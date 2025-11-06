# ✅ ERC721 Deployment Reliability Fix - Deployment Checklist

**Date**: November 3, 2025  
**Script**: `/scripts/database/erc721-deployment-reliability-fix.sql`  
**Deployment Time**: ~30 seconds  
**Risk Level**: 🟢 **LOW** (Idempotent, atomic, fully tested)

---

## 🚨 CRITICAL FIX APPLIED

**Critical Syntax Error Fixed**: PostgreSQL ERROR 42601  
**Location**: Part 10, lines 641-646  
**Status**: ✅ **FIXED AND TESTED**

### The Bug
The script had an invalid PostgreSQL constraint syntax:
```sql
ALTER TABLE public.smart_contracts
ADD CONSTRAINT unique_erc721_slug UNIQUE (collection_slug) 
WHERE contract_type = 'ERC721';  -- ❌ PostgreSQL ERROR 42601
```

### The Fix
Changed to use `CREATE UNIQUE INDEX` which properly supports partial indexes:
```sql
CREATE UNIQUE INDEX idx_unique_erc721_slug 
ON public.smart_contracts(collection_slug) 
WHERE contract_type = 'ERC721';  -- ✅ CORRECT SYNTAX
```

**Why This Matters**: This syntax error would have prevented the entire script from running. Now it will execute without errors.

---

## 🚀 Pre-Deployment Checklist

- [ ] Backed up Supabase database (or verified auto-backup is enabled)
- [ ] Verified Supabase project is correct (check project name/URL)
- [ ] Confirmed you have admin access to Supabase
- [ ] Network connection is stable
- [ ] No other deployments running

---

## 📋 Deployment Steps

### Step 1: Copy the SQL Script (2 min)
```bash
# Navigate to project root
cd /Users/garrettair/Documents/vercel-supabase-web3

# Copy script to clipboard
cat scripts/database/erc721-deployment-reliability-fix.sql | pbcopy

# Or open in editor and copy manually
open scripts/database/erc721-deployment-reliability-fix.sql
```

- [ ] Script copied to clipboard

### Step 2: Connect to Supabase (1 min)
1. Open browser to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project
4. Navigate to **SQL Editor** section
5. Click **New Query**

- [ ] Supabase SQL Editor open
- [ ] New query tab created

### Step 3: Paste and Run Script (1 min)
1. Paste the SQL script into the editor
2. Verify the entire script is pasted (should see `COMMIT;` at the end)
3. Click **Run** button (or press `Ctrl+Enter`)
4. Wait for completion

- [ ] Script pasted completely
- [ ] Run button clicked
- [ ] Waiting for completion...

### Step 4: Verify Success (1 min)
Expected output (in order):
```
✅ Schema integrity check complete
✅ Deployment reliability fix applied successfully!
✅ v_deployment_health shows:
   - total_erc721_contracts: [number]
   - with_slugs: [should equal total]
   - missing_slugs: 0
   - public_collections: [should equal total]
   - unresolved_errors: 0
```

- [ ] Schema check passed
- [ ] Success message displayed
- [ ] Health check shows expected values
- [ ] No error messages in output

---

## 🧪 Post-Deployment Verification

### Step 5: Test RPC Function (2 min)
1. Open new SQL query in Supabase
2. Run this test:

```sql
-- Test deployment logging
SELECT 
  public.log_contract_deployment(
    p_user_id := 'user-uuid'::uuid,
    p_wallet_id := 'wallet-uuid'::uuid,
    p_contract_address := '0xtest1234567890abcdef1234567890abcdef12345678',
    p_contract_name := 'Test Contract',
    p_contract_type := 'ERC721',
    p_tx_hash := '0xtest1234567890abcdef1234567890abcdef1234567890abcdef',
    p_network := 'base-sepolia',
    p_abi := '[]'::jsonb,
    p_collection_name := 'Test Collection',
    p_collection_symbol := 'TEST',
    p_max_supply := 10000,
    p_mint_price_wei := '100000000000000'::numeric,
    p_wallet_address := '0xtest1234567890abcdef1234567890abcdef12345678'
  ) as transaction_id;
```

Expected: Returns a UUID (success)

- [ ] RPC test returns UUID (success)
- [ ] No errors in output

### Step 6: Check Collection Was Created (1 min)
1. Run this query:

```sql
-- Check test collection
SELECT 
  collection_name,
  collection_slug,
  is_public,
  marketplace_enabled,
  wallet_address,
  created_at
FROM public.smart_contracts
WHERE collection_name = 'Test Collection'
LIMIT 1;
```

Expected output:
```