'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Droplet, CheckCircle2, AlertTriangle } from 'lucide-react';

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

interface SuperFaucetButtonProps {
  walletAddress?: string;
}

export function SuperFaucetButton({ walletAddress: initialAddress }: SuperFaucetButtonProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuperFaucetResponse | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(initialAddress || null);

  // Load wallet address and current balance on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        setLoadingBalance(true);
        
        // If we don't have a wallet address, fetch from API
        let address = initialAddress;
        if (!address) {
          const walletResponse = await fetch('/api/wallet/list');
          if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            if (walletData.wallets?.[0]?.address) {
              address = walletData.wallets[0].address;
              setWalletAddress(address as string);
            }
          }
        } else {
          setWalletAddress(address as string);
        }

        // Load balance if we have an address
        if (address) {
          const response = await fetch(`/api/wallet/balance?address=${address}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentBalance(data.eth || 0);
          }
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
      } finally {
        setLoadingBalance(false);
      }
    };

    initializeWallet();
  }, [initialAddress]);

  const loadBalance = async () => {
    if (!walletAddress) return;
    try {
      setLoadingBalance(true);
      const response = await fetch(`/api/wallet/balance?address=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentBalance(data.eth); // ✅ FIXED: Use data.eth instead of data.balance
      }
    } catch (err) {
      console.error('Failed to load balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSuperFaucet = async () => {
    setIsRequesting(true);
    setError(null);
    setResult(null);

    try {
      if (!walletAddress) {
        throw new Error('Wallet address not available');
      }

      const response = await fetch('/api/wallet/super-faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request faucet funds');
      }

      const data = await response.json();
      setResult(data);
      setCurrentBalance(data.finalBalance);

      // Auto refresh after a moment to ensure blockchain state is updated
      setTimeout(() => loadBalance(), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Droplet className="w-5 h-5 text-blue-500" />
          <div>
            <CardTitle>Testnet Funds</CardTitle>
            <CardDescription>
              Request free Base Sepolia ETH for testing
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Balance Display */}
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
          {loadingBalance ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <div className="text-2xl font-bold">
              {currentBalance !== null ? currentBalance.toFixed(6) : '0.000000'} ETH
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        {/* Success Message and Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
              <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-green-700 dark:text-green-300">
                ✅ Successfully received {result.totalReceived.toFixed(6)} ETH!
              </div>
            </div>

            {/* Result Details */}
            <div className="p-3 bg-muted rounded-md space-y-2 border text-xs">
              <div className="font-medium">Request Details</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Requests:</span>
                  <span className="ml-2 font-mono">{result.requestCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Before:</span>
                  <span className="ml-2 font-mono">{result.startBalance.toFixed(6)} ETH</span>
                </div>
                <div>
                  <span className="text-muted-foreground">After:</span>
                  <span className="ml-2 font-mono">{result.finalBalance.toFixed(6)} ETH</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-mono">+{result.totalReceived.toFixed(6)} ETH</span>
                </div>
              </div>

              {/* Explorer Links */}
              {result.explorerUrls.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <div className="font-medium mb-1">Transaction Links:</div>
                  <div className="space-y-1">
                    {result.explorerUrls.slice(0, 3).map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline text-xs truncate"
                      >
                        TX {idx + 1} → View on BaseScan
                      </a>
                    ))}
                    {result.explorerUrls.length > 3 && (
                      <div className="text-muted-foreground text-xs">
                        +{result.explorerUrls.length - 3} more transactions
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-medium">Super Faucet</p>
            <p>Requests multiple faucet transactions to accumulate testnet ETH. Target: ~0.05 ETH</p>
            <p>Conservative spacing prevents rate-limiting. May take a few minutes.</p>
          </div>
        </div>

        {/* Request Button */}
        <Button
          onClick={handleSuperFaucet}
          disabled={isRequesting || !walletAddress}
          className="w-full h-10 font-semibold"
          size="lg"
        >
          {isRequesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Requesting Funds...
            </>
          ) : (
            <>
              <Droplet className="mr-2 h-4 w-4" />
              Request Testnet Funds
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
