'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, Loader2, AlertCircle, CheckCircle2, ChevronDown, TrendingUp, Droplet } from "lucide-react";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";

interface WalletData {
  id: string;
  wallet_address: string;
  wallet_name: string;
  network: string;
  balances?: {
    eth: number;
    usdc: number;
  };
}

interface FaucetStatus {
  step: number;
  balance: number;
  timestamp: string;
}

interface SuperFaucetResponse {
  success: boolean;
  requestCount: number;
  startBalance: number;
  finalBalance: number;
  totalReceived: number;
  transactionHashes: string[];
  statusUpdates: FaucetStatus[];
  explorerUrls: string[];
}

export function ProfileWalletCard() {
  console.log('[ProfileWalletCard] Component starting...');

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUSDCFunding, setIsUSDCFunding] = useState(false);
  const [usdcFundingError, setUSDCFundingError] = useState<string | null>(null);
  const [balanceRefreshInterval, setBalanceRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  // ✅ FIX: Use refs for counters to prevent unnecessary re-renders
  const autoCreateAttempts = useRef(0);
  const MAX_AUTO_CREATE_ATTEMPTS = 3;
  const loadWalletInProgress = useRef(false);
  const usdcRefreshAttempts = useRef(0);
  const MAX_USDC_REFRESH_ATTEMPTS = 5;

  console.log('[ProfileWalletCard] State initialized, isLoading:', isLoading);

  // ✅ FIX: useEffect with empty dependency array - runs only on mount
  useEffect(() => {
    console.log('[ProfileWalletCard] useEffect triggered (mount only)');
    loadWallet();
  }, []);

  const loadWallet = async () => {
    // ✅ FIX: Prevent concurrent loadWallet calls (debounce)
    if (loadWalletInProgress.current) {
      console.log('[ProfileWalletCard] loadWallet already in progress, skipping');
      return;
    }
    
    loadWalletInProgress.current = true;
    console.log('[ProfileWalletCard] loadWallet starting...');
    try {
      setIsLoading(true);
      setError(null);
      console.log('[ProfileWalletCard] Fetching /api/wallet/list...');
      
      const response = await fetch('/api/wallet/list');
      console.log('[ProfileWalletCard] /api/wallet/list response:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to load wallet: ${response.status}`);
      }

      console.log('[ProfileWalletCard] Parsing response JSON...');
      const data = await response.json();
      console.log('[ProfileWalletCard] Response data:', data);

      if (data.wallets && data.wallets.length > 0) {
        console.log('[ProfileWalletCard] Found wallets:', data.wallets.length);
        const firstWallet = data.wallets[0];

        // ✅ CRITICAL FIX: Get real-time blockchain balances for accurate funding decisions
        let ethBalance = 0;
        let usdcBalance = 0;

        try {
          const balanceResponse = await fetch(`/api/wallet/balance?address=${firstWallet.address}&t=${Date.now()}`);
          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            ethBalance = balanceData.eth || 0;
            usdcBalance = balanceData.usdc || 0;
            console.log('[ProfileWalletCard] Real-time balances loaded:', { eth: ethBalance, usdc: usdcBalance });
          } else {
            console.warn('[ProfileWalletCard] Balance API failed, using database balances');
            ethBalance = firstWallet.balances?.eth || 0;
            usdcBalance = firstWallet.balances?.usdc || 0;
          }
        } catch (err) {
          console.error('[ProfileWalletCard] Error fetching real-time balances:', err);
          // Fallback to database balances if endpoint fails
          ethBalance = firstWallet.balances?.eth || 0;
          usdcBalance = firstWallet.balances?.usdc || 0;
        }

        const walletData = {
          id: firstWallet.id,
          wallet_address: firstWallet.address,
          wallet_name: firstWallet.name,
          network: firstWallet.network || 'base-sepolia',
          balances: {
            eth: ethBalance,
            usdc: usdcBalance
          }
        };
        console.log('[ProfileWalletCard] Setting wallet data:', walletData);
        setWallet(walletData);
        console.log('[ProfileWalletCard] Wallet set successfully');
        
        // ✅ FIX: Reset auto-create attempts on successful wallet load
        autoCreateAttempts.current = 0;
      } else {
        console.log('[ProfileWalletCard] No wallets found');
        
        // ✅ FIX: Check if we've exceeded max auto-create attempts
        if (autoCreateAttempts.current >= MAX_AUTO_CREATE_ATTEMPTS) {
          console.error('[ProfileWalletCard] Max auto-create attempts exceeded');
          setError('Unable to create wallet after multiple attempts. Please try again later.');
          setWallet(null);
        } else {
          console.log(`[ProfileWalletCard] Triggering auto-create (attempt ${autoCreateAttempts.current + 1}/${MAX_AUTO_CREATE_ATTEMPTS})`);
          autoCreateAttempts.current++;

          // Auto-create wallet if none exists
          try {
            const createResponse = await fetch('/api/wallet/auto-create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });

            if (createResponse.ok) {
              const createData = await createResponse.json();
              console.log('[ProfileWalletCard] Auto-create successful:', createData);

              // ✅ FIX: Only reload if wallet was actually created (created: true)
              if (createData.created) {
                console.log('[ProfileWalletCard] Wallet created, reloading in 1 second...');
                // Wait for database replication before reloading
                setTimeout(() => {
                  loadWalletInProgress.current = false;
                  loadWallet();
                }, 1000);
                return;
              } else {
                console.warn('[ProfileWalletCard] Auto-create returned created: false, wallet may already exist');
                // Try loading again immediately
                setTimeout(() => {
                  loadWalletInProgress.current = false;
                  loadWallet();
                }, 500);
                return;
              }
            } else {
              console.error('[ProfileWalletCard] Auto-create failed with status:', createResponse.status);
              const errorData = await createResponse.json();
              console.error('[ProfileWalletCard] Auto-create error:', errorData);
              setError(errorData.error || 'Failed to create wallet');
            }
          } catch (createErr) {
            console.error('[ProfileWalletCard] Auto-create error:', createErr);
            setError('Failed to create wallet: ' + (createErr instanceof Error ? createErr.message : 'Unknown error'));
          }
        }
      }
    } catch (err) {
      console.error('[ProfileWalletCard] Error loading wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      console.log('[ProfileWalletCard] loadWallet finally - ensuring loading is false');
      loadWalletInProgress.current = false;
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.wallet_address);
      console.log('Address copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const triggerAutoFaucet = async () => {
    if (!wallet) return;
    console.log('[ProfileWalletCard] Triggering auto-superfaucet...');
    try {
      const response = await fetch('/api/wallet/auto-superfaucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet.wallet_address })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('[ProfileWalletCard] Auto-faucet result:', result);
        // Reload wallet to show updated balance
        setTimeout(() => loadWallet(), 2000);
      }
    } catch (err) {
      console.error('[ProfileWalletCard] Auto-faucet error:', err);
    }
  };

  const triggerUSDCFaucet = async () => {
    if (!wallet) return;
    console.log('[ProfileWalletCard] Triggering USDC faucet...');
    try {
      setIsUSDCFunding(true);
      setUSDCFundingError(null);

      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: wallet.wallet_address,
          token: 'usdc'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific CDP errors with user-friendly messages
        if (response.status === 429 && errorData.error?.includes('Faucet limit exceeded')) {
          throw new Error('Global Limit for Coinbase Faucet is 10 USDC per 24 hours - Follow our Guide to Deploy your own CDP Keys');
        }
        throw new Error(errorData.error || 'Failed to fund USDC');
      }

      const result = await response.json();
      console.log('[ProfileWalletCard] USDC faucet result:', result);

      // USDC balance sync requires longer delay due to database replication
      // and potential RPC timing issues on production
      setTimeout(() => {
        loadWallet();
        // Retry balance refresh after additional delay to ensure sync
        setTimeout(() => loadWallet(), 3000);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fund USDC';
      console.error('[ProfileWalletCard] USDC faucet error:', errorMessage);
      setUSDCFundingError(errorMessage);
    } finally {
      setIsUSDCFunding(false);
    }
  };

  // ✅ FIX: Memoized startAutoRefresh function to prevent recreation
  const startAutoRefresh = useRef(() => {
    console.log('[ProfileWalletCard] Auto-refresh starting, will attempt 5 times every 5 seconds');
    usdcRefreshAttempts.current = 0;
    const interval = setInterval(() => {
      usdcRefreshAttempts.current++;
      console.log(`[ProfileWalletCard] Auto-refresh attempt ${usdcRefreshAttempts.current}/${MAX_USDC_REFRESH_ATTEMPTS}`);
      loadWallet();
      
      // Stop after 5 attempts (25 seconds total)
      if (usdcRefreshAttempts.current >= MAX_USDC_REFRESH_ATTEMPTS) {
        console.log('[ProfileWalletCard] Auto-refresh complete after 5 attempts');
        clearInterval(interval);
        setBalanceRefreshInterval(null);
      }
    }, 5000);
    
    setBalanceRefreshInterval(interval);
  }).current;

  // ✅ FIX: Auto-refresh effect with improved dependency array
  useEffect(() => {
    if (isUSDCFunding && wallet) {
      console.log('[ProfileWalletCard] USDC funding started, scheduling auto-refresh...');
      // Start auto-refresh after 5 seconds
      const timeoutId = setTimeout(() => {
        console.log('[ProfileWalletCard] Starting auto-refresh sequence...');
        startAutoRefresh();
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isUSDCFunding, wallet, startAutoRefresh]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (balanceRefreshInterval) {
        console.log('[ProfileWalletCard] Cleaning up balance refresh interval on unmount');
        clearInterval(balanceRefreshInterval);
      }
    };
  }, [balanceRefreshInterval]);

  console.log('[ProfileWalletCard] About to render, isLoading:', isLoading, 'wallet exists:', !!wallet);

  if (isLoading) {
    console.log('[ProfileWalletCard] Rendering loading state');
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <div>
              <CardTitle>My Wallet</CardTitle>
              <CardDescription>Loading wallet information...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Initializing your wallet...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.log('[ProfileWalletCard] Rendering error state');
    return (
      <Card className="w-full border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <CardTitle>Wallet Error</CardTitle>
              <CardDescription>Unable to load your wallet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-destructive">{error}</div>
          </div>
          <Button onClick={loadWallet} variant="outline" className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    console.log('[ProfileWalletCard] Rendering no wallet state');
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            <div>
              <CardTitle>Creating Your Wallet</CardTitle>
              <CardDescription>This may take a moment...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating your wallet automatically...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('[ProfileWalletCard] Rendering wallet display');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <CardTitle>My Wallet</CardTitle>
            <CardDescription>Your Web3 wallet on Base Sepolia</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Wallet Address Section */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Wallet Address</div>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-muted border border-input">
              <code className="text-xs sm:text-sm font-mono break-all text-foreground">
                {wallet.wallet_address}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="flex-shrink-0"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Balances Grid with Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">ETH Balance</div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-lg font-semibold text-foreground">
                {wallet.balances?.eth?.toFixed(6) || '0.000000'}
              </p>
              <p className="text-xs text-muted-foreground">ETH</p>
            </div>
            {wallet.balances?.eth && wallet.balances.eth >= 0.01 && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-700 dark:text-amber-200">
                ℹ️ You already have {wallet.balances.eth.toFixed(6)} ETH, which is the maximum the faucet can provide. The faucet limit is 0.01 ETH per request.
              </div>
            )}
            <Button
              onClick={triggerAutoFaucet}
              disabled={!!(wallet.balances?.eth && wallet.balances.eth >= 0.01)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Droplet className="w-4 h-4 mr-2" />
              Request ETH
            </Button>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">USDC Balance</div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <p className="text-lg font-semibold text-foreground">
                ${wallet.balances?.usdc?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">USDC</p>
            </div>
            <Button
              onClick={triggerUSDCFaucet}
              disabled={isUSDCFunding}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isUSDCFunding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request USDC"
              )}
            </Button>
          </div>
        </div>

        {/* Funding Controls - Simple Buttons */}
        <div className="space-y-3 border-t pt-4">
          
          {usdcFundingError && (
            <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-xs text-red-600 dark:text-red-400">
              ❌ {usdcFundingError}
            </div>
          )}
        </div>

        {/* Transaction History - Collapsible */}
        <div className="space-y-3 border-t pt-4">
          <Button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            variant="outline"
            className="w-full flex justify-between items-center"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              📊 Transaction History
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
          </Button>

          {isHistoryOpen && (
            <div className="mt-3">
              <TransactionHistory walletId={wallet.id} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

