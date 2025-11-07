# Quick SQL Deployment Guide

**⏱️ Time to Deploy**: 5 minutes  
**📝 File to Use**: `docs/stakingissueV2/01-STAKING-COMPLETE-RESTORATION.sql`

---

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query** button

---

## Step 2: Copy SQL Script

1. Open this file: `docs/stakingissueV2/01-STAKING-COMPLETE-RESTORATION.sql`
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor (Ctrl+V)

---

## Step 3: Execute Query

1. Click **Run** button (or Ctrl+Enter)
2. Wait for "Query OK" message at bottom
3. Should see green checkmark ✅

---

## Step 4: Verify Success

Copy and run each verification query below in a NEW SQL query:

### Query 1: Check Functions Exist

```sql
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('calculate_rair_tokens', 'set_rair_tokens_on_signup')
ORDER BY routine_name;
```

**Expected Result**:
```
calculate_rair_tokens      | FUNCTION
set_rair_tokens_on_signup  | FUNCTION
```

---

### Query 2: Check Trigger Exists

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'trg_set_rair_tokens_on_signup';
```

**Expected Result**:
```
trg_set_rair_tokens_on_signup | INSERT | profiles | BEFORE
```

---

### Query 3: Test Token Calculation

```sql
SELECT 
  signup_order,
  calculate_rair_tokens(signup_order) as tokens
FROM (VALUES (1), (50), (100), (250), (500), (750), (1000), (1250), (2000)) t(signup_order)
ORDER BY signup_order;
```

**Expected Result**:
```
1     | 10000
50    | 10000
100   | 10000
250   | 5000
500   | 5000
750   | 2500
1000  | 2500
1250  | 1250
2000  | 1250
```

---

## ✅ Success Checklist

- [ ] SQL query executed without errors
- [ ] Functions exist (Query 1 passed)
- [ ] Trigger exists (Query 2 passed)
- [ ] Token calculation correct (Query 3 passed)

---

## 🚀 Next Steps

1. **Deploy Code to Vercel**
   ```bash
   git add scripts/master/00-ULTIMATE-MIGRATION.sql
   git add docs/migrateV4/00-ULTIMATE-MIGRATION.sql
   git add components/superguide/SuperGuideAccessWrapper.tsx
   git commit -m "Restore full staking functionality"
   git push origin main
   ```

2. **Test with New User**
   - Create new mailinator account
   - Sign up for app
   - Check staking interface
   - Verify SuperGuide access control

3. **Verify in Production**
   - Check Vercel logs for errors
   - Check Supabase logs for errors
   - Test staking/unstaking flow
   - Test SuperGuide locked/unlocked states

---

## ⚠️ Troubleshooting

### If you see "function already exists" errors
✅ **This is normal!** The script uses `CREATE OR REPLACE`, so it's safe to re-run.

### If functions don't appear
❌ **Try clearing browser cache and reloading Supabase**

### If calculations are wrong
❌ **Make sure you copied the ENTIRE script, including all sections**

### If trigger doesn't fire
❌ **Check new user signup - trigger only fires on NEW profile inserts**

---

## 📞 Need Help?

Refer to:
- **What's included**: `01-STAKING-COMPLETE-RESTORATION.sql` (all commented)
- **Full analysis**: `critical-findings-and-restoration.md`
- **Step-by-step**: `implementation-guide.md`
- **Summary**: `IMPLEMENTATION-SUMMARY.md`


