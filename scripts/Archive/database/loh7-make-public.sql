-- ============================================================================
-- MAKE LOH7 COLLECTION PUBLIC FOR MARKETPLACE
-- ============================================================================
-- Purpose: Enable public minting and marketplace browsing for loh7 ERC721 contract
-- Date: October 31, 2025
-- 
-- This makes loh7 a PUBLIC collection that:
-- - ✅ Appears in /marketplace
-- - ✅ Can be minted by ANY signed-in user
-- - ✅ Shows real contract address and verified status
-- - ✅ Shows correct mint price (from contract)
-- 
-- Collection control remains PRIVATE:
-- - Only the owner (test@test.com) can update metadata
-- - Private transactions are not exposed

BEGIN;

-- Update loh7 to be public and marketplace-enabled
UPDATE public.smart_contracts
SET is_public = true,
    marketplace_enabled = true
WHERE (collection_slug = 'loh7' OR collection_name = 'loh7')
  AND is_active = true;

-- Verify the change
SELECT 
  id,
  collection_name,
  collection_slug,
  contract_address,
  is_public,
  marketplace_enabled,
  verified,
  mint_price_wei,
  total_minted,
  max_supply
FROM public.smart_contracts
WHERE collection_slug = 'loh7' OR collection_name = 'loh7';

COMMIT;
