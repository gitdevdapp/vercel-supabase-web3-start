'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MintButtonProps {
  contractAddress: string;
  collectionName: string;
  mintPrice?: string;
  maxSupply: number;
  totalMinted: number;
  onMintSuccess?: () => void;
}

export function MintButton({
  contractAddress,
  collectionName,
  mintPrice = '0',
  maxSupply,
  totalMinted,
  onMintSuccess
}: MintButtonProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userWallet, setUserWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Fetch user's wallet
          const { data: wallet } = await supabase
            .from('user_wallets')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
          setUserWallet(wallet);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const isAvailable = totalMinted < maxSupply;
  const canMint = isAvailable && user && userWallet && !isLoading;

  const handleMint = async () => {
    if (!user || !userWallet) {
      setError('Please sign in and connect a wallet to mint NFTs');
      return;
    }

    if (!isAvailable) {
      setError('This collection has reached its maximum supply');
      return;
    }

    setIsMinting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contract/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress,
          recipientAddress: userWallet.wallet_address,
          walletAddress: userWallet.wallet_address
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Minting failed');
      }

      setSuccess(`✅ NFT minted successfully! Tx: ${data.transactionHash.slice(0, 10)}...`);
      
      // ✨ NEW: Signal collection page to refresh NFTs
      const slug = window.location.pathname.split('/').pop();
      if (slug) {
        localStorage.setItem(`nft_minted_${slug}`, Date.now().toString());
        console.log(`✅ Mint signal sent for collection ${slug}`);
        
        // Also dispatch a custom event for same-tab listeners
        window.dispatchEvent(new CustomEvent(`nft_minted_${slug}_event`));
      }
      
      // Revalidate the page path to update NFT tiles and counter
      try {
        const currentPath = window.location.pathname;
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath })
        });
      } catch (err) {
        console.warn('Failed to revalidate path:', err);
      }
      
      // Refresh page to show updated NFTs and counter
      if (onMintSuccess) {
        setTimeout(onMintSuccess, 1500);
      } else {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error('Mint error:', err);
    } finally {
      setIsMinting(false);
    }
  };

  // Convert mint price from wei to ETH for display
  const mintPriceETH = parseInt(mintPrice || '0') / 1e18;
  const displayPrice = mintPriceETH > 0 ? mintPriceETH.toFixed(4) : 'Free';

  if (isLoading) {
    return (
      <Button size="lg" disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleMint}
        disabled={isMinting || !canMint}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        {isMinting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Minting {collectionName}...
          </>
        ) : !user ? (
          'Sign in to Mint'
        ) : !userWallet ? (
          'Connect Wallet to Mint'
        ) : !isAvailable ? (
          'Sold Out'
        ) : (
          `Mint NFT (${displayPrice} ETH)`
        )}
      </Button>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
        </div>
      )}

      {!isAvailable && (
        <p className="text-xs text-muted-foreground text-center">
          This collection has reached its maximum supply of {maxSupply} NFTs
        </p>
      )}
    </div>
  );
}
