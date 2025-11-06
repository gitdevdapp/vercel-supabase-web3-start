'use client';

import { useEffect } from 'react';
import { useNFTRefresh } from '@/lib/hooks/useNFTRefresh';

interface CollectionRefreshProviderProps {
  collectionSlug: string;
}

/**
 * Client-side provider that auto-refreshes the collection page when NFTs are minted
 * This wraps the server-rendered collection content and re-triggers revalidation on mint
 */
export function CollectionRefreshProvider({
  collectionSlug,
}: CollectionRefreshProviderProps) {
  const nftRefreshTrigger = useNFTRefresh(collectionSlug);

  useEffect(() => {
    if (nftRefreshTrigger > 0) {
      console.log(`🔄 NFT refresh triggered for ${collectionSlug}, revalidating page...`);
      
      // Revalidate the page path to refresh NFTs and counter
      const revalidatePath = async () => {
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/marketplace/${collectionSlug}` })
          });
          
          // Reload the page after revalidation is complete
          window.location.reload();
        } catch (err) {
          console.error('Failed to revalidate page:', err);
          // Fallback: reload anyway
          window.location.reload();
        }
      };

      revalidatePath();
    }
  }, [nftRefreshTrigger, collectionSlug]);

  // This component is just a listener and provider, it doesn't render anything
  return null;
}






