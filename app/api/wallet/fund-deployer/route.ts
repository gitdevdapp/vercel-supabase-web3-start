import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { ethers } from "ethers";
import { z } from "zod";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

function getCdpClient(): CdpClient {
  if (!isCDPConfigured()) {
    throw new Error(FEATURE_ERRORS.CDP_NOT_CONFIGURED);
  }
  
  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
}

const fundDeployerSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid from address format"),
  amount: z.number().positive("Amount must be positive")
});

/**
 * 🔐 Fund Deployer Endpoint
 * 
 * Allows authenticated users to fund the secure deployer wallet
 * This wallet is used server-side with ethers.js for ERC721 deployments
 * 
 * Security Guarantees:
 * ✅ Private keys NEVER exposed
 * ✅ Only server-side deployment
 * ✅ No client-side key handling
 * ✅ Deployment with ethers.js direct blockchain calls
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

    // Check if CDP is configured
    if (!isCDPConfigured()) {
      return NextResponse.json(
        { error: FEATURE_ERRORS.CDP_NOT_CONFIGURED },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = fundDeployerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { fromAddress, amount } = validation.data;
    const network = getNetworkSafe();

    // Only allow funding on testnet
    if (network !== "base-sepolia") {
      return NextResponse.json(
        { error: "Funding only available on testnet (base-sepolia)" },
        { status: 403 }
      );
    }

    // 🔒 Verify wallet ownership
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('wallet_address', fromAddress)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized' },
        { status: 403 }
      );
    }

    // Get deployer address from environment
    const deployerPrivateKey = process.env.CDP_DEPLOYER_PRIVATE_KEY;
    if (!deployerPrivateKey) {
      return NextResponse.json(
        { 
          error: 'Deployer not configured',
          details: 'CDP_DEPLOYER_PRIVATE_KEY environment variable is not set'
        },
        { status: 503 }
      );
    }

    // Derive deployer address from private key (NO PRIVATE KEY EXPOSURE)
    const deployerWallet = new ethers.Wallet(deployerPrivateKey);
    const deployerAddress = deployerWallet.address;

    console.log('🔄 Fund Deployer Request:', {
      fromAddress,
      toAddress: deployerAddress,
      amount,
      network
    });

    const cdp = getCdpClient();
    
    // Get sender account from CDP using the wallet name
    const account = await cdp.evm.getOrCreateAccount({ 
      name: wallet.wallet_name 
    });
    
    // Verify the retrieved account matches the expected address
    if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
      return NextResponse.json(
        { 
          error: "Wallet address mismatch", 
          expected: fromAddress,
          retrieved: account.address 
        },
        { status: 500 }
      );
    }

    // Scope the account to the network
    const senderAccount = await account.useNetwork(network);

    // Check ETH balance
    const balances = await senderAccount.listTokenBalances({});
    const ethBalance = balances?.balances?.find(
      (balance) => balance?.token?.symbol === "ETH"
    );
    
    const currentBalance = ethBalance?.amount ? Number(ethBalance.amount) : 0;
    const minReservedForGas = 0.0001;
    const maxTransferable = currentBalance - minReservedForGas;
    
    if (currentBalance < amount + minReservedForGas) {
      return NextResponse.json(
        { 
          error: "Insufficient ETH balance (including gas reserve)", 
          available: Math.max(0, maxTransferable),
          requested: amount,
          gasReserve: minReservedForGas,
          currentBalance
        },
        { status: 400 }
      );
    }

    // Transfer ETH to deployer wallet
    console.log('💸 Transferring to deployer:', {
      from: fromAddress,
      to: deployerAddress,
      amount
    });

    const result = await senderAccount.transfer({
      token: 'eth',
      amount: BigInt(Math.floor(amount * 1e18)), // Convert ETH to wei
      to: deployerAddress as `0x${string}`
    });

    console.log('✅ Transfer successful:', {
      transactionHash: result.transactionHash,
      from: fromAddress,
      to: deployerAddress,
      amount
    });

    // 📝 Log successful funding
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'fund_deployer',
        p_token_type: 'eth',
        p_amount: amount,
        p_from_address: fromAddress,
        p_to_address: deployerAddress,
        p_tx_hash: result.transactionHash,
        p_status: 'success'
      });
    } catch (err) {
      console.warn('Warning: Database logging failed:', err);
    }

    return NextResponse.json({
      success: true,
      transactionHash: result.transactionHash,
      deployer: {
        address: deployerAddress,
        network
      },
      amount,
      message: '🔐 Funds sent to deployer wallet (private key secured on server)',
      explorerUrl: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Fund deployer error:", error);
    
    let errorMessage = "Failed to fund deployer";
    const errorDetails = error instanceof Error ? error.message : "Unknown error";
    
    if (errorDetails.includes("insufficient funds") || errorDetails.includes("insufficient balance")) {
      errorMessage = "Insufficient funds for transfer (including gas fees)";
    } else if (errorDetails.includes("rate limit") || errorDetails.includes("429")) {
      errorMessage = "Rate limit exceeded - please wait before trying again";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
