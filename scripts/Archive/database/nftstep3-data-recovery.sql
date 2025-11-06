-- ============================================================================
-- NFTSTEP3: MANUAL DATA RECOVERY & SYNCHRONIZATION
-- ============================================================================
-- Date: November 3, 2025
-- Purpose: Recover the 10 blockchain mints that failed to log to database
-- Impact: Adds 10 NFT records to nft_tokens table
-- Safety: Uses ON CONFLICT DO NOTHING to prevent duplicates
-- Deployable: Yes - after Phase 1 RLS fix is deployed
--
-- BACKGROUND:
-- ===========
-- When users minted NFTs:
-- ✅ 10 real tokens created on blockchain (verified on BaseScan)
-- ✅ 2 counters incremented (shown in database)
-- ❌ 0 NFT records in database (due to RLS policy blocking INSERT)
--
-- This script manually inserts the 10 real blockchain mints
-- extracted from BaseScan transaction history
--
-- INSTRUCTIONS:
-- =============
-- 1. Get token data from: 
--    https://sepolia.basescan.org/address/0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E
--
-- 2. For each "Transfer" event, extract:
--    - Token ID (from "Tokens Transferred")
--    - To Address (recipient address)
--    - Timestamp
--
-- 3. Fill in the VALUES section with actual data below
--
-- 4. Run this script to insert recovered records
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Display current state before recovery
-- ============================================================================
-- This shows what we're starting with
SELECT 
  'BEFORE RECOVERY' as phase,
  COUNT(*) as nft_count,
  COUNT(DISTINCT token_id) as unique_tokens,
  COUNT(DISTINCT owner_address) as unique_owners
FROM public.nft_tokens
WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E'
AND is_burned = false;

-- ============================================================================
-- STEP 2: Insert recovered NFT records from blockchain
-- ============================================================================
-- These are the 10 real mints extracted from BaseScan
-- 
-- IMPORTANT: Replace the placeholder addresses below with actual data
-- from: https://sepolia.basescan.org/address/0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E
--
-- Format: (UUID, contract_address, token_id, owner_address, minter_address, 
--          token_uri, metadata_json, is_burned, minted_at, created_at, updated_at)
--
-- Example extracted data format:
-- Token #1 → To: 0x742d35cc6634c0532925a3b844bc9e7595f0beb
-- Token #2 → To: 0x1234567890123456789012345678901234567890
-- etc...

INSERT INTO public.nft_tokens (
  id,
  contract_address,
  token_id,
  owner_address,
  minter_address,
  token_uri,
  metadata_json,
  is_burned,
  minted_at,
  created_at,
  updated_at
)
VALUES
-- Token #1 - [EXTRACT FROM BASESCAN: TO ADDRESS AND TIMESTAMP]
('11111111-1111-1111-1111-111111111111', 
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E', 
 1, 
 '0x742d35cc6634c0532925a3b844bc9e7595f0beb',  -- REPLACE WITH ACTUAL OWNER
 '0x742d35cc6634c0532925a3b844bc9e7595f0beb',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/1.json',
 '{"token_id": 1}',
 false,
 '2025-11-03T00:00:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #2 - [EXTRACT FROM BASESCAN]
('22222222-2222-2222-2222-222222222222',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 2,
 '0x0000000000000000000000000000000000000002',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000002',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/2.json',
 '{"token_id": 2}',
 false,
 '2025-11-03T00:05:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #3 - [EXTRACT FROM BASESCAN]
('33333333-3333-3333-3333-333333333333',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 3,
 '0x0000000000000000000000000000000000000003',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000003',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/3.json',
 '{"token_id": 3}',
 false,
 '2025-11-03T00:10:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #4 - [EXTRACT FROM BASESCAN]
('44444444-4444-4444-4444-444444444444',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 4,
 '0x0000000000000000000000000000000000000004',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000004',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/4.json',
 '{"token_id": 4}',
 false,
 '2025-11-03T00:15:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #5 - [EXTRACT FROM BASESCAN]
('55555555-5555-5555-5555-555555555555',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 5,
 '0x0000000000000000000000000000000000000005',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000005',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/5.json',
 '{"token_id": 5}',
 false,
 '2025-11-03T00:20:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #6 - [EXTRACT FROM BASESCAN]
('66666666-6666-6666-6666-666666666666',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 6,
 '0x0000000000000000000000000000000000000006',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000006',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/6.json',
 '{"token_id": 6}',
 false,
 '2025-11-03T00:25:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #7 - [EXTRACT FROM BASESCAN]
('77777777-7777-7777-7777-777777777777',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 7,
 '0x0000000000000000000000000000000000000007',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000007',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/7.json',
 '{"token_id": 7}',
 false,
 '2025-11-03T00:30:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #8 - [EXTRACT FROM BASESCAN]
('88888888-8888-8888-8888-888888888888',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 8,
 '0x0000000000000000000000000000000000000008',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000008',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/8.json',
 '{"token_id": 8}',
 false,
 '2025-11-03T00:35:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #9 - [EXTRACT FROM BASESCAN]
('99999999-9999-9999-9999-999999999999',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 9,
 '0x0000000000000000000000000000000000000009',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000009',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/9.json',
 '{"token_id": 9}',
 false,
 '2025-11-03T00:40:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW()),

-- Token #10 - [EXTRACT FROM BASESCAN]
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E',
 10,
 '0x0000000000000000000000000000000000000010',  -- REPLACE WITH ACTUAL OWNER
 '0x0000000000000000000000000000000000000010',  -- REPLACE WITH ACTUAL MINTER
 'https://metadata.example.com/10.json',
 '{"token_id": 10}',
 false,
 '2025-11-03T00:45:00+00:00',  -- REPLACE WITH ACTUAL TIMESTAMP
 NOW(),
 NOW())

-- ON CONFLICT: If token already exists, do nothing (prevents duplicate inserts)
ON CONFLICT (contract_address, token_id) DO NOTHING;

-- ============================================================================
-- STEP 3: Verify recovery results
-- ============================================================================
-- Check how many records were inserted
SELECT 
  'AFTER RECOVERY' as phase,
  COUNT(*) as nft_count,
  COUNT(DISTINCT token_id) as unique_tokens,
  COUNT(DISTINCT owner_address) as unique_owners
FROM public.nft_tokens
WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E'
AND is_burned = false;

-- ============================================================================
-- STEP 4: Display all recovered NFTs
-- ============================================================================
-- Show the inserted records for verification
SELECT 
  token_id,
  owner_address,
  minted_at,
  created_at
FROM public.nft_tokens
WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E'
AND is_burned = false
ORDER BY token_id ASC;

-- ============================================================================
-- STEP 5: Sync counter to match database
-- ============================================================================
-- Update the counter to reflect the actual number of minted NFTs
UPDATE public.smart_contracts
SET 
  total_minted = (
    SELECT COUNT(*) FROM public.nft_tokens 
    WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E'
    AND is_burned = false
  ),
  updated_at = NOW()
WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E';

-- ============================================================================
-- STEP 6: Final verification
-- ============================================================================
-- Confirm counter and database are synced
SELECT 
  'SYNC VERIFICATION' as check_type,
  total_minted as counter_value,
  (SELECT COUNT(*) FROM nft_tokens 
   WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E'
   AND is_burned = false) as database_count,
  CASE 
    WHEN total_minted = (SELECT COUNT(*) FROM nft_tokens 
         WHERE contract_address = '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E'
         AND is_burned = false)
    THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as sync_status
FROM public.smart_contracts
WHERE collection_slug = 'loh7';

COMMIT;

-- ============================================================================
-- POST-DEPLOYMENT VERIFICATION
-- ============================================================================
-- After running this script, verify with:
--
-- 1. Check NFT count via API:
--    GET http://localhost:3000/api/test-supabase?check=nfts
--    Should return count: 10
--
-- 2. Check marketplace UI:
--    Visit http://localhost:3000/marketplace/loh7
--    Should display 10 NFT tiles
--
-- 3. Check counter on profile:
--    Visit http://localhost:3000/protected/profile
--    loh7 collection should show: 10/10000 Minted
--
-- ============================================================================






