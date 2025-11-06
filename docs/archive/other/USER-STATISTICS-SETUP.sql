-- ============================================================================
-- USER STATISTICS & TIERED RAIR TOKENOMICS - DATABASE SETUP
-- ============================================================================
-- READY-TO-RUN SQL for Supabase
-- 
-- INSTRUCTIONS:
-- 1. Copy all SQL below
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Create new query
-- 4. Paste all SQL
-- 5. Run query
-- 6. Wait for completion (should take < 5 seconds)
-- 7. Run verification queries at the bottom to confirm setup
--
-- TIME TO RUN: < 5 seconds
-- VERCEL IMPACT: None (backend only)
-- BREAKING CHANGES: None
-- ============================================================================

-- ============================================================================
-- STEP 1: Add columns to profiles table
-- ============================================================================
-- These columns track user signup order and token allocation

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS signup_order BIGSERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS rair_token_tier INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS rair_tokens_allocated NUMERIC DEFAULT 0;

-- Add helpful comments
COMMENT ON COLUMN profiles.signup_order IS 'Sequential signup order (1-indexed) for determining token tier';
COMMENT ON COLUMN profiles.rair_token_tier IS 'Token allocation tier based on signup order';
COMMENT ON COLUMN profiles.rair_tokens_allocated IS 'Number of RAIR tokens user receives on signup';

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_profiles_signup_order ON profiles(signup_order);
CREATE INDEX IF NOT EXISTS idx_profiles_rair_tokens_allocated ON profiles(rair_tokens_allocated);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================================================
-- STEP 2: Create function to calculate token tier
-- ============================================================================
-- This function calculates how many RAIR tokens a user should receive
-- based on their signup order
--
-- Logic:
-- - Users 1-100: 10,000 tokens
-- - Users 101-500: 5,000 tokens
-- - Users 501-1,000: 2,500 tokens
-- - Users 1,001+: 2,500 tokens halved every 1,000 users
--   (1,001-2,000: 1,250, 2,001-3,000: 625, etc.)

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

-- ============================================================================
-- STEP 3: Create trigger to automatically set tokens on user signup
-- ============================================================================
-- When a new profile is created, this trigger automatically:
-- 1. Calculates the token amount based on signup_order
-- 2. Sets the appropriate tier
-- 3. Assigns rair_tokens_allocated

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

-- ============================================================================
-- STEP 4: Create function to get detailed user statistics
-- ============================================================================
-- Returns comprehensive stats as JSON for use in dashboards/API

CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_users INT;
  v_last_signup_time TIMESTAMP WITH TIME ZONE;
  v_avg_tokens_per_user NUMERIC;
BEGIN
  -- Count total active users (non-null id indicates profile exists)
  SELECT COUNT(*)
  INTO v_total_users
  FROM profiles
  WHERE id IS NOT NULL;

  -- Get timestamp of most recent signup
  SELECT created_at
  INTO v_last_signup_time
  FROM profiles
  WHERE id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Calculate average tokens per user (only for users with tokens allocated)
  SELECT AVG(rair_tokens_allocated)
  INTO v_avg_tokens_per_user
  FROM profiles
  WHERE rair_tokens_allocated > 0;

  -- Return results as JSON
  RETURN json_build_object(
    'total_users', COALESCE(v_total_users, 0),
    'last_signup_at', v_last_signup_time,
    'average_tokens_per_user', ROUND(COALESCE(v_avg_tokens_per_user, 0), 2),
    'fetched_at', NOW()
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users (public data)
GRANT EXECUTE ON FUNCTION get_user_statistics() TO authenticated, anon;

-- ============================================================================
-- STEP 5: Create lightweight function for homepage user count
-- ============================================================================
-- Optimized for performance - single COUNT query
-- Used by UserStatsElement component on homepage

CREATE OR REPLACE FUNCTION get_total_user_count()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count profiles with non-null IDs (signed-up users)
  SELECT COUNT(*)
  INTO v_count
  FROM profiles
  WHERE id IS NOT NULL;

  -- Return count, default to 0 if NULL
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Grant execute permission to authenticated and anonymous users (public stat)
GRANT EXECUTE ON FUNCTION get_total_user_count() TO authenticated, anon;

-- ============================================================================
-- STEP 6: Create materialized view for caching (high-traffic optimization)
-- ============================================================================
-- This view pre-aggregates stats to avoid repeated table scans
-- Should be refreshed periodically (suggested: every 5 minutes)

CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats_cache AS
SELECT 
  COUNT(*) as total_users,
  MAX(created_at) as last_signup_at,
  AVG(rair_tokens_allocated) as avg_tokens_per_user,
  MIN(signup_order) as first_signup_order,
  MAX(signup_order) as last_signup_order,
  NOW() as cache_updated_at
FROM profiles
WHERE id IS NOT NULL;

-- Create index for faster queries on materialized view
CREATE INDEX IF NOT EXISTS idx_user_stats_cache ON user_stats_cache(total_users);

-- Grant permissions
GRANT SELECT ON user_stats_cache TO authenticated, anon;

-- ============================================================================
-- STEP 7: Initialize tokens for EXISTING users (optional)
-- ============================================================================
-- ONLY uncomment and run this if you have existing users
-- This will assign signup_order to existing users based on created_at
-- and calculate token allocations for them
--
-- WARNING: Only run this ONCE. Running multiple times will create duplicates.

/*
-- UNCOMMENT THIS BLOCK IF YOU HAVE EXISTING USERS

-- Assign signup_order to existing users based on creation time
WITH ordered_users AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM profiles
  WHERE id IS NOT NULL AND signup_order IS NULL
)
UPDATE profiles
SET signup_order = ordered_users.row_num
FROM ordered_users
WHERE profiles.id = ordered_users.id;

-- Update token allocations for all users
UPDATE profiles
SET 
  rair_tokens_allocated = calculate_rair_tokens(signup_order),
  rair_token_tier = CASE
    WHEN signup_order <= 100 THEN 1
    WHEN signup_order <= 500 THEN 2
    WHEN signup_order <= 1000 THEN 3
    ELSE 4 + FLOOR((signup_order - 1001) / 1000)::INT
  END
WHERE signup_order IS NOT NULL AND (rair_tokens_allocated = 0 OR rair_token_tier = 1);

*/

-- ============================================================================
-- STEP 8: VERIFICATION QUERIES (run these after setup to confirm)
-- ============================================================================
-- These queries verify that everything was set up correctly
-- Copy each one individually to SQL Editor and run

-- VERIFY 1: Check that new columns exist
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- AND column_name IN ('signup_order', 'rair_token_tier', 'rair_tokens_allocated');

-- VERIFY 2: Check that functions exist
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name IN ('calculate_rair_tokens', 'get_user_statistics', 'get_total_user_count', 'set_rair_tokens_on_signup')
-- AND routine_schema = 'public';

-- VERIFY 3: Test the calculate_rair_tokens function
-- SELECT 
--   signup_order,
--   calculate_rair_tokens(signup_order) as tokens
-- FROM (VALUES (1), (50), (100), (200), (500), (750), (1000), (1500), (2000), (2500), (3500), (5500)) AS t(signup_order)
-- ORDER BY signup_order;

-- VERIFY 4: Get user statistics (should return JSON)
-- SELECT get_user_statistics();

-- VERIFY 5: Get user count (should return number)
-- SELECT get_total_user_count();

-- VERIFY 6: Check materialized view
-- SELECT * FROM user_stats_cache;

-- VERIFY 7: View token tier distribution
-- SELECT 
--   rair_token_tier,
--   COUNT(*) as user_count,
--   AVG(rair_tokens_allocated) as avg_tokens,
--   MIN(signup_order) as min_signup,
--   MAX(signup_order) as max_signup
-- FROM profiles
-- WHERE id IS NOT NULL
-- GROUP BY rair_token_tier
-- ORDER BY rair_token_tier;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Run verification queries above
-- 2. If you have existing users, uncomment and run Step 7
-- 3. Create components/user-stats-element.tsx component
-- 4. Add UserStatsElement to app/page.tsx
--
-- For issues or questions, see: docs/stats/USER-STATS-AND-TOKENOMICS-PLAN.md
-- ============================================================================
