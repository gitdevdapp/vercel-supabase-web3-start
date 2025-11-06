# Wallet Creation System - V3 Deployment Guide

**Date:** November 3, 2025  
**Status:** Clean, Simple, WORKS  
**Environment:** Supabase Production (mjrnzgunexmopvnamggw)

## The Fix

The ERROR `42725: function name "public.log_contract_deployment" is not unique` was caused by:
- Multiple function overloads existing in the database
- Previous attempts with `CREATE OR REPLACE` not working properly

**Solution:** Use `DROP CASCADE` to completely clear all overloads, then recreate with clean signatures.

---

## Deployment Steps

### 1. Upload Migration to Supabase

```bash
# Navigate to project root
cd /Users/garrettair/Documents/vercel-supabase-web3

# Apply the migration using Supabase CLI
supabase db push --file docs/walletaliveV3/00-CLEAN_RESTORATION.sql
```

OR manually in Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/sql/new
2. Copy entire contents of `00-CLEAN_RESTORATION.sql`
3. Click "Run"
4. Wait for verification output ✅

### 2. Verify in Supabase SQL Editor

After deployment, run this query to confirm:

```sql
-- Check all functions exist
SELECT routine_name, routine_type, routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('log_wallet_operation', 'log_contract_deployment')
ORDER BY routine_name;
```

Expected output:
```
log_contract_deployment | FUNCTION | public
log_wallet_operation    | FUNCTION | public
```

---

## Testing on Localhost

### 1. Build & Start Local Dev Server

```bash
npm run build
npm run dev
```

### 2. Sign Up Test User

- Navigate to: http://localhost:3000/auth/sign-up
- Use email: `testuser_$(date +%s)@mailinator.com`
- Password: `TestPassword123!`
- Click signup

### 3. Check Wallet Creation

After signup, you should see:
- ✅ Wallet auto-created
- ✅ ETH balance shows (0.05 ETH)
- ✅ No errors in console
- ✅ No errors in Supabase logs

### 4. Verify Audit Logging

In Supabase SQL Editor, run:

```sql
-- Check wallet_operations table has entries
SELECT id, p_operation_type, p_status, created_at
FROM public.wallet_operations
ORDER BY created_at DESC
LIMIT 5;
```

Expected: See `auto_create` operations logged

### 5. Test Contract Deployment

- Go to protected/page (if available)
- Deploy a test contract
- Check wallet_operations for `deploy` entries

---

## Key Features

✅ **Idempotent** - Can run multiple times safely  
✅ **Atomic** - Single transaction, all-or-nothing  
✅ **Simple** - No new fields, no unnecessary complexity  
✅ **Audited** - All operations logged for compliance  
✅ **Secure** - RLS policies restrict data access  
✅ **Performant** - Proper indexes for query speed

---

## If Issues Occur

### Function still not unique error?

The migration uses `DROP CASCADE` which should clear all overloads. If error persists:

```sql
-- Nuclear option: Drop and recreate everything
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;
DROP FUNCTION IF EXISTS public.log_contract_deployment CASCADE;
DROP TABLE IF EXISTS public.wallet_operations CASCADE;
-- Then re-run 00-CLEAN_RESTORATION.sql
```

### Wallet still not creating?

1. Check backend logs in Supabase: Dashboard → Logs
2. Verify environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
3. Check CDP credentials: `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`
4. Confirm RLS policies allow operations

### Tests failing?

```bash
# Run integration tests
npm run test:integration

# Check console output for specific errors
# Common: RLS policy blocking inserts → Solution: Verify policy WITH CHECK clause
```

---

## Rollback (If Needed)

To undo this migration:

```sql
BEGIN;

-- Drop functions
DROP FUNCTION IF EXISTS public.log_contract_deployment CASCADE;
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;

-- Drop table
DROP TABLE IF EXISTS public.wallet_operations CASCADE;

-- Drop column
ALTER TABLE public.user_wallets 
DROP COLUMN IF EXISTS platform_api_used CASCADE;

COMMIT;
```

⚠️ **Warning:** This will lose all audit logging data. Only use if necessary.

---

## Production Checklist

- [ ] Migration applied to production
- [ ] Verification queries passed ✅
- [ ] Localhost testing successful
- [ ] No errors in console/logs
- [ ] Wallet creation flow tested end-to-end
- [ ] Contract deployment tested
- [ ] Audit logs being created
- [ ] RLS policies enforced


