import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePurchaserAccount, getOrCreateSellerAccount } from "@/lib/accounts";
import { CdpClient } from "@coinbase/cdp-sdk";
import { z } from "zod";
import { isCDPConfigured, FEATURE_ERRORS } from "@/lib/features";
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

const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Wallet name too long"),
  type: z.enum(["purchaser", "seller", "custom"], {
    errorMap: () => ({ message: "Type must be 'purchaser', 'seller', or 'custom'" })
  })
});

export async function POST(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION CHECK - RESTORED
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
    const validation = createWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, type } = validation.data;

    let account;
    
    switch (type) {
      case "purchaser":
        account = await getOrCreatePurchaserAccount();
        break;
      case "seller":
        account = await getOrCreateSellerAccount();
        break;
      case "custom":
        // Create custom named account
        const cdp = getCdpClient();
        account = await cdp.evm.getOrCreateAccount({ name });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid wallet type" },
          { status: 400 }
        );
    }

    // 💾 NEW: Store wallet in database
    const walletName = type === "custom" ? name : type.charAt(0).toUpperCase() + type.slice(1);

    console.log('Wallet creation debug:', {
      userId: user.id,
      userIdType: typeof user.id,
      accountAddress: account.address,
      walletName: walletName,
      userIdString: String(user.id)
    });

    // Ensure user_id is properly formatted as string
    const userIdString = String(user.id);

    const { data: wallet, error: dbError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userIdString,
        wallet_address: account.address,
        wallet_name: walletName,
        network: 'base-sepolia'
      })
      .select()
      .single();

    console.log('Database insert result:', { wallet, dbError });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save wallet to database' },
        { status: 500 }
      );
    }

    // 📝 Log wallet creation (temporarily disabled for debugging)
    try {
      await supabase.rpc('log_wallet_operation', {
        p_user_id: userIdString,
        p_wallet_id: wallet.id,
        p_operation_type: 'create',
        p_token_type: 'eth',
        p_status: 'success'
      });
      console.log('RPC logging successful');
    } catch (rpcError) {
      console.error('RPC logging failed:', rpcError);
      // Don't fail the entire operation if RPC logging fails
    }

    return NextResponse.json({
      address: wallet.wallet_address,
      name: wallet.wallet_name,
      wallet_id: wallet.id,
      type
    }, { status: 201 });

  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
