-- ============================================================================
-- NFT COLLECTION METADATA MIGRATION
-- ============================================================================
-- Purpose: Add collection metadata columns and update RPC function for ERC721 NFT deployments
-- Date: October 30, 2025
-- Status: Production Ready - Fully Idempotent
-- ============================================================================
-- This migration ensures that:
-- 1. Collection metadata columns exist on smart_contracts table
-- 2. log_contract_deployment RPC function accepts and stores collection metadata
-- 3. Deployed contracts appear in UI with proper display information
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ADD COLLECTION METADATA COLUMNS (Idempotent)
-- ============================================================================

-- Add collection_name column for ERC721 NFT collection name
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'collection_name'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN collection_name TEXT;
    RAISE NOTICE 'Added column: collection_name';
  ELSE
    RAISE NOTICE 'Column collection_name already exists - skipped';
  END IF;
END $$;

-- Add collection_symbol column for ERC721 NFT collection ticker symbol
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'collection_symbol'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN collection_symbol TEXT;
    RAISE NOTICE 'Added column: collection_symbol';
  ELSE
    RAISE NOTICE 'Column collection_symbol already exists - skipped';
  END IF;
END $$;

-- Add max_supply column for maximum NFT supply
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'max_supply'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN max_supply BIGINT DEFAULT 10000;
    RAISE NOTICE 'Added column: max_supply';
  ELSE
    RAISE NOTICE 'Column max_supply already exists - skipped';
  END IF;
END $$;

-- Add mint_price_wei column for NFT mint price in Wei
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'mint_price_wei'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN mint_price_wei NUMERIC(78,0) DEFAULT 0;
    RAISE NOTICE 'Added column: mint_price_wei';
  ELSE
    RAISE NOTICE 'Column mint_price_wei already exists - skipped';
  END IF;
END $$;

-- Add base_uri column for NFT metadata base URI
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_contracts' AND column_name = 'base_uri'
  ) THEN
    ALTER TABLE public.smart_contracts 
    ADD COLUMN base_uri TEXT DEFAULT 'https://example.com/metadata/';
    RAISE NOTICE 'Added column: base_uri';
  ELSE
    RAISE NOTICE 'Column base_uri already exists - skipped';
  END IF;
END $$;

-- ============================================================================
-- PART 2: ADD COLUMN DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.smart_contracts.collection_name 
IS 'NFT collection name for ERC721 contracts (used in UI display)';

COMMENT ON COLUMN public.smart_contracts.collection_symbol 
IS 'NFT collection symbol/ticker for ERC721 contracts (used in UI display)';

COMMENT ON COLUMN public.smart_contracts.max_supply 
IS 'Maximum number of NFTs that can be minted from this contract';

COMMENT ON COLUMN public.smart_contracts.mint_price_wei 
IS 'Price per NFT mint in Wei (Ethereum base unit) - stored as NUMERIC for precision';

COMMENT ON COLUMN public.smart_contracts.base_uri 
IS 'Base URI for NFT metadata (e.g., IPFS gateway or API endpoint)';

-- ============================================================================
-- PART 3: UPDATE log_contract_deployment RPC FUNCTION
-- ============================================================================
-- Now accepts collection metadata parameters and stores them in the database
-- This allows deployed contracts to be properly displayed in the UI

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
  p_platform_api_used BOOLEAN DEFAULT false
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_contract_id UUID;
BEGIN
  -- Insert into smart_contracts table with collection metadata
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
    mint_price_wei
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
    p_mint_price_wei
  )
  RETURNING id INTO v_contract_id;
  
  -- Log transaction to wallet_transactions with full context
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
-- PART 4: SUMMARY & VERIFICATION
-- ============================================================================

-- Log summary of columns that now exist
SELECT 
  'Collection metadata migration completed' as status,
  COUNT(*) as total_contracts,
  SUM(CASE WHEN collection_name IS NOT NULL THEN 1 ELSE 0 END) as contracts_with_collection_name
FROM public.smart_contracts;

-- Log updated function info
SELECT 
  'log_contract_deployment function updated' as status,
  'Now accepts collection metadata parameters' as details;

COMMIT;









