# Profile Update - MyCollectionsPreview Auto-Refresh

**Status**: 📋 Planning Phase  
**Priority**: Medium (UX Improvement)  
**Target**: Profile page collection display  

## Overview

This documentation covers the plan to implement automatic refresh of the `MyCollectionsPreview` component when a new ERC721 collection is deployed.

## Current Issue

When users deploy a new NFT collection:
1. ✅ Deployment succeeds and is saved to database
2. ✅ Success message is shown to user
3. ❌ MyCollectionsPreview doesn't update
4. ❌ User must manually press F5 to see new collection

## Solution

Implement a simple localStorage-based event system that:
- Signals deployment completion to MyCollectionsPreview
- Triggers component refresh only when needed
- Prevents infinite loops and excessive API calls
- Works across browser tabs

## Documents

- `01-AUTO-REFRESH-PLAN.md` - Complete implementation plan with code examples

## Quick Start

### Implementation Steps (30 minutes)

1. Create `lib/hooks/useDeploymentRefresh.ts` custom hook
2. Update `components/profile/MyCollectionsPreview.tsx` to use hook
3. Update deployment form to signal completion via localStorage
4. Test auto-refresh functionality

### Key Files to Modify

- **New**: `lib/hooks/useDeploymentRefresh.ts`
- **Update**: `components/profile/MyCollectionsPreview.tsx`
- **Update**: `components/profile/NFTCreationCard.tsx` (or deployment form)

## Success Criteria

✅ Deploy collection → appears immediately in MyCollectionsPreview  
✅ No manual F5 refresh needed  
✅ No performance degradation  
✅ No infinite loops or excessive API calls  

## Technical Approach

**Event Mechanism**: localStorage + window storage events

```
Deployment Success 
  → localStorage.setItem('erc721_deployment_complete', timestamp)
     ↓
MyCollectionsPreview hook detects event
  → Calls fetchCollections()
     ↓
Component updates with new collection
```

## Safety Guarantees

| Concern | Solution |
|---------|----------|
| Infinite loops | Key self-clears after read |
| Excessive calls | Only 1 API call per deployment |
| Memory leaks | Event listeners properly cleaned up |
| Browser limits | Minimal localStorage usage |

## Related Issues

- Issue: New collections not visible until manual refresh
- Component: MyCollectionsPreview
- Root cause: Empty useEffect dependency array

## Next Steps

1. Review plan in `01-AUTO-REFRESH-PLAN.md`
2. Implement the three code changes
3. Test with browser developer tools
4. Verify no console errors
5. Test with multiple deployments
6. Merge to main branch



