import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ethers } from "ethers";
import { getNetworkSafe } from "@/lib/features";
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
      console.log(`[USDC Balance] Processing tx: ${tx.id}, type: ${tx.operation_type}, token: ${tx.token_type}, amount: ${tx.amount}, status: ${tx.status}`);

      if (tx.token_type?.toLowerCase() === 'usdc' && tx.status === 'success') {
        const amount = tx.amount || 0;

        // Add incoming USDC (funding operations)
        if (tx.operation_type === 'fund') {
          balance += amount;
          console.log(`[USDC Balance] Added ${amount} USDC (fund), balance now: ${balance}`);
        }
        // Add other incoming operations as needed
        else if (tx.operation_type === 'receive') {
          balance += amount;
          console.log(`[USDC Balance] Added ${amount} USDC (receive), balance now: ${balance}`);
        }
        // Subtract outgoing operations
        else if (tx.operation_type === 'send') {
          balance -= amount;
          console.log(`[USDC Balance] Subtracted ${amount} USDC (send), balance now: ${balance}`);
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

/**
 * Calculate ETH balance from transaction history
 * Serves as fallback when blockchain call fails
 */
async function calculateETHBalance(walletId: string): Promise<number> {
  try {
    console.log(`[ETH Balance] Starting calculation for wallet: ${walletId}`);
    const supabase = await createClient();

    // Query all successful ETH transactions for this wallet
    const { data: transactions, error } = await supabase
      .rpc('get_wallet_transactions', {
        p_wallet_id: walletId,
        p_limit: 1000
      });

    if (error) {
      console.error('[ETH Balance] Error fetching transactions:', error);
      return 0;
    }

    console.log(`[ETH Balance] Found ${transactions?.length || 0} transactions for wallet ${walletId}`);

    let balance = 0;

    // Calculate balance from transaction history
    for (const tx of transactions || []) {
      if (tx.token_type?.toLowerCase() === 'eth' && tx.status === 'success') {
        const amount = tx.amount || 0;

        // Add incoming ETH
        if (tx.operation_type === 'fund') {
          balance += amount;
          console.log(`[ETH Balance] Added ${amount} ETH (fund), balance now: ${balance}`);
        } else if (tx.operation_type === 'receive') {
          balance += amount;
          console.log(`[ETH Balance] Added ${amount} ETH (receive), balance now: ${balance}`);
        }
        // Subtract outgoing operations
        else if (tx.operation_type === 'send') {
          balance -= amount;
          console.log(`[ETH Balance] Subtracted ${amount} ETH (send), balance now: ${balance}`);
        }
      }
    }

    const finalBalance = Math.max(0, balance);
    console.log(`[ETH Balance] Final calculated balance for wallet ${walletId}: ${finalBalance}`);
    return finalBalance;

  } catch (error) {
    console.error('[ETH Balance] Error calculating balance from history:', error);
    return 0;
  }
}

/**
 * Get wallet by address with improved error handling and retry logic
 */
async function getWalletByAddress(address: string, retries = 2) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[Wallet] Fetching wallet for address ${address} (attempt ${attempt + 1}/${retries})`);
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (error) {
        console.warn(`[Wallet] Attempt ${attempt + 1} error:`, error.message);
        if (attempt < retries - 1) {
          // Exponential backoff before retry
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
          continue;
        }
        return null;
      }

      console.log(`[Wallet] Successfully found wallet: ${data?.id}`);
      return data;
    } catch (error) {
      console.error(`[Wallet] Exception on attempt ${attempt + 1}:`, error instanceof Error ? error.message : error);
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
      }
    }
  }

  console.error('[Wallet] All retry attempts failed for address:', address);
  return null;
}

/**
 * Query transactions directly by address (fallback when wallet lookup fails)
 */
async function getTransactionsByAddress(address: string): Promise<any[]> {
  try {
    console.log(`[Transactions] Querying transactions directly by address: ${address}`);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .or(`from_address.eq.${address},to_address.eq.${address}`)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('[Transactions] Error fetching transactions by address:', error);
      return [];
    }

    console.log(`[Transactions] Found ${data?.length || 0} transactions for address ${address}`);
    return data || [];
  } catch (error) {
    console.error('[Transactions] Error in getTransactionsByAddress:', error);
    return [];
  }
}

/**
 * Calculate balance from transactions (used when wallet lookup fails)
 */
function calculateBalanceFromTransactions(transactions: any[], tokenType: string): number {
  let balance = 0;

  for (const tx of transactions || []) {
    if (tx.token_type?.toLowerCase() === tokenType.toLowerCase() && tx.status === 'success') {
      const amount = tx.amount || 0;

      if (tx.operation_type === 'fund' || tx.operation_type === 'receive') {
        balance += amount;
      } else if (tx.operation_type === 'send') {
        balance -= amount;
      }
    }
  }

  return Math.max(0, balance);
}

const balanceQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    const validation = balanceQuerySchema.safeParse({ address });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid address format", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Fetching balances for address using ethers
    let usdcAmount = 0;
    let ethAmount = 0;
    let usdcSource = 'error'; // Track how USDC balance was obtained
    let ethSource = 'error';
    const balanceSource = 'blockchain';
    const network = getNetworkSafe();

    console.log(`[Balance API] Processing balance request for address: ${validation.data.address} on network: ${network}`);

    try {
      const provider = new ethers.JsonRpcProvider(RPC_URLS[network as keyof typeof RPC_URLS]);

      // ============ ETH BALANCE ============
      try {
        console.log('[Balance API] Fetching ETH balance from blockchain...');
        const ethBalanceWei = await provider.getBalance(validation.data.address);
        ethAmount = Number(ethBalanceWei) / 1000000000000000000; // Convert wei to ETH
        ethSource = 'contract';
        console.log(`[Balance API] ETH balance from blockchain: ${ethAmount}`);
      } catch (ethError) {
        console.warn('[Balance API] Blockchain ETH fetch failed, trying transaction history:', ethError instanceof Error ? ethError.message : ethError);
        // Fallback to transaction history for ETH
        try {
          const wallet = await getWalletByAddress(validation.data.address);
          if (wallet) {
            ethAmount = await calculateETHBalance(wallet.id);
            ethSource = 'calculated';
            console.log(`[Balance API] ETH balance from transaction history: ${ethAmount}`);
          } else {
            console.log('[Balance API] No wallet found, trying direct transaction query...');
            const transactions = await getTransactionsByAddress(validation.data.address);
            ethAmount = calculateBalanceFromTransactions(transactions, 'eth');
            ethSource = 'transaction-query';
            console.log(`[Balance API] ETH balance from direct transaction query: ${ethAmount}`);
          }
        } catch (calcError) {
          console.error('[Balance API] Failed to calculate ETH fallback:', calcError);
          ethAmount = 0;
          ethSource = 'error';
        }
      }

      // ============ USDC BALANCE ============
      if (network === "base-sepolia") {
        try {
          console.log('[Balance API] Fetching USDC balance from contract...');
          const usdcContract = new ethers.Contract(
            USDC_CONTRACT_ADDRESS,
            USDC_ABI,
            provider
          );

          const contractBalance = await usdcContract.balanceOf(validation.data.address);
          usdcAmount = Number(contractBalance) / 1000000; // USDC has 6 decimals
          usdcSource = 'contract';
          console.log(`[Balance API] Contract USDC balance: ${usdcAmount}`);

          // Always try calculating from transaction history for comparison/debugging
          console.log('[Balance API] Checking transaction history for comparison...');
          const wallet = await getWalletByAddress(validation.data.address);

          if (wallet) {
            const calculatedBalance = await calculateUSDCBalance(wallet.id);
            console.log(`[Balance API] Calculated balance: ${calculatedBalance}`);

            // Use calculated balance if contract returns 0 or if calculated > contract
            if (usdcAmount === 0 && calculatedBalance > 0) {
              console.log(`[Balance API] Using calculated balance instead of contract 0: ${calculatedBalance}`);
              usdcAmount = calculatedBalance;
              usdcSource = 'calculated';
            } else if (calculatedBalance > usdcAmount) {
              console.log(`[Balance API] Calculated balance (${calculatedBalance}) > contract (${usdcAmount}), using calculated`);
              usdcAmount = calculatedBalance;
              usdcSource = 'calculated';
            } else {
              console.log(`[Balance API] Keeping contract balance (${usdcAmount}) vs calculated (${calculatedBalance})`);
            }
          } else {
            console.log('[Balance API] No wallet found, trying direct transaction query...');
            const transactions = await getTransactionsByAddress(validation.data.address);
            const directQueryBalance = calculateBalanceFromTransactions(transactions, 'usdc');

            if (usdcAmount === 0 && directQueryBalance > 0) {
              console.log(`[Balance API] Using direct query balance instead of contract 0: ${directQueryBalance}`);
              usdcAmount = directQueryBalance;
              usdcSource = 'transaction-query';
            } else if (directQueryBalance > usdcAmount) {
              console.log(`[Balance API] Direct query balance (${directQueryBalance}) > contract (${usdcAmount}), using direct query`);
              usdcAmount = directQueryBalance;
              usdcSource = 'transaction-query';
            }
          }
        } catch (usdcError) {
          console.warn('[Balance API] Contract call failed, trying transaction history:', usdcError instanceof Error ? usdcError.message : usdcError);
          // Try calculating from transaction history as fallback
          try {
            console.log('[Balance API] In catch block, looking up wallet for fallback calculation');
            const wallet = await getWalletByAddress(validation.data.address);
            
            if (wallet) {
              const calculatedBalance = await calculateUSDCBalance(wallet.id);
              console.log(`[Balance API] Fallback calculated balance: ${calculatedBalance}`);
              usdcAmount = calculatedBalance;
              usdcSource = 'calculated';
              console.log(`[Balance API] Set usdcAmount to ${usdcAmount} and usdcSource to ${usdcSource}`);
            } else {
              console.log('[Balance API] No wallet found, trying direct transaction query as final fallback');
              const transactions = await getTransactionsByAddress(validation.data.address);
              const directQueryBalance = calculateBalanceFromTransactions(transactions, 'usdc');
              usdcAmount = directQueryBalance;
              usdcSource = 'transaction-query';
              console.log(`[Balance API] Fallback direct query USDC balance: ${usdcAmount}`);
            }
          } catch (calcError) {
            console.error('[Balance API] Fallback calculation failed:', calcError);
            usdcAmount = 0; // Default to 0 if all methods fail
            usdcSource = 'error';
          }
        }
      }

    } catch (error) {
      console.error('Error fetching balances:', error);
      // Continue with zero balances if fetch fails
    }

    console.log(`[Balance API] Final result - USDC: ${usdcAmount} (${usdcSource}), ETH: ${ethAmount} (${ethSource})`);

    return NextResponse.json({
      usdc: isNaN(usdcAmount) ? 0 : usdcAmount,
      eth: isNaN(ethAmount) ? 0 : ethAmount,
      lastUpdated: new Date().toISOString(),
      address: validation.data.address,
      balanceSource,
      usdcSource, // Track how USDC balance was obtained
      ethSource,  // Track how ETH balance was obtained
      debug: {
        usdcAmount,
        ethAmount,
        network,
        usdcSource,
        ethSource
      }
    });

  } catch (error) {
    // Balance check error
    return NextResponse.json(
      { error: "Failed to check balance", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
