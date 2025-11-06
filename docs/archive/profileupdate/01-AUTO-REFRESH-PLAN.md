# 🔄 AUTO-REFRESH FIX PLAN - MyCollectionsPreview

**Date**: November 3, 2025  
**Issue**: New deployed collections don't appear in MyCollectionsPreview without manual F5 refresh  
**Impact**: UX friction - users must manually refresh to see their new collections  
**Solution Approach**: Simple, non-invasive event-based refresh mechanism  

---

## Executive Summary

When users deploy a new ERC721 collection, the deployment succeeds and is saved to the database, but the `MyCollectionsPreview` component doesn't automatically update because it only fetches data on component mount.

**Solution**: Trigger a targeted refresh of `MyCollectionsPreview` only when deployment succeeds, using a localStorage-based event system that avoids infinite loops and excessive API calls.

---

## Problem Analysis

### Current Flow
```
User Deploy Collection
    ↓
✅ Deployment succeeds
    ↓
✅ Collection saved to database
    ↓
❌ MyCollectionsPreview still shows old data
    ↓
User must manually F5 refresh to see new collection
```

### Root Cause
`MyCollectionsPreview.tsx` uses `useEffect` with empty dependency array:
```typescript
useEffect(() => {
  fetchCollections();
}, []);  // ← Only runs once on mount
```

---

## Solution Design

### Architecture: Event-Based Refresh Signal

**Key Principle**: Use a simple localStorage event as a one-time deployment completion signal that:
1. ✅ Triggers only on successful deployment (not on every render)
2. ✅ Signals only the MyCollectionsPreview component
3. ✅ Self-clears to prevent repeated triggers
4. ✅ Has no polling or infinite loop risk
5. ✅ Minimal performance impact

### Implementation Steps

#### Step 1: Create Custom Hook (`lib/hooks/useDeploymentRefresh.ts`)

```typescript
import { useEffect, useState } from 'react';

/**
 * Custom hook that triggers on successful deployment
 * Listens for deployment completion events via localStorage
 */
export function useDeploymentRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    // Listen for storage events from deployment success
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'erc721_deployment_complete' && e.newValue) {
        // Trigger refresh by incrementing counter
        setRefreshTrigger(prev => prev + 1);
        // Clear the signal so it only triggers once per deployment
        localStorage.removeItem('erc721_deployment_complete');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return refreshTrigger;
}
```

#### Step 2: Update MyCollectionsPreview Component

Modify `components/profile/MyCollectionsPreview.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useDeploymentRefresh } from '@/lib/hooks/useDeploymentRefresh';

export function MyCollectionsPreview() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✨ NEW: Listen for deployment completion
  const deploymentRefreshTrigger = useDeploymentRefresh();

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/contract/list');
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      const data = await response.json();
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

  // Fetch on mount (original behavior)
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

  // ... rest of component remains the same
}
```

#### Step 3: Update Deployment Component

Modify `components/profile/NFTCreationCard.tsx` (or deployment form):

Add this after successful deployment response:

```typescript
// ✨ Signal MyCollectionsPreview to refresh
localStorage.setItem('erc721_deployment_complete', Date.now().toString());

// Show success message to user
setSuccessMessage(`NFT Collection '${name}' deployed successfully!`);
```

---

## Technical Details

### Why This Approach is Safe

| Risk | Mitigation |
|------|-----------|
| **Infinite loops** | localStorage key is removed immediately after read, single trigger per deployment |
| **Excessive API calls** | Only fetches on successful deployment signal (typically 1-5 times per session) |
| **Memory leaks** | Event listener is properly cleaned up in useEffect return |
| **Multiple refreshes** | Key self-clears after reading, no repeated triggers |
| **Browser storage limits** | Single small key, well below any limits |
| **Tab synchronization** | Works across tabs naturally via storage events |

### Performance Characteristics

```
Deployment Success → localStorage write (1 byte key + timestamp)
                   ↓ (same tab)
User sees no loading indicator
                   ↓ (500ms later, typical API call time)
Collections refresh silently
                   ↓
User sees new collection appear
```

**Total overhead**: 1 API call per deployment (same as if user manually refreshed)

---

## Files to Modify

### New Files
- `lib/hooks/useDeploymentRefresh.ts` - Custom hook for refresh signal

### Existing Files
1. `components/profile/MyCollectionsPreview.tsx`
   - Add useDeploymentRefresh hook
   - Add useEffect for refresh trigger

2. `components/profile/NFTCreationCard.tsx` (or similar deployment form)
   - Add localStorage.setItem() after successful deployment

---

## Implementation Flow Diagram

```
┌─ NFTCreationCard (Deployment Form)
│
├─ User clicks "Deploy"
│  └─ POST /api/contract/deploy
│     └─ ✅ Deployment succeeds
│        └─ localStorage.setItem('erc721_deployment_complete', timestamp)
│
└─ MyCollectionsPreview (listening)
   └─ useDeploymentRefresh hook detects storage change
      └─ Calls fetchCollections()
         └─ Updated UI shows new collection ✨
```

---

## Code Review Checklist

- [ ] useDeploymentRefresh hook properly cleans up event listeners
- [ ] localStorage key is cleared after reading
- [ ] No infinite loop conditions in useEffect dependencies
- [ ] Deployment success message doesn't prevent storage signal
- [ ] Works with multiple rapid deployments
- [ ] Works across browser tabs
- [ ] No console errors or warnings
- [ ] Performance: <500ms total for refresh
- [ ] Gracefully handles if hook unused (no side effects)

---

## Testing Strategy

### Unit Tests
- [ ] useDeploymentRefresh hook triggers on storage event
- [ ] localStorage key is properly cleared
- [ ] Multiple deployments trigger multiple refreshes
- [ ] No listener memory leaks

### Integration Tests
- [ ] Deploy new collection → MyCollectionsPreview updates
- [ ] Deploy multiple collections → each triggers refresh
- [ ] Refresh shows correct collection count
- [ ] New collection is clickable and navigable

### User Flow Tests
- [ ] User deploys collection
- [ ] User sees success message
- [ ] Collection appears in MyCollectionsPreview automatically
- [ ] No manual refresh (F5) needed
- [ ] User can click new collection immediately

---

## Rollback Plan

If issues occur:
1. Remove useDeploymentRefresh call from MyCollectionsPreview
2. Remove localStorage.setItem call from NFTCreationCard
3. Components revert to original behavior (manual refresh required)
4. No database changes needed, fully code-based

---

## Future Enhancements

1. **Real-time updates**: Replace localStorage signal with WebSocket for live updates
2. **Deployment status tracking**: Show "deployment in progress" indicator
3. **Automatic polling fallback**: If storage events don't trigger, poll every 10s for 30s
4. **Multi-window sync**: Automatically update MyCollectionsPreview in all open tabs

---

## Success Criteria

✅ User deploys collection  
✅ Success message appears immediately  
✅ Collection appears in MyCollectionsPreview within 1 second  
✅ No manual F5 refresh needed  
✅ User can click and navigate to collection immediately  
✅ No console errors or warnings  
✅ No performance degradation  
✅ No infinite loops or excessive API calls  

---

## Estimated Implementation Time

- **Create hook**: 10 minutes
- **Update MyCollectionsPreview**: 5 minutes
- **Update NFTCreationCard**: 2 minutes
- **Testing**: 10 minutes
- **Total**: ~30 minutes

---

**Status**: 📋 Ready for implementation  
**Priority**: Medium (UX improvement)  
**Complexity**: Low (simple event mechanism)



