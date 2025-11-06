# Staking System - Quick Start Guide (V5)

## 🚀 For New Supabase Projects

### Step 1: Use the Fixed Migration Script

**File**: `scripts/master/00-ULTIMATE-MIGRATION-V5-FIXED.sql`

Copy the entire contents and run in your Supabase SQL Editor:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create New Query
4. Paste entire contents of `00-ULTIMATE-MIGRATION-V5-FIXED.sql`
5. Click "Run"
6. Wait ~15-17 minutes
7. Verify completion messages

### Step 2: Verify Installation

Run these queries to confirm everything is set up:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Should show: deployment_logs, nft_tokens, profiles, smart_contracts, staking_transactions, user_wallets, wallet_auth, wallet_transactions

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
-- Should include: calculate_rair_tokens, get_staking_status, set_rair_tokens_on_signup, stake_rair, unstake_rair
```

### Step 3: Test Staking System

```sql
-- Create a test user
INSERT INTO auth.users (id, email, email_confirmed_at)
VALUES (gen_random_uuid(), 'staking-test@example.com', NOW());

-- Verify the user got staking allocation
SELECT 
  email,
  signup_order,
  rair_balance,
  rair_token_tier,
  rair_tokens_allocated
FROM profiles
WHERE email = 'staking-test@example.com';

-- Expected output:
-- email: staking-test@example.com
-- signup_order: 1 (or next number)
-- rair_balance: 10000 (or tiered amount)
-- rair_token_tier: '1' (or corresponding tier)
-- rair_tokens_allocated: 10000 (or corresponding amount)
```

### Step 4: Test Staking Function

```sql
-- Get current staking status for test user
SELECT * FROM public.get_staking_status()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'staking-test@example.com' LIMIT 1);

-- Expected columns:
-- user_id, rair_balance, rair_staked, total_rair, has_superguide_access
```

---

## 📊 Staking Tiers Explained

| Tier | Users | Balance | Threshold for SuperGuide |
|------|-------|---------|-------------------------|
| Tier 1 | 1-100 | 10,000 RAIR | 3,000 RAIR staked ✅ |
| Tier 2 | 101-500 | 5,000 RAIR | 3,000 RAIR staked ✅ |
| Tier 3 | 501-1,000 | 2,500 RAIR | Not enough alone ❌ |
| Tier 4+ | 1001+ | Halving | Requires staking |

**SuperGuide Access**: User gets access when `rair_staked >= 3000`

---

## 🔧 API Endpoints

### GET /api/staking/status

Returns current user's staking information.

**Response**:
```json
{
  "rair_balance": 10000,
  "rair_staked": 0,
  "total_rair": 10000,
  "has_superguide_access": false
}
```

**Note**: Calls `get_staking_status()` function from database

### POST /api/staking/stake

Stake RAIR tokens.

**Request**:
```json
{
  "amount": 3000
}
```

**Expected After**: 
- `rair_balance`: 7000
- `rair_staked`: 3000
- `has_superguide_access`: true (if staked >= 3000)

### POST /api/staking/unstake

Unstake RAIR tokens.

**Request**:
```json
{
  "amount": 1000
}
```

---

## ✅ Critical Fixes in V5

### Fix 1: BIGSERIAL Sequence Assignment
- **Issue**: V4 triggers couldn't access BIGSERIAL value
- **Fix**: V5 manually assigns sequence using `pg_get_serial_sequence()`
- **Result**: All users get correct `signup_order`

### Fix 2: rair_balance Initialization
- **Issue**: V4 left `rair_balance` at default 10,000 for all users
- **Fix**: V5 sets `rair_balance` to tiered amount in trigger
- **Result**: Tier 2 users get 5,000, Tier 3 get 2,500, etc.

---

## 🐛 Troubleshooting

### Issue: New users have signup_order = NULL

**Cause**: V4 migration script used

**Solution**: Run V5 migration: `00-ULTIMATE-MIGRATION-V5-FIXED.sql`

### Issue: All users show rair_balance = 10000

**Cause**: V4 trigger not setting balance by tier

**Solution**: Run V5 migration or execute backfill:

```sql
UPDATE profiles
SET rair_balance = public.calculate_rair_tokens(signup_order)
WHERE rair_balance = 10000
AND signup_order > 100;
```

### Issue: /api/staking/status returns empty

**Cause**: Trigger didn't execute or function doesn't exist

**Solution**: 
1. Verify trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'trg_set_rair_tokens_on_signup';`
2. Verify function exists: `SELECT * FROM information_schema.routines WHERE routine_name = 'get_staking_status';`
3. Check trigger is on profiles table: Ensure it's set to BEFORE INSERT

---

## 📋 Pre-Deployment Checklist

- [ ] Ran `00-ULTIMATE-MIGRATION-V5-FIXED.sql`
- [ ] Verified all 8 tables exist
- [ ] Verified all 12 functions exist
- [ ] Tested user creation with staking allocation
- [ ] Tested `get_staking_status()` function
- [ ] Tested staking/unstaking functions
- [ ] Confirmed `/api/staking/status` endpoint works
- [ ] Verified SuperGuide access control (lock/unlock at 3000 RAIR)

---

## 🚀 Deployment

1. **Backup existing Supabase project** if upgrading from V4
2. **Run migration script** on empty or fresh Supabase project
3. **Verify all checks pass** (see above)
4. **Deploy application code** (no changes needed for V5)
5. **Test with real users** - have them signup and check staking page
6. **Monitor** - Check database logs for any errors

---

## 📚 Additional Resources

- **Full Analysis**: See `CRITICAL-REVIEW-AND-FIX.md`
- **Comparison**: See `MIGRATION-V4-vs-V5-FIXES.md`
- **Original Analysis**: See `docs/stakingissueV3/STAKING-SYSTEM-FIX-COMPREHENSIVE-ANALYSIS.md`

---

## ❓ Questions?

Review:
1. Did you run the correct V5 script?
2. Is the trigger firing? (Check profile inserts)
3. Is the sequence being assigned? (Check signup_order values)
4. Are balances being set? (Check rair_balance after signup)

All should be YES for V5. If still issues, compare your database schema with the V5 script line by line.

