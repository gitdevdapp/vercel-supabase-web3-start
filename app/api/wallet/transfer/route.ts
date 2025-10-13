import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
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

const transferSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid from address format"),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid to address format"),
  amount: z.number().positive("Amount must be positive"),
  token: z.enum(["usdc", "eth"], { errorMap: () => ({ message: "Token must be 'usdc' or 'eth'" }) })
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
    const validation = transferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { fromAddress, toAddress, amount, token } = validation.data;
    const network = getNetworkSafe();

    // Only allow transfers on testnet
    if (network !== "base-sepolia") {
      return NextResponse.json(
        { error: "Transfers only available on testnet (base-sepolia)" },
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

    const cdp = getCdpClient();
    
    // Get sender account from CDP using the wallet name
    // This ensures we retrieve the correct account that was created with getOrCreateAccount
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

    // Scope the account to the network to get transfer capabilities
    const senderAccount = await account.useNetwork(network);

    // ============================================================================
    // HANDLE ETH TRANSFERS (Native Currency)
    // ============================================================================
    if (token === 'eth') {
      try {
        // Check ETH balance first
        const balances = await senderAccount.listTokenBalances({});
        const ethBalance = balances?.balances?.find(
          (balance) => 
            balance?.token?.symbol === "ETH"
        );
        
        const currentBalance = ethBalance?.amount ? Number(ethBalance.amount) : 0;
        
        // Reserve ETH for gas fees (0.0001 ETH minimum)
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
        
        // Use CDP's built-in transfer method
        const result = await senderAccount.transfer({
          token: 'eth',
          amount: BigInt(Math.floor(amount * 1e18)), // Convert ETH to wei
          to: toAddress as `0x${string}`
        });
        
        // 📝 Log successful transfer
        await supabase.rpc('log_wallet_operation', {
          p_user_id: user.id,
          p_wallet_id: wallet.id,
          p_operation_type: 'send',
          p_token_type: 'eth',
          p_amount: amount,
          p_from_address: fromAddress,
          p_to_address: toAddress,
          p_tx_hash: result.transactionHash,
          p_status: 'success'
        });
        
        return NextResponse.json({
          transactionHash: result.transactionHash,
          status: 'submitted',
          fromAddress,
          toAddress,
          amount,
          token: 'ETH',
          explorerUrl: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
          timestamp: new Date().toISOString()
        });
        
      } catch (transferError) {
        console.error("ETH transfer failed:", transferError);
        
        // Log failed transfer
        try {
          await supabase.rpc('log_wallet_operation', {
            p_user_id: user.id,
            p_wallet_id: wallet.id,
            p_operation_type: 'send',
            p_token_type: 'eth',
            p_amount: amount,
            p_from_address: fromAddress,
            p_to_address: toAddress,
            p_tx_hash: null,
            p_status: 'failed',
            p_error_message: transferError instanceof Error ? transferError.message : 'Unknown error'
          });
        } catch (logError) {
          console.error("Failed to log error:", logError);
        }
        
        return NextResponse.json(
          { 
            error: "ETH transfer failed", 
            details: transferError instanceof Error ? transferError.message : "Unknown error"
          },
          { status: 500 }
        );
      }
    }

    // ============================================================================
    // HANDLE USDC TRANSFERS (ERC-20 Token)
    // ============================================================================
    // Check sender balance first
    try {
      const balances = await senderAccount.listTokenBalances({});

      const usdcBalance = balances?.balances?.find(
        (balance) => balance?.token?.symbol === "USDC"
      );

      const currentBalance = usdcBalance?.amount ? Number(usdcBalance.amount) / 1000000 : 0;
      
      if (currentBalance < amount) {
        return NextResponse.json(
          { 
            error: "Insufficient USDC balance", 
            available: currentBalance,
            requested: amount 
          },
          { status: 400 }
        );
      }
    } catch (balanceError) {
      console.warn("Could not check balance before transfer:", balanceError);
      // Continue with transfer attempt
    }

    // Execute USDC transfer using CDP's native transfer method
    try {
      // Use CDP's built-in transfer method
      // USDC has 6 decimals, so convert amount to atomic units
      const result = await senderAccount.transfer({
        token: 'usdc',
        amount: BigInt(Math.floor(amount * 1000000)), // Convert USDC to microUSDC
        to: toAddress as `0x${string}`
      });
      
      // 📝 Log successful transfer
      await supabase.rpc('log_wallet_operation', {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_operation_type: 'send',
        p_token_type: token,
        p_amount: amount,
        p_from_address: fromAddress,
        p_to_address: toAddress,
        p_tx_hash: result.transactionHash,
        p_status: 'success'
      });
      
      return NextResponse.json({
        transactionHash: result.transactionHash,
        status: 'submitted',
        fromAddress,
        toAddress,
        amount,
        token: token.toUpperCase(),
        explorerUrl: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
        timestamp: new Date().toISOString()
      });

    } catch (transferError) {
      console.error("Transfer execution failed:", transferError);
      throw transferError;
    }

  } catch (error) {
    console.error("Transfer error:", error);
    
    let errorMessage = "Transfer failed";
    const errorDetails = error instanceof Error ? error.message : "Unknown error";
    
    // Provide user-friendly error messages
    if (errorDetails.includes("insufficient funds") || errorDetails.includes("insufficient balance")) {
      errorMessage = "Insufficient funds for transfer (including gas fees)";
    } else if (errorDetails.includes("nonce")) {
      errorMessage = "Transaction nonce error - please try again";
    } else if (errorDetails.includes("gas")) {
      errorMessage = "Gas estimation failed - please ensure wallet has ETH for gas";
    } else if (errorDetails.includes("rate limit") || errorDetails.includes("429")) {
      errorMessage = "Rate limit exceeded - please wait before trying again";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        suggestion: "Ensure sender wallet has sufficient USDC and ETH for gas fees"
      },
      { status: 500 }
    );
  }
}
