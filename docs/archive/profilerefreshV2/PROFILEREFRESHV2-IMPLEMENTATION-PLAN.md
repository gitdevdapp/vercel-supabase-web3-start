# Profile Refresh V2: Implementation Plan
**Date**: November 4, 2025  
**Version**: PROFILEREFRESHV2  
**Status**: Ready for Implementation

---

## Executive Summary

This document outlines three interconnected improvements to the user profile wallet experience:

1. **USDC Balance Auto-Refresh**: Implement robust, non-breaking balance refresh with transaction history fallback
2. **Transaction History Pagination**: Display only 5 most recent transactions with page navigation
3. **UI/UX Simplification**: Move deployer funding section to advanced details

### Key Principles
- ✅ **Non-Style-Breaking**: All changes use existing Tailwind CSS classes and component patterns
- ✅ **Non-Vercel-Breaking**: No environment or build configuration changes
- ✅ **Framework-Consistent**: Use only existing technologies (React, Next.js, ethers.js, Supabase)
- ✅ **Backward Compatible**: No breaking changes to APIs or data structures

---

## Issue 1: USDC Balance Not Updating Correctly

### Current State (Analyzed from USDC-BALANCE-REFRESH-ANALYSIS.md)

**Problem**: USDC balance shows $0.00 despite successful transactions

**Root Causes Identified**:
1. Incorrect USDC contract address was used (now fixed to `0x036CbD53842c5426634e7929541eC231BcE1BDaE0`)
2. Silent failures in error handling (contract call fails, defaults to 0)
3. RPC timing issues on production
4. No automatic refresh mechanism after funding

**Current Implementation**:
- `app/api/wallet/list/route.ts`: Fetches USDC from contract with transaction history fallback
- `app/api/wallet/balance/route.ts`: Secondary balance endpoint with redundancy checks
- `components/profile-wallet-card.tsx`: Manual refresh after funding (5-8 second delay)

### Solution Strategy: USDC Balance Auto-Refresh

#### File: `components/profile-wallet-card.tsx`

**Changes**:
1. Add automatic refresh interval (5 seconds) for USDC balance after funding
2. Add visual refresh indicator without breaking layout
3. Add manual refresh button (already exists, but will enhance)
4. Implement exponential backoff for failed refreshes
5. Add console logging for debugging

**Implementation Details**:

```typescript
// New state variables
const [balanceRefreshInterval, setBalanceRefreshInterval] = useState<NodeJS.Timeout | null>(null);
const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
const [usdcRefreshAttempts, setUsdcRefreshAttempts] = useState(0);

// Auto-refresh after USDC funding
useEffect(() => {
  if (isUSDCFunding && wallet) {
    // Start auto-refresh after 5 seconds
    const timeoutId = setTimeout(() => {
      startAutoRefresh();
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }
}, [isUSDCFunding]);

// Auto-refresh function with exponential backoff
const startAutoRefresh = () => {
  setUsdcRefreshAttempts(0);
  const interval = setInterval(() => {
    loadWallet();
    setUsdcRefreshAttempts(prev => prev + 1);
    
    // Stop after 5 attempts (25 seconds total)
    if (usdcRefreshAttempts >= 4) {
      clearInterval(interval);
      setBalanceRefreshInterval(null);
    }
  }, 5000);
  
  setBalanceRefreshInterval(interval);
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (balanceRefreshInterval) clearInterval(balanceRefreshInterval);
  };
}, [balanceRefreshInterval]);
```

**Backend Enhancements** (`app/api/wallet/list/route.ts`):
- Dual-endpoint USDC fetching (contract + transaction history)
- Fallback mechanism with detailed logging
- Balance comparison logic for consistency checks

---

## Issue 2: Transaction History Pagination

### Current State

**Problem**: All transactions displayed at once, clutters UI, poor performance with many transactions

**Current Implementation**:
- `components/wallet/TransactionHistory.tsx`: Displays all transactions in a single list
- No pagination or limiting
- Transaction loading happens on component mount

### Solution: Pagination Implementation

#### File: `components/wallet/TransactionHistory.tsx`

**Changes**:
1. Add state for current page and items per page (5 transactions per page)
2. Calculate paginated transactions on frontend
3. Add page navigation buttons (Previous/Next)
4. Show page indicator (e.g., "Page 1 of 5")
5. Disable Previous button on page 1, disable Next button on last page
6. Keep all styling consistent with existing design

**Implementation Details**:

```typescript
// New state variables
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

// Calculate pagination
const totalPages = Math.ceil(transactions.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedTransactions = transactions.slice(startIndex, endIndex);

// Navigation functions
const goToNextPage = () => {
  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};

const goToPreviousPage = () => {
  if (currentPage > 1) setCurrentPage(currentPage - 1);
};

// Reset page when transactions reload
useEffect(() => {
  setCurrentPage(1);
}, [transactions]);
```

**UI Layout**:
```
┌─────────────────────────────────────────┐
│ Transaction History      [Refresh]      │
├─────────────────────────────────────────┤
│ [Transaction 1]                         │
│ [Transaction 2]                         │
│ [Transaction 3]                         │
│ [Transaction 4]                         │
│ [Transaction 5]                         │
├─────────────────────────────────────────┤
│ [< Previous]  Page 1 of 5  [Next >]    │
├─────────────────────────────────────────┤
│ Tip: Click any transaction...           │
└─────────────────────────────────────────┘
```

**CSS Classes** (using existing Tailwind):
- `flex justify-between items-center` for pagination controls
- `text-xs text-muted-foreground` for page indicator
- `disabled:opacity-50 disabled:cursor-not-allowed` for disabled buttons
- `border-t pt-4 mt-4` for separator

---

## Issue 3: Move Deployer Funding to Advanced Section

### Current State

**Problem**: "Shared Universal Deployer" box clutters the top of NFT Creation Card, visible by default

**Current Implementation**:
- `components/profile/NFTCreationCard.tsx`: Lines 262-338
- Displayed as prominent box before form fields
- Takes ~15% of viewport on initial view

### Solution: Move to Advanced Details

#### File: `components/profile/NFTCreationCard.tsx`

**Changes**:
1. Remove deployer funding section from main UI (lines 262-338)
2. Move the entire section into the "Advanced Details" collapsible (lines 458-514)
3. Keep all functionality intact (fund button, etc.)
4. Maintain styling consistency with advanced section background

**New Layout**:
```
┌─────────────────────────────────┐
│ Create NFT Collection           │
├─────────────────────────────────┤
│ Collection Name        [Input]  │
│ Collection Symbol      [Input]  │
│ Collection Size        [Input]  │
│ Mint Price             [Input]  │
│                                 │
│ [Advanced Details ▼]            │
│   ├─ Secure Deployment (exists) │
│   └─ Shared Universal Deployer  │ ← MOVED HERE
│       └─ [Fund Now]             │
│                                 │
│ [Deploy NFT Collection]         │
└─────────────────────────────────┘
```

**Implementation**:
1. Delete lines 262-338 from main CardContent
2. Add deployer section inside `showAdvancedDetails` conditional
3. Keep the exact same UI structure and styling
4. Place after "Secure Deployment" section

---

## Files to Modify

### 1. `components/profile-wallet-card.tsx`
- **Lines**: 37-192 (state, useEffect hooks)
- **Changes**: Add USDC auto-refresh logic
- **Testing**: Verify refresh happens after USDC funding

### 2. `components/wallet/TransactionHistory.tsx`
- **Lines**: 25-275 (entire component)
- **Changes**: Add pagination state and UI
- **Testing**: Verify pagination works with 5+ transactions

### 3. `components/profile/NFTCreationCard.tsx`
- **Lines**: 262-338 (deployer section)
- **Lines**: 458-514 (advanced details)
- **Changes**: Move deployer section into advanced details
- **Testing**: Verify deployer funding still works in advanced section

---

## Implementation Order

1. **Move Deployer Section** (Easiest, least risky)
   - Cut and paste from main section to advanced
   - No backend changes
   - Quick to test

2. **Add Pagination** (Medium complexity)
   - Add state and calculation logic
   - Add UI pagination controls
   - Test with multiple transactions

3. **USDC Auto-Refresh** (Most complex)
   - Add auto-refresh logic to wallet card
   - Test with USDC funding
   - Verify balance updates within 10-15 seconds

---

## Testing Checklist

### Test Account
- **Email**: `wallettest_nov3_dev@mailinator.com`
- **Password**: `TestPassword123!`
- **Network**: Base Sepolia testnet
- **Environment**: localhost (npm run dev)

### Test Scenarios

#### 1. Deployer Section Move ✓
- [ ] Open profile page
- [ ] Verify "Fund Deployer" button NOT visible by default
- [ ] Click "Advanced Details" to expand
- [ ] Verify deployer section appears in advanced area
- [ ] Click "Fund Now" button
- [ ] Verify funding dialog appears and works

#### 2. Transaction History Pagination ✓
- [ ] Request USDC funding multiple times (5+)
- [ ] Open transaction history
- [ ] Verify only 5 most recent displayed
- [ ] Verify "Page 1 of X" shown
- [ ] Click "Next >" button
- [ ] Verify next 5 transactions shown
- [ ] Click "< Previous" button
- [ ] Verify previous page shown
- [ ] Verify buttons disabled on first/last page

#### 3. USDC Balance Auto-Refresh ✓
- [ ] Note current USDC balance
- [ ] Click "Request USDC" button
- [ ] Wait for transaction success
- [ ] Wait 5 seconds (auto-refresh should start)
- [ ] Verify balance updates within 15 seconds
- [ ] Check console for refresh attempts
- [ ] Verify manual "Refresh" still works

---

## Performance Considerations

### No Performance Regressions
- ✅ Pagination reduces DOM elements (5 items vs potentially 100+)
- ✅ Auto-refresh uses existing API endpoints (no new calls)
- ✅ Moving deployer section reduces initial UI size
- ✅ No new dependencies added

### Optimization Strategies
1. **Pagination**: Frontend-only, no API changes
2. **Auto-refresh**: Uses existing `/api/wallet/list` endpoint
3. **UI**: All Tailwind classes already loaded
4. **Memory**: Cleanup intervals on component unmount

---

## Rollback Plan

If issues occur:

1. **Deployer Section**: Simply move the section back to original location
2. **Pagination**: Remove pagination state/UI, display all transactions
3. **Auto-Refresh**: Remove interval logic, keep manual refresh button

Each change is independent and can be rolled back without affecting others.

---

## Success Criteria

- ✅ USDC balance updates within 10-15 seconds after funding on localhost
- ✅ Pagination shows exactly 5 transactions per page
- ✅ Page navigation works correctly (previous/next, disabled states)
- ✅ Deployer section not visible by default, appears in Advanced Details
- ✅ All existing UI/UX remains unchanged (no style breaking)
- ✅ No new npm packages required
- ✅ No backend API changes needed
- ✅ All tests pass on localhost with test account

---

## Estimated Timeline

- **Move Deployer Section**: 10-15 minutes
- **Add Pagination**: 15-20 minutes  
- **Implement Auto-Refresh**: 15-20 minutes
- **Testing & Debugging**: 20-30 minutes
- **Total**: ~60-85 minutes

---

## Notes

- All changes are made with the constraint of using only existing technologies and frameworks
- No dependency changes (no new npm packages)
- No environment variable changes
- No breaking changes to existing APIs
- Full backward compatibility maintained

**Author**: Assistant  
**Status**: Ready for Implementation  
**Last Updated**: November 4, 2025
