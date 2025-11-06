# Quick Reference - V3 Wallet Restoration

## Problem
```
ERROR 42725: function name "public.log_contract_deployment" is not unique
HINT: Specify the argument list to select the function unambiguously
```

## Root Cause
Multiple function overloads from previous migration attempts (V1, V2) lingering in database.

## Solution
**One command that fixes everything:**

```sql
-- 1. Drop functions with CASCADE (clears all overloads)
DROP FUNCTION IF EXISTS public.log_wallet_operation CASCADE;
DROP FUNCTION IF EXISTS public.log_contract_deployment CASCADE;

-- 2. Run the V3 migration script (00-CLEAN_RESTORATION.sql)
```

---

## Files in walletaliveV3/

| File | Purpose |
|------|---------|
| `00-CLEAN_RESTORATION.sql` | The migration script - **RUN THIS** |
| `01-DEPLOYMENT_GUIDE.md` | Full deployment & testing guide |
| `02-QUICK_REFERENCE.md` | This file - quick lookup |

---

## Deploy Now (2 minutes)

### Option A: Supabase CLI
```bash
cd /Users/garrettair/Documents/vercel-supabase-web3
supabase db push --file docs/walletaliveV3/00-CLEAN_RESTORATION.sql
```

### Option B: Dashboard (Manual)
1. https://supabase.com/dashboard/project/mjrnzgunexmopvnamggw/sql/new
2. Copy all text from `00-CLEAN_RESTORATION.sql`
3. Paste into editor
4. Click "Run"
5. Wait for ✅ (takes ~10 seconds)

---

## Verify It Worked

After running migration, execute this:

```sql
SELECT 
  routine_name,
  COUNT(*) as overload_count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('log_wallet_operation', 'log_contract_deployment')
GROUP BY routine_name;
```

Expected result: **Exactly 1 row per function** (no duplicates)

---

## What Gets Created

✅ `platform_api_used` column on `user_wallets` table  
✅ `wallet_operations` audit table  
✅ `log_wallet_operation()` RPC function  
✅ `log_contract_deployment()` RPC function  
✅ RLS policies for security  
✅ Indexes for performance  

---

## Test After Deployment

### 1. Local Dev (10 minutes)
```bash
npm run dev
# Open http://localhost:3000/auth/sign-up
# Sign up with test email
# Check wallet was created automatically
```

### 2. Check Audit Logs
```sql
SELECT * FROM public.wallet_operations 
ORDER BY created_at DESC LIMIT 1;
```
Should show your wallet creation operation logged.

---

## Still Getting the Error?

**This should NOT happen** with V3, but if it does:

```sql
-- Super aggressive cleanup
DROP FUNCTION IF EXISTS public.log_wallet_operation() CASCADE;
DROP FUNCTION IF EXISTS public.log_contract_deployment() CASCADE;

-- Then run 00-CLEAN_RESTORATION.sql again
```

The `()` with empty parens drops the function without needing to specify arguments.

---

## Need Help?

1. **Check Supabase logs**: Dashboard → Logs → find "ERROR"
2. **Verify environment**: Check `NEXT_PUBLIC_SUPABASE_URL` set correctly
3. **Check RLS**: Ensure `wallet_ops_insert` policy is there
4. **Restart dev server**: `ctrl+c` then `npm run dev`

---

## TL;DR

| Step | Command |
|------|---------|
| 1. Deploy | Copy `00-CLEAN_RESTORATION.sql` to Supabase SQL editor and run |
| 2. Verify | Run the verification query above |
| 3. Test | `npm run dev` and sign up new user |
| 4. Confirm | Check `wallet_operations` table has entries |

**Done. Wallet system working again.** ✅


