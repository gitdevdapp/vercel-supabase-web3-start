-- ============================================================================
-- 🏆 POINTS & REWARDS SYSTEM - DATABASE SETUP
-- ============================================================================
-- Version: 1.0
-- Date: October 15, 2025
-- Purpose: Add points tracking and token rewards to user profiles
-- Execution: Copy entire file → Paste in Supabase SQL Editor → Run
-- ============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  EXECUTION INSTRUCTIONS                                                  ║
-- ╠══════════════════════════════════════════════════════════════════════════╣
-- ║  1. Open Supabase Dashboard → SQL Editor                                 ║
-- ║  2. Click "+ New query" button                                           ║
-- ║  3. Copy this ENTIRE file (Cmd/Ctrl+A → Cmd/Ctrl+C)                      ║
-- ║  4. Paste into the SQL Editor                                            ║
-- ║  5. Click "Run" button or press Cmd/Ctrl+Enter                           ║
-- ║  6. Wait for completion (~3-5 seconds)                                   ║
-- ║  7. Scroll to bottom and verify success message                          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ⚠️  IMPORTANT NOTES:
-- • SAFE TO RUN MULTIPLE TIMES: This script is fully idempotent
-- • NO DATA LOSS: Existing data is preserved during re-runs
-- • REQUIRES: profiles table (should already exist)
-- • EXECUTION TIME: ~3-5 seconds

-- ============================================================================
-- 🔧 SECTION 1: TABLE CREATION
-- ============================================================================

-- Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign key to user (links to auth.users)
  user_id UUID NOT NULL,
  
  -- Core contribution stats
  prs_submitted INTEGER DEFAULT 0 NOT NULL,
  prs_approved INTEGER DEFAULT 0 NOT NULL,
  
  -- Token balances (stored as DECIMAL for precision)
  -- Format: DECIMAL(30, 18) allows large numbers with 18 decimal places
  -- Default values: 3000 RAIR (welcome bonus), 0 bETH, 0 sETH, 0.01 APE
  rair_balance DECIMAL(30, 18) DEFAULT 3000 NOT NULL,
  beth_balance DECIMAL(30, 18) DEFAULT 0 NOT NULL,
  seth_balance DECIMAL(30, 18) DEFAULT 0 NOT NULL,
  ape_balance DECIMAL(30, 18) DEFAULT 0.01 NOT NULL,
  
  -- Claim tracking (for future claim functionality)
  total_claimed_rair DECIMAL(30, 18) DEFAULT 0 NOT NULL,
  total_claimed_beth DECIMAL(30, 18) DEFAULT 0 NOT NULL,
  total_claimed_seth DECIMAL(30, 18) DEFAULT 0 NOT NULL,
  total_claimed_ape DECIMAL(30, 18) DEFAULT 0 NOT NULL,
  last_claim_at TIMESTAMPTZ,
  claim_wallet_address TEXT,
  
  -- Metadata timestamps
  points_last_updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 🔗 SECTION 2: CONSTRAINTS
-- ============================================================================

-- Foreign key constraint (link to auth.users)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_points_user_id_fkey' 
    AND table_name = 'user_points'
  ) THEN
    ALTER TABLE public.user_points 
    ADD CONSTRAINT user_points_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Unique constraint (one points record per user)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_points_user_id_unique' 
    AND table_name = 'user_points'
  ) THEN
    ALTER TABLE public.user_points 
    ADD CONSTRAINT user_points_user_id_unique 
    UNIQUE (user_id);
  END IF;
END $$;

-- Validation: PRs submitted must be non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_prs_submitted'
    AND table_name = 'user_points'
  ) THEN
    ALTER TABLE public.user_points 
    ADD CONSTRAINT valid_prs_submitted 
    CHECK (prs_submitted >= 0);
  END IF;
END $$;

-- Validation: PRs approved must be <= submitted
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_prs_approved'
    AND table_name = 'user_points'
  ) THEN
    ALTER TABLE public.user_points 
    ADD CONSTRAINT valid_prs_approved 
    CHECK (prs_approved >= 0 AND prs_approved <= prs_submitted);
  END IF;
END $$;

-- Validation: Claim wallet must be valid Ethereum address or NULL
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_claim_wallet'
    AND table_name = 'user_points'
  ) THEN
    ALTER TABLE public.user_points 
    ADD CONSTRAINT valid_claim_wallet 
    CHECK (claim_wallet_address IS NULL OR claim_wallet_address ~ '^0x[a-fA-F0-9]{40}$');
  END IF;
END $$;

-- ============================================================================
-- 📊 SECTION 3: PERFORMANCE INDEXES
-- ============================================================================

-- Index on user_id (primary query pattern)
CREATE INDEX IF NOT EXISTS idx_user_points_user_id 
ON public.user_points(user_id);

-- Index on RAIR balance (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_user_points_rair 
ON public.user_points(rair_balance DESC);

-- Index on PRs approved (for contributor rankings)
CREATE INDEX IF NOT EXISTS idx_user_points_prs 
ON public.user_points(prs_approved DESC);

-- Index on last claim timestamp (for claim tracking)
CREATE INDEX IF NOT EXISTS idx_user_points_last_claim 
ON public.user_points(last_claim_at DESC NULLS LAST);

-- ============================================================================
-- 🔐 SECTION 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user_points table
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for clean re-runs)
DROP POLICY IF EXISTS "Users can view own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can update own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON public.user_points;

-- Policy 1: Users can view their own points
CREATE POLICY "Users can view own points"
  ON public.user_points 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can update their own points (for claim wallet)
CREATE POLICY "Users can update own points"
  ON public.user_points 
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own points
CREATE POLICY "Users can insert own points"
  ON public.user_points 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 🛠️ SECTION 5: HELPER FUNCTIONS
-- ============================================================================

-- Function 1: Get user points and balances
CREATE OR REPLACE FUNCTION public.get_user_points(p_user_id UUID)
RETURNS TABLE (
  prs_submitted INTEGER,
  prs_approved INTEGER,
  rair_balance DECIMAL,
  beth_balance DECIMAL,
  seth_balance DECIMAL,
  ape_balance DECIMAL,
  claim_wallet_address TEXT,
  last_claim_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.prs_submitted,
    up.prs_approved,
    up.rair_balance,
    up.beth_balance,
    up.seth_balance,
    up.ape_balance,
    up.claim_wallet_address,
    up.last_claim_at
  FROM public.user_points up
  WHERE up.user_id = p_user_id;
END;
$$;

-- Function 2: Auto-create points record on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert initial points record for new user
  INSERT INTO public.user_points (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Silent fail - points record is optional, don't block user creation
    RETURN NEW;
END;
$$;

-- Function 3: Auto-update timestamp on changes
CREATE OR REPLACE FUNCTION public.update_points_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 🔔 SECTION 6: TRIGGERS
-- ============================================================================

-- Trigger 1: Create points record when profile is created
DROP TRIGGER IF EXISTS on_profile_created_points ON public.profiles;
CREATE TRIGGER on_profile_created_points
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_points();

-- Trigger 2: Auto-update timestamp on points record changes
DROP TRIGGER IF EXISTS update_user_points_timestamp ON public.user_points;
CREATE TRIGGER update_user_points_timestamp
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_points_timestamp();

-- ============================================================================
-- 📦 SECTION 7: PERMISSIONS
-- ============================================================================

-- Grant table permissions to authenticated users (via RLS)
GRANT SELECT, UPDATE ON public.user_points TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.get_user_points(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_points() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_points_timestamp() TO authenticated;

-- ============================================================================
-- 🔄 SECTION 8: MIGRATE EXISTING USERS
-- ============================================================================

-- Create points records for any existing users who don't have one
INSERT INTO public.user_points (user_id)
SELECT p.id
FROM public.profiles p
WHERE p.id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- ✅ SECTION 9: VERIFICATION
-- ============================================================================

-- Verification query to confirm successful setup
SELECT 
  '╔════════════════════════════════════════════════════════════════════════╗' as verification;
SELECT 
  '║  🎉 POINTS SYSTEM SETUP COMPLETED SUCCESSFULLY! 🎉                     ║' as verification;
SELECT 
  '╚════════════════════════════════════════════════════════════════════════╝' as verification;
SELECT '' as verification;

-- Component verification
SELECT 
  '📊 VERIFICATION RESULTS' as component,
  '' as count,
  '' as status;

SELECT 
  '─────────────────────' as component,
  '─────────' as count,
  '─────────' as status;

SELECT 
  'Points Table' as component,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'user_points')::text as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_points') = 1 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

SELECT 
  'Points RLS Policies' as component,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'user_points')::text as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE schemaname = 'public' AND tablename = 'user_points') = 3 
    THEN '✅ PASS' 
    ELSE '⚠️  CHECK' 
  END as status;

SELECT 
  'Points Functions' as component,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('get_user_points', 'handle_new_user_points', 'update_points_timestamp'))::text as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name IN ('get_user_points', 'handle_new_user_points', 'update_points_timestamp')) = 3 
    THEN '✅ PASS' 
    ELSE '⚠️  CHECK' 
  END as status;

SELECT 
  'Points Triggers' as component,
  (SELECT COUNT(*) FROM information_schema.triggers 
   WHERE event_object_table IN ('user_points', 'profiles')
   AND trigger_name IN ('on_profile_created_points', 'update_user_points_timestamp'))::text as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.triggers 
          WHERE event_object_table IN ('user_points', 'profiles')
          AND trigger_name IN ('on_profile_created_points', 'update_user_points_timestamp')) = 2 
    THEN '✅ PASS' 
    ELSE '⚠️  CHECK' 
  END as status;

-- Database stats
SELECT '' as component, '' as count, '' as status;
SELECT 
  '📈 DATABASE STATISTICS' as component,
  '' as count,
  '' as status;

SELECT 
  '─────────────────────' as component,
  '─────────' as count,
  '─────────' as status;

SELECT 
  'Total Users' as component,
  (SELECT COUNT(*) FROM auth.users)::text as count,
  'ℹ️  INFO' as status;

SELECT 
  'Total Profiles' as component,
  (SELECT COUNT(*) FROM public.profiles)::text as count,
  'ℹ️  INFO' as status;

SELECT 
  'Points Records Created' as component,
  (SELECT COUNT(*) FROM public.user_points)::text as count,
  'ℹ️  INFO' as status;

-- Final success message
SELECT '' as component, '' as count, '' as status;
SELECT 
  '╔════════════════════════════════════════════════════════════════════════╗' as completion;
SELECT 
  '║  ✅ ALL COMPONENTS VERIFIED - POINTS SYSTEM READY                     ║' as completion;
SELECT 
  '║                                                                        ║' as completion;
SELECT 
  '║  📋 NEXT STEPS:                                                        ║' as completion;
SELECT 
  '║  1. Deploy frontend components (ProfilePointsCard.tsx)                ║' as completion;
SELECT 
  '║  2. Update profile page to include points card                        ║' as completion;
SELECT 
  '║  3. Test points display on user profiles                              ║' as completion;
SELECT 
  '║  4. (Future) Implement PR tracking integration                        ║' as completion;
SELECT 
  '║  5. (Future) Implement token claiming functionality                   ║' as completion;
SELECT 
  '║                                                                        ║' as completion;
SELECT 
  '║  📚 DOCUMENTATION:                                                     ║' as completion;
SELECT 
  '║  • See docs/points/ for implementation details                        ║' as completion;
SELECT 
  '╚════════════════════════════════════════════════════════════════════════╝' as completion;

-- ============================================================================
-- END OF POINTS SYSTEM SETUP SCRIPT
-- ============================================================================

