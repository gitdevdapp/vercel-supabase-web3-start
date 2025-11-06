import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "@/lib/env";

const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Wallet name too long"),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address").optional(),
  type: z.enum(["purchaser", "seller", "custom"], {
    errorMap: () => ({ message: "Type must be 'purchaser', 'seller', or 'custom'" })
  })
});

function getCdpClient(): CdpClient {
  const client = new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
  
  console.log('[ManualWallet] CDP Client initialized with correct credentials');
  return client;
}

/**
 * Create wallet entry in database
 * Supports both manual wallet address input AND auto-generation via CDP
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
    const validation = createWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, address, type } = validation.data;
    const network = 'base-sepolia';

    let walletName: string;
    let walletAddress: string = '';

    switch (type) {
      case "purchaser":
        walletName = "Purchaser";
        break;
      case "seller":
        walletName = "Seller";
        break;
      case "custom":
        walletName = name;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid wallet type" },
          { status: 400 }
        );
    }

    // ✅ NEW: Support both manual address input AND auto-generation
    if (address) {
      // Option 1: User provided an address - use it directly
      console.log('[ManualWallet] Using user-provided address');
      walletAddress = address;
    } else {
      // Option 2: NO address provided - generate via CDP (NEW FEATURE)
      console.log('[ManualWallet] No address provided, generating wallet via CDP...');
      
      // ✨ V6 IMPROVEMENT: Retry logic with exponential backoff
      const maxRetries = 3;
      let lastCdpError: unknown;
      let walletGenerated = false;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[ManualWallet] CDP generation attempt ${attempt}/${maxRetries}`);
          
          const cdp = getCdpClient();
          
          // Use getOrCreateAccount() which is the working CDP SDK method
          const account = await cdp.evm.getOrCreateAccount({
            name: `Custom-${walletName}-${user.id.slice(0, 8)}`
          });

          walletAddress = account.address;
          walletGenerated = true;
          console.log('[ManualWallet] Wallet generated successfully:', walletAddress);
          break; // Success, exit retry loop
        } catch (cdpError) {
          lastCdpError = cdpError;
          console.error(`[ManualWallet] CDP attempt ${attempt} failed:`, cdpError);
          
          // ✨ V6: Check if error is retryable
          const errorMessage = cdpError instanceof Error ? cdpError.message : String(cdpError);
          const isRetryable = 
            errorMessage.includes('timeout') ||
            errorMessage.includes('ECONNREFUSED') ||
            errorMessage.includes('ENOTFOUND') ||
            errorMessage.includes('network') ||
            (cdpError as any)?.status >= 500; // Server errors are retryable
          
          if (attempt < maxRetries && isRetryable) {
            const backoffTime = 1000 * attempt; // 1s, 2s, 3s exponential backoff
            console.log(`[ManualWallet] Retryable error, waiting ${backoffTime}ms before attempt ${attempt + 1}`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          }
          
          // Non-retryable or last attempt
          break;
        }
      }

      if (!walletGenerated) {
        console.error('[ManualWallet] Failed to generate wallet after 3 attempts:', lastCdpError);
        
        // ✨ V6: More specific error messages
        const errorMessage = lastCdpError instanceof Error ? lastCdpError.message : String(lastCdpError);
        
        let displayError = 'Failed to generate wallet. CDP may not be configured.';
        
        if (errorMessage.includes('timeout')) {
          displayError = 'Wallet generation timeout. Please try again.';
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          displayError = 'Too many wallet creation requests. Please wait a moment.';
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          displayError = 'Wallet service authentication failed. Please contact support.';
        }
        
        return NextResponse.json(
          { 
            error: displayError,
            success: false,
            details: process.env.NODE_ENV === 'development' ? String(lastCdpError) : undefined
          },
          { status: 503 }
        );
      }
    }

    console.log('[ManualWallet] Creating wallet entry:', {
      name: walletName,
      type,
      userId: user.id,
      network,
      walletAddress
    });

    // 💾 Store wallet in database
    const { data: wallet, error: dbError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        wallet_name: walletName,
        network: network,
        platform_api_used: false
      })
      .select()
      .single();

    if (dbError) {
      console.error('[ManualWallet] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save wallet to database' },
        { status: 500 }
      );
    }

    // 📝 Log wallet creation
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'create',
        p_token_type: 'eth',
        p_status: 'success'
      });
      console.log('[ManualWallet] Wallet operation logged successfully');
    } catch (rpcError) {
      console.error('[ManualWallet] RPC logging failed:', rpcError);
      // Don't fail the entire operation if RPC logging fails
    }

    return NextResponse.json({
      address: wallet.wallet_address,
      name: wallet.wallet_name,
      wallet_id: wallet.id,
      type,
      network: network,
      platform_api_used: false
    }, { status: 201 });

  } catch (error) {
    console.error("[ManualWallet] Wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
