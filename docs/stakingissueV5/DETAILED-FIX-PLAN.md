# Staking System - Comprehensive Fix Plan (V5)

**Date:** November 6, 2025  
**Status:** ✅ ANALYSIS COMPLETE - Ready for Implementation  
**Scope:** Code-only fixes (NO NEW SQL needed - database infrastructure is correct)

---

## Executive Summary

The staking system has **correct database infrastructure** but **frontend and API integration issues** prevent it from working properly. This document outlines specific, targeted fixes that require **NO new SQL scripts** and **NO Vercel configuration changes**.

### Key Finding
The database functions (`stake_rair`, `unstake_rair`, `get_staking_status`) are correctly implemented. The issue is:
1. Frontend component doesn't fetch real staking status on load (disabled for testing)
2. Frontend uses hardcoded values (7,000 available, 3,000 staked) instead of real data
3. New signups properly get 10,000 RAIR (unstaked) via the `set_rair_tokens_on_signup` trigger

---

## Requirements Analysis

### Functional Requirements
1. **✓ On Signup:** User gets 10,000 RAIR tokens in `rair_balance` (unstaked)
   - **Status:** ✅ Database trigger `set_rair_tokens_on_signup` already does this
   - **Verification:** Check `rair_balance = 10000, rair_staked = 0` after signup

2. **✓ Stake 3,000 RAIR:** User can stake 3,000 tokens to access Super Guide
   - **Status:** ⚠️ UI doesn't load real status, buttons disabled
   - **Fix:** Re-enable `fetchStakingStatus()` in StakingCard component

3. **✓ Unlock Super Guide:** When `rair_staked >= 3000`, Super Guide becomes accessible
   - **Status:** ✅ SuperGuideAccessWrapper already checks this correctly
   - **Verification:** Line 39 in SuperGuideAccessWrapper.tsx: `setHasAccess(balance >= 3000)`

4. **✓ Lock Super Guide:** If user unstakes to 2,999, Super Guide should be locked
   - **Status:** ✅ Same component checks this, should auto-lock
   - **Verification:** Test unstaking 1 RAIR

---

## Critical Issues Identified

### Issue 1: Staking Status Never Loads on Profile Page
**File:** `components/staking/StakingCard.tsx` (Line 60)
**Current State:**
```typescript
useEffect(() => {
  // fetchStakingStatus(); // TEMP: disabled for testing
}, []);
```

**Impact:** 
- Component shows hardcoded values (7,000 available, 3,000 staked) forever
- Users never see their real balance
- Stake/Unstake buttons are disabled because of empty amount field logic

**Solution:** Uncomment the `fetchStakingStatus()` call

---

### Issue 2: API Response Handling is Incomplete
**File:** `app/api/staking/stake/route.ts` and `app/api/staking/unstake/route.ts`

**Problem 1 - Line 59 in stake/route.ts:**
```typescript
if (result !== true) {
  return NextResponse.json(
    { error: "Failed to stake RAIR tokens" },
    { status: 400 }
  );
}
```
**Issue:** `stake_rair` function returns BOOLEAN (true/false), not structured data. Need to verify return value properly.

**Problem 2 - Lines 67-76 in stake/route.ts:**
```typescript
const { data: updatedStatus, error: statusError } = await supabase.rpc('get_staking_status');

if (statusError) {
  // ... returns partial success
}

return NextResponse.json({
  success: true,
  rair_balance: updatedStatus.rair_balance || 0,  // ← WRONG: accesses array element
  rair_staked: updatedStatus.rair_staked || 0,
```

**Issue:** `get_staking_status()` returns a **TABLE** (array), not an object. Must access `updatedStatus[0]`.

---

### Issue 3: Frontend State Not Updated After API Response
**File:** `components/staking/StakingCard.tsx` (Lines 103-108)

**Current Code:**
```typescript
if (response.ok && data.success) {
  setStakingStatus({
    rair_balance: data.rair_balance,
    rair_staked: data.rair_staked,
    has_superguide_access: data.rair_staked >= 3000
  });
```

**Issue:** If API returns `null` or `undefined` for balances, UI resets to 0. Need better error handling.

---

### Issue 4: Disabled State Logic Wrong
**File:** `components/staking/StakingCard.tsx` (Lines 338-344)

**Current Code:**
```typescript
disabled={
  isLoading ||
  !amount ||
  parseInt(amount) <= 0 ||
  parseInt(amount) > stakingStatus.rair_balance
}
```

**Issue:** When staking first loads with hardcoded values (7000), the logic expects amount field to be filled. But before user interaction, amount is empty, so button stays disabled.

---

## Root Cause Chain

1. **fetchStakingStatus is commented out** 
   → Component shows hardcoded values forever
   → User's real balance never loads
   → Buttons appear disabled (no amount entered, balance 0)

2. **When user clicks "Quick Stake 3000"**
   → Amount field gets populated with "3000"
   → Buttons become enabled
   → User clicks Stake

3. **Stake API is called**
   → `stake_rair()` function executes correctly
   → Returns BOOLEAN true
   → API tries to fetch updated status via `get_staking_status()`
   → **BUG: Accesses array as object** → Returns undefined/0
   → UI receives `{ rair_balance: 0, rair_staked: 0 }`
   → **UI corrupts - shows 0/0 forever**

---

## Solution Overview (NO SQL NEEDED)

### Phase 1: Fix API Response Handling (Code-only)
**Objective:** Make stake/unstake APIs return correct balance data

**Files to modify:**
1. `app/api/staking/stake/route.ts` - Fix `updatedStatus[0]` array access
2. `app/api/staking/unstake/route.ts` - Fix `updatedStatus[0]` array access

**Changes:**
```typescript
// BEFORE:
rair_balance: updatedStatus.rair_balance || 0,

// AFTER:
rair_balance: updatedStatus?.[0]?.rair_balance || 0,
rair_staked: updatedStatus?.[0]?.rair_staked || 0,
has_superguide_access: updatedStatus?.[0]?.has_superguide_access || false,
```

---

### Phase 2: Re-enable Frontend Status Loading (Code-only)
**Objective:** Load real staking status when component mounts

**File:** `components/staking/StakingCard.tsx`

**Changes:**
1. **Line 60:** Uncomment `fetchStakingStatus()` call
2. **Line 26:** Change `const [isLoadingStatus, setIsLoadingStatus] = useState(false)` to `useState(true)` so UI shows loading while fetching
3. **Add error handling:** Display user-friendly message if fetch fails

---

### Phase 3: Improve Frontend State Management (Code-only)
**Objective:** Better handle edge cases and user feedback

**File:** `components/staking/StakingCard.tsx`

**Changes:**
1. Add validation of API response before updating state:
```typescript
if (response.ok && data.success && data.rair_balance !== undefined && data.rair_staked !== undefined) {
  // Update state
} else {
  // Show error
}
```

2. Add retry logic for failed status fetches
3. Clear error message on successful transaction
4. Add helpful messages during loading states

---

### Phase 4: Verify SuperGuide Access Control (No changes needed)
**Objective:** Verify that SuperGuideAccessWrapper correctly locks/unlocks based on staked balance

**File:** `components/superguide/SuperGuideAccessWrapper.tsx`

**Status:** ✅ Code is correct, just needs real staking data from Phase 1-2

**Verification:** Line 39 correctly checks `balance >= 3000`

---

## Detailed Implementation Plan

### Fix 1: API Response Array Access Bug

**File:** `app/api/staking/stake/route.ts` (Lines 66-85)

```typescript
// CURRENT (BUGGY):
const { data: updatedStatus, error: statusError } = await supabase.rpc('get_staking_status');

if (statusError) {
  console.error('Error fetching updated status:', statusError);
  return NextResponse.json({
    success: true,
    amount: amount,
    message: "Staked successfully, but failed to refresh status"
  });
}

return NextResponse.json({
  success: true,
  rair_balance: updatedStatus.rair_balance || 0,           // ← BUG: undefined
  rair_staked: updatedStatus.rair_staked || 0,             // ← BUG: undefined
  has_superguide_access: updatedStatus.has_superguide_access || false,
  amount: amount
});

// FIXED:
const { data: updatedStatus, error: statusError } = await supabase.rpc('get_staking_status');

if (statusError || !updatedStatus || updatedStatus.length === 0) {
  console.error('Error fetching updated status:', statusError);
  // Still return success, but don't update balance display
  return NextResponse.json({
    success: true,
    amount: amount,
    message: "Staked successfully"
    // Don't include balance - let frontend refetch
  });
}

// updatedStatus is an array from the function's RETURNS TABLE
const status = updatedStatus[0];
return NextResponse.json({
  success: true,
  rair_balance: status?.rair_balance || 0,
  rair_staked: status?.rair_staked || 0,
  has_superguide_access: (status?.rair_staked || 0) >= 3000,
  amount: amount
});
```

**Same fix applies to:** `app/api/staking/unstake/route.ts` (Lines 66-85)

---

### Fix 2: Re-enable Status Fetching

**File:** `components/staking/StakingCard.tsx`

**Current (Line 60):**
```typescript
useEffect(() => {
  // fetchStakingStatus(); // TEMP: disabled for testing
}, []);
```

**Fixed:**
```typescript
useEffect(() => {
  fetchStakingStatus(); // Re-enabled for actual usage
}, []);
```

**Also update Line 26:**
```typescript
// Before:
const [isLoadingStatus, setIsLoadingStatus] = useState(false); // TEMP: set to false

// After:
const [isLoadingStatus, setIsLoadingStatus] = useState(true); // Show loading while fetching
```

---

### Fix 3: Add Response Validation

**File:** `components/staking/StakingCard.tsx` (Lines 103-120)

**Current:**
```typescript
if (response.ok && data.success) {
  setStakingStatus({
    rair_balance: data.rair_balance,
    rair_staked: data.rair_staked,
    has_superguide_access: data.rair_staked >= 3000
  });
  setAmount('');
  setMessage({
    type: 'success',
    text: `Successfully staked ${stakeAmount.toLocaleString()} RAIR tokens.`
  });
} else {
  setMessage({
    type: 'error',
    text: data.error || 'Failed to stake RAIR tokens.'
  });
}
```

**Fixed:**
```typescript
if (response.ok && data.success) {
  // Validate we have balance data
  if (data.rair_balance !== undefined && data.rair_staked !== undefined) {
    setStakingStatus({
      rair_balance: Math.max(0, data.rair_balance), // Ensure non-negative
      rair_staked: Math.max(0, data.rair_staked),   // Ensure non-negative
      has_superguide_access: data.rair_staked >= 3000
    });
  }
  setAmount('');
  setMessage({
    type: 'success',
    text: `Successfully staked ${stakeAmount.toLocaleString()} RAIR tokens.`
  });
} else {
  setMessage({
    type: 'error',
    text: data.error || 'Failed to stake RAIR tokens.'
  });
}
```

**Apply same fix to handleUnstake** (Lines 164-180)

---

## Test Cases & Verification

### Test Case 1: New User Signup → Receives 10,000 RAIR
**Steps:**
1. Create new account via Web3 auth
2. Check profile page `/protected/profile`
3. Verify StakingCard shows:
   - Available: 10,000 RAIR
   - Staked: 0 RAIR
   - Super Guide: Locked

**Expected Result:** ✅ User has 10,000 available (unstaked)

**Database check:**
```sql
SELECT id, rair_balance, rair_staked FROM profiles WHERE email = 'wallet@wallet.local' LIMIT 1;
-- Expected: rair_balance = 10000, rair_staked = 0
```

---

### Test Case 2: Stake 3,000 RAIR → Super Guide Unlocks
**Steps:**
1. On StakingCard, enter "3000" in amount field
2. Click "Stake"
3. Wait for "Successfully staked" message
4. Verify balances updated to:
   - Available: 7,000 RAIR
   - Staked: 3,000 RAIR
   - Super Guide: **Active ✅**
5. Click "Access Super Guide" button
6. Verify `/superguide` page loads (not locked)

**Expected Result:** ✅ User can access Super Guide

---

### Test Case 3: Unstake 1 RAIR → Super Guide Locks
**Steps:**
1. On StakingCard, enter "1" in amount field
2. Click "Unstake"
3. Wait for "Successfully unstaked" message
4. Verify balances updated to:
   - Available: 7,001 RAIR
   - Staked: 2,999 RAIR
   - Super Guide: **Locked 🔒**
5. Try to click "Access Super Guide"
6. Verify locked view shows (not full content)

**Expected Result:** ✅ Super Guide is locked at 2,999 RAIR staked

---

### Test Case 4: Re-stake to Regain Access
**Steps:**
1. On StakingCard, enter "1" in amount field
2. Click "Stake"
3. Wait for success message
4. Verify balances updated to:
   - Available: 7,000 RAIR
   - Staked: 3,000 RAIR
   - Super Guide: **Active ✅**

**Expected Result:** ✅ User regains access

---

## Database Schema Verification

No SQL changes needed. Current schema is correct:

```sql
-- profiles table has correct columns:
- rair_balance NUMERIC DEFAULT 0
- rair_staked NUMERIC DEFAULT 0
- rair_tokens_allocated NUMERIC
- rair_token_tier TEXT
- signup_order BIGSERIAL UNIQUE

-- staking_transactions table exists and logs all transactions

-- Database functions are correct:
- stake_rair(amount) → BOOLEAN
- unstake_rair(amount) → BOOLEAN
- get_staking_status() → TABLE(user_id, rair_balance, rair_staked, total_rair, has_superguide_access)
- set_rair_tokens_on_signup() → TRIGGER (fires on INSERT)
- calculate_rair_tokens(signup_order) → NUMERIC (10k for first 100 users)
```

---

## Implementation Checklist

- [ ] **Phase 1: Fix API Response Handling**
  - [ ] Fix `stake/route.ts` - access `updatedStatus[0]`
  - [ ] Fix `unstake/route.ts` - access `updatedStatus[0]`
  - [ ] Test both endpoints with curl/Postman

- [ ] **Phase 2: Re-enable Frontend Loading**
  - [ ] Uncomment `fetchStakingStatus()` in StakingCard
  - [ ] Change `isLoadingStatus` initial state to `true`
  - [ ] Test profile page loads staking data

- [ ] **Phase 3: Improve State Management**
  - [ ] Add response validation in handleStake
  - [ ] Add response validation in handleUnstake
  - [ ] Add error boundary for API failures
  - [ ] Improve error messages shown to users

- [ ] **Phase 4: Manual Testing**
  - [ ] [ ] Test new signup → 10,000 RAIR
  - [ ] [ ] Test stake 3,000 → Super Guide unlocks
  - [ ] [ ] Test unstake 1 → Super Guide locks
  - [ ] [ ] Test re-stake → Super Guide unlocks again
  - [ ] [ ] Test edge cases (0 amount, negative, over balance)

- [ ] **Phase 5: Verification**
  - [ ] Check database shows correct balances
  - [ ] Check transaction logs recorded
  - [ ] Check no Vercel environment changes needed
  - [ ] Check no new SQL migrations needed

---

## Files Modified Summary

```
MODIFIED (Code-only fixes):
✓ app/api/staking/stake/route.ts         (Fix array access bug)
✓ app/api/staking/unstake/route.ts       (Fix array access bug)
✓ components/staking/StakingCard.tsx     (Re-enable fetching, improve validation)

NO CHANGES NEEDED:
✓ Database functions (all correct)
✓ SuperGuideAccessWrapper (correctly checks balance)
✓ Vercel configuration (no breaking changes)
✓ Environment variables (no new ones needed)
```

---

## Risk Assessment

### Low Risk ✅
- Changes are isolated to frontend and API layer
- Database infrastructure is solid and tested
- No breaking changes to Vercel deployment
- All fixes are backward compatible

### Mitigation
- Test on staging before production
- Monitor staking transaction logs
- Keep rollback plan ready (original code in git)

---

## Success Criteria

✅ **User receives 10,000 RAIR on signup (unstaked)**
- Verified via profile page showing "Available: 10,000"
- Verified via database query

✅ **User can stake 3,000 RAIR**
- Click stake, see success message
- Balance updates to 7,000 available, 3,000 staked
- No hardcoded values shown

✅ **Super Guide unlocks when staked >= 3,000**
- Badge shows "Super Guide Access Active"
- Button is enabled
- Page `/superguide` loads content

✅ **Super Guide locks when staked < 3,000**
- Badge shows "Super Guide Locked"
- Button is disabled
- Page `/superguide` shows locked view

✅ **No Vercel-breaking changes**
- All changes are code-level
- No new environment variables
- No new dependencies
- No SQL editor script needed

---

## Timeline Estimate

- **Phase 1 (API fixes):** 15 minutes
- **Phase 2 (Re-enable fetching):** 5 minutes
- **Phase 3 (State management):** 15 minutes
- **Phase 4 (Manual testing):** 30 minutes
- **Phase 5 (Verification):** 15 minutes

**Total: ~1.5 hours**

---

## Rollback Plan

If issues occur:
1. Revert changes to affected files (git checkout)
2. Redeploy to Vercel
3. Verify rollback successful
4. Investigate root cause
5. Re-apply fixes with adjustments

---

## Next Steps After Implementation

1. Deploy to staging
2. Run full test suite
3. Manual testing by team
4. Code review
5. Deploy to production
6. Monitor error logs for 24 hours
7. Document any additional issues found

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** ✅ Ready for Implementation

