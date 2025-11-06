import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deployERC721, getBaseScanUrl } from "@/lib/erc721-deploy";
import { z } from "zod";

const deployContractSchema = z.object({
  name: z.string().min(1, "Contract name is required"),
  symbol: z.string().min(1, "Contract symbol is required"),
  maxSupply: z.number().int().positive("Max supply must be positive"),
  mintPrice: z.union([z.number(), z.string()])
    .transform((val) => {
      try {
        const strVal = typeof val === 'string' ? val : val.toString();
        const bigVal = BigInt(strVal);
        return bigVal.toString();
      } catch {
        throw new Error("Invalid mint price format");
      }
    })
    .pipe(z.string().regex(/^\d+$/, "Mint price must be a valid number string")),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
});

/**
 * 🚀 ERC721 Contract Deployment Endpoint
 * 
 * ✅ REAL DEPLOYMENT - Deploys actual ERC721 contracts to Base Sepolia
 * - Uses ethers.js with a funded deployer account (CDP_DEPLOYER_PRIVATE_KEY)
 * - Signs transactions directly with private key
 * - Spends real ETH gas from deployer wallet
 * - All deployments are permanent and verifiable on BaseScan
 * - NO FAKE ADDRESSES - real verified contracts
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
    const validation = deployContractSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, symbol, maxSupply, mintPrice, walletAddress } = validation.data;

    // Verify wallet ownership
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

    console.log('🚀 Attempting ERC721 deployment:', {
      name,
      symbol,
      maxSupply: maxSupply.toString(),
      mintPrice: mintPrice.toString(),
      network: 'base-sepolia'
    });

    // Deploy contract
    const deployment = await deployERC721({
      name,
      symbol,
      maxSupply,
      mintPrice
    });

    console.log(`✅ ERC721 deployed successfully:`, {
      contractAddress: deployment.contractAddress,
      transactionHash: deployment.transactionHash,
      network: deployment.network
    });

    // Log deployment to database
    const { error: dbError } = await supabase.rpc('log_contract_deployment', {
      p_user_id: user.id,
      p_wallet_id: wallet.id,
      p_contract_address: deployment.contractAddress,
      p_contract_name: name,
      p_contract_type: 'ERC721',
      p_tx_hash: deployment.transactionHash,
      p_network: 'base-sepolia',
      p_abi: [], // Will be set separately if needed
      p_deployment_block: 0,
      p_platform_api_used: false,
      // ✅ Add collection metadata for UI display
      p_collection_name: name,
      p_collection_symbol: symbol,
      p_max_supply: maxSupply,
      p_mint_price_wei: mintPrice,
      p_wallet_address: walletAddress
    });

    // ✅ CRITICAL: Return error if RPC call fails instead of silently swallowing it
    if (dbError) {
      console.error('❌ CRITICAL: Database logging failed:', {
        error: dbError.message,
        code: dbError.code,
        hint: dbError.hint,
        deploymentAddress: deployment.contractAddress,
        collectionName: name
      });
      
      return NextResponse.json(
        {
          error: 'Failed to log deployment to database',
          details: dbError.message,
          hint: 'The contract deployed but could not be registered. Please try again or contact support.',
          deploymentAddress: deployment.contractAddress
        },
        { status: 500 }
      );
    }

    // ✅ VERIFICATION: Ensure collection was actually created with slug
    try {
      const { data: newCollection, error: verifyError } = await supabase
        .from('smart_contracts')
        .select('id, collection_slug, is_public, marketplace_enabled')
        .eq('contract_address', deployment.contractAddress)
        .single();
      
      if (verifyError) {
        console.warn('⚠️ Could not verify collection insertion:', verifyError);
      }
      
      if (!newCollection) {
        console.error('❌ Collection was not inserted into database');
        return NextResponse.json(
          {
            error: 'Collection deployment failed',
            details: 'Contract deployed but collection was not created in database',
            deploymentAddress: deployment.contractAddress
          },
          { status: 500 }
        );
      }
      
      if (!newCollection.collection_slug) {
        console.error('❌ Collection slug was not generated');
        return NextResponse.json(
          {
            error: 'Collection deployment failed',
            details: 'Slug generation failed. Collection may not be visible in marketplace.',
            deploymentAddress: deployment.contractAddress
          },
          { status: 500 }
        );
      }
      
      console.log('✅ Collection successfully registered:', {
        slug: newCollection.collection_slug,
        isPublic: newCollection.is_public,
        marketplaceEnabled: newCollection.marketplace_enabled
      });
      
    } catch (verifyErr) {
      console.error('❌ Verification check failed:', verifyErr);
      // Don't fail deployment - verification is just a safety check
    }

    // 📝 Log deployment to wallet transaction history
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'deploy',
        p_token_type: 'eth',
        p_tx_hash: deployment.transactionHash,
        p_status: 'success'
      });
    } catch (err) {
      console.warn("Warning: Transaction logging failed:", err);
    }

    const explorerUrl = getBaseScanUrl(deployment.contractAddress);

    return NextResponse.json({
      success: true,
      contractAddress: deployment.contractAddress,
      transactionHash: deployment.transactionHash,
      explorerUrl,
      deploymentMethod: 'Real ERC721 (CDP SDK + Base Sepolia)',
      contract: {
        name,
        symbol,
        maxSupply,
        mintPrice,
        network: 'base-sepolia'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Contract deployment error:', error);
    return NextResponse.json(
      {
        error: 'Failed to deploy contract',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}