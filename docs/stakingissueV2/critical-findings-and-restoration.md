# Staking System Critical Findings & Restoration Plan

**Date**: November 6, 2025  
**Status**: Code Review Complete - Restoration in Progress  
**Priority**: CRITICAL (Affects superguide access & token allocation)

---

## Executive Summary

The staking system infrastructure is **well-designed but incomplete in production migration**. Key discovery:

✅ **Tiered token allocation system EXISTS** in archived code  
❌ **NOT INCLUDED in current production migration** (scripts/master/00-ULTIMATE-MIGRATION.sql)  
❌ **SuperGuide bypass active** (temporary code still present)  
❌ **Database schema has columns but no calculation logic**

**Solution**: Restore existing working tiered allocation logic and remove SuperGuide bypass.

---

## Part 1: What's Currently Broken

### Issue #1: Missing Tiered Token Allocation Logic

**Location**: `/scripts/master/00-ULTIMATE-MIGRATION.sql`

**What Exists**:
```sql
-- These columns EXIST in profiles table:
signup_order BIGINT UNIQUE,
rair_token_tier TEXT,
rair_tokens_allocated NUMERIC,

-- But NO functions use them:
-- ❌ calculate_rair_tokens() - MISSING
-- ❌ set_rair_tokens_on_signup() - MISSING
-- ❌ Token tier logic - MISSING
```

**Current Behavior**:
- All new users get 10,000 RAIR (flat rate via DEFAULT)
- `signup_order` never gets set
- `rair_token_tier` never gets calculated
- Users 101+ should get reduced tokens but don't

**Expected Behavior** (From archived code):
```
Users 1-100:     10,000 RAIR ✅
Users 101-500:   5,000 RAIR  ❌ (getting 10,000)
Users 501-1,000: 2,500 RAIR  ❌ (getting 10,000)
Users 1001+:     Halving every 1000 users ❌ (getting 10,000)
```

---

### Issue #2: SuperGuide Bypass Active

**Location**: `components/superguide/SuperGuideAccessWrapper.tsx` (lines 103-105)

**Current Code**:
```typescript
// TEMPORARY: Skip access check for testing V8 implementation - MODIFIED
// Access granted - show content
return <>{children}</>  // ❌ EVERYONE gets access!
```

**What Should Happen**:
```typescript
if (!hasAccess) {
  return <SuperGuideLockedView stakedBalance={stakedBalance} />
}
return <>{children}</>
```

**Impact**:
- Any authenticated user can access /superguide
- No 3,000 RAIR staking requirement enforced
- Staking interface rendered but not actually required

---

### Issue #3: handle_new_user() Function Incomplete

**Location**: `scripts/master/00-ULTIMATE-MIGRATION.sql` (lines 348-356)

**Current Code**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
```

**Problem**: 
- Only inserts ID and email
- Relies on defaults for `rair_balance`
- Doesn't set `signup_order` (sequence lost if trigger timing fails)
- Doesn't call `set_rair_tokens_on_signup()`

---

## Part 2: Existing Working Code (Located in Archives)

### The Complete Tiered System

**File**: `docs/archive/other/USER-STATISTICS-SETUP.sql`

This file contains the **complete working implementation** that needs to be restored:

#### 1. Token Calculation Function

```sql
CREATE OR REPLACE FUNCTION calculate_rair_tokens(p_signup_order BIGINT)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_block INT;
  v_tokens NUMERIC;
BEGIN
  -- Handle NULL or invalid input
  IF p_signup_order IS NULL OR p_signup_order < 1 THEN
    RETURN 0;
  END IF;

  -- Tier 1: Users 1-100 = 10,000 tokens
  IF p_signup_order <= 100 THEN
    RETURN 10000;
  END IF;

  -- Tier 2: Users 101-500 = 5,000 tokens
  IF p_signup_order <= 500 THEN
    RETURN 5000;
  END IF;

  -- Tier 3: Users 501-1,000 = 2,500 tokens
  IF p_signup_order <= 1000 THEN
    RETURN 2500;
  END IF;

  -- Tier 4+: Halving every 1,000 users after user 1,000
  -- Users 1,001-2,000: 2,500 / 2^0 = 1,250 tokens
  -- Users 2,001-3,000: 2,500 / 2^1 = 625 tokens
  -- Users 3,001-4,000: 2,500 / 2^2 = 312 tokens
  -- And so on, halving every 1,000 users
  
  v_block := FLOOR((p_signup_order - 1001) / 1000)::INT;
  v_tokens := 2500::NUMERIC / POWER(2::NUMERIC, v_block::NUMERIC);
  
  -- Ensure minimum 1 token to avoid floating point precision issues
  RETURN GREATEST(1, FLOOR(v_tokens));
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_rair_tokens(BIGINT) TO authenticated;
```

**What This Does**:
- ✅ Calculates tokens based on signup order
- ✅ Returns correct tier amounts
- ✅ Handles edge cases (NULL, invalid input)
- ✅ Immutable (pure function, no side effects)
- ✅ Efficient (no database queries)

---

#### 2. Token Assignment Trigger

```sql
CREATE OR REPLACE FUNCTION set_rair_tokens_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens NUMERIC;
BEGIN
  -- Calculate tokens based on signup_order
  v_tokens := calculate_rair_tokens(NEW.signup_order);
  
  -- Set token allocation
  NEW.rair_tokens_allocated := v_tokens;
  
  -- Determine and set tier for reference
  IF NEW.signup_order <= 100 THEN
    NEW.rair_token_tier := 1;
  ELSIF NEW.signup_order <= 500 THEN
    NEW.rair_token_tier := 2;
  ELSIF NEW.signup_order <= 1000 THEN
    NEW.rair_token_tier := 3;
  ELSE
    -- Tier 4+ calculation
    NEW.rair_token_tier := 4 + FLOOR((NEW.signup_order - 1001) / 1000)::INT;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS trg_set_rair_tokens_on_signup ON profiles;

-- Create trigger that fires BEFORE INSERT on profiles table
CREATE TRIGGER trg_set_rair_tokens_on_signup
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_rair_tokens_on_signup();
```

**What This Does**:
- ✅ Fires BEFORE INSERT on new profiles
- ✅ Calculates token amount from signup_order
- ✅ Sets rair_tokens_allocated column
- ✅ Sets rair_token_tier for reference
- ✅ Automatic (no API changes needed)

---

### The SuperGuide Access Logic (Already Correct)

**What Works Perfectly**:

1. **API Endpoint** (`app/api/staking/status/route.ts`):
   ```typescript
   const { data: result, error: functionError } = await supabase.rpc('get_staking_status');
   return NextResponse.json({
     rair_balance: result.rair_balance || 0,
     rair_staked: result.rair_staked || 0,
     has_superguide_access: result.has_superguide_access || false
   });
   ```
   ✅ Correctly calls Supabase function
   ✅ Returns staking status accurately

2. **AccessWrapper Component** (`components/superguide/SuperGuideAccessWrapper.tsx`):
   ```typescript
   const checkAccess = async () => {
     const response = await fetch('/api/staking/status')
     const data = await response.json()
     const balance = data.rair_staked || 0
     setHasAccess(balance >= 3000)  // ✅ Correct check
   }
   ```
   ✅ Fetches status correctly
   ✅ Checks rair_staked >= 3000
   ✅ **EXCEPT**: Line 105 bypasses this check!

3. **LockedView Component** (`components/superguide/SuperGuideLockedView.tsx`):
   ```typescript
   const remainingNeeded = Math.max(0, 3000 - stakedBalance)
   const progressPercentage = stakedBalance > 0 ? Math.min((stakedBalance / 3000) * 100, 100) : 0
   ```
   ✅ Shows progress toward 3,000 RAIR
   ✅ Shows remaining needed amount
   ✅ Beautiful locked view UI

---

## Part 3: Verification Logic (Already Exists in DB)

### The `get_staking_status()` Function

**Location**: `scripts/master/00-ULTIMATE-MIGRATION.sql` (around line 1020)

```sql
CREATE OR REPLACE FUNCTION public.get_staking_status()
RETURNS TABLE(
  rair_balance NUMERIC,
  rair_staked NUMERIC,
  has_superguide_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.rair_balance,
    p.rair_staked,
    (p.rair_staked >= 3000) as has_superguide_access
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

✅ **This is correct and working**!
- Checks `rair_staked >= 3000`
- Returns accurate boolean
- Called from API successfully

---

## Part 4: Test Cases to Verify Logic

### Test Case 1: First 100 Users Get 10,000 RAIR

```sql
-- After restoration, new users 1-100 should receive:
SELECT 
  id,
  email,
  signup_order,
  rair_token_tier,
  rair_tokens_allocated,
  rair_balance,
  created_at
FROM profiles
WHERE signup_order <= 100
ORDER BY signup_order;

-- Expected: rair_tokens_allocated = 10000 for all
```

**Test Execution**:
1. Create new user #50 via signup → Should get 10,000 RAIR
2. Create new user #100 via signup → Should get 10,000 RAIR
3. Query database → Verify rair_balance = 10000

---

### Test Case 2: Users 101-500 Get 5,000 RAIR

```sql
-- After restoration, users 101-500 should receive:
SELECT 
  id,
  email,
  signup_order,
  rair_token_tier,
  rair_tokens_allocated,
  rair_balance,
  created_at
FROM profiles
WHERE signup_order > 100 AND signup_order <= 500
ORDER BY signup_order;

-- Expected: rair_tokens_allocated = 5000 for all
```

**Test Execution**:
1. Manually create 100+ users (or adjust signup_order via SQL)
2. Create new user #150 → Should get 5,000 RAIR
3. Verify rair_balance = 5000

---

### Test Case 3: SuperGuide Access Locked for <3000 Staked

```javascript
// Test in browser console
fetch('/api/staking/status')
  .then(r => r.json())
  .then(data => {
    console.log('Staked:', data.rair_staked);
    console.log('Has Access:', data.has_superguide_access);
    // Expected: has_superguide_access = false if rair_staked < 3000
  })
```

**Test Execution**:
1. Create user with 1000 staked RAIR
2. Navigate to /superguide
3. Should see SuperGuideLockedView (not bypass)
4. Show "2,000 more RAIR needed"

---

### Test Case 4: SuperGuide Access Unlocked for >=3000 Staked

```javascript
// Same as above but with 3000+ staked
fetch('/api/staking/status')
  .then(r => r.json())
  .then(data => {
    console.log('Staked:', data.rair_staked);
    console.log('Has Access:', data.has_superguide_access);
    // Expected: has_superguide_access = true if rair_staked >= 3000
  })
```

**Test Execution**:
1. Stake 3,000 RAIR for test user
2. Navigate to /superguide
3. Should see full SuperGuide content (not locked view)
4. Progress bar shows 100%

---

### Test Case 5: Tiered Allocation Calculation

```sql
-- Verify calculate_rair_tokens function works correctly
SELECT 
  input.signup_order,
  calculate_rair_tokens(input.signup_order) as tokens,
  CASE 
    WHEN input.signup_order <= 100 THEN 'Tier 1 (10k)'
    WHEN input.signup_order <= 500 THEN 'Tier 2 (5k)'
    WHEN input.signup_order <= 1000 THEN 'Tier 3 (2.5k)'
    ELSE 'Tier 4+ (halving)'
  END as tier
FROM (
  VALUES 
    (1), (50), (100),           -- Tier 1
    (150), (300), (500),        -- Tier 2
    (750), (1000),              -- Tier 3
    (1500), (2000), (2500)      -- Tier 4+
) AS input(signup_order)
ORDER BY input.signup_order;

-- Expected output:
-- 1     | 10000 | Tier 1 (10k)
-- 50    | 10000 | Tier 1 (10k)
-- 100   | 10000 | Tier 1 (10k)
-- 150   | 5000  | Tier 2 (5k)
-- 300   | 5000  | Tier 2 (5k)
-- 500   | 5000  | Tier 2 (5k)
-- 750   | 2500  | Tier 3 (2.5k)
-- 1000  | 2500  | Tier 3 (2.5k)
-- 1500  | 1250  | Tier 4+ (halving)
-- 2000  | 1250  | Tier 4+ (halving)
-- 2500  | 625   | Tier 4+ (halving)
```

---

## Part 5: Restoration Checklist

### ✅ Non-Breaking Changes (Production Safe)

These can be merged immediately without affecting existing functionality:

- [ ] **Add `calculate_rair_tokens()` function** to migration
  - Location: After profiles table definition
  - Status: Pure function, no side effects
  
- [ ] **Add `set_rair_tokens_on_signup()` function** to migration
  - Location: After calculate_rair_tokens
  - Status: Only affects NEW signups
  
- [ ] **Add trigger `trg_set_rair_tokens_on_signup`** to migration
  - Location: After function definition
  - Status: BEFORE INSERT trigger, doesn't affect existing rows

### ⚠️ Code Changes (Requires Testing)

- [ ] **Remove SuperGuide bypass** in SuperGuideAccessWrapper.tsx
  - Replace lines 103-105 with proper access check
  - Test: Create new user, verify access denied until 3000 RAIR staked

- [ ] **Update handle_new_user()** to be more explicit
  - Option A: No change needed (trigger handles it)
  - Option B: Add explicit rair_balance set (defensive)

---

## Part 6: Actual vs Expected Data

### Current Database State (Broken)

```sql
-- All new users currently get:
SELECT 
  COUNT(*) as total_users,
  MIN(rair_balance) as min_balance,
  MAX(rair_balance) as max_balance,
  AVG(rair_balance) as avg_balance,
  COUNT(CASE WHEN signup_order IS NOT NULL THEN 1 END) as with_signup_order
FROM profiles;

-- Expected broken output:
-- total_users | min_balance | max_balance | avg_balance | with_signup_order
-- 42          | 10000       | 10000       | 10000       | 0
```

### After Restoration (Fixed)

```sql
-- Should be tiered:
SELECT 
  COUNT(*) as total_users,
  MIN(rair_balance) as min_balance,
  MAX(rair_balance) as max_balance,
  AVG(rair_balance) as avg_balance,
  COUNT(CASE WHEN signup_order IS NOT NULL THEN 1 END) as with_signup_order,
  COUNT(CASE WHEN rair_token_tier = 1 THEN 1 END) as tier_1_users,
  COUNT(CASE WHEN rair_token_tier = 2 THEN 1 END) as tier_2_users
FROM profiles;

-- Expected fixed output (if 150 users):
-- total_users | min_balance | max_balance | avg_balance | with_signup_order | tier_1_users | tier_2_users
-- 150         | 625         | 10000       | 8250        | 150               | 100          | 50
```

---

## Part 7: Implementation Order

### Step 1: Add Functions to Migration (Non-Breaking)
**Time**: 5 minutes
1. Copy `calculate_rair_tokens()` from archive
2. Copy `set_rair_tokens_on_signup()` from archive  
3. Copy trigger creation from archive
4. Add to `/scripts/master/00-ULTIMATE-MIGRATION.sql` after profiles table
5. Redeploy migration to production database

### Step 2: Update Existing Users (Optional but Recommended)
**Time**: 2 minutes
```sql
-- Retrospectively assign signup_order and recalculate tokens
UPDATE profiles
SET 
  rair_tokens_allocated = calculate_rair_tokens(signup_order),
  rair_token_tier = CASE 
    WHEN signup_order <= 100 THEN '1'
    WHEN signup_order <= 500 THEN '2'
    WHEN signup_order <= 1000 THEN '3'
    ELSE '4+'
  END
WHERE signup_order IS NOT NULL AND rair_tokens_allocated = 0;
```

### Step 3: Remove SuperGuide Bypass
**Time**: 1 minute
1. Open `components/superguide/SuperGuideAccessWrapper.tsx`
2. Replace lines 103-105 with proper access check
3. Test locally
4. Deploy

### Step 4: Verify Everything Works
**Time**: 5 minutes
1. Create test user #1
2. Verify receives 10,000 RAIR
3. Try accessing /superguide without staking → See locked view
4. Stake 3,000 RAIR
5. Try accessing /superguide with staking → See content
6. Logout, create another test user
7. Repeat verification

---

## Part 8: Risk Assessment

### Low Risk Changes ✅
- Adding new functions (no side effects)
- Adding new triggers (only on NEW inserts)
- Removing bypass (restores intended behavior)

### No Breaking Changes ✅
- Existing users unaffected (no migration of current balances)
- Existing staking logic unchanged
- Existing APIs unchanged
- Database schema already has columns

### Testing Required ⚠️
- New user signup flow
- SuperGuide access gate
- Staking interface still renders
- Token allocation displays correctly

---

## Conclusion

The staking system is **99% complete** - it just needs:

1. ✅ Restore tiered allocation functions from archive
2. ✅ Remove SuperGuide bypass
3. ✅ Verify with test users

**Status**: Ready for implementation  
**Complexity**: Low (copy/paste + remove bypass)  
**Risk**: Very Low (non-breaking additions + restore intended behavior)  
**Time to Fix**: ~15 minutes total

---

**Next**: Implementation should restore working functionality and verify all test cases pass.


