'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { VerifyContractButton } from './VerifyContractButton';
import { RefreshButton } from '@/components/collection/RefreshButton';

interface Contract {
  id: string;
  contract_address: string;
  collection_name: string;
  collection_symbol: string;
  collection_slug?: string;
  max_supply: number;
  mint_price_wei: string;
  verified: boolean;
  verification_status: string;
  created_at: string;
  total_minted?: number;
}

// Helper function to format wei to ETH
function formatMintPrice(weiString: string): string {
  try {
    const wei = BigInt(weiString);
    const eth = Number(wei) / 1e18;
    // Format to 6 decimals but remove trailing zeros
    const formatted = eth.toFixed(6).replace(/\.?0+$/, '');
    return formatted + ' ETH';
  } catch {
    return weiString + ' wei';
  }
}

export function DeployedContractsCard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/contract/list');
      if (!response.ok) {
        throw new Error('Failed to load contracts');
      }

      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    // Reload contracts to show updated verification status
    loadContracts();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My NFT Collections</CardTitle>
          <CardDescription>Deploy your first NFT collection above</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>No deployed contracts yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My NFT Collections</CardTitle>
        <CardDescription>
          {contracts.length} collection{contracts.length !== 1 ? 's' : ''} deployed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md text-sm">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {contracts.map((contract, index) => (
          <div
            key={contract.id}
            className="p-4 rounded-lg border bg-card space-y-4"
          >
            {/* Contract Header - Name and Verified Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base">{contract.collection_name}</h4>
                <p className="text-sm text-muted-foreground">
                  Symbol: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{contract.collection_symbol}</code>
                </p>
              </div>
              
              {/* Verified Status Badge */}
              <div className="flex-shrink-0">
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  ✓ Verified
                </span>
              </div>
            </div>

            {/* Contract Details Grid - Max Supply and Mint Price */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Max NFTs</p>
                <p className="font-medium text-lg">{contract.max_supply.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Mint Price</p>
                <p className="font-medium text-lg">{formatMintPrice(contract.mint_price_wei)}</p>
              </div>
            </div>

            {/* Minted Count and Refresh Button */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">NFTs Minted</p>
                <p className="font-medium text-lg">
                  {contract.total_minted || 0} / {contract.max_supply}
                </p>
              </div>
              
              <RefreshButton
                collectionSlug={contract.collection_slug || ''}
                collectionName={contract.collection_name}
                currentCount={contract.total_minted || 0}
              />
            </div>

            {/* Contract Address Section */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Address</p>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1.5 rounded text-xs flex-1 truncate">
                  {contract.contract_address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(contract.contract_address);
                  }}
                  title="Copy address"
                >
                  📋
                </Button>
              </div>
            </div>

            {/* Verification Section - Collection Link */}
            <div className="pt-2 border-t">
              <VerifyContractButton
                contractAddress={contract.contract_address}
                contractName={contract.collection_name}
                contractSymbol={contract.collection_symbol}
                collectionSlug={contract.collection_slug}
                maxSupply={contract.max_supply}
                mintPrice={contract.mint_price_wei}
                verified={contract.verified}
                onVerificationSuccess={handleVerificationSuccess}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
