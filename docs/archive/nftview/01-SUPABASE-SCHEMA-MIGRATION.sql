-- ============================================================================
-- NFT MARKETPLACE - DATABASE SCHEMA MIGRATION
-- ============================================================================
-- Purpose: Add marketplace functionality to existing ERC721 deployment system
-- Date: October 30, 2025
-- Status: READY FOR PRODUCTION
-- Dependencies: Requires PRODUCTION-TESTED.sql to be applied first
-- 
-- This migration adds:
-- 1. Collection slug and marketplace metadata columns to smart_contracts
-- 2. New nft_tokens table for tracking individual NFT ownership
-- 3. Slug generation function for URL-friendly collection identifiers
-- 4. Indexes for marketplace queries
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ADD MARKETPLACE COLUMNS TO smart_contracts TABLE
-- ============================================================================

-- Add collection slug for URL routing (devdapp.com/marketplace/[slug])
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'collection_slug'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN collection_slug TEXT UNIQUE;
    RAISE NOTICE '✅ Added column: collection_slug';
  ELSE
    RAISE NOTICE '⏭️  Column collection_slug already exists - skipped';
  END IF;
END $$;

-- Add collection description for marketplace display
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'collection_description'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN collection_description TEXT;
    RAISE NOTICE '✅ Added column: collection_description';
  ELSE
    RAISE NOTICE '⏭️  Column collection_description already exists - skipped';
  END IF;
END $$;

-- Add collection image URL (tile/card view)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'collection_image_url'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN collection_image_url TEXT;
    RAISE NOTICE '✅ Added column: collection_image_url';
  ELSE
    RAISE NOTICE '⏭️  Column collection_image_url already exists - skipped';
  END IF;
END $$;

-- Add collection banner URL (detail page header)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'collection_banner_url'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN collection_banner_url TEXT;
    RAISE NOTICE '✅ Added column: collection_banner_url';
  ELSE
    RAISE NOTICE '⏭️  Column collection_banner_url already exists - skipped';
  END IF;
END $$;

-- Add public visibility flag
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN is_public BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Added column: is_public';
  ELSE
    RAISE NOTICE '⏭️  Column is_public already exists - skipped';
  END IF;
END $$;

-- Add marketplace enabled flag
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'marketplace_enabled'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN marketplace_enabled BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Added column: marketplace_enabled';
  ELSE
    RAISE NOTICE '⏭️  Column marketplace_enabled already exists - skipped';
  END IF;
END $$;

-- Add total minted counter (cached from on-chain)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'total_minted'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN total_minted INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added column: total_minted';
  ELSE
    RAISE NOTICE '⏭️  Column total_minted already exists - skipped';
  END IF;
END $$;

-- Add floor price (lowest listing price in wei)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'floor_price_wei'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN floor_price_wei NUMERIC(78,0);
    RAISE NOTICE '✅ Added column: floor_price_wei';
  ELSE
    RAISE NOTICE '⏭️  Column floor_price_wei already exists - skipped';
  END IF;
END $$;

-- Add slug generation timestamp
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'slug_generated_at'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN slug_generated_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Added column: slug_generated_at';
  ELSE
    RAISE NOTICE '⏭️  Column slug_generated_at already exists - skipped';
  END IF;
END $$;

-- Add wallet_address column if not exists (for creator tracking)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN wallet_address TEXT;
    RAISE NOTICE '✅ Added column: wallet_address';
  ELSE
    RAISE NOTICE '⏭️  Column wallet_address already exists - skipped';
  END IF;
END $$;

-- ============================================================================
-- PART 2: ADD COLUMN DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.smart_contracts.collection_slug 
IS 'URL-safe slug for marketplace routing (e.g., "awesome-nfts" for /marketplace/awesome-nfts)';

COMMENT ON COLUMN public.smart_contracts.collection_description 
IS 'Marketing description of the NFT collection (displayed on marketplace)';

COMMENT ON COLUMN public.smart_contracts.collection_image_url 
IS 'Collection thumbnail image for tile/card views (recommended: 512x512px)';

COMMENT ON COLUMN public.smart_contracts.collection_banner_url 
IS 'Collection banner image for detail page header (recommended: 1400x400px)';

COMMENT ON COLUMN public.smart_contracts.is_public 
IS 'Whether collection is publicly visible on marketplace (true = public, false = private)';

COMMENT ON COLUMN public.smart_contracts.marketplace_enabled 
IS 'Whether collection is actively listed on marketplace (true = listed, false = delisted)';

COMMENT ON COLUMN public.smart_contracts.total_minted 
IS 'Cached count of minted NFTs (updated from on-chain data)';

COMMENT ON COLUMN public.smart_contracts.floor_price_wei 
IS 'Lowest listing price in collection (in wei) - NULL if no listings';

COMMENT ON COLUMN public.smart_contracts.slug_generated_at 
IS 'Timestamp when slug was auto-generated';

-- ============================================================================
-- PART 3: CREATE nft_tokens TABLE FOR INDIVIDUAL NFT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nft_tokens (
  -- Primary identifier
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Contract and token identification
  contract_address TEXT NOT NULL,
  token_id BIGINT NOT NULL,
  
  -- Ownership tracking
  owner_address TEXT NOT NULL,
  minter_address TEXT NOT NULL,
  minted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  minted_by_user_id UUID REFERENCES auth.users(id),
  
  -- Metadata (cached from tokenURI)
  token_uri TEXT,
  metadata_json JSONB,
  metadata_fetched_at TIMESTAMPTZ,
  metadata_fetch_error TEXT,
  
  -- NFT Details (extracted from metadata_json for fast queries)
  name TEXT,
  description TEXT,
  image_url TEXT,
  attributes JSONB,
  
  -- Status flags
  is_burned BOOLEAN DEFAULT false,
  last_transfer_at TIMESTAMPTZ,
  transfer_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(contract_address, token_id),
  FOREIGN KEY (contract_address) REFERENCES smart_contracts(contract_address) ON DELETE CASCADE
);

-- ============================================================================
-- PART 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for slug lookup (marketplace URL routing)
CREATE INDEX IF NOT EXISTS idx_smart_contracts_slug 
  ON public.smart_contracts(collection_slug);

-- Index for public marketplace queries
CREATE INDEX IF NOT EXISTS idx_smart_contracts_public 
  ON public.smart_contracts(is_public, marketplace_enabled) 
  WHERE is_public = true AND marketplace_enabled = true;

-- Index for user's collections
CREATE INDEX IF NOT EXISTS idx_smart_contracts_user_active 
  ON public.smart_contracts(user_id, is_active) 
  WHERE is_active = true;

-- Indexes for nft_tokens table
CREATE INDEX IF NOT EXISTS idx_nft_tokens_contract 
  ON public.nft_tokens(contract_address);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_owner 
  ON public.nft_tokens(owner_address);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_minter 
  ON public.nft_tokens(minted_by_user_id);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_contract_token 
  ON public.nft_tokens(contract_address, token_id);

-- Index for burned NFTs filtering
CREATE INDEX IF NOT EXISTS idx_nft_tokens_active 
  ON public.nft_tokens(contract_address, is_burned) 
  WHERE is_burned = false;

-- ============================================================================
-- PART 5: SLUG GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_collection_slug(p_collection_name TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- Generate base slug from collection name
  -- 1. Convert to lowercase
  -- 2. Trim whitespace
  -- 3. Replace non-alphanumeric characters with hyphens
  -- 4. Remove leading/trailing hyphens
  v_slug := regexp_replace(
    lower(trim(p_collection_name)), 
    '[^a-z0-9]+', 
    '-', 
    'g'
  );
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');
  
  -- Handle empty slug
  IF v_slug = '' OR v_slug IS NULL THEN
    v_slug := 'collection';
  END IF;
  
  -- Ensure uniqueness by appending counter if slug exists
  WHILE EXISTS (SELECT 1 FROM smart_contracts WHERE collection_slug = v_slug) LOOP
    v_counter := v_counter + 1;
    -- Remove existing counter suffix if present
    v_slug := regexp_replace(v_slug, '-\d+$', '', 'g') || '-' || v_counter;
  END LOOP;
  
  RETURN v_slug;
END;
$$;

COMMENT ON FUNCTION public.generate_collection_slug 
IS 'Generates URL-safe slug from collection name with uniqueness guarantee';

-- ============================================================================
-- PART 6: AUTO-GENERATE SLUGS FOR EXISTING COLLECTIONS
-- ============================================================================

-- Generate slugs for collections that don't have one yet
DO $$
DECLARE
  v_contract RECORD;
  v_generated_slug TEXT;
BEGIN
  FOR v_contract IN 
    SELECT id, collection_name 
    FROM smart_contracts 
    WHERE collection_slug IS NULL 
      AND collection_name IS NOT NULL
  LOOP
    v_generated_slug := generate_collection_slug(v_contract.collection_name);
    
    UPDATE smart_contracts
    SET 
      collection_slug = v_generated_slug,
      slug_generated_at = NOW()
    WHERE id = v_contract.id;
    
    RAISE NOTICE 'Generated slug "%" for collection "%"', v_generated_slug, v_contract.collection_name;
  END LOOP;
END $$;

-- ============================================================================
-- PART 7: UPDATE log_contract_deployment TO INCLUDE SLUG
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_contract_deployment(
  p_user_id UUID,
  p_wallet_id UUID,
  p_contract_address TEXT,
  p_contract_name TEXT,
  p_contract_type TEXT,
  p_tx_hash TEXT,
  p_network TEXT,
  p_abi JSONB,
  p_deployment_block INTEGER DEFAULT NULL,
  p_collection_name TEXT DEFAULT NULL,
  p_collection_symbol TEXT DEFAULT NULL,
  p_max_supply BIGINT DEFAULT NULL,
  p_mint_price_wei NUMERIC DEFAULT NULL,
  p_platform_api_used BOOLEAN DEFAULT false,
  p_wallet_address TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_contract_id UUID;
  v_slug TEXT;
BEGIN
  -- Generate unique slug for collection
  IF p_collection_name IS NOT NULL THEN
    v_slug := generate_collection_slug(p_collection_name);
  END IF;

  -- Insert into smart_contracts table with marketplace columns
  INSERT INTO public.smart_contracts (
    user_id,
    contract_name,
    contract_type,
    contract_address,
    transaction_hash,
    network,
    abi,
    deployment_block,
    deployed_at,
    collection_name,
    collection_symbol,
    max_supply,
    mint_price_wei,
    wallet_address,
    collection_slug,
    slug_generated_at,
    is_active,
    is_public,
    marketplace_enabled
  ) VALUES (
    p_user_id,
    p_contract_name,
    p_contract_type,
    p_contract_address,
    p_tx_hash,
    p_network,
    p_abi,
    p_deployment_block,
    NOW(),
    p_collection_name,
    p_collection_symbol,
    p_max_supply,
    p_mint_price_wei,
    p_wallet_address,
    v_slug,
    NOW(),
    true,
    false, -- Default: private (user must explicitly enable marketplace)
    false  -- Default: marketplace disabled
  )
  RETURNING id INTO v_contract_id;
  
  -- Log transaction to wallet_transactions
  INSERT INTO public.wallet_transactions (
    user_id,
    wallet_id,
    operation_type,
    token_type,
    contract_address,
    function_called,
    tx_hash,
    status,
    from_address,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_wallet_id,
    'deploy',
    'eth',
    p_contract_address,
    'constructor',
    p_tx_hash,
    'success',
    NULL,
    jsonb_build_object(
      'contract_id', v_contract_id,
      'contract_name', p_contract_name,
      'contract_type', p_contract_type,
      'network', p_network,
      'deployment_block', p_deployment_block,
      'collection_name', p_collection_name,
      'collection_symbol', p_collection_symbol,
      'collection_slug', v_slug,
      'max_supply', p_max_supply,
      'mint_price_wei', p_mint_price_wei,
      'platform_api_used', p_platform_api_used
    ),
    NOW()
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- ============================================================================
-- PART 8: VERIFICATION QUERIES
-- ============================================================================

-- Verify marketplace columns were added
SELECT 
  '✅ MARKETPLACE COLUMNS' as section,
  COUNT(*) as columns_found
FROM information_schema.columns 
WHERE table_name = 'smart_contracts' 
AND column_name IN (
  'collection_slug', 
  'collection_description', 
  'collection_image_url', 
  'collection_banner_url',
  'is_public', 
  'marketplace_enabled', 
  'total_minted', 
  'floor_price_wei',
  'slug_generated_at'
);

-- Verify nft_tokens table was created
SELECT 
  '✅ NFT_TOKENS TABLE' as section,
  COUNT(*) as columns_found
FROM information_schema.columns 
WHERE table_name = 'nft_tokens';

-- Verify slug generation function exists
SELECT 
  '✅ SLUG FUNCTION' as section,
  proname as function_name,
  'Slug generation function created' as status
FROM pg_proc 
WHERE proname = 'generate_collection_slug'
LIMIT 1;

-- Show sample of collections with slugs
SELECT 
  '✅ SAMPLE COLLECTIONS' as section,
  collection_name,
  collection_slug,
  is_public,
  marketplace_enabled
FROM smart_contracts
WHERE collection_slug IS NOT NULL
LIMIT 5;

-- Final success message
SELECT 
  '✅ MIGRATION COMPLETE' as status,
  'Marketplace schema ready for use' as message,
  'Collections now have URL slugs' as slug_status,
  'NFT tracking table created' as nft_status,
  'Ready to build marketplace UI' as next_step;

COMMIT;

-- ============================================================================
-- ✅ END OF MIGRATION
-- ============================================================================
-- 
-- Next Steps:
-- 1. Apply this migration to production Supabase
-- 2. Verify all checkmarks appear in output
-- 3. Test slug generation with new deployments
-- 4. Build marketplace API endpoints
-- 5. Create marketplace UI components
-- 
-- ============================================================================







