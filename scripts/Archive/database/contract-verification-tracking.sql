-- ============================================================================
-- CONTRACT VERIFICATION TRACKING MIGRATION
-- ============================================================================
-- Purpose: Add verification status tracking to smart_contracts table
-- Created: October 29, 2025
-- Status: Production Ready - Fully Idempotent
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ADD VERIFICATION TRACKING COLUMNS
-- ============================================================================

-- Add verified status column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN verified BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added column: verified';
  ELSE
    RAISE NOTICE 'Column verified already exists - skipped';
  END IF;
END $$;

-- Add verification timestamp column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN verified_at TIMESTAMPTZ;
    RAISE NOTICE 'Added column: verified_at';
  ELSE
    RAISE NOTICE 'Column verified_at already exists - skipped';
  END IF;
END $$;

-- Add verification status column (pending/failed/verified)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'verification_status'
  ) THEN
    -- Create enum type for verification status
    CREATE TYPE verification_status_enum AS ENUM ('pending', 'in_progress', 'verified', 'failed');
    
    ALTER TABLE public.smart_contracts 
    ADD COLUMN verification_status verification_status_enum DEFAULT 'pending';
    RAISE NOTICE 'Added column: verification_status';
  ELSE
    RAISE NOTICE 'Column verification_status already exists - skipped';
  END IF;
END $$;

-- Add constructor arguments column (stored as JSONB)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'constructor_args'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN constructor_args JSONB;
    RAISE NOTICE 'Added column: constructor_args';
  ELSE
    RAISE NOTICE 'Column constructor_args already exists - skipped';
  END IF;
END $$;

-- Add verification error message column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'verification_error'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN verification_error TEXT;
    RAISE NOTICE 'Added column: verification_error';
  ELSE
    RAISE NOTICE 'Column verification_error already exists - skipped';
  END IF;
END $$;

-- Add verification attempt count
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'verification_attempts'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN verification_attempts INTEGER DEFAULT 0;
    RAISE NOTICE 'Added column: verification_attempts';
  ELSE
    RAISE NOTICE 'Column verification_attempts already exists - skipped';
  END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE INDEXES FOR VERIFICATION QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_smart_contracts_verified 
  ON public.smart_contracts(verified) WHERE verified = true;

CREATE INDEX IF NOT EXISTS idx_smart_contracts_verification_status 
  ON public.smart_contracts(verification_status);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_verified_at 
  ON public.smart_contracts(verified_at DESC);

-- ============================================================================
-- PART 3: ADD COLUMN DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.smart_contracts.verified 
IS 'Boolean flag indicating if contract is verified on BaseScan (true = verified)';

COMMENT ON COLUMN public.smart_contracts.verified_at 
IS 'Timestamp of when contract was successfully verified on BaseScan';

COMMENT ON COLUMN public.smart_contracts.verification_status 
IS 'Current verification status: pending (not started), in_progress (verifying), verified (success), failed (error)';

COMMENT ON COLUMN public.smart_contracts.constructor_args 
IS 'JSON object storing constructor arguments used for verification. Schema: {name, symbol, maxSupply, mintPrice, baseURI}';

COMMENT ON COLUMN public.smart_contracts.verification_error 
IS 'Error message from failed verification attempt (empty if successful)';

COMMENT ON COLUMN public.smart_contracts.verification_attempts 
IS 'Number of verification attempts made for this contract';

-- ============================================================================
-- PART 4: UPDATE EXISTING RECORDS WITH CONSTRUCTOR ARGS
-- ============================================================================

-- For contracts that have collection_name and collection_symbol, populate constructor_args
-- This is done safely to avoid overwriting any existing data
UPDATE public.smart_contracts
SET constructor_args = jsonb_build_object(
  'name', COALESCE(collection_name, contract_name),
  'symbol', COALESCE(collection_symbol, ''),
  'maxSupply', COALESCE(max_supply, 0),
  'mintPrice', COALESCE(mint_price_wei::text, '0'),
  'baseURI', COALESCE(base_uri, 'https://example.com/metadata/')
)
WHERE constructor_args IS NULL
  AND (collection_name IS NOT NULL OR collection_symbol IS NOT NULL);

-- Log summary
SELECT 
  'Verification tracking columns added' as status,
  COUNT(*) as total_contracts,
  SUM(CASE WHEN constructor_args IS NOT NULL THEN 1 ELSE 0 END) as contracts_with_args,
  COUNT(*) - SUM(CASE WHEN constructor_args IS NOT NULL THEN 1 ELSE 0 END) as contracts_missing_args
FROM public.smart_contracts;

COMMIT;

-- ============================================================================
-- PART 5: ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If you need to rollback this migration, run:
-- 
-- BEGIN;
-- ALTER TABLE public.smart_contracts DROP COLUMN IF EXISTS verified CASCADE;
-- ALTER TABLE public.smart_contracts DROP COLUMN IF EXISTS verified_at CASCADE;
-- ALTER TABLE public.smart_contracts DROP COLUMN IF EXISTS verification_status CASCADE;
-- ALTER TABLE public.smart_contracts DROP COLUMN IF EXISTS constructor_args CASCADE;
-- ALTER TABLE public.smart_contracts DROP COLUMN IF EXISTS verification_error CASCADE;
-- ALTER TABLE public.smart_contracts DROP COLUMN IF EXISTS verification_attempts CASCADE;
-- DROP TYPE IF EXISTS verification_status_enum CASCADE;
-- COMMIT;
-- ============================================================================










