import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

const mintNFTSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid recipient address"),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
});

/**
 * 🎨 ERC721 Minting Endpoint
 * 
 * Mints real ERC721 tokens using ethers.js
 * All mints are permanent and verifiable on BaseScan
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = mintNFTSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { contractAddress, recipientAddress, walletAddress } = validation.data;

    // Verify wallet ownership (user must own a wallet to mint from)
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized' },
        { status: 404 }
      );
    }

    // 🆕 CRITICAL FIX: Allow PUBLIC minting for public collections
    // First, fetch the contract to check if it's public
    const { data: contract, error: contractError } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('contract_address', contractAddress)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // 🆕 Check permissions: Allow if public, or if user owns it
    const isPublic = contract.is_public === true;
    const isOwner = contract.user_id === user.id;
    
    if (!isPublic && !isOwner) {
      return NextResponse.json(
        { error: 'Contract is private and you do not own it' },
        { status: 403 }
      );
    }

    console.log('🎨 Attempting ERC721 mint:', {
      contractAddress,
      recipientAddress,
      network: 'base-sepolia'
    });

    // Get private key from environment (test wallet)
    // Use CDP_DEPLOYER_PRIVATE_KEY which is in hex format compatible with ethers.js
    const privateKey = process.env.CDP_DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('CDP_DEPLOYER_PRIVATE_KEY not configured for minting');
    }

    // Connect to Base Sepolia RPC
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const walletSigner = new ethers.Wallet(privateKey, provider);
    
    // Load contract ABI
    const artifactPath = join(process.cwd(), 'artifacts/contracts/SimpleERC721.sol/SimpleERC721.json');
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8'));
    
    // Connect to contract
    const erc721Contract = new ethers.Contract(
      contractAddress,
      artifact.abi,
      walletSigner
    );
    
    console.log('🚀 Executing mint transaction...');
    
    // Call mint function
    const tx = await erc721Contract.mint(recipientAddress);
    console.log('⏳ Waiting for mint confirmation...');
    const receipt = await tx.wait();
    
    console.log('✅ NFT minted successfully:');
    console.log('  Transaction Hash:', receipt.hash);
    console.log('  Block:', receipt.blockNumber);
    console.log('  Gas Used:', receipt.gasUsed.toString());

    // Extract token ID from transaction logs
    let tokenId = null;
    try {
      // Look for Transfer event log to get token ID
      const transferEventAbi = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)';
      const iface = new ethers.Interface([transferEventAbi]);
      
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'Transfer') {
            tokenId = parsed.args[2]; // tokenId is the third parameter
            console.log('  Token ID:', tokenId);
            break;
          }
        } catch {
          // Log might not be a Transfer event, continue
        }
      }
    } catch (err) {
      console.warn('Warning: Could not extract token ID from logs:', err);
    }

    // 🆕 Log mint to database using RPC function
    try {
      console.log('📝 Logging mint to nft_tokens table...');
      const { data: nftId, error: rpcError } = await supabase.rpc('log_nft_mint', {
        p_contract_address: contractAddress,
        p_token_id: tokenId ? parseInt(tokenId.toString()) : 0,
        p_owner_address: recipientAddress,
        p_minter_address: recipientAddress,
        p_minter_user_id: user.id,
        p_token_uri: null,
        p_metadata_json: null
      });

      if (rpcError) {
        console.error('❌ CRITICAL: Failed to log mint to database:', {
          error_message: rpcError.message,
          error_code: (rpcError as any).code,
          error_details: (rpcError as any).details
        });
      } else {
        console.log('✅ Mint logged to database with ID:', nftId);
      }

      // 🆕 Increment collection minted counter
      console.log('📊 Incrementing collection minted counter...');
      const { error: incrementError } = await supabase.rpc('increment_collection_minted', {
        p_contract_address: contractAddress,
        p_amount: 1
      });

      if (incrementError) {
        console.error('❌ CRITICAL: Failed to update collection minted count:', {
          error_message: incrementError.message,
          error_code: (incrementError as any).code,
          contract: contractAddress
        });
      } else {
        console.log('✅ Collection minted counter incremented');
      }
    } catch (dbErr) {
      console.error('❌ ERROR: Database operations failed:', dbErr);
      // Don't fail the mint if database logging fails - blockchain mint is successful
    }

    // Log mint to legacy database endpoint if available
    const { error: dbError } = await supabase.rpc('log_contract_mint', {
      p_user_id: user.id,
      p_wallet_id: wallet.id,
      p_contract_address: contractAddress,
      p_to_address: recipientAddress,
      p_tx_hash: receipt.hash,
      p_token_id: tokenId ? tokenId.toString() : null,
      p_quantity: 1,
      p_platform_api_used: false
    });

    if (dbError) {
      console.warn('Warning: Legacy database logging failed:', dbError);
    }

    const explorerUrl = `https://sepolia.basescan.org/tx/${receipt.hash}`;

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      explorerUrl,
      mintMethod: 'Direct ERC721 (ethers.js)',
      mint: {
        contractAddress,
        recipientAddress,
        network: 'base-sepolia'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('NFT mint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to mint NFT',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

