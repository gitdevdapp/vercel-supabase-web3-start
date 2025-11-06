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

// Conservative variable spacing between 2-15 seconds
function getRandomDelay(): number {
  const minMs = 2000;
  const maxMs = 15000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

const superFaucetSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
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
    const validation = superFaucetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { address } = validation.data;
    const network = getNetworkSafe();

    // Only allow funding on testnet
    if (network !== "base-sepolia") {
      return NextResponse.json(
        { error: "Super Faucet only available on testnet (base-sepolia)" },
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
    const provider = new ethers.JsonRpcProvider(RPC_URLS[network as keyof typeof RPC_URLS]);

    // Conservative parameters
    const targetAmount = 0.05; // 0.05 ETH limit
    const maxRequests = 500; // Safety limit (would reach 0.05 ETH)
    const minSpacingMs = 2000;
    const maxSpacingMs = 15000;
    const singleRequestAmount = 0.0001; // CDP faucet gives 0.0001 ETH per request

    // Get current balance using ethers
    let currentBalance = Number(await provider.getBalance(address)) / 1e18;

    const results = {
      requestCount: 0,
      startBalance: currentBalance,
      finalBalance: currentBalance,
      transactionHashes: [] as string[],
      statusUpdates: [] as { step: number; balance: number; timestamp: string }[]
    };

    // Add initial status
    results.statusUpdates.push({
      step: 0,
      balance: currentBalance,
      timestamp: new Date().toISOString()
    });

    // Make multiple requests until target is reached
    while (currentBalance < targetAmount && results.requestCount < maxRequests) {
      try {
        const { transactionHash } = await cdp.evm.requestFaucet({
          address,
          network,
          token: "eth",
        });

        results.transactionHashes.push(transactionHash);
        results.requestCount++;

        // Wait for confirmation using ethers
        await provider.waitForTransaction(transactionHash);

        // Check updated balance using ethers
        currentBalance = Number(await provider.getBalance(address)) / 1e18;

        results.finalBalance = currentBalance;
        results.statusUpdates.push({
          step: results.requestCount,
          balance: currentBalance,
          timestamp: new Date().toISOString()
        });

        // Stop if target reached
        if (currentBalance >= targetAmount) {
          break;
        }

        // Conservative variable spacing between 2-15 seconds
        if (results.requestCount < maxRequests) {
          const delay = getRandomDelay();
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error: any) {
        // Handle faucet rate limit
        if (error.errorType === "faucet_limit_exceeded" || 
            error.message?.includes("faucet_limit_exceeded")) {
          results.statusUpdates.push({
            step: results.requestCount,
            balance: currentBalance,
            timestamp: new Date().toISOString()
          });
          break; // Stop if we hit the limit
        }
        // For other errors, still stop gracefully
        throw error;
      }
    }

    // 📝 Log successful super faucet operation
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'super_faucet',
        p_token_type: 'eth',
        p_amount: results.finalBalance - results.startBalance,
        p_to_address: address,
        p_tx_hash: results.transactionHashes[0] || '',
        p_status: 'success'
      });
    } catch (err) {
      console.warn("Logging warning:", err);
    }

    return NextResponse.json({
      success: true,
      requestCount: results.requestCount,
      startBalance: results.startBalance,
      finalBalance: results.finalBalance,
      totalReceived: results.finalBalance - results.startBalance,
      transactionHashes: results.transactionHashes,
      statusUpdates: results.statusUpdates,
      explorerUrls: results.transactionHashes.map(
        hash => `https://sepolia.basescan.org/tx/${hash}`
      )
    });

  } catch (error) {
    console.error("Super Faucet error:", error);
    
    // Handle specific faucet errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("faucet_limit_exceeded")) {
        return NextResponse.json(
          { error: "Faucet rate limit exceeded. Please try again in 24 hours." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to request super faucet funds", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
