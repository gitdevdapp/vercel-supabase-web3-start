import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { isCDPConfigured, getNetworkSafe, FEATURE_ERRORS } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";

// USDC contract details for Base Sepolia
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC231BcE1BDaE0";
const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
] as const;

// RPC URLs for different networks
const RPC_URLS = {
  "base-sepolia": "https://sepolia.base.org",
  "base": "https://mainnet.base.org"
} as const;

/**
 * Calculate USDC balance from transaction history
 * This serves as a reliable fallback when direct contract calls fail
 */
async function calculateUSDCBalance(walletId: string): Promise<number> {
  try {
    console.log(`[USDC Balance] Starting calculation for wallet: ${walletId}`);
    const supabase = await createClient();

    // Query all successful USDC transactions for this wallet
    const { data: transactions, error } = await supabase
      .rpc('get_wallet_transactions', {
        p_wallet_id: walletId,
        p_limit: 1000 // Get recent transactions for balance calculation
      });

    if (error) {
      console.error('[USDC Balance] Error fetching transactions:', error);
      return 0;
    }

    console.log(`[USDC Balance] Found ${transactions?.length || 0} transactions for wallet ${walletId}`);

    let balance = 0;

    // Calculate balance from transaction history
    for (const tx of transactions || []) {
      if (tx.token_type?.toLowerCase() === 'usdc' && tx.status === 'success') {
        const amount = tx.amount || 0;

        // Add incoming USDC (funding operations)
        if (tx.operation_type === 'fund') {
          balance += amount;
        }
        // Add other incoming operations as needed
        else if (tx.operation_type === 'receive') {
          balance += amount;
        }
        // Subtract outgoing operations
        else if (tx.operation_type === 'send') {
          balance -= amount;
        }
      }
    }

    const finalBalance = Math.max(0, balance);
    console.log(`[USDC Balance] Final calculated balance for wallet ${walletId}: ${finalBalance}`);
    return finalBalance;

  } catch (error) {
    console.error('[USDC Balance] Error calculating balance from history:', error);
    return 0;
  }
}

export async function GET() {
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
      return NextResponse.json({
        error: FEATURE_ERRORS.CDP_NOT_CONFIGURED,
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      }, { status: 503 });
    }

    // 🎯 SUPABASE-FIRST: Query database for user's wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (walletsError) {
      console.error('Error fetching wallets from database:', walletsError);
      return NextResponse.json(
        { error: 'Failed to fetch wallets', details: walletsError.message },
        { status: 500 }
      );
    }

    // If no wallets, return empty list
    if (!wallets || wallets.length === 0) {
      return NextResponse.json({
        wallets: [],
        count: 0,
        lastUpdated: new Date().toISOString()
      });
    }

    const network = getNetworkSafe();

    // Get balances for each wallet using ethers
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          let usdcAmount = 0;
          let ethAmount = 0;

          const provider = new ethers.JsonRpcProvider(RPC_URLS[network as keyof typeof RPC_URLS]);

          // Get ETH balance directly from blockchain
          const ethBalanceWei = await provider.getBalance(wallet.wallet_address);
          ethAmount = Number(ethBalanceWei) / 1000000000000000000; // Convert wei to ETH
          console.log(`[Wallet List] ETH Balance for ${wallet.wallet_address}: ${ethAmount}`);

          // Get USDC balance from contract (if on testnet)
          if (network === "base-sepolia") {
            try {
              console.log(`[Wallet List] Fetching USDC balance for ${wallet.wallet_address} on ${network}`);
              const usdcContract = new ethers.Contract(
                USDC_CONTRACT_ADDRESS,
                USDC_ABI,
                provider
              );

              const contractBalance = await usdcContract.balanceOf(wallet.wallet_address);
              usdcAmount = Number(contractBalance) / 1000000; // USDC has 6 decimals
              console.log(`[Wallet List] USDC Raw: ${contractBalance.toString()}, Converted: ${usdcAmount}`);
            } catch (usdcError) {
              console.warn(`[Wallet List] Contract call failed for ${wallet.wallet_address}, trying fallback:`, usdcError instanceof Error ? usdcError.message : usdcError);
              // Fallback to transaction history calculation
              try {
                usdcAmount = await calculateUSDCBalance(wallet.id);
                console.log(`[Wallet List] Using calculated USDC balance for ${wallet.wallet_address}: ${usdcAmount}`);
              } catch (calcError) {
                console.error(`[Wallet List] Failed to calculate USDC balance for ${wallet.wallet_address}:`, calcError);
                usdcAmount = 0;
              }
            }
          }

          const result = {
            id: wallet.id,                          // ✅ Database UUID (critical for operations)
            name: wallet.wallet_name,
            address: wallet.wallet_address,
            network: wallet.network,
            balances: {
              usdc: isNaN(usdcAmount) ? 0 : usdcAmount,
              eth: isNaN(ethAmount) ? 0 : ethAmount,
            },
            created_at: wallet.created_at,
            lastUpdated: new Date().toISOString()
          };
          console.log(`[Wallet List] Final result for ${wallet.wallet_address}:`, result.balances);
          return result;
        } catch (error) {
          // Error getting balances for wallet
          console.error(`[Wallet List] Error loading balances for ${wallet.wallet_address}:`, error instanceof Error ? error.message : error);
          return {
            id: wallet.id,
            name: wallet.wallet_name,
            address: wallet.wallet_address,
            network: wallet.network,
            balances: {
              usdc: 0,
              eth: 0,
            },
            created_at: wallet.created_at,
            lastUpdated: new Date().toISOString(),
            error: "Failed to load balances"
          };
        }
      })
    );

    return NextResponse.json({
      wallets: walletsWithBalances,
      count: walletsWithBalances.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('List wallets error:', error);
    return NextResponse.json(
      { error: "Failed to list wallets", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
