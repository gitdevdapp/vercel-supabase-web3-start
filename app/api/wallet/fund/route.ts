import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { ethers } from "ethers";
import { z } from "zod";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

// RPC URLs for different networks
const RPC_URLS = {
  "base-sepolia": "https://sepolia.base.org",
  "base": "https://mainnet.base.org"
} as const;

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

const fundWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  token: z.enum(["usdc", "eth"], {
    errorMap: () => ({ message: "Token must be 'usdc' or 'eth'" })
  })
});

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
    const validation = fundWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { address, token } = validation.data;
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
      .eq('wallet_address', address)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized' },
        { status: 404 }
      );
    }

    const cdp = getCdpClient();

    // Request funds from faucet
    const { transactionHash } = await cdp.evm.requestFaucet({
      address,
      network,
      token: token.toLowerCase() as "usdc" | "eth",
    });

    // Wait for transaction confirmation using ethers
    const provider = new ethers.JsonRpcProvider(RPC_URLS[network as keyof typeof RPC_URLS]);
    const tx = await provider.waitForTransaction(transactionHash);

    // Check if transaction was successful (ethers returns 1 for success, 0 for failure)
    const isSuccessful = tx?.status === 1;

    if (!isSuccessful) {
      // Log failed transaction
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'fund',
        p_token_type: token,
        p_amount: token === 'eth' ? 0.001 : 1.0,
        p_to_address: address,
        p_tx_hash: transactionHash,
        p_status: 'failed'
      });

      return NextResponse.json(
        { error: "Funding transaction failed", transactionHash },
        { status: 500 }
      );
    }

    // 📝 Log successful funding
    await supabase.rpc('log_wallet_operation', {
      p_user_id: user.id,
      p_wallet_id: wallet.id,
      p_operation_type: 'fund',
      p_token_type: token,
      p_amount: token === 'eth' ? 0.001 : 1.0,
      p_to_address: address,
      p_tx_hash: transactionHash,
      p_status: 'success'
    });

    return NextResponse.json({
      transactionHash,
      status: "success",
      token: token.toUpperCase(),
      address,
      explorerUrl: `https://sepolia.basescan.org/tx/${transactionHash}`
    });

  } catch (error) {
    console.error("Funding error:", error);
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    
    // Handle specific faucet errors with broader matching
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("rate limit") || 
          errorMsg.includes("faucet limit") ||
          errorMsg.includes("limit reached") ||
          errorMsg.includes("you have reached")) {
        return NextResponse.json(
          { error: "Global 10 USDC Limit per 24 Hours - Use our Guide to get your own CDP Keys", type: "FAUCET_LIMIT" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fund wallet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
