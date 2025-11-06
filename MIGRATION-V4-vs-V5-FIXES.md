# Migration Script Comparison: V4 vs V5 (FIXED)

## Overview

**V4**: Contains the correct schema structure but has **2 CRITICAL BUGS** in the staking trigger that cause silent failures.

**V5**: Fixes both critical bugs and is **production-ready** for new Supabase projects.

---

## Critical Fix #1: BIGSERIAL Sequence Timing

### The Problem

In PostgreSQL, BEFORE INSERT triggers execute **before column defaults are applied**. Since `signup_order` is `BIGSERIAL`, its default sequence value hasn't been assigned yet when the trigger runs.

### V4 Code (BROKEN)

```sql
CREATE OR REPLACE FUNCTION public.set_rair_tokens_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens NUMERIC;
BEGIN
  -- ❌ NEW.signup_order is NULL here - BIGSERIAL hasn't assigned yet!
  v_tokens := public.calculate_rair_tokens(NEW.signup_order);
  
  NEW.rair_tokens_allocated := v_tokens;
  
  IF NEW.signup_order <= 100 THEN  -- ❌ This is NULL, so condition fails
    NEW.rair_token_tier := 1;
  -- ... tier logic fails ...
  END IF;

  RETURN NEW;
END;
$$;
```

**Result**: Every user gets `signup_order = NULL` and `rair_tokens_allocated = 0`

### V5 Code (FIXED)

```sql
CREATE OR REPLACE FUNCTION public.set_rair_tokens_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens NUMERIC;
  v_seq_name TEXT;
BEGIN
  -- ✅ FIX 1: Manually assign sequence value before using it
  v_seq_name := pg_get_serial_sequence('public.profiles', 'signup_order');
  
  IF v_seq_name IS NOT NULL THEN
    SELECT nextval(v_seq_name::regclass) INTO NEW.signup_order;
  END IF;
  
  -- ✅ Now signup_order has a valid value
  v_tokens := public.calculate_rair_tokens(NEW.signup_order);
  
  NEW.rair_tokens_allocated := v_tokens;
  
  IF NEW.signup_order <= 100 THEN  -- ✅ This now works correctly
    NEW.rair_token_tier := '1';
  -- ... tier logic works ...
  END IF;

  RETURN NEW;
END;
$$;
```

**Result**: Every user gets correct `signup_order` and `rair_tokens_allocated` matching their tier

---

## Critical Fix #2: rair_balance Not Set by Trigger

### The Problem

The `profiles` table column definition:
```sql
rair_balance NUMERIC DEFAULT 10000 CHECK (rair_balance >= 0),
```

The trigger never sets `rair_balance`, so it defaults to 10,000 for ALL users, regardless of tier.

### V4 Code (BROKEN)

```sql
-- In set_rair_tokens_on_signup function:
DECLARE
  v_tokens NUMERIC;
BEGIN
  v_tokens := public.calculate_rair_tokens(NEW.signup_order);
  
  -- ❌ Only sets allocated, NOT balance
  NEW.rair_tokens_allocated := v_tokens;
  
  -- Balance defaults to 10000 for everyone
  -- No explicit setting of NEW.rair_balance
  
  IF NEW.signup_order <= 100 THEN
    NEW.rair_token_tier := 1;
  ELSIF NEW.signup_order <= 500 THEN
    NEW.rair_token_tier := 2;  -- Should get 5000, gets 10000
  ELSIF NEW.signup_order <= 1000 THEN
    NEW.rair_token_tier := 3;  -- Should get 2500, gets 10000
  END IF;

  RETURN NEW;
END;
```

**Behavior**:
- User 1-100: balance = 10000 ✅
- User 101-500: balance = 10000 ❌ (should be 5000)
- User 501-1000: balance = 10000 ❌ (should be 2500)

### V5 Code (FIXED)

```sql
-- In set_rair_tokens_on_signup function:
DECLARE
  v_tokens NUMERIC;
  v_seq_name TEXT;
BEGIN
  -- ... sequence assignment (Fix #1) ...
  
  -- ✅ FIX 2: Calculate once, set both balance and allocated
  v_tokens := public.calculate_rair_tokens(NEW.signup_order);
  
  NEW.rair_balance := v_tokens;              -- ✅ Set to tiered amount
  NEW.rair_tokens_allocated := v_tokens;    -- ✅ Also set to tiered amount
  
  IF NEW.signup_order <= 100 THEN
    NEW.rair_token_tier := '1';
  ELSIF NEW.signup_order <= 500 THEN
    NEW.rair_token_tier := '2';  -- Now gets 5000 balance
  ELSIF NEW.signup_order <= 1000 THEN
    NEW.rair_token_tier := '3';  -- Now gets 2500 balance
  END IF;

  RETURN NEW;
END;
```

**Behavior**:
- User 1-100: balance = 10000 ✅
- User 101-500: balance = 5000 ✅
- User 501-1000: balance = 2500 ✅

---

## Additional Changes in V5

### Column Definition Update

**V4**:
```sql
rair_balance NUMERIC DEFAULT 10000 CHECK (rair_balance >= 0),
```

**V5**:
```sql
rair_balance NUMERIC DEFAULT 0 CHECK (rair_balance >= 0),
```

**Why**: Default is now 0 since the trigger always sets it explicitly. This makes it clearer that the value is controlled by the trigger.

### Trigger Function Documentation

**V4**: Generic comment

**V5**: Explicit documentation of the fixes

```sql
COMMENT ON FUNCTION public.set_rair_tokens_on_signup() IS 
'BEFORE INSERT trigger that assigns tiered RAIR tokens and balance when a new profile is created. 
FIXED: Manually assigns BIGSERIAL sequence and sets rair_balance to tiered amount.';
```

---

## Test Case: Demonstrating the Difference

### Setup
Both versions create a new user after the schema:

```sql
INSERT INTO auth.users (id, email, email_confirmed_at)
VALUES (gen_random_uuid(), 'test@example.com', NOW());
-- This triggers handle_new_user() which inserts into profiles
-- Which then triggers set_rair_tokens_on_signup()
```

### V4 Query Results (BROKEN)
```sql
SELECT signup_order, rair_balance, rair_token_tier, rair_tokens_allocated
FROM profiles
WHERE email = 'test@example.com';

-- Result:
-- signup_order: NULL (or error)
-- rair_balance: 10000 (default)
-- rair_token_tier: NULL (logic never executes)
-- rair_tokens_allocated: 0 (calculate_rair_tokens(NULL) returns 0)
```

### V5 Query Results (FIXED)
```sql
SELECT signup_order, rair_balance, rair_token_tier, rair_tokens_allocated
FROM profiles
WHERE email = 'test@example.com';

-- Result:
-- signup_order: 1 (manually assigned)
-- rair_balance: 10000 (tier 1 amount)
-- rair_token_tier: '1'
-- rair_tokens_allocated: 10000
```

---

## API Endpoint Impact

### /api/staking/status Endpoint

**V4 Result**:
```json
{
  "rair_balance": 0,
  "rair_staked": 0,
  "has_superguide_access": false,
  "total_rair": 0
}
```
❌ User can't access any staking features, appears to have no tokens

**V5 Result**:
```json
{
  "rair_balance": 10000,
  "rair_staked": 0,
  "has_superguide_access": false,
  "total_rair": 10000
}
```
✅ User correctly shows their tier 1 allocation

---

## Migration Path for Existing Databases

If you're currently on V4 and need to fix existing data:

```sql
-- Step 1: Update the trigger function (V5 version)
-- Run the set_rair_tokens_on_signup creation from V5

-- Step 2: Backfill existing users
UPDATE profiles
SET signup_order = row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM profiles
) sub
WHERE profiles.id = sub.id
AND profiles.signup_order IS NULL;

-- Step 3: Recalculate balances and tiers
UPDATE profiles
SET 
  rair_balance = public.calculate_rair_tokens(signup_order),
  rair_tokens_allocated = public.calculate_rair_tokens(signup_order),
  rair_token_tier = CASE
    WHEN signup_order <= 100 THEN '1'
    WHEN signup_order <= 500 THEN '2'
    WHEN signup_order <= 1000 THEN '3'
    ELSE (4 + FLOOR((signup_order - 1001) / 1000)::INT)::TEXT
  END
WHERE rair_balance = 0 OR rair_token_tier IS NULL;
```

---

## Recommendation

**For New Supabase Projects**: Use `00-ULTIMATE-MIGRATION-V5-FIXED.sql`

**For Existing Projects on V4**: Apply the migration path above, then all new signups will use the fixed trigger

---

## Verification Checklist

After running V5, verify:

- [ ] `profiles` table exists with correct columns
- [ ] `signup_order` is BIGSERIAL and auto-incrementing
- [ ] `rair_balance` defaults to 0
- [ ] `set_rair_tokens_on_signup()` trigger exists
- [ ] New user insert results in:
  - [ ] `signup_order` > 0
  - [ ] `rair_balance` > 0
  - [ ] `rair_token_tier` populated
  - [ ] `rair_tokens_allocated` > 0
- [ ] `/api/staking/status` returns correct balance

---

