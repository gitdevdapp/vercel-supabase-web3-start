-- ============================================================================
-- NFTSTEP3: NFT MINTING INTEGRATION & MARKETPLACE FUNCTIONALITY
-- ============================================================================
-- Purpose: Enable NFT minting tracking, ownership management, and marketplace
--          mint availability display
-- Created: October 31, 2025
-- Status: Production Ready - Fully Idempotent
-- 
-- DEPLOYMENT INSTRUCTIONS:
-- =======================
-- 1. Copy entire script to Supabase SQL Editor
-- 2. Run in production environment (safely idempotent)
-- 3. Script runs in single transaction (BEGIN...COMMIT)
-- 4. All changes are additive - zero data loss
-- 5. Safe to run multiple times
--
-- WHAT THIS SCRIPT DOES:
-- ======================
-- ✅ Add total_minted counter to smart_contracts (marketplace stats)
-- ✅ Create nft_tokens table for individual NFT ownership tracking
-- ✅ Create RPC function: log_nft_mint (logs NFT mints to database)
-- ✅ Create RPC function: increment_collection_minted (updates stats)
-- ✅ Add indexes for performance optimization
-- ✅ Add RLS policies for secure access
-- ✅ Zero breaking changes to existing code
--
-- EXPECTED RESULTS:
-- =================
-- ✅ Collections show accurate minted/available counts
-- ✅ Individual NFT ownership tracked in database
-- ✅ Mint button can be added to UI (Phase 2)
-- ✅ Individual NFT pages can be created (Phase 3)
-- ✅ "My NFTs" profile section possible (future)
--
-- PRODUCTION SAFETY CHECKLIST:
-- ============================
-- ✅ Fully idempotent (uses IF NOT EXISTS everywhere)
-- ✅ No data loss (only adds columns with defaults)
-- ✅ Zero breaking changes (existing queries unchanged)
-- ✅ Single transaction (ACID compliance)
-- ✅ All columns have sensible defaults
-- ✅ Performance optimized (proper indexes)
-- ✅ RLS enabled for security
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ADD MINTING COUNTER TO smart_contracts TABLE
-- ============================================================================
-- Tracks total NFTs minted from each collection for marketplace display

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'total_minted'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN total_minted BIGINT DEFAULT 0
    CHECK (total_minted >= 0 AND total_minted <= max_supply);
    RAISE NOTICE '✅ Added column: total_minted';
  ELSE
    RAISE NOTICE '✅ Column total_minted already exists - skipped';
  END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE nft_tokens TABLE FOR INDIVIDUAL NFT TRACKING
-- ============================================================================
-- Stores individual NFT ownership, metadata, and status
-- Links to smart_contracts via contract_address

CREATE TABLE IF NOT EXISTS public.nft_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Contract & Token identifiers
  contract_address TEXT NOT NULL 
    CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$'),
  token_id BIGINT NOT NULL,
  
  -- Ownership tracking
  owner_address TEXT NOT NULL 
    CHECK (owner_address ~ '^0x[a-fA-F0-9]{40}$'),
  minter_address TEXT NOT NULL 
    CHECK (minter_address ~ '^0x[a-fA-F0-9]{40}$'),
  minter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- NFT Metadata
  name TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT,
  token_uri TEXT,
  metadata_json JSONB DEFAULT '{}',
  attributes JSONB DEFAULT '[]',
  
  -- Status tracking
  is_burned BOOLEAN DEFAULT false,
  minted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata_fetched_at TIMESTAMPTZ,
  burned_at TIMESTAMPTZ,
  
  -- System
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_nft_per_contract UNIQUE (contract_address, token_id),
  CONSTRAINT token_id_positive CHECK (token_id >= 0)
);

-- Add documentation
COMMENT ON TABLE public.nft_tokens 
  IS 'Tracks individual NFT ownership, metadata, and lifecycle (mint → burn)';
COMMENT ON COLUMN public.nft_tokens.contract_address 
  IS 'ERC721 contract address (links to smart_contracts table)';
COMMENT ON COLUMN public.nft_tokens.token_id 
  IS 'Token ID within the contract (unique per contract)';
COMMENT ON COLUMN public.nft_tokens.owner_address 
  IS 'Current owner blockchain address';
COMMENT ON COLUMN public.nft_tokens.minter_address 
  IS 'Original minter blockchain address (may differ from owner if transferred)';
COMMENT ON COLUMN public.nft_tokens.minter_user_id 
  IS 'Supabase user ID of minter (if minted via app)';
COMMENT ON COLUMN public.nft_tokens.is_burned 
  IS 'true if NFT has been burned/destroyed';

-- ============================================================================
-- PART 3: ADD INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_nft_tokens_contract 
  ON public.nft_tokens(contract_address);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_owner 
  ON public.nft_tokens(owner_address);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_minter_user 
  ON public.nft_tokens(minter_user_id);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_minted_at 
  ON public.nft_tokens(minted_at DESC);

CREATE INDEX IF NOT EXISTS idx_nft_tokens_is_burned 
  ON public.nft_tokens(is_burned)
  WHERE is_burned = false;

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.nft_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view non-burned NFTs from public collections" ON public.nft_tokens;
DROP POLICY IF EXISTS "Minters can view their own mints" ON public.nft_tokens;
DROP POLICY IF EXISTS "Service role can manage NFT tokens" ON public.nft_tokens;

-- Public can view NFTs from public collections
CREATE POLICY "Public can view non-burned NFTs from public collections" ON public.nft_tokens 
  FOR SELECT USING (
    NOT is_burned AND EXISTS (
      SELECT 1 FROM public.smart_contracts sc
      WHERE sc.contract_address = nft_tokens.contract_address
      AND sc.is_public = true
      AND sc.marketplace_enabled = true
    )
  );

-- Users can view their own mints
CREATE POLICY "Minters can view their own mints" ON public.nft_tokens 
  FOR SELECT USING (auth.uid() = minter_user_id);

-- Service role can do everything (admin operations)
CREATE POLICY "Service role can manage NFT tokens" ON public.nft_tokens 
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- PART 5: CREATE RPC FUNCTION - log_nft_mint
-- ============================================================================
-- Logs a successful blockchain mint to the database
-- Called by minting API after blockchain transaction succeeds
-- Returns the nft_tokens record ID

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
  -- Validate contract exists
  IF NOT EXISTS (
    SELECT 1 FROM public.smart_contracts 
    WHERE contract_address = p_contract_address
  ) THEN
    RAISE EXCEPTION 'Contract not found: %', p_contract_address;
  END IF;

  -- Insert NFT record
  INSERT INTO public.nft_tokens (
    contract_address,
    token_id,
    owner_address,
    minter_address,
    minter_user_id,
    token_uri,
    metadata_json,
    minted_at
  ) VALUES (
    p_contract_address,
    p_token_id,
    p_owner_address,
    p_minter_address,
    p_minter_user_id,
    COALESCE(p_token_uri, p_contract_address || '/' || p_token_id),
    COALESCE(p_metadata_json, '{"token_id": ' || p_token_id || '}'),
    NOW()
  )
  ON CONFLICT (contract_address, token_id) DO UPDATE SET
    updated_at = NOW(),
    is_burned = false
  RETURNING id INTO v_nft_id;

  RETURN v_nft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: CREATE RPC FUNCTION - increment_collection_minted
-- ============================================================================
-- Updates the total_minted counter when an NFT is minted
-- Ensures count never exceeds max_supply

CREATE OR REPLACE FUNCTION public.increment_collection_minted(
  p_contract_address TEXT,
  p_amount BIGINT DEFAULT 1
)
RETURNS void AS $$
BEGIN
  UPDATE public.smart_contracts
  SET 
    total_minted = LEAST(total_minted + p_amount, max_supply),
    updated_at = NOW()
  WHERE contract_address = p_contract_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 7: CREATE RPC FUNCTION - burn_nft
-- ============================================================================
-- Marks an NFT as burned
-- Called when NFT is destroyed/removed from circulation

CREATE OR REPLACE FUNCTION public.burn_nft(
  p_contract_address TEXT,
  p_token_id BIGINT
)
RETURNS UUID AS $$
DECLARE
  v_nft_id UUID;
BEGIN
  UPDATE public.nft_tokens
  SET 
    is_burned = true,
    burned_at = NOW(),
    updated_at = NOW()
  WHERE contract_address = p_contract_address
    AND token_id = p_token_id
  RETURNING id INTO v_nft_id;

  IF v_nft_id IS NOT NULL THEN
    -- Decrement minted counter
    UPDATE public.smart_contracts
    SET 
      total_minted = GREATEST(total_minted - 1, 0),
      updated_at = NOW()
    WHERE contract_address = p_contract_address;
  END IF;

  RETURN v_nft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 8: CREATE HELPER FUNCTIONS FOR QUERIES
-- ============================================================================

-- Get collection mint availability
CREATE OR REPLACE FUNCTION public.get_collection_mint_stats(
  p_contract_address TEXT
)
RETURNS TABLE (
  total_minted BIGINT,
  max_supply BIGINT,
  remaining BIGINT,
  percentage_complete NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.total_minted,
    sc.max_supply,
    (sc.max_supply - sc.total_minted)::BIGINT as remaining,
    CASE 
      WHEN sc.max_supply = 0 THEN 0
      ELSE ROUND((sc.total_minted::NUMERIC / sc.max_supply::NUMERIC) * 100, 2)
    END as percentage_complete
  FROM public.smart_contracts sc
  WHERE sc.contract_address = p_contract_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's owned NFTs (minted via this app)
CREATE OR REPLACE FUNCTION public.get_user_nfts(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  contract_address TEXT,
  token_id BIGINT,
  owner_address TEXT,
  name TEXT,
  image_url TEXT,
  minted_at TIMESTAMPTZ,
  collection_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nt.id,
    nt.contract_address,
    nt.token_id,
    nt.owner_address,
    nt.name,
    nt.image_url,
    nt.minted_at,
    sc.collection_name
  FROM public.nft_tokens nt
  JOIN public.smart_contracts sc ON sc.contract_address = nt.contract_address
  WHERE nt.minter_user_id = p_user_id
    AND nt.is_burned = false
  ORDER BY nt.minted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 9: ADD COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.smart_contracts.total_minted 
  IS 'Total NFTs minted from this collection (used for marketplace availability display)';

-- ============================================================================
-- PART 10: VERIFICATION QUERIES
-- ============================================================================
-- Run these after deployment to verify everything is working:

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'nft_tokens' 
ORDER BY ordinal_position;

-- Verify functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('log_nft_mint', 'increment_collection_minted', 'burn_nft');

-- Verify indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'nft_tokens';

COMMIT;







