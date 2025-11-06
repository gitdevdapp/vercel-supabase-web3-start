# Staking System Restoration - Implementation Guide

**Status**: Ready to Implement  
**Complexity**: Low  
**Time**: ~15 minutes

---

## Quick Summary: What to Restore

| Item | Source | Status | Priority |
|------|--------|--------|----------|
| `calculate_rair_tokens()` | `docs/archive/other/USER-STATISTICS-SETUP.sql` lines 53-95 | Missing | HIGH |
| `set_rair_tokens_on_signup()` | `docs/archive/other/USER-STATISTICS-SETUP.sql` lines 108-145 | Missing | HIGH |
| Trigger `trg_set_rair_tokens_on_signup` | `docs/archive/other/USER-STATISTICS-SETUP.sql` lines 142-145 | Missing | HIGH |
| SuperGuide bypass removal | `components/superguide/SuperGuideAccessWrapper.tsx` lines 103-105 | Active | HIGH |

---

## Implementation Step-by-Step

### Step 1: Locate & Copy Tiered Token Functions

**Source File**: `docs/archive/other/USER-STATISTICS-SETUP.sql`

**What to Copy** (lines 53-95):
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
  v_block := FLOOR((p_signup_order - 1001) / 1000)::INT;
  v_tokens := 2500::NUMERIC / POWER(2::NUMERIC, v_block::NUMERIC);
  
  -- Ensure minimum 1 token to avoid floating point precision issues
  RETURN GREATEST(1, FLOOR(v_tokens));
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_rair_tokens(BIGINT) TO authenticated;
```

**Where to Add**: In `scripts/master/00-ULTIMATE-MIGRATION.sql`  
**After Line**: Line 367 (after handle_new_user trigger)  
**Before Line**: Next function definition

---

### Step 2: Copy Token Assignment Trigger

**Source File**: `docs/archive/other/USER-STATISTICS-SETUP.sql`

**What to Copy** (lines 108-145):
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

**Where to Add**: In `scripts/master/00-ULTIMATE-MIGRATION.sql`  
**After**: The `calculate_rair_tokens` function  
**Before**: Next function definition

---

### Step 3: Add Grant Permission

After the `set_rair_tokens_on_signup()` function, add:
```sql
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_rair_tokens_on_signup() TO authenticated;
```

---

### Step 4: Update Migration File

**File**: `docs/migrateV4/00-ULTIMATE-MIGRATION.sql`

**Repeat Steps 1-3** for the docs migration file (same additions, same locations).

This ensures both migration files stay in sync.

---

### Step 5: Remove SuperGuide Bypass

**File**: `components/superguide/SuperGuideAccessWrapper.tsx`

**Current Code** (lines 103-105):
```typescript
  // TEMPORARY: Skip access check for testing V8 implementation - MODIFIED
  // Access granted - show content
  return <>{children}</>
```

**Replace With**:
```typescript
  // Access control: Show locked view if user doesn't have sufficient staked RAIR
  if (!hasAccess) {
    return <SuperGuideLockedView stakedBalance={stakedBalance} />
  }

  // User has access: Show full content
  return <>{children}</>
```

---

## Verification Checklist

### ✅ Before Implementation

- [ ] Read `critical-findings-and-restoration.md` (this doc)
- [ ] Backup current database
- [ ] Have test account ready
- [ ] Know how to access Supabase SQL Editor

### ✅ During Implementation

- [ ] Add `calculate_rair_tokens()` to migration files
- [ ] Add `set_rair_tokens_on_signup()` to migration files
- [ ] Add trigger definition to migration files
- [ ] Redeploy migration SQL
- [ ] Remove SuperGuide bypass from component
- [ ] Deploy code to Vercel

### ✅ After Implementation

Run these verification queries in Supabase SQL Editor:

**1. Verify Functions Exist**
```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('calculate_rair_tokens', 'set_rair_tokens_on_signup')
ORDER BY routine_name;

-- Expected 2 rows with FUNCTION type
```

**2. Verify Trigger Exists**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'trg_set_rair_tokens_on_signup';

-- Expected 1 row: INSERT, profiles table
```

**3. Test Token Calculation**
```sql
SELECT 
  input.signup_order,
  calculate_rair_tokens(input.signup_order) as tokens
FROM (
  VALUES (1), (50), (100), (150), (500), (750), (1000), (1500), (2500)
) AS input(signup_order)
ORDER BY input.signup_order;

-- Expected:
-- 1    | 10000
-- 50   | 10000
-- 100  | 10000
-- 150  | 5000
-- 500  | 5000
-- 750  | 2500
-- 1000 | 2500
-- 1500 | 1250
-- 2500 | 625
```

### ✅ Manual Testing (In Application)

**Test 1: First User Gets 10,000 RAIR**
1. Create new test user via signup form
2. After signup, check database:
   ```sql
   SELECT email, rair_balance, signup_order, rair_token_tier, rair_tokens_allocated 
   FROM profiles 
   WHERE email = 'test@example.com';
   ```
3. Expected: `rair_balance = 10000, signup_order = 1, rair_token_tier = 1, rair_tokens_allocated = 10000`

**Test 2: SuperGuide Locked Without 3000 RAIR Staked**
1. Login with test user (10,000 balance, 0 staked)
2. Navigate to `/superguide`
3. Expected: See `SuperGuideLockedView` with message "Stake X more RAIR"
4. NOT expected: Direct access to guide content

**Test 3: SuperGuide Unlocked With 3000 RAIR Staked**
1. Use test user from Test 2
2. Stake 3,000 RAIR (use StakingCard component)
3. Navigate to `/superguide`
4. Expected: See full SuperGuide content
5. NOT expected: Locked view

**Test 4: Staking Interface Shows Correctly**
1. Login with test user
2. Go to `/protected/profile`
3. Scroll to RAIR Staking section
4. Expected:
   - Available: 10,000 RAIR (or remaining after any stakes)
   - Staked: 0 RAIR (or current stake)
   - Progress bar shows 0% (or current progress)
   - "Quick Stake 3000" button is enabled

**Test 5: Quick Stake Works**
1. From previous test, click "Quick Stake 3000"
2. Input field auto-fills with "3000"
3. Click "Stake" button
4. Wait for confirmation (2-3 seconds)
5. Expected:
   - Message: "Successfully staked 3,000 RAIR tokens"
   - Available: 7,000 RAIR
   - Staked: 3,000 RAIR
   - Progress bar shows 100%
   - SuperGuide button becomes enabled

**Test 6: SuperGuide Access After Staking**
1. From Test 5, navigate to `/superguide`
2. Expected: Full guide content visible
3. NOT expected: Locked view

---

## Rollback Plan (If Needed)

If something goes wrong:

**1. Revert Code Changes**
```bash
git checkout components/superguide/SuperGuideAccessWrapper.tsx
```

**2. Revert Database** (from backup)
```sql
-- Supabase Console → SQL Editor → Run
-- (your database backup restoration script)
```

**3. Re-redeploy**
```bash
# Vercel will auto-redeploy if you push to main
git push origin main
```

---

## Expected Outcomes After Restoration

### ✅ SuperGuide Access Now Working
- First 100 users get 10,000 RAIR each
- Users 101-500 get 5,000 RAIR each
- Users 501-1000 get 2,500 RAIR each
- Subsequent users get halving amounts every 1,000 users
- SuperGuide LOCKED unless user has 3,000+ RAIR staked
- Staking interface fully functional
- Progress tracking accurate

### ✅ Database Integrity
- All new users get signup_order automatically
- All new users get rair_token_tier set correctly
- All new users get rair_tokens_allocated calculated correctly
- No data loss for existing users
- No breaking changes to existing APIs

### ✅ User Experience
- New users see correct token allocation
- Staking interface shows accurate balances
- SuperGuide access gate works as intended
- Progress toward 3,000 RAIR displayed clearly
- Quick Stake 3000 button works
- Unlock message shows remaining RAIR needed

---

## FAQ

**Q: Will this affect existing users?**  
A: No. The trigger only fires on NEW profile inserts. Existing users keep their current balances.

**Q: What if a user already has 0 signup_order?**  
A: The BIGSERIAL sequence will continue from the highest value. New users will get correct signup_order.

**Q: Can users get more RAIR if they have less than their tier?**  
A: This implementation doesn't alter existing balances. New users start with the tier amount; existing users keep theirs.

**Q: What if I delete/re-add a migration?**  
A: All CREATE OR REPLACE and DROP IF EXISTS statements make this safe to re-run.

**Q: How do I monitor this working correctly?**  
A: Watch the `rair_balance` and `signup_order` columns in the profiles table for new signups.

---

## Timeline

| Step | Time | Notes |
|------|------|-------|
| Add functions to migration | 3 min | Copy/paste from archive |
| Redeploy migration | 2 min | Supabase SQL Editor → Run |
| Remove bypass from component | 2 min | Edit file, save |
| Deploy to Vercel | 3 min | Push to main, wait for deploy |
| Manual testing | 5 min | 6 test cases above |
| **Total** | **~15 min** | Non-blocking, low risk |

---

## Success Criteria

✅ Implementation is successful when:
1. ✓ New users receive correct tiered RAIR allocation
2. ✓ SuperGuide access is locked for <3000 staked
3. ✓ SuperGuide access is granted for >=3000 staked
4. ✓ Staking interface renders and works
5. ✓ Database queries show no errors
6. ✓ No 500 errors in Vercel logs
7. ✓ All test cases pass

---

## Support Resources

If you run into issues:

1. **Database Error**: Check Supabase logs → SQL Editor → View error message
2. **Component Error**: Check browser console (F12) for React/TypeScript errors
3. **Staking Not Working**: Verify `/api/staking/status` returns correct values
4. **Access Still Bypassed**: Verify component change was deployed (hard refresh with Ctrl+Shift+R)

---

**Ready to restore!** Follow the steps above in order.

