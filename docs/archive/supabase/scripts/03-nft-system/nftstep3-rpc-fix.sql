-- ============================================================================
-- NFTSTEP3 RPC FUNCTION FIX
-- ============================================================================
-- Purpose: Fix JSONB type casting issue in log_nft_mint RPC function
-- Date: October 31, 2025
-- Impact: Minimal - only replaces the broken RPC function with corrected version
-- Safety: Uses CREATE OR REPLACE, fully backward compatible
-- 
-- ROOT CAUSE FIXED:
-- Error: "COALESCE types jsonb and text cannot be matched"
-- Issue: Fallback metadata_json value was not cast to JSONB type
-- Solution: Cast string to JSONB: ('...')::jsonb
-- 
-- BEFORE:
--   COALESCE(p_metadata_json, '{"token_id": ' || p_token_id || '}')
--
-- AFTER:
--   COALESCE(p_metadata_json, ('{"token_id": ' || p_token_id || '}')::jsonb)
-- ============================================================================

BEGIN;

-- Recreate log_nft_mint function with correct JSONB casting
CREATE OR REPLACE FUNCTION public.log_nft_mint(
  p_contract_address TEXT,
  p_token_id BIGINT,
  p_owner_address TEXT,
  p_minter_address TEXT,
  p_minter_user_id UUID DEFAULT NULL,
  p_token_uri TEXT DEFAULT NULL,
  p_metadata_json JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_nft_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.smart_contracts 
    WHERE contract_address = p_contract_address
  ) THEN
    RAISE EXCEPTION 'Contract not found: %', p_contract_address;
  END IF;

  INSERT INTO public.nft_tokens (
    contract_address, token_id, owner_address, minter_address,
    minter_user_id, token_uri, metadata_json, minted_at
  ) VALUES (
    p_contract_address, p_token_id, p_owner_address, p_minter_address,
    p_minter_user_id, COALESCE(p_token_uri, p_contract_address || '/' || p_token_id),
    COALESCE(p_metadata_json, ('{"token_id": ' || p_token_id || '}')::jsonb), NOW()
  )
  ON CONFLICT (contract_address, token_id) DO UPDATE SET
    updated_at = NOW(), is_burned = false
  RETURNING id INTO v_nft_id;

  RETURN v_nft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- After running this script, the log_nft_mint function should work correctly.
-- Test with:
--
-- SELECT public.log_nft_mint(
--   '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
--   999,
--   '0x1234567890123456789012345678901234567890',
--   '0x1234567890123456789012345678901234567890'
-- );
--
-- Should return a UUID without error.







