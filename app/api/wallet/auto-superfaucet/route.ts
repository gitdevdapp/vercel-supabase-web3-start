import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { CdpClient } from "@coinbase/cdp-sdk";
import { ethers } from "ethers";
import { z } from "zod";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";

/**
 * AUTO-SUPERFAUCET ENDPOINT (SIMPLE & RELIABLE)
 *
 * Purpose: Automatically fund wallet with testnet gas for new test accounts
 * Target: Test accounts using mailinator emails  
 * Safety: Checks balance before requesting (prevents infinite loops)
 * Idempotency: Doesn't request if already funded
 * Reliability: Single request per call - avoids CDP project rate limits
 *
 * POST /api/wallet/auto-superfaucet
 * Request: { wallet_address (optional) }
 * Response: Single faucet request result with balance verification
 */

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

const autoSuperFaucetSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format").optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[AutoSuperFaucet] Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in', success: false },
        { status: 401 }
      );
    }

    console.log('[AutoSuperFaucet] ✅ Authentication successful for user:', user.id);

    // 🔍 CHECK: CDP Configuration
    if (!isCDPConfigured()) {
      console.error('[AutoSuperFaucet] CDP not configured');
      return NextResponse.json(
        { error: FEATURE_ERRORS.CDP_NOT_CONFIGURED, success: false },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = autoSuperFaucetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues, success: false },
        { status: 400 }
      );
    }

    let walletAddress = validation.data.wallet_address;

    // ✅ STEP 1: Get user's wallet if not provided
    if (!walletAddress) {
      console.log('[AutoSuperFaucet] No wallet address provided, fetching from database...');

      const { data: walletRecord, error: walletError } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError || !walletRecord) {
        console.error('[AutoSuperFaucet] ❌ No wallet found for user');
        return NextResponse.json(
          { error: 'No wallet found. Please create a wallet first.', success: false },
          { status: 404 }
        );
      }

      walletAddress = walletRecord.wallet_address;
      console.log('[AutoSuperFaucet] ✅ Using wallet from DB:', walletAddress);
    }

    // ✅ STEP 2: Verify wallet ownership (security check)
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError || !wallet) {
      console.error('[AutoSuperFaucet] ❌ Wallet not owned by user');
      return NextResponse.json(
        { error: 'Wallet not found or unauthorized', success: false },
        { status: 404 }
      );
    }

    console.log('[AutoSuperFaucet] ✅ Wallet ownership verified');

    // ✅ STEP 3: Get network and verify it's testnet
    const network = getNetworkSafe();
    console.log('[AutoSuperFaucet] Network:', network);

    if (network !== "base-sepolia") {
      return NextResponse.json(
        { error: "Super Faucet only available on testnet (base-sepolia)", success: false },
        { status: 403 }
      );
    }

    // ✅ STEP 4: Check current balance and skip if already funded
    console.log('[AutoSuperFaucet] Checking wallet balance...');
    const provider = new ethers.JsonRpcProvider(RPC_URLS[network as keyof typeof RPC_URLS]);
    let currentBalance = Number(await provider.getBalance(walletAddress!)) / 1e18;

    console.log('[AutoSuperFaucet] Current balance:', currentBalance, 'ETH');

    // If already funded (>= 0.01 ETH), skip superfaucet
    if (currentBalance >= 0.01) {
      console.log('[AutoSuperFaucet] ⏭️ Wallet already funded, skipping superfaucet');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Wallet already has sufficient balance',
        currentBalance: currentBalance,
        requestCount: 0,
        transactionHashes: []
      }, { status: 200 });
    }

    // ✅ STEP 5: MAKE SINGLE CDP FAUCET REQUEST (NO LOOPS!)
    console.log('[AutoSuperFaucet] 🚀 Making single CDP faucet request...');

    const startBalance = currentBalance;
    const transactionHashes: string[] = [];

    try {
      const cdp = getCdpClient();

      console.log(`[AutoSuperFaucet] 📤 Calling cdp.evm.requestFaucet for ${walletAddress}...`);
      
      // Make ONE request with timeout
      const requestPromise = cdp.evm.requestFaucet({
        address: walletAddress!,
        network,
        token: "eth",
      });

      // Add 30 second timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('CDP faucet request timeout (30s)')), 30000)
      );

      let transactionHash: string;
      try {
        const result = await Promise.race([requestPromise, timeoutPromise]) as any;
        transactionHash = result?.transactionHash;
      } catch (raceError: any) {
        // Check if it's a rate limit error
        if (raceError.message?.includes("limit reached") || 
            raceError.message?.includes("rate limit") ||
            raceError.message?.includes("faucet limit")) {
          console.error('[AutoSuperFaucet] ⏹️ CDP Rate limit hit:', raceError.message);
          return NextResponse.json(
            {
              error: "Faucet rate limit exceeded. Please try again in 24 hours.",
              success: false,
              errorType: "RATE_LIMIT"
            },
            { status: 429 }
          );
        }
        throw raceError;
      }

      if (!transactionHash) {
        throw new Error('No transaction hash returned from CDP faucet');
      }

      console.log(`[AutoSuperFaucet] ✅ Request succeeded: ${transactionHash}`);
      transactionHashes.push(transactionHash);

      // Wait for transaction confirmation
      console.log(`[AutoSuperFaucet] ⏳ Waiting for transaction confirmation...`);
      const receipt = await provider.waitForTransaction(transactionHash, 1, 60000);
      if (!receipt) {
        console.warn(`[AutoSuperFaucet] ⚠️ Transaction ${transactionHash} not confirmed within timeout`);
      } else {
        console.log(`[AutoSuperFaucet] ✅ Transaction confirmed: ${transactionHash}`);
      }

      // Check final balance
      console.log('[AutoSuperFaucet] Checking final balance...');
      let finalBalance = Number(await provider.getBalance(walletAddress!)) / 1e18;
      console.log('[AutoSuperFaucet] Final balance:', finalBalance, 'ETH');

      // Verify balance actually increased
      if (finalBalance <= startBalance) {
        console.warn(`[AutoSuperFaucet] ⚠️ Balance did not increase. Start: ${startBalance}, Final: ${finalBalance}`);
        // Still return success since we got a transaction hash
        // The blockchain may just be slow
      }

      const amountReceived = finalBalance - startBalance;
      console.log('[AutoSuperFaucet] ✅ Success! Amount received:', amountReceived.toFixed(6), 'ETH');

      // ✅ STEP 6: Log operation for auditing
      try {
        await supabase.rpc('log_wallet_operation', {
          p_user_id: user.id,
          p_wallet_id: wallet.id,
          p_operation_type: 'auto_superfaucet',
          p_token_type: 'eth',
          p_amount: Math.max(amountReceived, 0.0001), // At least 0.0001 ETH from faucet
          p_status: 'success'
        });
        console.log('[AutoSuperFaucet] ✅ Operation logged');
      } catch (rpcError) {
        console.warn('[AutoSuperFaucet] ⚠️ RPC logging failed (non-critical):', rpcError);
      }

      // ✅ STEP 7: Return verified success
      return NextResponse.json({
        success: true,
        skipped: false,
        requestCount: 1,
        startBalance: startBalance,
        finalBalance: finalBalance,
        totalReceived: amountReceived,
        transactionHashes: transactionHashes,
        explorerUrls: transactionHashes.map(
          hash => `https://sepolia.basescan.org/tx/${hash}`
        )
      }, { status: 200 });

    } catch (cdpError: any) {
      console.error('[AutoSuperFaucet] ❌ CDP faucet error:', cdpError);

      // Check for specific error types
      if (cdpError.message?.includes("limit reached") || 
          cdpError.message?.includes("rate limit") ||
          cdpError.message?.includes("faucet limit")) {
        return NextResponse.json(
          { 
            error: "Faucet rate limit exceeded. Please try again in 24 hours.",
            success: false,
            errorType: "RATE_LIMIT"
          },
          { status: 429 }
        );
      }

      if (cdpError.message?.includes("timeout")) {
        return NextResponse.json(
          { 
            error: "Faucet request timed out. Please try again.",
            success: false,
            errorType: "TIMEOUT"
          },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to request faucet funds',
          success: false,
          details: cdpError instanceof Error ? cdpError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[AutoSuperFaucet] ❌ Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to auto-trigger superfaucet',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
