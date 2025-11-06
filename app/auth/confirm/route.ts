import { createClient } from "@/lib/supabase/server";
import { createEmailConfirmationServerClient } from "@/lib/supabase/email-client";
import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("token_hash");
  const type = searchParams.get("type") || "signup";
  const next = searchParams.get("next") || "/protected/profile";

  console.log("Email confirmation attempt:", {
    code: code ? `${code.substring(0, 15)}...` : null,
    type,
    next,
    url: request.url
  });

  if (!code) {
    console.error("Missing authorization code");
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Missing authorization code')}`
    );
  }

  try {
    // 🔧 MVP Fix: Detect PKCE tokens and handle them with verifyOtp
    const isPkceToken = code.startsWith('pkce_');
    
    if (isPkceToken) {
      console.log("Detected PKCE token, using verifyOtp method");
      
      // Use email confirmation client with implicit flow
      const supabase = await createEmailConfirmationServerClient();
      
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: type as 'email' | 'signup' | 'recovery' | 'invite',
      });
      
      if (error) {
        console.error("PKCE token verification failed:", error);
        return NextResponse.redirect(
          `${origin}/auth/error?error=${encodeURIComponent('Email confirmation failed: ' + error.message)}`
        );
      }
      
      if (data.session) {
        console.log("PKCE email confirmation successful via verifyOtp");
        
        // 🤖 AUTO-WALLET: Directly create wallet to avoid API auth issues during session setup
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
        
        return NextResponse.redirect(`${origin}${next}`);
      }
      
      console.error("No session created after PKCE token verification");
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Session creation failed')}`
      );
      
    } else {
      console.log("Detected non-PKCE token, using exchangeCodeForSession");
      
      // Use regular PKCE client for non-PKCE tokens
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Code exchange failed:", error);
        return NextResponse.redirect(
          `${origin}/auth/error?error=${encodeURIComponent('Email confirmation failed: ' + error.message)}`
        );
      }
      
      if (data.session) {
        console.log("Non-PKCE email confirmation successful");
        
        // 🤖 AUTO-WALLET: Directly create wallet to avoid API auth issues during session setup
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
        
        return NextResponse.redirect(`${origin}${next}`);
      }
      
      console.error("No session created after code exchange");
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Session creation failed')}`
      );
    }
    
  } catch (error) {
    console.error("Unexpected auth confirmation error:", error);
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Authentication confirmation failed')}`
    );
  }
}

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
