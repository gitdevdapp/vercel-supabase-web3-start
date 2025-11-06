import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";

// 🤖 Helper function to directly create wallet (bypasses API call auth issues)
async function autoCreateWalletDirect(
  supabase: any,
  userId: string,
  userEmail?: string
) {
  try {
    console.log('[AutoWallet] Attempting direct wallet creation for user:', userId);
    
    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingWallet) {
      console.log('[AutoWallet] Wallet already exists:', existingWallet.wallet_address);
      return { success: true, created: false, wallet: existingWallet };
    }

    // Generate wallet via CDP
    const network = process.env.NEXT_PUBLIC_NETWORK || 'base-sepolia';
    const cdp = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      walletSecret: process.env.CDP_WALLET_SECRET,
    });

    const account = await cdp.evm.getOrCreateAccount({
      name: `Auto-Wallet-${userId.slice(0, 8)}`
    });

    console.log('[AutoWallet] Wallet account generated:', account.address);

    // Store in database
    const { data: newWallet, error: dbError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        wallet_address: account.address,
        wallet_name: 'Auto-Generated Wallet',
        network: network,
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('[AutoWallet] Database error:', dbError);
      return { success: false, error: dbError };
    }

    console.log('[AutoWallet] Wallet created successfully:', account.address);
    
    // Log operation
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: userId,
        p_wallet_id: newWallet.id,
        p_operation_type: 'auto_create',
        p_token_type: 'eth',
        p_status: 'success'
      });
    } catch (err) {
      console.error('[AutoWallet] Logging failed (non-critical):', err);
    }

    return { success: true, created: true, wallet: newWallet };
  } catch (error) {
    console.error('[AutoWallet] Error:', error);
    return { success: false, error };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/protected/profile";

  // Enhanced debug logging for OAuth callback
  console.log("=== OAuth Callback Debug ===");
  console.log("Full URL:", request.url);
  console.log("Origin:", origin);
  console.log("Code present:", !!code);
  console.log("Code length:", code?.length);
  console.log("Error param:", error);
  console.log("Error description:", error_description);
  console.log("Next param:", next);
  console.log("All search params:", Array.from(searchParams.entries()));
  console.log("Request host:", request.headers.get('host'));
  console.log("Referer:", request.headers.get('referer'));
  console.log("User-Agent:", request.headers.get('user-agent'));
  console.log("Cookies present:", request.cookies.getAll().map(c => c.name).join(', '));
  console.log("Timestamp:", new Date().toISOString());
  console.log("===================================");

  // Handle OAuth errors (e.g., user cancelled authorization)
  if (error) {
    console.warn("⚠️ OAuth error received:", error, error_description);
    const errorMessage = error_description || error || 'OAuth authorization failed';
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // Handle authorization code exchange
  if (code) {
    const supabase = await createClient();
    
    try {
      console.log("Attempting to exchange code for session...");
      const startTime = Date.now();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      const exchangeDuration = Date.now() - startTime;
      
      if (!exchangeError && data?.session) {
        console.log("✅ Session exchange successful!");
        console.log("Exchange duration:", `${exchangeDuration}ms`);
        console.log("User ID:", data.user?.id);
        console.log("Email:", data.user?.email);
        console.log("Provider:", data.user?.app_metadata?.provider);
        console.log("Session expires at:", data.session?.expires_at);
        console.log("Redirecting to:", `${origin}${next}`);
        
        // 🤖 AUTO-WALLET: Directly create wallet to avoid API auth issues
        if (data.user?.id) {
          const walletResult = await autoCreateWalletDirect(supabase, data.user.id, data.user.email);
          if (walletResult.success) {
            console.log("[AutoWallet] Auto-wallet created successfully:", {
              address: walletResult.wallet?.wallet_address,
              created: walletResult.created
            });
          } else {
            console.error("[AutoWallet] Auto-wallet creation failed (non-critical):", walletResult.error);
          }
        }
        
        // Successfully authenticated, redirect to intended page
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // Session exchange failed
        const errorMsg = exchangeError?.message || 'Session creation failed';
        console.error("❌ Session exchange failed:", errorMsg);
        console.error("Error details:", {
          name: exchangeError?.name,
          status: exchangeError?.status,
          message: errorMsg,
          code: exchangeError?.code
        });
        
        // Provide helpful error message based on error type
        let userMessage = errorMsg;
        if (errorMsg.includes('expired')) {
          userMessage = 'Authorization code has expired. Please try signing in again.';
        } else if (errorMsg.includes('invalid')) {
          userMessage = 'Invalid authorization code. Please try signing in again.';
        } else if (errorMsg.includes('already used')) {
          userMessage = 'Authorization code was already used. Please try signing in again.';
        }
        
        return NextResponse.redirect(
          `${origin}/auth/error?error=${encodeURIComponent(userMessage)}`
        );
      }
    } catch (error) {
      console.error("❌ Unexpected callback error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error("Error stack:", errorStack);
      
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Authentication callback failed: ' + errorMessage)}`
      );
    }
  }

  // No code or error provided - invalid callback
  console.error("❌ No code or error parameter in callback URL");
  console.error("This may indicate:");
  console.error("1. User accessed /auth/callback directly");
  console.error("2. OAuth flow was interrupted");
  console.error("3. Supabase redirect configuration issue");
  
  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent('No authorization code provided. Please try signing in again.')}`
  );
}
