import { useEffect, useState, useRef } from 'react';

/**
 * 🎯 Custom hook that triggers when NFTs are minted in a collection
 * 
 * How it works:
 * 1. Listens for 'nft_minted_{collectionSlug}' storage event (cross-tab)
 * 2. Also accepts direct refresh trigger via dispatchEvent (for same-tab)
 * 3. Returns a refresh trigger counter (increments on each mint)
 * 4. Clears the signal after reading to prevent duplicate triggers
 * 5. Collection-specific - only refreshes for the current collection
 * 
 * Note: Storage events don't fire in the same tab per browser design.
 * This hook uses a custom event for same-tab coordination.
 * 
 * @param {string} collectionSlug - The collection slug to listen for mints
 * @returns {number} Refresh trigger counter - increments each mint
 */
export function useNFTRefresh(collectionSlug: string) {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const lastValueRef = useRef<string | null>(null);
  const expectedKey = `nft_minted_${collectionSlug}`;
  const eventName = `nft_minted_${collectionSlug}_event`;

  useEffect(() => {
    // Handle storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === expectedKey && e.newValue) {
        console.log(`🎯 NFT mint signal received for ${collectionSlug} (cross-tab), triggering refresh`);
        
        // Increment the counter to trigger refresh
        setRefreshTrigger(prev => prev + 1);
        
        // Clear the signal immediately
        localStorage.removeItem(expectedKey);
      }
    };

    // Handle custom events from same-tab
    const handleMintComplete = () => {
      console.log(`🎯 NFT mint signal received for ${collectionSlug} (same-tab), triggering refresh`);
      
      // Increment the counter to trigger refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Clear the signal
      localStorage.removeItem(expectedKey);
    };

    // Also check on mount in case signal was set before component loaded
    const storageValue = localStorage.getItem(expectedKey);
    if (storageValue && storageValue !== lastValueRef.current) {
      lastValueRef.current = storageValue;
      console.log(`🎯 NFT mint signal detected on mount for ${collectionSlug}, triggering refresh`);
      setRefreshTrigger(prev => prev + 1);
      localStorage.removeItem(expectedKey);
    }

    // Attach storage event listener for cross-tab events
    window.addEventListener('storage', handleStorageChange);
    
    // Attach custom event listener for same-tab events
    window.addEventListener(eventName, handleMintComplete);
    
    // Cleanup: Remove listeners when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(eventName, handleMintComplete);
    };
  }, [collectionSlug, expectedKey, eventName]);

  return refreshTrigger;
}
