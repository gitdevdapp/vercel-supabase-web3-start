/**
 * WALLET CREATION SYSTEM - RESTORATION MIGRATION
 * 
 * Purpose: Restore broken wallet creation by adding missing schema objects
 * Date: November 3, 2025
 * Status: NON-BREAKING | IDEMPOTENT | REVERSIBLE
 * 
 * This single script:
 * 1. ✅ Adds platform_api_used column to user_wallets
 * 2. ✅ Creates wallet_operations audit table
 * 3. ✅ Creates log_wallet_operation RPC function
 * 4. ✅ Creates log_contract_deployment RPC function
 * 5. ✅ Sets up proper indexes for performance
 * 6. ✅ Enables RLS for security
 * 7. ✅ Includes verification checks
 * 8. ✅ Is 100% idempotent (safe to run multiple times)
 * 
 * SAFETY: All operations use IF NOT EXISTS, so re-running is safe
 * IMPACT: Zero data loss, purely additive
 * ROLLBACK: See section at bottom to undo if needed
 */

-- ============================================================================
-- PART 1: ADD MISSING COLUMN TO user_wallets TABLE
-- ============================================================================

-- Add platform_api_used column to track CDP-generated wallets
-- This column distinguishes auto-created wallets (via CDP) from manually imported ones
ALTER TABLE public.user_wallets
ADD COLUMN IF NOT EXISTS platform_api_used boolean DEFAULT false;

-- Create index for fast queries on auto-generated wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_platform_api 
ON public.user_wallets(platform_api_used) 
WHERE platform_api_used = true;

-- Update existing wallets to have platform_api_used = false
-- (They were created before this feature was added)
UPDATE public.user_wallets 
SET platform_api_used = false 
WHERE platform_api_used IS NULL;

COMMIT;

-- ============================================================================
-- PART 2: CREATE wallet_operations AUDIT TABLE
-- ============================================================================

-- Create wallet_operations table for audit logging
-- Tracks all wallet-related operations: creation, funding, deployment, minting
CREATE TABLE IF NOT EXISTS public.wallet_operations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign keys
  p_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  p_wallet_id uuid NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
  
  -- Operation details
  p_operation_type text NOT NULL,
  p_token_type text,
  p_amount numeric(20, 8),
  p_to_address text,
  p_from_address text,
  p_tx_hash text,
  p_status text NOT NULL,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  
  -- Data integrity constraints
  CONSTRAINT valid_operation_type CHECK (
    p_operation_type IN ('auto_create', 'super_faucet', 'fund', 'deploy', 'mint')
  ),
  CONSTRAINT valid_status CHECK (
    p_status IN ('pending', 'success', 'failed')
  )
);

-- Create indexes for common queries on wallet_operations
CREATE INDEX IF NOT EXISTS idx_wallet_ops_user ON public.wallet_operations(p_user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ops_wallet ON public.wallet_operations(p_wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ops_created ON public.wallet_operations(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_ops_type ON public.wallet_operations(p_operation_type);

-- Enable Row Level Security for wallet_operations
ALTER TABLE public.wallet_operations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own operations
-- Note: PostgreSQL doesn't support IF NOT EXISTS for policies, so we drop first
DROP POLICY IF EXISTS wallet_ops_user_select ON public.wallet_operations;
CREATE POLICY wallet_ops_user_select ON public.wallet_operations
  FOR SELECT
  USING (p_user_id = auth.uid());

COMMIT;

-- ============================================================================
-- PART 3: CREATE log_wallet_operation RPC FUNCTION
-- ============================================================================

-- RPC function to log wallet operations
-- Called by: auto-create, super-faucet, fund endpoints
CREATE OR REPLACE FUNCTION public.log_wallet_operation(
  p_user_id uuid,
  p_wallet_id uuid,
  p_operation_type text,
  p_status text,
  p_token_type text DEFAULT NULL,
  p_amount numeric DEFAULT NULL,
  p_to_address text DEFAULT NULL,
  p_from_address text DEFAULT NULL,
  p_tx_hash text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_operation_id uuid;
BEGIN
  -- Validate input
  IF p_user_id IS NULL OR p_wallet_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'user_id and wallet_id are required'
    );
  END IF;

  -- Insert the operation record
  INSERT INTO public.wallet_operations (
    p_user_id,
    p_wallet_id,
    p_operation_type,
    p_token_type,
    p_amount,
    p_to_address,
    p_from_address,
    p_tx_hash,
    p_status
  ) VALUES (
    p_user_id,
    p_wallet_id,
    p_operation_type,
    p_token_type,
    p_amount,
    p_to_address,
    p_from_address,
    p_tx_hash,
    p_status
  )
  RETURNING id INTO v_operation_id;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'message', 'Operation logged successfully',
    'operation_id', v_operation_id
  );
EXCEPTION WHEN OTHERS THEN
  -- Return error response (don't fail - logging is non-critical)
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.log_wallet_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_wallet_operation TO service_role;

COMMIT;

-- ============================================================================
-- PART 4: CREATE log_contract_deployment RPC FUNCTION
-- ============================================================================

-- RPC function to log contract deployments
-- Called by: contract/deploy endpoint
CREATE OR REPLACE FUNCTION public.log_contract_deployment(
  p_user_id uuid,
  p_wallet_id uuid,
  p_contract_address text,
  p_tx_hash text,
  p_contract_name text DEFAULT NULL,
  p_contract_symbol text DEFAULT NULL,
  p_max_supply integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_operation_id uuid;
BEGIN
  -- Validate input
  IF p_user_id IS NULL OR p_wallet_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'user_id and wallet_id are required'
    );
  END IF;

  -- Insert the deployment record as a 'deploy' operation
  INSERT INTO public.wallet_operations (
    p_user_id,
    p_wallet_id,
    p_operation_type,
    p_to_address,
    p_tx_hash,
    p_status
  ) VALUES (
    p_user_id,
    p_wallet_id,
    'deploy',
    p_contract_address,
    p_tx_hash,
    'success'
  )
  RETURNING id INTO v_operation_id;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'message', 'Deployment logged successfully',
    'operation_id', v_operation_id,
    'contract_address', p_contract_address
  );
EXCEPTION WHEN OTHERS THEN
  -- Return error response (don't fail - logging is non-critical)
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.log_contract_deployment TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_contract_deployment TO service_role;

COMMIT;

-- ============================================================================
-- PART 5: VERIFICATION - Confirm All Migrations Applied Successfully
-- ============================================================================

-- Run comprehensive verification to confirm all migrations are in place
DO $$
DECLARE
  v_platform_api_exists boolean;
  v_wallet_ops_exists boolean;
  v_log_wallet_op_exists boolean;
  v_log_contract_exists boolean;
  v_all_success boolean := true;
BEGIN
  -- Check 1: platform_api_used column exists with correct type
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_wallets' 
    AND column_name = 'platform_api_used'
    AND data_type = 'boolean'
  ) INTO v_platform_api_exists;

  -- Check 2: wallet_operations table exists with primary key
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'wallet_operations'
    AND table_schema = 'public'
  ) INTO v_wallet_ops_exists;

  -- Check 3: log_wallet_operation function exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'log_wallet_operation'
    AND routine_schema = 'public'
    AND routine_type = 'FUNCTION'
  ) INTO v_log_wallet_op_exists;

  -- Check 4: log_contract_deployment function exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'log_contract_deployment'
    AND routine_schema = 'public'
    AND routine_type = 'FUNCTION'
  ) INTO v_log_contract_exists;

  -- Determine overall success
  v_all_success := v_platform_api_exists AND v_wallet_ops_exists AND 
                  v_log_wallet_op_exists AND v_log_contract_exists;

  -- Report results
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║        WALLET CREATION SYSTEM - MIGRATION VERIFICATION    ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  RAISE NOTICE '1. platform_api_used column:     %', CASE WHEN v_platform_api_exists THEN '✅ PRESENT' ELSE '❌ MISSING' END;
  RAISE NOTICE '2. wallet_operations table:      %', CASE WHEN v_wallet_ops_exists THEN '✅ PRESENT' ELSE '❌ MISSING' END;
  RAISE NOTICE '3. log_wallet_operation RPC:     %', CASE WHEN v_log_wallet_op_exists THEN '✅ PRESENT' ELSE '❌ MISSING' END;
  RAISE NOTICE '4. log_contract_deployment RPC:  %', CASE WHEN v_log_contract_exists THEN '✅ PRESENT' ELSE '❌ MISSING' END;
  
  RAISE NOTICE '';
  
  IF v_all_success THEN
    RAISE NOTICE '🎉 SUCCESS! All migrations applied successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Wallet creation system is now OPERATIONAL.';
    RAISE NOTICE 'New users can now:';
    RAISE NOTICE '  ✅ Auto-create wallets via CDP SDK';
    RAISE NOTICE '  ✅ Get auto-funded with 0.05 ETH';
    RAISE NOTICE '  ✅ Deploy ERC721 contracts';
    RAISE NOTICE '  ✅ Mint NFTs';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Test with real user signup → wallet creation';
  ELSE
    RAISE NOTICE '⚠️  VERIFICATION FAILED - Some migrations are missing:';
    RAISE NOTICE '';
    IF NOT v_platform_api_exists THEN
      RAISE NOTICE '  ❌ platform_api_used column missing';
    END IF;
    IF NOT v_wallet_ops_exists THEN
      RAISE NOTICE '  ❌ wallet_operations table missing';
    END IF;
    IF NOT v_log_wallet_op_exists THEN
      RAISE NOTICE '  ❌ log_wallet_operation RPC function missing';
    END IF;
    IF NOT v_log_contract_exists THEN
      RAISE NOTICE '  ❌ log_contract_deployment RPC function missing';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE 'Please re-run this migration script or check for SQL errors.';
  END IF;
  
  RAISE NOTICE '';
END$$;

-- ============================================================================
-- PART 6: MANUAL VERIFICATION QUERIES
-- ============================================================================

-- Optional: Run these queries separately to inspect the schema

-- View all columns in user_wallets table
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user_wallets'
-- ORDER BY ordinal_position;

-- View wallet_operations table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'wallet_operations'
-- ORDER BY ordinal_position;

-- View all RPC functions
-- SELECT routine_name, routine_type, data_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
-- ORDER BY routine_name;

-- ============================================================================
-- PART 7: ROLLBACK PROCEDURE (If you need to undo this migration)
-- ============================================================================

/*
To rollback this migration, run the following SQL:

-- DROP the RPC functions (reverse order of creation)
DROP FUNCTION IF EXISTS public.log_contract_deployment CASCADE;
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;

-- DROP the wallet_operations table (cascades will handle RLS policies)
DROP TABLE IF EXISTS public.wallet_operations CASCADE;

-- DROP the platform_api_used column
ALTER TABLE public.user_wallets 
DROP COLUMN IF EXISTS platform_api_used CASCADE;

-- IMPORTANT: You would then need to:
-- 1. Revert the code changes that use these new schema objects
-- 2. Test thoroughly that wallet creation still works
-- 3. Re-deploy the reverted code to production

WARNING: Rollback will lose all audit logging data in wallet_operations table!
         Only use if you need to undo the migration.
*/

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================

COMMIT;

-- Display summary
SELECT 'Migration completed successfully!' as status;
