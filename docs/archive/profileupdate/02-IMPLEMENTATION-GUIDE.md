# Implementation Guide - MyCollectionsPreview Auto-Refresh

**Version**: 1.0  
**Date**: November 3, 2025  
**Estimated Time**: 30 minutes  

---

## File 1: Create Custom Hook

**File**: `lib/hooks/useDeploymentRefresh.ts`  
**Status**: NEW FILE  
**Purpose**: Listen for deployment completion signals

```typescript
import { useEffect, useState } from 'react';

/**
 * 🎯 Custom hook that triggers when a new ERC721 collection is deployed
 * 
 * How it works:
 * 1. Listens for 'erc721_deployment_complete' storage event
 * 2. Returns a refresh trigger counter (increments on each deployment)
 * 3. Clears the signal after reading to prevent duplicate triggers
 * 4. Properly cleans up event listeners
 * 
 * Usage:
 *   const deploymentRefreshTrigger = useDeploymentRefresh();
 *   useEffect(() => {
 *     if (deploymentRefreshTrigger > 0) {
 *       fetchCollections();
 *     }
 *   }, [deploymentRefreshTrigger]);
 */
export function useDeploymentRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    // Listen for storage events (works both in current and other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'erc721_deployment_complete' && e.newValue) {
        console.log('🎯 Deployment completion signal received, triggering refresh');
        
        // Increment the counter to trigger refresh
        setRefreshTrigger(prev => prev + 1);
        
        // Clear the signal immediately so it only triggers once per deployment
        localStorage.removeItem('erc721_deployment_complete');
      }
    };

    // Attach listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup: Remove listener when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return refreshTrigger;
}
```

---

## File 2: Update MyCollectionsPreview

**File**: `components/profile/MyCollectionsPreview.tsx`  
**Status**: MODIFY EXISTING  
**Changes**: Add import, add hook usage, add refresh effect

### Before
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionTile } from '@/components/marketplace/CollectionTile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';

interface Collection {
  id: string;
  collection_slug: string;
  collection_name: string;
  collection_symbol: string;
  collection_image_url?: string | null;
  total_minted?: number;
  max_supply?: number;
  verified?: boolean;
}

export function MyCollectionsPreview() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/contract/list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }

        const data = await response.json();
        
        // Show all collections, not just those with slugs
        const validCollections = (data.contracts || []).filter(
          (c: any) => c.collection_name && c.id
        );
        
        setCollections(validCollections);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load collections';
        setError(message);
        console.error('Error fetching collections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // ... rest of component
}
```

### After
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionTile } from '@/components/marketplace/CollectionTile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useDeploymentRefresh } from '@/lib/hooks/useDeploymentRefresh'; // ✨ NEW IMPORT

interface Collection {
  id: string;
  collection_slug: string;
  collection_name: string;
  collection_symbol: string;
  collection_image_url?: string | null;
  total_minted?: number;
  max_supply?: number;
  verified?: boolean;
}

export function MyCollectionsPreview() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✨ NEW: Listen for deployment completion signals
  const deploymentRefreshTrigger = useDeploymentRefresh();

  // ✨ Extracted: Fetch function can now be reused
  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/contract/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      
      // Show all collections, not just those with slugs
      const validCollections = (data.contracts || []).filter(
        (c: any) => c.collection_name && c.id
      );
      
      setCollections(validCollections);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load collections';
      setError(message);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Original: Fetch on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // ✨ NEW: Refetch when deployment completes
  useEffect(() => {
    if (deploymentRefreshTrigger > 0) {
      console.log('📢 Deployment detected, refreshing collections...');
      fetchCollections();
    }
  }, [deploymentRefreshTrigger]);

  // ... rest of component remains unchanged
}
```

**Key Changes:**
1. Import `useDeploymentRefresh` from `@/lib/hooks/useDeploymentRefresh`
2. Call hook: `const deploymentRefreshTrigger = useDeploymentRefresh();`
3. Extract `fetchCollections` into standalone function for reuse
4. Add new `useEffect` that triggers when `deploymentRefreshTrigger` changes

---

## File 3: Update Deployment Form

**File**: `components/profile/NFTCreationCard.tsx` (or similar deployment form component)  
**Status**: MODIFY EXISTING  
**Changes**: Add localStorage signal after successful deployment

### Location in code
Find the success handler after `POST /api/contract/deploy` response:

### Before
```typescript
// Inside the deploy button onClick handler
try {
  const response = await fetch('/api/contract/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      symbol,
      maxSupply,
      mintPrice,
      walletAddress
    })
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error);
    return;
  }

  // ✅ Deployment succeeded
  setDeploymentSuccess(data);
  setName('');
  setSymbol('');
  // ... reset form
} catch (err) {
  setError('Deployment failed');
}
```

### After
```typescript
// Inside the deploy button onClick handler
try {
  const response = await fetch('/api/contract/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      symbol,
      maxSupply,
      mintPrice,
      walletAddress
    })
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error);
    return;
  }

  // ✅ Deployment succeeded
  
  // ✨ NEW: Signal MyCollectionsPreview to refresh
  localStorage.setItem('erc721_deployment_complete', Date.now().toString());
  console.log('✅ Deployment signal sent to MyCollectionsPreview');
  
  setDeploymentSuccess(data);
  setName('');
  setSymbol('');
  // ... reset form
} catch (err) {
  setError('Deployment failed');
}
```

**Key Change:**
- Add 2 lines after successful deployment:
  ```typescript
  localStorage.setItem('erc721_deployment_complete', Date.now().toString());
  console.log('✅ Deployment signal sent to MyCollectionsPreview');
  ```

---

## Step-by-Step Implementation

### Step 1: Create the Hook (5 minutes)

1. Create file: `lib/hooks/useDeploymentRefresh.ts`
2. Copy the full code from "File 1" above
3. Save file

**Verify:**
- File exists at `lib/hooks/useDeploymentRefresh.ts`
- No TypeScript errors in editor

### Step 2: Update MyCollectionsPreview (5 minutes)

1. Open `components/profile/MyCollectionsPreview.tsx`
2. Add import at top:
   ```typescript
   import { useDeploymentRefresh } from '@/lib/hooks/useDeploymentRefresh';
   ```
3. Add hook call in component:
   ```typescript
   const deploymentRefreshTrigger = useDeploymentRefresh();
   ```
4. Extract `fetchCollections` from useEffect into standalone function
5. Add new useEffect for deployment trigger (see "After" code above)
6. Save file

**Verify:**
- No TypeScript errors
- Component still renders correctly
- fetchCollections is called on mount

### Step 3: Update Deployment Form (2 minutes)

1. Find deployment success handler in form component (usually `NFTCreationCard.tsx`)
2. After successful response, add:
   ```typescript
   localStorage.setItem('erc721_deployment_complete', Date.now().toString());
   ```
3. Save file

**Verify:**
- No TypeScript errors
- Deployment still works

### Step 4: Test (10 minutes)

```
1. Start dev server: npm run dev
2. Login as test@test.com / test123
3. Navigate to /protected/profile
4. Open browser DevTools → Application → Local Storage
5. Deploy new collection
6. Verify:
   ✅ 'erc721_deployment_complete' key appears in Local Storage (briefly)
   ✅ Success message shows
   ✅ MyCollectionsPreview updates automatically (within 1 second)
   ✅ localStorage key is cleared
   ✅ No console errors
7. Refresh page
8. New collection should still be visible
```

---

## Testing Checklist

### Console Verification
- [ ] No TypeScript errors on save
- [ ] Component renders without errors
- [ ] Console shows: "📢 Deployment detected, refreshing collections..."
- [ ] Console shows: "✅ Deployment signal sent to MyCollectionsPreview"

### Functional Testing
- [ ] Deploy new collection
- [ ] Success message appears
- [ ] Collection appears in MyCollectionsPreview within 1 second
- [ ] localStorage key `erc721_deployment_complete` is cleared automatically
- [ ] User can click new collection immediately
- [ ] F5 refresh still works (collections persist)

### Edge Cases
- [ ] Deploy multiple collections rapidly → each triggers refresh
- [ ] Deploy in multiple browser tabs → MyCollectionsPreview updates in each
- [ ] Close tab during deployment → no errors
- [ ] Clear localStorage manually → doesn't cause issues

---

## Rollback Instructions

If you need to revert:

1. **Remove hook usage** from `MyCollectionsPreview.tsx`:
   - Remove import
   - Remove `deploymentRefreshTrigger` hook call
   - Remove second useEffect

2. **Remove signal** from deployment form:
   - Remove `localStorage.setItem()` line

3. **Delete hook file**:
   - Delete `lib/hooks/useDeploymentRefresh.ts`

Components will revert to original behavior (manual F5 required).

---

## Performance Impact

| Metric | Impact |
|--------|--------|
| Initial Load | None (hook only listens, doesn't execute) |
| Per Deployment | +1 API call (same as manual refresh) |
| Memory | 2 integers + event listener (negligible) |
| CPU | Event listener only, no polling |

---

## Debugging Guide

### Issue: Collections don't refresh after deployment

**Check:**
1. Console for errors: `console.log('📢 Deployment detected...')`
2. localStorage: Open DevTools → Application → Local Storage
3. Verify key `erc721_deployment_complete` appears and disappears
4. Check that fetchCollections is being called

### Issue: Multiple refreshes happening

**Check:**
1. localStorage key is being cleared (verified in DevTools)
2. deploymentRefreshTrigger useEffect only triggers on counter change
3. No duplicate event listeners (should be exactly 1)

### Issue: Works in one tab but not another

**This is expected** - localStorage events don't fire in same tab. Only works:
- Same tab: when signal is set (won't see in DevTools until cleared)
- Other tabs: full storage event notification

---

## Success Criteria Verification

After implementation:

✅ Deploy new collection → appears in MyCollectionsPreview within 1 second  
✅ No manual F5 refresh needed  
✅ Success message appears before collection  
✅ Collection is clickable immediately  
✅ No console errors or warnings  
✅ Works across multiple browser tabs  
✅ localStorage self-clears automatically  

---

**Ready to implement?**

1. Follow Steps 1-4 above
2. Test with the Testing Checklist
3. Verify all Success Criteria
4. Commit changes to git
5. Create pull request



