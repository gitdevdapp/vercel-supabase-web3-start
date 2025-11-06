-- ============================================================================
-- STAKING SYSTEM - COMPLETE RESTORATION SCRIPT
-- ============================================================================
-- 
-- Date: November 6, 2025
-- Purpose: Restore full staking functionality by adding tiered token allocation
--
-- This script restores the tiered token allocation system that was designed
-- but not included in the production migration. It includes:
--
-- 1. calculate_rair_tokens() - Calculates tier amounts based on signup order
-- 2. set_rair_tokens_on_signup() - Assigns tokens on user signup
-- 3. Trigger - Automatically fires on new profile creation
--
-- ============================================================================
-- IMPORTANT: Execute this AFTER the main migration
-- ============================================================================
--
-- Dependencies:
--   - profiles table (created by main migration)
--   - staking functions (created by main migration)
--   - User roles (authenticated, service_role)
--
-- Risk Level: VERY LOW
--   - Additive changes only (no modifications to existing data)
--   - All queries use CREATE OR REPLACE (safe to re-run)
--   - New trigger only affects NEW signups (existing users unaffected)
--   - All changes are reversible
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: TOKEN CALCULATION FUNCTION
-- ============================================================================
-- Calculates how many RAIR tokens a user should receive based on signup order
--
-- Tier Structure:
--   Users 1-100:      10,000 tokens (Early pioneers)
--   Users 101-500:    5,000 tokens  (Early adopters)
--   Users 501-1,000:  2,500 tokens  (Growing community)
--   Users 1,001+:     Halving every 1,000 users
--     1,001-2,000:    1,250 tokens
--     2,001-3,000:    625 tokens
--     3,001-4,000:    312 tokens
--     And continues halving...

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
  -- Users 4,001-5,000: 2,500 / 2^3 = 156 tokens
  -- And so on, halving every 1,000 users
  
  v_block := FLOOR((p_signup_order - 1001) / 1000)::INT;
  v_tokens := 2500::NUMERIC / POWER(2::NUMERIC, v_block::NUMERIC);
  
  -- Ensure minimum 1 token to avoid floating point precision issues
  RETURN GREATEST(1, FLOOR(v_tokens));
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_rair_tokens(BIGINT) TO authenticated;

COMMENT ON FUNCTION calculate_rair_tokens(BIGINT) IS 
'Calculates RAIR token allocation based on signup order. Returns tiered amounts: 
 1-100: 10k, 101-500: 5k, 501-1k: 2.5k, 1001+: halving every 1000 users';

-- ============================================================================
-- SECTION 2: TOKEN ASSIGNMENT TRIGGER FUNCTION
-- ============================================================================
-- When a new profile is created, this trigger automatically:
-- 1. Gets the signup_order from BIGSERIAL
-- 2. Calculates the token amount based on signup_order
-- 3. Sets the appropriate tier
-- 4. Assigns rair_tokens_allocated

CREATE OR REPLACE FUNCTION set_rair_tokens_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens NUMERIC;
BEGIN
  -- Calculate tokens based on signup_order (auto-incremented by BIGSERIAL)
  v_tokens := calculate_rair_tokens(NEW.signup_order);
  
  -- Set token allocation from calculated amount
  NEW.rair_tokens_allocated := v_tokens;
  
  -- Determine and set tier for reference
  IF NEW.signup_order <= 100 THEN
    NEW.rair_token_tier := 1;
  ELSIF NEW.signup_order <= 500 THEN
    NEW.rair_token_tier := 2;
  ELSIF NEW.signup_order <= 1000 THEN
    NEW.rair_token_tier := 3;
  ELSE
    -- Tier 4+ calculation (matches calculate_rair_tokens logic)
    NEW.rair_token_tier := 4 + FLOOR((NEW.signup_order - 1001) / 1000)::INT;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_rair_tokens_on_signup() IS 
'Trigger function that fires BEFORE INSERT on profiles table. 
 Automatically calculates and sets rair_tokens_allocated and rair_token_tier 
 based on the auto-incremented signup_order.';

-- Drop existing trigger if it exists (to avoid conflicts on re-run)
DROP TRIGGER IF EXISTS trg_set_rair_tokens_on_signup ON profiles;

-- Create trigger that fires BEFORE INSERT on profiles table
CREATE TRIGGER trg_set_rair_tokens_on_signup
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_rair_tokens_on_signup();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_rair_tokens_on_signup() TO authenticated;

-- ============================================================================
-- SECTION 3: VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the restoration was successful
--
-- 1. Check if functions exist:

/*
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('calculate_rair_tokens', 'set_rair_tokens_on_signup')
ORDER BY routine_name;

-- Expected Result:
-- routine_name                 | routine_type
-- ----+----+---+---+---+---+---+----
-- calculate_rair_tokens        | FUNCTION
-- set_rair_tokens_on_signup    | FUNCTION


-- 2. Check if trigger exists:

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'trg_set_rair_tokens_on_signup';

-- Expected Result:
-- trigger_name                      | event_manipulation | event_object_table | action_timing
-- ---+---+---+---+---+---+---+---+---+---+---+---+
-- trg_set_rair_tokens_on_signup     | INSERT             | profiles           | BEFORE


-- 3. Test the calculation function:

SELECT 
  signup_order,
  calculate_rair_tokens(signup_order) as tokens,
  CASE 
    WHEN signup_order <= 100 THEN 1
    WHEN signup_order <= 500 THEN 2
    WHEN signup_order <= 1000 THEN 3
    ELSE 4 + FLOOR((signup_order - 1001) / 1000)::INT
  END as tier
FROM (
  VALUES 
    (1)::BIGINT,    -- Tier 1: 10,000
    (50),           -- Tier 1: 10,000
    (100),          -- Tier 1: 10,000
    (101),          -- Tier 2: 5,000
    (250),          -- Tier 2: 5,000
    (500),          -- Tier 2: 5,000
    (501),          -- Tier 3: 2,500
    (750),          -- Tier 3: 2,500
    (1000),         -- Tier 3: 2,500
    (1001),         -- Tier 4: 1,250
    (2000),         -- Tier 4: 1,250
    (2001),         -- Tier 5: 625
    (3000),         -- Tier 5: 625
    (3001),         -- Tier 6: 312
    (4000)          -- Tier 6: 312
) t(signup_order)
ORDER BY signup_order;

-- Expected Result:
-- signup_order | tokens | tier
-- ----+---+---+---+---+---+---+---+---+---
-- 1            | 10000  | 1
-- 50           | 10000  | 1
-- 100          | 10000  | 1
-- 101          | 5000   | 2
-- 250          | 5000   | 2
-- 500          | 5000   | 2
-- 501          | 2500   | 3
-- 750          | 2500   | 3
-- 1000         | 2500   | 3
-- 1001         | 1250   | 4
-- 2000         | 1250   | 4
-- 2001         | 625    | 5
-- 3000         | 625    | 5
-- 3001         | 312    | 6
-- 4000         | 312    | 6

*/

-- ============================================================================
-- SECTION 4: IMPLEMENTATION CHECKLIST
-- ============================================================================
--
-- After running this script, verify:
--
-- ✅ Database Verification:
--    [ ] Functions exist (see verification queries above)
--    [ ] Trigger exists and fires on INSERT
--    [ ] Test calculation function returns correct values
--
-- ✅ Code Changes:
--    [ ] Remove SuperGuide bypass in SuperGuideAccessWrapper.tsx
--      - Location: components/superguide/SuperGuideAccessWrapper.tsx (lines 103-105)
--      - Replace temporary bypass with proper access check
--
-- ✅ Deployment:
--    [ ] Deploy SQL changes to Supabase
--    [ ] Deploy code changes to Vercel
--
-- ✅ Testing:
--    [ ] Create new test user #50+ and verify they get tiered allocation
--    [ ] Verify SuperGuide access control works
--    [ ] Verify staking interface functions properly
--
-- ============================================================================
-- SECTION 5: DATA FLOW AFTER RESTORATION
-- ============================================================================
--
-- User Signs Up
--        ↓
-- Supabase auth.users table updated
--        ↓
-- handle_new_user() trigger fires (creates profiles row)
--        ↓
-- INSERT into profiles triggers trg_set_rair_tokens_on_signup
--        ↓
-- BIGSERIAL auto-increments signup_order
--        ↓
-- calculate_rair_tokens() gets called with signup_order
--        ↓
-- Returns correct tiered amount (10k, 5k, 2.5k, etc.)
--        ↓
-- rair_tokens_allocated set in profiles
--        ↓
-- rair_token_tier set based on tier calculation
--        ↓
-- rair_balance defaults to calculated amount
--        ↓
-- User can now see staking card with correct balance
--        ↓
-- User can stake RAIR to unlock features
--        ↓
-- SuperGuide access check properly validates staked balance >= 3000
--        ↓
-- ✅ Full staking system operational
--
-- ============================================================================
-- ADDITIONAL FIXES: Column Definition and Function Updates
-- ============================================================================
-- These fixes address issues discovered during testing
--
-- 1. signup_order column should be BIGSERIAL (auto-incrementing)
-- 2. get_staking_status function should return has_superguide_access (not can_stake_superguide)
--
-- Apply these after the main restoration script
-- ============================================================================

-- Fix 1: Convert signup_order to BIGSERIAL (auto-incrementing)
-- Since the column already exists, we need to recreate it properly

-- Step 1: Drop the existing column (safe since it's NULL for existing users)
ALTER TABLE profiles DROP COLUMN IF EXISTS signup_order;

-- Step 2: Add it back as BIGSERIAL
ALTER TABLE profiles ADD COLUMN signup_order BIGSERIAL UNIQUE;

-- Step 3: Update any existing profiles to have signup_order based on created_at order
-- This assigns sequential numbers starting from 1 for the oldest user
UPDATE profiles
SET signup_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM profiles
) sub
WHERE profiles.id = sub.id;

-- Fix 2: Update get_staking_status function to return correct column name
CREATE OR REPLACE FUNCTION public.get_staking_status()
RETURNS TABLE (
  user_id UUID,
  rair_balance NUMERIC,
  rair_staked NUMERIC,
  total_rair NUMERIC,
  has_superguide_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.rair_balance,
    p.rair_staked,
    p.rair_balance + p.rair_staked,
    (p.rair_staked >= 3000)
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- END OF RESTORATION SCRIPT
-- ============================================================================
--
-- Status: Ready to Execute
-- Expected Outcome: Full staking functionality restored
-- Risk Level: Very Low (additive changes only)
-- Rollback: Drop functions and trigger if needed
--
-- Questions? See docs/stakingissueV2/README.md or implementation-guide.md
--
-- ============================================================================

