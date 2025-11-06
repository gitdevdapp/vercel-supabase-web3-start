# V3 Deployment Checklist

**Date:** November 3, 2025  
**Project:** devdapp.com (mjrnzgunexmopvnamggw)  
**Target:** Supabase Production

---

## Pre-Deployment

- [x] Created clean SQL migration: `00-CLEAN_RESTORATION.sql`
- [x] Verified SQL syntax (262 lines, well-formed)
- [x] Documented deployment steps
- [x] Created quick reference guide
- [x] All files in `docs/walletaliveV3/` directory

---

## Deployment (Choose One Method)

### Method 1: Supabase Dashboard (Recommended - Easiest)

- [ ] 1. Open browser to: https://supabase.com/dashboard
- [ ] 2. Navigate to project: mjrnzgunexmopvnamggw
- [ ] 3. Click "SQL Editor" in left sidebar
- [ ] 4. Click "New query"
- [ ] 5. Open file: `docs/walletaliveV3/00-CLEAN_RESTORATION.sql`
- [ ] 6. Copy **entire** contents (all 262 lines)
- [ ] 7. Paste into Supabase SQL editor
- [ ] 8. Click "Run" button (top right)
- [ ] 9. Wait for verification output (~10 seconds)
- [ ] 10. Look for: "🎉 SUCCESS! Wallet system restored and ready!"

### Method 2: Supabase CLI

- [ ] 1. Open terminal in project root
- [ ] 2. Run: `supabase db push --file docs/walletaliveV3/00-CLEAN_RESTORATION.sql`
- [ ] 3. Wait for completion
- [ ] 4. Verify no errors in output

### Method 3: psql (Direct PostgreSQL)

- [ ] 1. Get Supabase connection string
- [ ] 2. Run: `psql postgresql://... < docs/walletaliveV3/00-CLEAN_RESTORATION.sql`

---

## Post-Deployment Verification

### Step 1: Check Functions Exist (Should run in Supabase SQL Editor)

```sql
SELECT 
  routine_name,
  COUNT(*) as overload_count,
  array_agg(routine_type) as types
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('log_wallet_operation', 'log_contract_deployment')
GROUP BY routine_name;
```

**Expected Result:**
```
log_contract_deployment | 1 | {FUNCTION}
log_wallet_operation    | 1 | {FUNCTION}
```

- [ ] Query executed successfully
- [ ] Exactly 1 row per function
- [ ] No duplicates or errors

### Step 2: Check Table Exists

```sql
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name = 'wallet_operations' 
  AND table_schema = 'public';
```

**Expected Result:**
```
wallet_operations | public
```

- [ ] Query executed successfully
- [ ] Table exists in public schema

### Step 3: Check Column Added

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_wallets' 
  AND column_name = 'platform_api_used';
```

**Expected Result:**
```
platform_api_used | boolean | NO
```

- [ ] Query executed successfully
- [ ] Column exists and is boolean type

### Step 4: Check Indexes Created

```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename IN ('user_wallets', 'wallet_operations')
  AND indexname LIKE 'idx%';
```

**Expected Result:** 5 indexes
- `idx_user_wallets_platform_api` on user_wallets
- `idx_wallet_ops_user` on wallet_operations
- `idx_wallet_ops_wallet` on wallet_operations
- `idx_wallet_ops_created` on wallet_operations
- `idx_wallet_ops_type` on wallet_operations

- [ ] All 5 indexes exist

### Step 5: Check RLS Policies

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'wallet_operations';
```

**Expected Result:** 2 policies
- `wallet_ops_user_select` (SELECT)
- `wallet_ops_insert` (INSERT)

- [ ] Both policies exist
- [ ] Policies have correct names and commands

---

## Local Testing

### Environment Setup

- [ ] 1. Copy `.env.local` template (if not exists)
- [ ] 2. Verify environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` set
  - [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` set
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` set
  - [ ] `CDP_API_KEY_ID` set
  - [ ] `CDP_API_KEY_SECRET` set

### Build & Start Dev Server

```bash
cd /Users/garrettair/Documents/vercel-supabase-web3
npm run build
npm run dev
```

- [ ] Build completes without errors
- [ ] Dev server starts on http://localhost:3000
- [ ] No errors in terminal

### Test Wallet Creation

- [ ] 1. Navigate to: http://localhost:3000/auth/sign-up
- [ ] 2. Generate random test email (e.g., testuser_1234@mailinator.com)
- [ ] 3. Enter password: TestPassword123!
- [ ] 4. Click "Sign up"
- [ ] 5. Wait for email verification (check Mailinator inbox)
- [ ] 6. After signup, check:
  - [ ] Redirected to profile page
  - [ ] Wallet address shown
  - [ ] ETH balance shows (0.05)
  - [ ] No red error messages
  - [ ] No errors in browser console

### Check Browser Console

```javascript
// Should see no errors, only info messages
// Look for lines indicating successful wallet creation
```

- [ ] No errors in console
- [ ] Wallet created successfully
- [ ] Balance loaded correctly

### Verify Audit Logging (in Supabase SQL Editor)

```sql
SELECT id, p_user_id, p_wallet_id, p_operation_type, p_status, created_at
FROM public.wallet_operations
ORDER BY created_at DESC
LIMIT 10;
```

- [ ] Query returns results
- [ ] See `auto_create` operations for new users
- [ ] Timestamps recent (within last few minutes)

---

## Deployment Success Criteria

- [x] SQL file created and validated
- [ ] Migration deployed to Supabase
- [ ] Post-deployment verification queries pass
- [ ] No function uniqueness errors
- [ ] All schema objects created
- [ ] Local dev environment works
- [ ] User signup → wallet creation works
- [ ] Audit logging active
- [ ] Browser console clean
- [ ] Supabase logs show no errors

---

## If Deployment Fails

### Error: "function name ... is not unique"

**Cause:** Previous function overloads still in database

**Solution:**
```sql
DROP FUNCTION IF EXISTS public.log_wallet_operation() CASCADE;
DROP FUNCTION IF EXISTS public.log_contract_deployment() CASCADE;
-- Re-run 00-CLEAN_RESTORATION.sql
```

### Error: "table already exists"

**Cause:** wallet_operations table exists from previous attempt

**Solution:** This is OK! Script uses `CREATE TABLE IF NOT EXISTS` so it skips. Continue with rest of verification.

### Error: "column already exists"

**Cause:** platform_api_used column exists from previous attempt

**Solution:** This is OK! Script uses `ADD COLUMN IF NOT EXISTS` so it skips. Continue with rest of verification.

### Wallet Still Not Creating

**Checklist:**
- [ ] Check CDP credentials in Supabase environment variables
- [ ] Check Supabase logs: Dashboard → Logs → search for "ERROR"
- [ ] Verify RLS policies allow inserts: `wallet_ops_insert` should exist
- [ ] Check network tab in browser dev tools for API errors
- [ ] Restart dev server: `Ctrl+C` then `npm run dev`

### Audit Logs Empty

**Checklist:**
- [ ] Verify `wallet_operations` table exists
- [ ] Check RLS policy `wallet_ops_insert` exists with `WITH CHECK (true)`
- [ ] Verify function was called (check Supabase logs)
- [ ] Try manual insert:
```sql
INSERT INTO public.wallet_operations 
  (p_user_id, p_wallet_id, p_operation_type, p_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 
   '00000000-0000-0000-0000-000000000002'::uuid, 
   'test', 
   'success');
```

---

## Rollback Plan

If deployment needs to be reversed:

```sql
BEGIN;
DROP FUNCTION IF EXISTS public.log_contract_deployment CASCADE;
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;
DROP TABLE IF EXISTS public.wallet_operations CASCADE;
ALTER TABLE public.user_wallets 
DROP COLUMN IF EXISTS platform_api_used CASCADE;
COMMIT;
```

**Consequences:**
- ⚠️ All audit logging data lost
- ⚠️ Wallet operations tracking removed
- ✅ Wallets still work (column is just for tracking)

---

## Final Signoff

- [ ] All verification queries passed
- [ ] Local testing successful
- [ ] Wallet creation confirmed working
- [ ] Audit logging confirmed active
- [ ] No errors in any logs
- [ ] Deployment approved and complete

**Deployment Completed By:** ________________  
**Date:** ________________  
**Status:** ✅ SUCCESS / ❌ FAILED

---

## Post-Deployment Monitoring

For next 24 hours:
- [ ] Monitor Supabase logs for errors
- [ ] Test new user signups periodically
- [ ] Verify audit logging continues
- [ ] Check for performance issues
- [ ] Monitor error rates

**All checklist items should be marked before declaring deployment successful.**


