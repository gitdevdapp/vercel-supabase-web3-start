import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";

/**
 * AUTO-CREATE WALLET ENDPOINT
 * 
 * Purpose: Automatically generate a wallet for users on first login
 * Supports both: Client-side calls (authenticated) and server-side calls with user_id
 * Safety: Checks if wallet exists before creating (prevents infinite loops)
 * 
 * POST /api/wallet/auto-create
 * Response: { wallet_address, wallet_name, wallet_id, created, success }
 */

function getCdpClient(): CdpClient {
  const client = new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
  
  console.log('[AutoWallet] CDP Client initialized with correct credentials');
  return client;
}

function getNetworkSafe(): string {
  const network = process.env.NEXT_PUBLIC_NETWORK || "base-sepolia";
  const validNetworks = ["base-sepolia", "ethereum-sepolia", "polygon-mumbai"];
  return validNetworks.includes(network) ? network : "base-sepolia";
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Allow both authenticated users and direct user_id for server-side calls
    let userId: string | null = user?.id || null;
    
    // If no user from auth, try to get user_id from request body (for server-side calls)
    if (!userId) {
      try {
        const body = await request.json();
        userId = body.user_id;
      } catch {
        // Body might not be JSON
      }
    }

    if (!userId) {
      console.log('[AutoWallet] No user context available');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in', success: false },
        { status: 401 }
      );
    }

    console.log('[AutoWallet] Creating wallet for user:', userId);

    const network = getNetworkSafe();

    // ✅ STEP 1: Check if user already has a wallet (PREVENT INFINITE LOOPS)
    const { data: existingWallet, error: checkError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[AutoWallet] Error checking existing wallet:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing wallet', success: false },
        { status: 500 }
      );
    }

    // If wallet exists, return it (idempotent - don't create duplicate)
    if (existingWallet) {
      console.log('[AutoWallet] Wallet already exists:', existingWallet.wallet_address);
      return NextResponse.json({
        wallet_address: existingWallet.wallet_address,
        wallet_name: existingWallet.wallet_name,
        wallet_id: existingWallet.id,
        created: false,
        success: true
      }, { status: 200 });
    }

    // ✅ STEP 2: Generate new wallet via CDP
    console.log('[AutoWallet] No existing wallet found, generating new wallet...');
    
    let walletAddress: string;
    try {
      const cdp = getCdpClient();
      
      // Use getOrCreateAccount() which is the working CDP SDK method
      const account = await cdp.evm.getOrCreateAccount({
        name: `Auto-Wallet-${userId.slice(0, 8)}`
      });

      walletAddress = account.address;
      console.log('[AutoWallet] Wallet account generated successfully:', walletAddress);
    } catch (cdpError) {
      console.error('[AutoWallet] CDP wallet generation failed:', cdpError);
      return NextResponse.json(
        { 
          error: 'Failed to generate wallet. CDP may not be configured.', 
          success: false 
        },
        { status: 503 }
      );
    }

    // ✅ STEP 3: Store wallet in database
    const { data: wallet, error: dbError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        wallet_name: 'Auto-Generated Wallet',
        network: network,
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('[AutoWallet] Database insertion error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save wallet to database', success: false },
        { status: 500 }
      );
    }

    console.log('[AutoWallet] Wallet saved to database:', wallet.id);

    // ✅ STEP 4: Log wallet creation for auditing
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: userId,
        p_wallet_id: wallet.id,
        p_operation_type: 'auto_create',
        p_token_type: 'eth',
        p_status: 'success'
      });
      console.log('[AutoWallet] Operation logged successfully');
    } catch (rpcError) {
      console.error('[AutoWallet] RPC logging failed (non-critical):', rpcError);
      // Don't fail the operation if logging fails
    }

    // ✅ STEP 5: Return success
    return NextResponse.json({
      wallet_address: wallet.wallet_address,
      wallet_name: wallet.wallet_name,
      wallet_id: wallet.id,
      created: true,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('[AutoWallet] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to auto-create wallet',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
