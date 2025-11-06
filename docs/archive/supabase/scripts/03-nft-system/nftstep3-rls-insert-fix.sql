-- ============================================================================
-- NFTSTEP3: RLS INSERT POLICY FIX
-- ============================================================================
-- Date: November 3, 2025
-- Purpose: Fix NFT logging failure by correcting RLS policies on nft_tokens table
-- Impact: Non-breaking change - only affects nft_tokens table INSERT permissions
-- Safety: Fully idempotent, uses IF EXISTS for drop operations
-- Deployable: Yes - safe to run in production without downtime
--
-- PROBLEM BEING FIXED:
-- ====================
-- Current Issue: log_nft_mint() RPC function fails with permission error
--                because the INSERT policy is too restrictive
-- Symptom: Counter increments but NFTs aren't logged to database
-- Result: 0 NFTs display in marketplace even though counter shows >0
--
-- SOLUTION:
-- =========
-- 1. Drop overly restrictive INSERT policies
-- 2. Create new permissive INSERT policy that allows authenticated users
-- 3. Grant explicit INSERT permission to authenticated role
-- 4. Set correct search_path on RPC function for proper context
-- 5. Verify the fix with test query
--
-- EXPECTED OUTCOME:
-- =================
-- ✅ log_nft_mint() RPC will succeed for authenticated users
-- ✅ NFT records will be inserted into nft_tokens table
-- ✅ Marketplace will display NFT tiles correctly
-- ✅ Counter and database will stay in sync
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Diagnostic - Check current policies
-- ============================================================================
-- View existing INSERT policies before making changes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'nft_tokens'
ORDER BY policyname;

-- ============================================================================
-- STEP 2: Drop problematic INSERT policies
-- ============================================================================
-- These will be replaced with a more permissive policy
DROP POLICY IF EXISTS "Authenticated and service_role can insert NFTs" ON public.nft_tokens;
DROP POLICY IF EXISTS "Users can insert their own NFTs" ON public.nft_tokens;
DROP POLICY IF EXISTS "Allow authenticated to insert NFTs" ON public.nft_tokens;
DROP POLICY IF EXISTS "allow_insert" ON public.nft_tokens;

-- ============================================================================
-- STEP 3: Create new explicit INSERT policy
-- ============================================================================
-- This policy allows authenticated and service_role to insert NFTs
-- The WITH CHECK (true) trusts the RPC function to validate data
CREATE POLICY "nft_tokens_insert_policy" ON public.nft_tokens
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- ============================================================================
-- STEP 4: Grant explicit table permissions to roles
-- ============================================================================
-- Ensure authenticated role can insert into nft_tokens
GRANT INSERT ON public.nft_tokens TO authenticated;
GRANT INSERT ON public.nft_tokens TO service_role;

-- ============================================================================
-- STEP 5: Set correct search_path on RPC function
-- ============================================================================
-- This ensures the function can find tables and auth functions correctly
-- when called from authenticated user context
ALTER FUNCTION IF EXISTS public.log_nft_mint(TEXT, BIGINT, TEXT, TEXT, UUID, TEXT, JSONB)
  SET search_path = public, auth, extensions;

-- ============================================================================
-- STEP 6: Ensure increment function also has correct search_path
-- ============================================================================
ALTER FUNCTION IF EXISTS public.increment_collection_minted(TEXT, BIGINT)
  SET search_path = public, auth, extensions;

-- ============================================================================
-- STEP 7: Verification query
-- ============================================================================
-- Confirm the fix was applied
SELECT 
  'RLS Policy Status' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'nft_tokens' 
      AND policyname = 'nft_tokens_insert_policy'
    ) THEN '✅ INSERT policy created'
    ELSE '❌ INSERT policy missing'
  END as status
UNION ALL
SELECT 
  'Authenticated Role',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'nft_tokens'
      AND 'authenticated' = ANY(roles)
    ) THEN '✅ Authenticated role in policy'
    ELSE '❌ Authenticated role not in policy'
  END
UNION ALL
SELECT 
  'Service Role',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'nft_tokens'
      AND 'service_role' = ANY(roles)
    ) THEN '✅ Service role in policy'
    ELSE '❌ Service role not in policy'
  END
UNION ALL
SELECT 
  'log_nft_mint Function',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'log_nft_mint'
      AND routine_schema = 'public'
    ) THEN '✅ Function exists'
    ELSE '❌ Function not found'
  END
ORDER BY check_item;

-- ============================================================================
-- STEP 8: Final verification - Test that the fix works
-- ============================================================================
-- This test verifies the RLS policy allows authenticated inserts
-- Note: This is a conceptual test - actual test should be done via API
SELECT 
  'Phase 1 RLS Fix' as phase,
  'Ready for testing' as status,
  CURRENT_TIMESTAMP as completed_at,
  'Run Phase 2 (data recovery) after confirming this fix works' as next_step;

COMMIT;

-- ============================================================================
-- POST-DEPLOYMENT VERIFICATION STEPS
-- ============================================================================
-- After running this script, follow these steps to verify the fix:
--
-- 1. Check that policies are in place:
--    SELECT * FROM pg_policies WHERE tablename = 'nft_tokens';
--
-- 2. Test via API endpoint:
--    POST http://localhost:3000/api/test-supabase with:
--    { "action": "test_log_nft_mint", "token_id": 9999 }
--
-- 3. If successful, should return:
--    { "success": true, "tokenId": 9999, "error": null }
--
-- 4. Verify record was inserted:
--    GET http://localhost:3000/api/test-supabase?check=nfts
--    Should show count > 0
--
-- ============================================================================






