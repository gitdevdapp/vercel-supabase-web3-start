import { useEffect, useState, useRef } from 'react';

/**
 * 🎯 Custom hook that triggers when a new ERC721 collection is deployed
 * 
 * How it works:
 * 1. Listens for 'erc721_deployment_complete' storage event (works across tabs)
 * 2. Also accepts direct refresh trigger via dispatchEvent (for same-tab)
 * 3. Returns a refresh trigger counter (increments on each deployment)
 * 4. Clears the signal after reading to prevent duplicate triggers
 * 5. Properly cleans up event listeners
 * 
 * Note: Storage events don't fire in the same tab per browser design.
 * This hook uses a custom event for same-tab coordination.
 * 
 * @returns {number} Refresh trigger counter - increments each deployment
 */
export function useDeploymentRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const lastValueRef = useRef<string | null>(null);

  useEffect(() => {
    // Handle storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'erc721_deployment_complete' && e.newValue) {
        console.log('🎯 Deployment completion signal received (cross-tab), triggering refresh');
        
        // Increment the counter to trigger refresh
        setRefreshTrigger(prev => prev + 1);
        
        // Clear the signal so it only triggers once per deployment
        localStorage.removeItem('erc721_deployment_complete');
      }
    };

    // Handle custom events from same-tab
    const handleDeploymentComplete = () => {
      console.log('🎯 Deployment completion signal received (same-tab), triggering refresh');
      
      // Increment the counter to trigger refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Clear the signal
      localStorage.removeItem('erc721_deployment_complete');
    };

    // Also check on mount in case signal was set before component loaded
    const storageValue = localStorage.getItem('erc721_deployment_complete');
    if (storageValue && storageValue !== lastValueRef.current) {
      lastValueRef.current = storageValue;
      console.log('🎯 Deployment signal detected on mount, triggering refresh');
      setRefreshTrigger(prev => prev + 1);
      localStorage.removeItem('erc721_deployment_complete');
    }

    // Attach storage event listener for cross-tab events
    window.addEventListener('storage', handleStorageChange);
    
    // Attach custom event listener for same-tab events
    window.addEventListener('erc721_deployment_complete_event', handleDeploymentComplete);
    
    // Cleanup: Remove listeners when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('erc721_deployment_complete_event', handleDeploymentComplete);
    };
  }, []);

  return refreshTrigger;
}
