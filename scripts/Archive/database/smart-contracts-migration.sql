-- ============================================================================
-- SMART CONTRACTS TABLE MIGRATION
-- ============================================================================
-- Purpose: Enable NFT contract deployment and management
-- Created: October 22, 2025
-- Status: Ready for production deployment
-- ============================================================================

-- ============================================================================
-- TABLE: smart_contracts
-- ============================================================================
-- Stores information about deployed ERC721 and other smart contracts
-- Linked to user accounts and tracked on blockchain
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.smart_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'ERC721'
    CHECK (contract_type IN ('ERC721', 'ERC20', 'ERC1155', 'CUSTOM')),
  contract_address TEXT NOT NULL UNIQUE 
    CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$'),
  transaction_hash TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL DEFAULT 'base-sepolia'
    CHECK (network IN ('base-sepolia', 'base', 'ethereum-sepolia', 'ethereum')),
  abi JSONB NOT NULL,
  deployment_block INTEGER,
  deployed_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  collection_name TEXT,
  collection_symbol TEXT,
  max_supply BIGINT DEFAULT 10000,
  mint_price_wei NUMERIC(78,0) DEFAULT 0,
  base_uri TEXT DEFAULT 'https://example.com/metadata/',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add documentation comments
COMMENT ON TABLE public.smart_contracts IS 'Stores all user-deployed smart contracts with metadata and ABI';
COMMENT ON COLUMN public.smart_contracts.id IS 'Unique identifier for contract record';
COMMENT ON COLUMN public.smart_contracts.user_id IS 'User who deployed the contract';
COMMENT ON COLUMN public.smart_contracts.contract_name IS 'Human-readable contract name (e.g., "My NFT Collection")';
COMMENT ON COLUMN public.smart_contracts.contract_type IS 'Contract standard: ERC721, ERC20, ERC1155, or CUSTOM';
COMMENT ON COLUMN public.smart_contracts.contract_address IS 'Deployed contract address on blockchain';
COMMENT ON COLUMN public.smart_contracts.transaction_hash IS 'Deployment transaction hash';
COMMENT ON COLUMN public.smart_contracts.network IS 'Blockchain network where contract is deployed';
COMMENT ON COLUMN public.smart_contracts.abi IS 'Contract ABI for read/write operations';
COMMENT ON COLUMN public.smart_contracts.deployment_block IS 'Block number where contract was deployed';
COMMENT ON COLUMN public.smart_contracts.deployed_at IS 'Timestamp of deployment';
COMMENT ON COLUMN public.smart_contracts.is_active IS 'Soft delete flag for contract management';
COMMENT ON COLUMN public.smart_contracts.collection_name IS 'NFT collection name for ERC721 contracts';
COMMENT ON COLUMN public.smart_contracts.collection_symbol IS 'NFT collection symbol/ticker for ERC721 contracts';
COMMENT ON COLUMN public.smart_contracts.max_supply IS 'Maximum number of NFTs that can be minted from this contract';
COMMENT ON COLUMN public.smart_contracts.mint_price_wei IS 'Price per NFT mint in Wei (Ethereum base unit)';
COMMENT ON COLUMN public.smart_contracts.base_uri IS 'Base URI for NFT metadata (e.g., IPFS gateway or API endpoint)';

-- ============================================================================
-- INDEXES: smart_contracts
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_smart_contracts_user_id 
  ON public.smart_contracts(user_id);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_address 
  ON public.smart_contracts(contract_address);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_type 
  ON public.smart_contracts(contract_type);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_network 
  ON public.smart_contracts(network);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_created_at 
  ON public.smart_contracts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_active 
  ON public.smart_contracts(is_active) WHERE is_active = true;

-- ============================================================================
-- ADD COLLECTION METADATA COLUMNS (Idempotent - adds columns if missing)
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
-- ROW LEVEL SECURITY: smart_contracts
-- ============================================================================

-- Enable RLS on smart_contracts table
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own contracts
CREATE POLICY "Users can view own contracts" 
  ON public.smart_contracts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own contracts
CREATE POLICY "Users can create own contracts" 
  ON public.smart_contracts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own contracts
CREATE POLICY "Users can update own contracts" 
  ON public.smart_contracts 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE: wallet_transactions ENHANCEMENTS
-- ============================================================================
-- Add columns to track contract operations
-- ============================================================================

-- Add contract_address column for contract interactions
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS contract_address TEXT 
  CHECK (contract_address IS NULL OR contract_address ~ '^0x[a-fA-F0-9]{40}$');

-- Add function_called for tracking contract methods (mint, burn, approve, etc.)
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS function_called TEXT;

-- Add token_id for NFT operations
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS token_id BIGINT;

-- Add token_quantity for batch operations
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS token_quantity INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN public.wallet_transactions.contract_address IS 'Contract address for contract operations (deploy, mint, etc.)';
COMMENT ON COLUMN public.wallet_transactions.function_called IS 'Smart contract function called (mint, burn, approve, transfer, etc.)';
COMMENT ON COLUMN public.wallet_transactions.token_id IS 'NFT token ID for mint/burn operations';
COMMENT ON COLUMN public.wallet_transactions.token_quantity IS 'Quantity of tokens for batch operations';

-- ============================================================================
-- UPDATE: wallet_transactions operation_type CONSTRAINT
-- ============================================================================
-- Current: 'create', 'fund', 'send', 'receive'
-- New: Add 'deploy', 'mint', 'burn', 'approve', 'transfer'

-- Drop existing constraint (if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_operation'
    AND table_name = 'wallet_transactions'
  ) THEN
    ALTER TABLE public.wallet_transactions 
    DROP CONSTRAINT valid_operation;
  END IF;
END $$;

-- Add updated constraint with contract operations
ALTER TABLE public.wallet_transactions 
ADD CONSTRAINT valid_operation 
CHECK (operation_type IN (
  'create',   -- Wallet creation
  'fund',     -- Testnet faucet funding
  'send',     -- Send funds to address
  'receive',  -- Receive funds
  'deploy',   -- Deploy smart contract
  'mint',     -- Mint NFT
  'burn',     -- Burn NFT
  'approve',  -- Approve token spending
  'transfer', -- Transfer NFT/token
  'call'      -- Generic contract call
));

-- ============================================================================
-- FUNCTION: Log contract deployment
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
  -- Insert into smart_contracts table
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
-- FUNCTION: Log contract mint
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_contract_mint(
  p_user_id UUID,
  p_wallet_id UUID,
  p_contract_address TEXT,
  p_to_address TEXT,
  p_tx_hash TEXT,
  p_token_id BIGINT DEFAULT NULL,
  p_quantity INTEGER DEFAULT 1
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
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
    to_address,
    token_id,
    token_quantity,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_wallet_id,
    'mint',
    'eth',
    p_contract_address,
    'mint',
    p_tx_hash,
    'success',
    p_to_address,
    p_token_id,
    p_quantity,
    jsonb_build_object(
      'recipient', p_to_address,
      'quantity', p_quantity
    ),
    NOW()
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Update smart_contract timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_smart_contract_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_smart_contracts_timestamp ON public.smart_contracts;
CREATE TRIGGER update_smart_contracts_timestamp
  BEFORE UPDATE ON public.smart_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_smart_contract_timestamp();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that tables were created
SELECT 
  'smart_contracts' as table_name,
  COUNT(*) as column_count,
  'CREATED' as status
FROM information_schema.columns
WHERE table_name = 'smart_contracts'
GROUP BY table_name

UNION ALL

SELECT 
  'wallet_transactions' as table_name,
  COUNT(*) as column_count,
  'UPDATED' as status
FROM information_schema.columns
WHERE table_name = 'wallet_transactions'
GROUP BY table_name;

-- Check that indexes were created
SELECT 
  indexname,
  tablename,
  'INDEX CREATED' as status
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename IN ('smart_contracts', 'wallet_transactions')
ORDER BY tablename, indexname;
