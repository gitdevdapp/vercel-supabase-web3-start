# 🔧 Wallet System Fix - Implementation Guide

**Last Updated**: November 3, 2025  
**Target**: Production Supabase (mjrnzgunexmopvnamggw)  
**Impact**: CRITICAL - Unblocks wallet creation for all new users  
**Effort**: 30 minutes total (5 min SQL + 10 min testing + 15 min verification)

---

## ⚡ Quick Fix Summary

**3 SQL migrations needed**:
1. Add `platform_api_used` column to `user_wallets`
2. Create `wallet_operations` audit table
3. Create 2 RPC functions for operation logging

**After fix**:
- ✅ New wallets auto-create on first profile visit
- ✅ Wallets auto-funded with 0.05 ETH
- ✅ Users can deploy ERC721 contracts
- ✅ Users can mint NFTs

---

## 📋 Step-by-Step Fix

### STEP 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw
2. Navigate to: **SQL Editor** (left sidebar)
3. You're now ready to run migrations

### STEP 2: Migration #1 - Add Missing Column

**What**: Add `platform_api_used` boolean column to `user_wallets`  
**Why**: Auto-create route tries to set this when saving wallets  
**Time**: < 1 minute

**Copy this SQL into the Supabase SQL Editor**:

```sql
-- Migration: Add platform_api_used column to user_wallets
-- This column distinguishes auto-generated CDP wallets from manually imported ones
-- Status: REQUIRED FOR AUTO-WALLET FEATURE

ALTER TABLE public.user_wallets
ADD COLUMN IF NOT EXISTS platform_api_used boolean DEFAULT false;

-- Create index for faster queries on auto-created wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_platform_api 
ON user_wallets(platform_api_used) 
WHERE platform_api_used = true;

-- Update all existing wallets to have platform_api_used = false
-- (They were created before auto-create feature was implemented)
UPDATE public.user_wallets 
SET platform_api_used = false 
WHERE platform_api_used IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_wallets'
ORDER BY ordinal_position;
```

**After running**:
- ✅ See output showing all columns
- ✅ `platform_api_used` should appear in the list
- ✅ Status should show `DEFAULT false`

### STEP 3: Migration #2 - Create Audit Table

**What**: Create `wallet_operations` table for logging  
**Why**: Track wallet creation, funding, and contract deployments  
**Time**: < 1 minute

**Copy this SQL**:

```sql
-- Migration: Create wallet_operations audit table
-- Tracks all wallet-related operations for compliance and debugging
-- Status: REQUIRED FOR OPERATION LOGGING

CREATE TABLE IF NOT EXISTS public.wallet_operations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  p_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  p_wallet_id uuid NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
  p_operation_type text NOT NULL,
  p_token_type text,
  p_amount numeric(20, 8),
  p_to_address text,
  p_from_address text,
  p_tx_hash text,
  p_status text NOT NULL,
  created_at timestamp DEFAULT now(),
  
  -- Constraints to ensure data integrity
  CONSTRAINT valid_operation_type CHECK (
    p_operation_type IN ('auto_create', 'super_faucet', 'fund', 'deploy', 'mint')
  ),
  CONSTRAINT valid_status CHECK (
    p_status IN ('pending', 'success', 'failed')
  )
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wallet_ops_user ON wallet_operations(p_user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ops_wallet ON wallet_operations(p_wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ops_created ON wallet_operations(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_ops_type ON wallet_operations(p_operation_type);

-- Enable RLS for security
ALTER TABLE public.wallet_operations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own operations
CREATE POLICY wallet_ops_user_select ON wallet_operations
  FOR SELECT
  USING (p_user_id = auth.uid());

-- Verify table was created
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'wallet_operations';
```

**After running**:
- ✅ See confirmation: "table_name: wallet_operations"
- ✅ Indexes are created
- ✅ RLS is enabled

### STEP 4: Migration #3 - Create RPC Functions

**What**: Create PL/pgSQL functions for logging operations  
**Why**: API routes call these functions to audit all activities  
**Time**: < 2 minutes

**Copy this SQL** (NOTE: All at once):

```sql
-- Migration: Create log_wallet_operation RPC function
-- Called by: /api/wallet/auto-create, /api/wallet/super-faucet
-- Status: REQUIRED FOR WALLET OPERATION LOGGING

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
  -- Insert the operation record
  INSERT INTO wallet_operations (
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
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_wallet_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_wallet_operation TO service_role;

-- Verify function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'log_wallet_operation';
```

**After running**:
- ✅ See: "routine_name: log_wallet_operation"
- ✅ Type should be: "FUNCTION"

**Now create second RPC function** (copy separately):

```sql
-- Migration: Create log_contract_deployment RPC function
-- Called by: /api/contract/deploy, /api/contract/mint
-- Status: REQUIRED FOR CONTRACT DEPLOYMENT LOGGING

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
  -- Insert the deployment record as a 'deploy' operation
  INSERT INTO wallet_operations (
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
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_contract_deployment TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_contract_deployment TO service_role;

-- Verify function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'log_contract_deployment';
```

**After running**:
- ✅ See: "routine_name: log_contract_deployment"
- ✅ Type should be: "FUNCTION"

---

## ✅ Verification: Confirm All Fixes Applied

**Run this verification SQL** (copy into SQL Editor):

```sql
-- Verification: Confirm all migrations are complete
-- This script checks that all 3 fixes were successfully applied

DO $$
DECLARE
  v_platform_api_exists boolean;
  v_wallet_ops_exists boolean;
  v_log_wallet_op_exists boolean;
  v_log_contract_exists boolean;
BEGIN
  -- Check 1: platform_api_used column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_wallets' 
    AND column_name = 'platform_api_used'
  ) INTO v_platform_api_exists;

  -- Check 2: wallet_operations table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'wallet_operations'
  ) INTO v_wallet_ops_exists;

  -- Check 3: log_wallet_operation function exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'log_wallet_operation'
  ) INTO v_log_wallet_op_exists;

  -- Check 4: log_contract_deployment function exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'log_contract_deployment'
  ) INTO v_log_contract_exists;

  -- Report results
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '1. platform_api_used column: %', CASE WHEN v_platform_api_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '2. wallet_operations table: %', CASE WHEN v_wallet_ops_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '3. log_wallet_operation RPC: %', CASE WHEN v_log_wallet_op_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '4. log_contract_deployment RPC: %', CASE WHEN v_log_contract_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  
  IF v_platform_api_exists AND v_wallet_ops_exists AND v_log_wallet_op_exists AND v_log_contract_exists THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL MIGRATIONS SUCCESSFUL!';
    RAISE NOTICE 'Wallet creation system is now ready for testing.';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  MIGRATION INCOMPLETE';
    RAISE NOTICE 'Missing: %', 
      ARRAY_TO_STRING(ARRAY[
        CASE WHEN NOT v_platform_api_exists THEN 'platform_api_used column' END,
        CASE WHEN NOT v_wallet_ops_exists THEN 'wallet_operations table' END,
        CASE WHEN NOT v_log_wallet_op_exists THEN 'log_wallet_operation RPC' END,
        CASE WHEN NOT v_log_contract_exists THEN 'log_contract_deployment RPC' END
      ], ', ');
  END IF;
END$$;
```

**Expected Output**:
```
NOTICE: VERIFICATION RESULTS:
NOTICE: 1. platform_api_used column: ✅ EXISTS
NOTICE: 2. wallet_operations table: ✅ EXISTS
NOTICE: 3. log_wallet_operation RPC: ✅ EXISTS
NOTICE: 4. log_contract_deployment RPC: ✅ EXISTS
NOTICE: 
NOTICE: 🎉 ALL MIGRATIONS SUCCESSFUL!
```

If you see all ✅, proceed to Testing section.

---

## 🧪 TESTING: Verify Wallet Creation Works

### Test 1: Test Database Insert (No RPC)

**SQL Test** (run in SQL Editor):

```sql
-- Test 1: Direct insert into user_wallets with all columns
-- This tests that the platform_api_used column accepts the insert

INSERT INTO user_wallets (
  user_id,
  wallet_address,
  wallet_name,
  network,
  is_active,
  platform_api_used
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Fake UUID for testing
  '0xTestWallet0000000000000000000000000000001',
  'Test Wallet - DB Schema Verification',
  'base-sepolia',
  true,
  true  -- This is the key: the column now exists!
)
RETURNING id, wallet_address, platform_api_used;

-- Query to verify
SELECT id, wallet_address, platform_api_used, created_at 
FROM user_wallets 
WHERE platform_api_used = true
ORDER BY created_at DESC
LIMIT 1;

-- Clean up test data
DELETE FROM user_wallets 
WHERE wallet_address = '0xTestWallet0000000000000000000000000000001';
```

**Expected**:
- ✅ Insert succeeds (no schema error)
- ✅ Can see wallet in query result with `platform_api_used = true`

### Test 2: Test RPC Function

**SQL Test**:

```sql
-- Test 2: Call log_wallet_operation RPC directly
SELECT public.log_wallet_operation(
  '00000000-0000-0000-0000-000000000001'::uuid,  -- user_id
  '00000000-0000-0000-0000-000000000002'::uuid,  -- wallet_id (this won't exist, but tests schema)
  'auto_create',
  'success',
  'eth',
  NULL,
  NULL,
  NULL,
  NULL
);
```

**Expected**: Should error about wallet_id foreign key (which is fine - proves schema is right)

---

## 🚀 FINAL: End-to-End User Test

### Setup Test User

1. Go to: `https://localhost:3000/auth/sign-up` (or production URL)
2. Sign up with test email: `wallet-test-${Date.now()}@mailinator.com`
3. Set password: `TestWallet123!@#`
4. Complete email verification

### Trigger Wallet Auto-Create

1. After email verification, user redirected to `/protected/profile`
2. Open browser Developer Tools → **Console** tab
3. Watch for these logs:

```
✅ SHOULD SEE:
[AutoCreateWallet] Triggering auto-wallet creation
[AutoCreateWallet] Initiating auto-wallet creation
[AutoWallet] Creating wallet for user: <uuid>
[AutoWallet] CDP Client initialized with correct credentials
[AutoWallet] Wallet account generated successfully: 0x...
[AutoWallet] Wallet saved to database: <wallet-uuid>
[AutoCreateWallet] Success: {...}
```

### Verify in Database

**In Supabase SQL Editor**, check that new wallet exists:

```sql
-- Check most recent wallet created
SELECT id, user_id, wallet_address, wallet_name, platform_api_used, created_at
FROM user_wallets
ORDER BY created_at DESC
LIMIT 1;

-- Check operation was logged
SELECT id, p_operation_type, p_status, p_user_id, created_at
FROM wallet_operations
WHERE p_operation_type = 'auto_create'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected**:
- ✅ New wallet row with `platform_api_used = true`
- ✅ New wallet_operations row with type `auto_create` and status `success`

### Verify Auto-Superfaucet Triggers

**In console**, watch for:

```
[AutoSuperFaucet] User has wallet, triggering auto-superfaucet
[AutoSuperFaucet] Initiating auto-superfaucet
[AutoSuperFaucet] Request from user: <uuid>
[AutoSuperFaucet] Using wallet: 0x...
[AutoSuperFaucet] Checking wallet balance...
[AutoSuperFaucet] Current balance: 0 ETH
[AutoSuperFaucet] Triggering superfaucet...
[AutoSuperFaucet] SuperFaucet completed: {requestCount: X, finalBalance: 0.05}
```

**Wait 60 seconds** for faucet to complete and wallet to show funded balance.

---

## 📊 Success Criteria

After completing all steps:

- ✅ Test user signs up successfully
- ✅ No "platform_api_used" column error
- ✅ Wallet auto-creates after profile page loads
- ✅ Wallet address displayed in UI
- ✅ wallet_operations table has logs
- ✅ Auto-superfaucet triggers automatically
- ✅ Wallet shows 0.05 ETH balance after ~60 seconds
- ✅ User can deploy ERC721 contracts
- ✅ User can mint NFTs

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```sql
-- ROLLBACK: Drop the new migrations
DROP TABLE IF EXISTS public.wallet_operations CASCADE;
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;
DROP FUNCTION IF EXISTS public.log_contract_deployment CASCADE;

-- Keep the platform_api_used column (it's backward compatible)
-- To remove it:
-- ALTER TABLE public.user_wallets DROP COLUMN platform_api_used;
```

---

## 📞 Troubleshooting

### Error: "Could not find the 'platform_api_used' column"

**Cause**: Migration #1 didn't run successfully  
**Fix**: Re-run STEP 2 SQL, verify column exists with:
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'user_wallets' AND column_name = 'platform_api_used';
```

### Error: "Could not find the table 'wallet_operations'"

**Cause**: Migration #2 didn't run successfully  
**Fix**: Re-run STEP 3 SQL, verify table exists with:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'wallet_operations';
```

### Error: "Unknown function log_wallet_operation"

**Cause**: Migration #3 didn't run successfully  
**Fix**: Re-run STEP 4 SQL, verify function exists with:
```sql
SELECT * FROM information_schema.routines WHERE routine_name = 'log_wallet_operation';
```

### Wallet still not creating after migrations

**Debug steps**:
1. Check browser console for error messages
2. Check Network tab → POST /api/wallet/auto-create response
3. Look for HTTP 500 error and error details
4. If still "platform_api_used error": Clear browser cache and refresh
5. Verify migration #1 ran: Query information_schema.columns

---

## 📝 Summary

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Access Supabase SQL Editor | 1 min | ⏳ |
| 2 | Add `platform_api_used` column | 1 min | ⏳ |
| 3 | Create `wallet_operations` table | 1 min | ⏳ |
| 4 | Create RPC functions | 2 min | ⏳ |
| 5 | Run verification SQL | 1 min | ⏳ |
| 6 | Sign up test user | 5 min | ⏳ |
| 7 | Verify wallet auto-creates | 5 min | ⏳ |
| 8 | Verify superfaucet funds wallet | 60 min | ⏳ |
| 9 | Document completion | 2 min | ⏳ |
| **TOTAL** | | **~78 min** | |

---

**Status**: Ready for implementation  
**Priority**: CRITICAL - Blocks wallet feature  
**Date**: November 3, 2025  
**Next Step**: Start with STEP 1 - Access Supabase Dashboard


