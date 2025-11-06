'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle, Send, Shield, Lock } from 'lucide-react';

interface DeployerFundingResponse {
  success: boolean;
  transactionHash: string;
  deployer: {
    address: string;
  };
  amount: number;
  message: string;
}

export function DeployerFundingButton() {
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fundingResult, setFundingResult] = useState<DeployerFundingResponse | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [deployerAddress, setDeployerAddress] = useState<string | null>(null);

  // Load wallet on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await fetch('/api/wallet/list');
        if (response.ok) {
          const data = await response.json();
          if (data.wallets?.[0]?.address) {
            setUserWallet(data.wallets[0].address);
          }
        }
      } catch (err) {
        console.error('Failed to load wallet:', err);
      }
    };

    const getDeployerAddress = async () => {
      try {
        const response = await fetch('/api/contract/deployer-info');
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setDeployerAddress(data.address);
          }
        }
      } catch (err) {
        console.error('Failed to load deployer info:', err);
      }
    };

    loadWallet();
    getDeployerAddress();
  }, []);

  const handleFundDeployer = async () => {
    if (!userWallet) {
      setError('User wallet not available');
      return;
    }

    setIsFunding(true);
    setError(null);
    setSuccess(null);
    setFundingResult(null);

    try {
      const response = await fetch('/api/wallet/fund-deployer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: userWallet,
          amount: 0.01 // Standard funding amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fund deployer');
      }

      const data = await response.json();
      setFundingResult(data);
      setSuccess(`✅ Successfully funded deployer with ${data.amount} ETH! Transaction: ${data.transactionHash}`);

      // Reset after success
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <Card className="w-full border-blue-200 dark:border-blue-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Send className="w-5 h-5 text-blue-500" />
          <div>
            <CardTitle>ERC721 Universal Deployer</CardTitle>
            <CardDescription>
              Shared secure wallet for deploying ERC721 collections (funding optional)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Universal Deployer Info Box */}
        <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md">
          <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <p className="font-medium">🔄 Universal Deployer Architecture</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>All users share one secure deployer wallet</li>
              <li>Funded once, can deploy unlimited collections</li>
              <li>Funding is <strong>optional</strong> - only needed if balance is low</li>
              <li>Each deployment costs ~0.005 ETH in gas</li>
            </ul>
          </div>
        </div>

        {/* Security Info Box */}
        <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
          <Shield className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <p className="font-medium flex items-center gap-2">
              <Lock className="w-3 h-3" />
              🔒 Private Key Security
            </p>
            <p>
              ✅ Private keys are NEVER exposed to the browser
            </p>
            <p>
              ✅ Only server-side deployment with ethers.js
            </p>
            <p>
              ✅ Secure environment variables (not in code)
            </p>
          </div>
        </div>

        {/* How It Works Box */}
        <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-medium">How ERC721 Deployment Works</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Fund deployer if needed (optional, one-time per user)</li>
              <li>Your browser sends deployment request</li>
              <li>Server receives request (private key stays on server)</li>
              <li>ethers.js signs transaction with deployer wallet</li>
              <li>Contract deployed & verified on BaseScan</li>
            </ol>
            <p className="font-medium mt-2">
              🔐 Private key: Always server-side, never browser!
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
            <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
          </div>
        )}

        {/* Funding Result Details */}
        {fundingResult && (
          <div className="p-4 bg-muted rounded-md space-y-3 border">
            <div className="font-semibold text-sm">Funding Details</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Universal Deployer Address:</span>
                <code className="bg-background px-2 py-1 rounded font-mono text-xs">
                  {deployerAddress?.slice(0, 10)}...{deployerAddress?.slice(-8)}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Sent:</span>
                <span className="font-medium">{fundingResult.amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction:</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${fundingResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs truncate"
                >
                  View on BaseScan →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Deployer Address Display */}
        {deployerAddress && (
          <div className="p-3 bg-muted rounded-md border">
            <div className="text-xs text-muted-foreground mb-1">Universal Deployer Wallet Address</div>
            <code className="text-xs font-mono break-all">{deployerAddress}</code>
            <p className="text-xs text-muted-foreground mt-2">
              This shared secure wallet is used server-side only to deploy all ERC721 contracts efficiently.
            </p>
          </div>
        )}

        {/* Fund Button */}
        <Button
          onClick={handleFundDeployer}
          disabled={isFunding || !userWallet}
          className="w-full h-10 font-semibold"
          size="lg"
        >
          {isFunding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Funding Universal Deployer...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Fund Universal Deployer (0.01 ETH - Optional)
            </>
          )}
        </Button>

        {/* Technical Details Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-md border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">🔧 Technical Details</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Architecture:</strong> Single universal deployer for all users</li>
              <li><strong>Deployment Method:</strong> ethers.js direct to blockchain</li>
              <li><strong>Network:</strong> Base Sepolia Testnet</li>
              <li><strong>Gas Cost:</strong> ~0.005 ETH per deployment</li>
              <li><strong>Confirmation Time:</strong> 15-30 seconds</li>
              <li><strong>Private Key:</strong> Stored in server env vars only</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
