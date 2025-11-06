-- ============================================================================
-- SUPABASE MIGRATION V3 - COMPREHENSIVE VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after completing both SQL migration scripts
-- Expected: All queries return expected results (noted in comments)
--
-- Organization:
-- 1. Table Existence (8 queries)
-- 2. Column Structure (8 queries)
-- 3. RLS Policies (4 queries)
-- 4. Indexes (3 queries)
-- 5. Functions (4 queries)
-- 6. Triggers (2 queries)
-- 7. Data Integrity Checks (3 queries)
-- 8. Performance Indexes (2 queries)
--
-- Total time: 2-3 minutes
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLE EXISTENCE VERIFICATION
-- ============================================================================

-- Query 1.1: All 8 core tables exist
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles', 'user_wallets', 'wallet_transactions', 'deployment_logs',
  'smart_contracts', 'nft_tokens', 'wallet_auth', 'staking_transactions'
)
ORDER BY tablename;
-- Expected: 8 rows (one for each table)

-- Query 1.2: Check specific table - profiles
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'profiles'
) as profiles_exists;
-- Expected: true

-- Query 1.3: Check specific table - smart_contracts
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'smart_contracts'
) as smart_contracts_exists;
-- Expected: true

-- Query 1.4: Check specific table - nft_tokens
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'nft_tokens'
) as nft_tokens_exists;
-- Expected: true

-- Query 1.5: Check specific table - wallet_auth
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'wallet_auth'
) as wallet_auth_exists;
-- Expected: true

-- Query 1.6: Check specific table - staking_transactions
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'staking_transactions'
) as staking_transactions_exists;
-- Expected: true

-- Query 1.7: Verify RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'user_wallets', 'wallet_transactions', 'deployment_logs',
  'smart_contracts', 'nft_tokens', 'wallet_auth', 'staking_transactions'
)
ORDER BY tablename;
-- Expected: 8 rows, all with rowsecurity = true

-- Query 1.8: Count total tables in public schema
SELECT COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public';
-- Expected: 8 (exactly 8 tables, no system tables)

-- ============================================================================
-- SECTION 2: COLUMN STRUCTURE VERIFICATION
-- ============================================================================

-- Query 2.1: Profiles table - verify key columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
-- Expected: 21 columns including: id UUID, username TEXT, email TEXT, 
--           rair_balance NUMERIC, rair_staked NUMERIC, created_at, updated_at

-- Query 2.2: Smart contracts table - verify column count
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'smart_contracts';
-- Expected: 42+

-- Query 2.3: NFT tokens table - verify column count
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'nft_tokens';
-- Expected: 18

-- Query 2.4: Wallet auth table - verify column count
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'wallet_auth';
-- Expected: 8

-- Query 2.5: Staking transactions table - verify column count
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'staking_transactions';
-- Expected: 9

-- Query 2.6: Verify smart_contracts contract_address column has CHECK constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'smart_contracts'
AND constraint_type = 'CHECK'
ORDER BY constraint_name;
-- Expected: Multiple CHECK constraints including contract address validation

-- Query 2.7: Verify nft_tokens has unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'nft_tokens'
AND constraint_type = 'UNIQUE'
ORDER BY constraint_name;
-- Expected: UNIQUE constraint on (contract_address, token_id)

-- Query 2.8: Verify profiles has default values for key columns
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_default IS NOT NULL
ORDER BY column_name;
-- Expected: Multiple columns with defaults (gen_random_uuid(), NOW(), etc.)

-- ============================================================================
-- SECTION 3: RLS POLICIES VERIFICATION
-- ============================================================================

-- Query 3.1: Total RLS policies count
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
-- Expected: 27+

-- Query 3.2: Policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected: 
-- deployment_logs: 1
-- nft_tokens: 3
-- profiles: 5
-- smart_contracts: 3
-- staking_transactions: 2
-- user_wallets: 4
-- wallet_auth: 3
-- wallet_transactions: 2

-- Query 3.3: Verify key policies exist
SELECT policyname
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%own%'
ORDER BY policyname;
-- Expected: Multiple "Users can view own..." and "Users can update own..." policies

-- Query 3.4: Verify service role policy for NFT tokens
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'nft_tokens'
AND policyname LIKE '%service%';
-- Expected: "Service role manages NFTs" policy

-- ============================================================================
-- SECTION 4: INDEXES VERIFICATION
-- ============================================================================

-- Query 4.1: Total indexes count
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%';
-- Expected: 40+

-- Query 4.2: Indexes per table
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%'
GROUP BY tablename
ORDER BY tablename;
-- Expected:
-- deployment_logs: 2
-- nft_tokens: 5
-- profiles: 8
-- smart_contracts: 8
-- staking_transactions: 3
-- user_wallets: 3
-- wallet_auth: 3
-- wallet_transactions: 4

-- Query 4.3: List all indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'smart_contracts', 'nft_tokens', 
  'wallet_auth', 'staking_transactions'
)
ORDER BY tablename, indexname;
-- Expected: 19 indexes listed for these tables

-- ============================================================================
-- SECTION 5: FUNCTIONS VERIFICATION
-- ============================================================================

-- Query 5.1: Core functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'handle_new_user', 'update_wallet_timestamp', 'update_profiles_timestamp',
  'generate_collection_slug', 'log_contract_deployment', 'increment_collection_minted',
  'update_smart_contract_timestamp', 'log_nft_mint', 'cleanup_expired_nonces',
  'stake_rair', 'unstake_rair', 'get_staking_status'
)
ORDER BY routine_name;
-- Expected: 12 functions

-- Query 5.2: Verify SECURITY DEFINER on critical functions
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('log_contract_deployment', 'log_nft_mint', 'stake_rair', 'unstake_rair')
AND routine_definition LIKE '%SECURITY DEFINER%';
-- Expected: 4 functions with SECURITY DEFINER

-- Query 5.3: Verify search path in functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition LIKE '%search_path = public%'
ORDER BY routine_name;
-- Expected: Multiple functions with explicit search_path

-- Query 5.4: Count all functions
SELECT COUNT(*) as total_functions
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
-- Expected: 12+

-- ============================================================================
-- SECTION 6: TRIGGERS VERIFICATION
-- ============================================================================

-- Query 6.1: All triggers
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
-- Expected: at least 3 triggers:
-- on_auth_user_created (INSERT on auth.users)
-- on_user_wallets_updated (UPDATE on user_wallets)
-- on_profiles_updated (UPDATE on profiles)
-- on_smart_contracts_updated (UPDATE on smart_contracts)

-- Query 6.2: Verify trigger functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name LIKE '%timestamp%'
ORDER BY routine_name;
-- Expected: update_wallet_timestamp, update_profiles_timestamp, update_smart_contract_timestamp

-- ============================================================================
-- SECTION 7: DATA INTEGRITY CHECKS
-- ============================================================================

-- Query 7.1: Verify profiles table structure is correct
SELECT 
  'profiles' as table_name,
  COUNT(*) as column_count,
  MAX(CASE WHEN column_name = 'id' THEN 1 ELSE 0 END) as has_id,
  MAX(CASE WHEN column_name = 'rair_balance' THEN 1 ELSE 0 END) as has_rair_balance,
  MAX(CASE WHEN column_name = 'rair_staked' THEN 1 ELSE 0 END) as has_rair_staked,
  MAX(CASE WHEN column_name = 'created_at' THEN 1 ELSE 0 END) as has_created_at,
  MAX(CASE WHEN column_name = 'updated_at' THEN 1 ELSE 0 END) as has_updated_at
FROM information_schema.columns
WHERE table_name = 'profiles';
-- Expected: All has_* columns = 1

-- Query 7.2: Verify smart_contracts table structure
SELECT 
  'smart_contracts' as table_name,
  COUNT(*) as column_count,
  MAX(CASE WHEN column_name = 'collection_slug' THEN 1 ELSE 0 END) as has_slug,
  MAX(CASE WHEN column_name = 'contract_address' THEN 1 ELSE 0 END) as has_contract_address,
  MAX(CASE WHEN column_name = 'is_public' THEN 1 ELSE 0 END) as has_is_public,
  MAX(CASE WHEN column_name = 'marketplace_enabled' THEN 1 ELSE 0 END) as has_marketplace_enabled
FROM information_schema.columns
WHERE table_name = 'smart_contracts';
-- Expected: All has_* columns = 1

-- Query 7.3: Verify nft_tokens table structure
SELECT 
  'nft_tokens' as table_name,
  COUNT(*) as column_count,
  MAX(CASE WHEN column_name = 'contract_address' THEN 1 ELSE 0 END) as has_contract_address,
  MAX(CASE WHEN column_name = 'token_id' THEN 1 ELSE 0 END) as has_token_id,
  MAX(CASE WHEN column_name = 'owner_address' THEN 1 ELSE 0 END) as has_owner_address,
  MAX(CASE WHEN column_name = 'minter_user_id' THEN 1 ELSE 0 END) as has_minter_user_id
FROM information_schema.columns
WHERE table_name = 'nft_tokens';
-- Expected: All has_* columns = 1

-- ============================================================================
-- SECTION 8: PERFORMANCE INDEXES VERIFICATION
-- ============================================================================

-- Query 8.1: Verify critical indexes for performance
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
  'idx_profiles_email',
  'idx_profiles_username',
  'idx_smart_contracts_user_id',
  'idx_smart_contracts_address',
  'idx_nft_tokens_contract',
  'idx_nft_tokens_owner',
  'idx_wallet_auth_wallet_address'
)
ORDER BY tablename, indexname;
-- Expected: 7 indexes present

-- Query 8.2: Verify partial indexes for performance
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%WHERE%'
ORDER BY tablename, indexname;
-- Expected: Several partial indexes (WHERE clauses) for active records

-- ============================================================================
-- FINAL SUMMARY REPORT
-- ============================================================================

SELECT 
  'MIGRATION VERIFICATION SUMMARY' as report_title,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE 'pg_%') as total_indexes,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') as total_functions,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers;

-- Expected output should show:
-- total_tables: 8
-- total_policies: 27+
-- total_indexes: 40+
-- total_functions: 12+
-- total_triggers: 3+

-- ============================================================================
-- ADDITIONAL CHECKS - Run if you encounter issues
-- ============================================================================

-- Check for any constraint violations
-- SELECT * FROM pg_constraint 
-- WHERE conrelid = 'profiles'::regclass 
-- ORDER BY conname;

-- Check for any missing foreign keys
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'nft_tokens'
-- ORDER BY constraint_name;

-- Check for RLS policy details
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policy
-- WHERE relname = 'profiles'
-- ORDER BY policyname;

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================
--
-- ✅ All queries return expected results?
-- ✅ 8 tables exist with correct structures?
-- ✅ 27+ RLS policies active?
-- ✅ 40+ indexes created?
-- ✅ 12+ functions available?
-- ✅ All triggers active?
-- ✅ No errors in constraint definitions?
--
-- If all above are TRUE → ✅ MIGRATION SUCCESSFUL
-- If any FALSE → Review specific queries and check migration logs
--
-- ============================================================================

