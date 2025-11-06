"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle } from "lucide-react";

interface FundingPanelProps {
  walletAddress: string;
  onFunded: () => void;
}

interface FundingTransaction {
  transactionHash: string;
  status: "pending" | "success" | "failed";
  token: string;
  explorerUrl?: string;
  timestamp: string;
  amount?: string;
}

export function FundingPanel({ walletAddress, onFunded }: FundingPanelProps) {
  const [loadingToken, setLoadingToken] = useState<"usdc" | "eth" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<FundingTransaction | null>(null);

  // 401 error handler
  const handleApiError = (response: Response) => {
    if (response.status === 401) {
      window.location.href = '/sign-in?redirectTo=/wallet';
      return true;
    }
    return false;
  };

  const pollBalanceUpdate = async (
    previousBalance: number,
    expectedIncrease: number,
    tokenType: 'usdc' | 'eth'
  ): Promise<boolean> => {
    const maxAttempts = 18; // 90 seconds total
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      try {
        const response = await fetch(`/api/wallet/balance?address=${walletAddress}&t=${Date.now()}`);
        const data = await response.json();
        
        // Get current balance for the specific token
        const currentBalance = tokenType === 'usdc' ? data.usdc : data.eth;
        
        // Check if balance increased by at least 95% of expected (tolerance for rounding)
        const minimumExpectedBalance = previousBalance + (expectedIncrease * 0.95);
        const actualIncrease = currentBalance - previousBalance;
        
        if (currentBalance >= minimumExpectedBalance) {
          setSuccessMessage(
            `✅ Balance updated! Received ${actualIncrease.toFixed(tokenType === 'eth' ? 6 : 4)} ${tokenType.toUpperCase()}`
          );
          onFunded();
          return true;
        }
        
        // Wait before next attempt (except on last attempt)
        if (attempts < maxAttempts - 1) {
          await delay(5000);
        }
      } catch (error) {
        console.warn("Balance polling failed:", error);
        if (attempts < maxAttempts - 1) {
          await delay(5000);
        }
      }
    }
    
    // All attempts exhausted
    setSuccessMessage(
      `✅ Transaction successful! Balance should update shortly.`
    );
    onFunded();
    return false;
  };

  const handleFundWallet = async (token: "usdc" | "eth") => {
    try {
      setLoadingToken(token);
      setError(null);
      setSuccessMessage(null);

      // Get current balance BEFORE funding
      const preBalanceResponse = await fetch(`/api/wallet/balance?address=${walletAddress}&t=${Date.now()}`);
      const preBalanceData = await preBalanceResponse.json();
      const previousBalance = token === "usdc" 
        ? (preBalanceData.usdc || 0)
        : (preBalanceData.eth || 0);

      const response = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          token: token,
        }),
      });

      if (handleApiError(response)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fund wallet");
      }

      const result = await response.json();
      
      // Determine amount based on token type
      const amount = token === "usdc" ? "1.0 USDC" : "0.001 ETH";
      const expectedIncrease = token === "usdc" ? 1.0 : 0.001;
      
      // Store transaction
      const newTransaction: FundingTransaction = {
        transactionHash: result.transactionHash,
        status: result.status === "success" ? "success" : "pending",
        token: result.token,
        explorerUrl: result.explorerUrl,
        timestamp: new Date().toISOString(),
        amount,
      };

      setLastTransaction(newTransaction);
      
      // Poll for balance update
      setTimeout(() => {
        pollBalanceUpdate(previousBalance, expectedIncrease, token);
      }, 5000);
      
    } catch (err) {
      if (err instanceof Error && err.message.includes("rate limit")) {
        setError("Rate limit exceeded. Please wait before requesting more funds.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to fund wallet");
      }
    } finally {
      setLoadingToken(null);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="p-6 bg-card text-card-foreground rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Request Funds</h3>
      
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-1">Wallet:</div>
        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {formatAddress(walletAddress)}
        </code>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Funding Requested!</span>
            </div>
            <p className="text-sm mb-3">{successMessage}</p>
            {lastTransaction?.explorerUrl && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(lastTransaction.explorerUrl, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Transaction on Base Sepolia Explorer
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleFundWallet("eth")}
            disabled={loadingToken !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loadingToken === "eth" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Requesting...
              </>
            ) : (
              "Request ETH"
            )}
          </Button>

          <Button
            onClick={() => handleFundWallet("usdc")}
            disabled={loadingToken !== null}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loadingToken === "usdc" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Requesting...
              </>
            ) : (
              "Request USDC"
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>USDC:</strong> Request $1 USDC per 24 hours</p>
          <p><strong>ETH:</strong> Request ~0.001 ETH per 24 hours</p>
          <p><strong>Testnet Only:</strong> All funds are for Base Sepolia testnet</p>
        </div>
      </div>
    </div>
  );
}
