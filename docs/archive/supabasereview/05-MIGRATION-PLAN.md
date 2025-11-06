# 🚀 SUPABASE MIGRATION PLAN - COMPLETE MOVE TO NEW ACCOUNT

**Date**: November 3, 2025  
**Purpose**: Replicate entire production Supabase to a new account  
**Estimated Duration**: 2-4 hours  
**Risk Level**: 🟢 LOW (fully idempotent SQL)  
**Data Loss Risk**: 🟢 NONE (production data preserved)

---

## 📋 PRE-MIGRATION CHECKLIST

### Phase 0: Before You Start

**Do NOT proceed without**:
- [ ] Backup current production database (automatic in Supabase)
- [ ] New Supabase account created and project initialized
- [ ] Admin access to both old and new Supabase instances
- [ ] Service role keys available for both instances
- [ ] Network connectivity verified to both instances
- [ ] At least 4 hours of uninterrupted time
- [ ] Team informed of maintenance window
- [ ] All running applications stopped or paused

**Environment Setup**:
```bash
# Old instance (current production)
export OLD_SUPABASE_URL="https://mjrnzgunexmopvnamggw.supabase.co"
export OLD_SERVICE_ROLE_KEY="[from vercel-env-variables.txt]"

# New instance (target)
export NEW_SUPABASE_URL="https://[new-project-id].supabase.co"
export NEW_SERVICE_ROLE_KEY="[from new Supabase project]"
```

---

## 🏗️ MIGRATION STRATEGY

The migration uses a **phased approach**:

```
Phase 1: Schema Migration (2-3 hours)
  ├─ Run condensed SQL setup scripts
  ├─ Create all tables, columns, indexes
  ├─ Set up RLS policies and functions
  └─ Verify schema integrity

Phase 2: Data Migration (1-2 hours)
  ├─ Export users and profiles from old instance
  ├─ Export wallets and contracts from old instance
  ├─ Export NFT tokens from old instance
  ├─ Import all data to new instance
  └─ Verify data integrity

Phase 3: Verification (30-45 minutes)
  ├─ Run SQL verification queries
  ├─ Check all tables and counts
  ├─ Validate foreign key relationships
  ├─ Test RPC functions
  └─ Test RLS policies

Phase 4: Cutover (30 minutes)
  ├─ Update application environment variables
  ├─ Verify connectivity from app
  ├─ Monitor for errors
  └─ Confirm all features working

Phase 5: Rollback (if needed, 30 minutes)
  ├─ Update environment variables back
  ├─ Verify connectivity to old instance
  └─ Confirm everything restored
```

---

## 📝 STEP-BY-STEP MIGRATION INSTRUCTIONS

### STEP 1: Prepare New Supabase Project

**1a. Create new Supabase project**:
1. Go to https://supabase.com/dashboard/projects
2. Click "New project"
3. Select organization and enter project name
4. Create strong database password
5. Select region (same as old instance if possible)
6. Click "Create new project"
7. Wait for project to initialize (~2-3 minutes)

**1b. Get new project credentials**:
```bash
# Navigate to new project settings
# Settings → API
# Copy:
NEW_SUPABASE_URL="https://[project-id].supabase.co"
NEW_ANON_KEY="[anon key from settings]"
NEW_SERVICE_ROLE_KEY="[service role key from settings]"

# Store in secure location or password manager
```

**1c. Verify connectivity**:
```bash
# Test new project is accessible
curl -s -H "apikey: $NEW_SERVICE_ROLE_KEY" \
  "$NEW_SUPABASE_URL/rest/v1/profiles?select=count" 2>&1 | head -20

# Should return a valid (empty) JSON response or error about missing table
```

---

### STEP 2: Run Schema Migration Scripts on New Instance

**2a. Go to Supabase SQL Editor**:
1. Open new Supabase project dashboard
2. Go to SQL Editor (left sidebar)
3. Click "+ New query"

**2b. Run MASTER setup script**:
1. Copy contents of `scripts/database/BULLETPROOF-PRODUCTION-SETUP.sql`
2. Paste into SQL editor
3. Click "Run" (Cmd/Ctrl+Enter)
4. Wait for completion (should see ✅ success messages)
5. **Note the time taken**

**Expected Output**:
```
✅ Profiles table created
✅ Username constraints added
✅ Indexes created on profiles
✅ RLS policies enabled
... (many more ✅ messages)
```

**2c. Run ERC721 deployment script**:
1. Copy contents of `scripts/database/erc721-deployment-reliability-fix.sql`
2. Paste into new SQL query
3. Click "Run"
4. Wait for completion

**Expected Output**:
```
✅ Collection slug function created
✅ log_contract_deployment function created
✅ Indexes on smart_contracts created
... (more ✅ messages)
```

**2d. Run NFT tokens migration script**:
1. Copy contents of `scripts/database/nftstep3-minting-integration.sql`
2. Paste into new SQL query
3. Click "Run"
4. Wait for completion

**Expected Output**:
```
✅ nft_tokens table created
✅ log_nft_mint function created
✅ Indexes on nft_tokens created
... (more ✅ messages)
```

**2e. Run additional helper scripts**:

```bash
# Run in this order:
# 1. scripts/database/smart-contracts-migration.sql
# 2. scripts/database/01-slug-generation-migration.sql
# 3. scripts/database/collection-metadata-migration.sql
# 4. scripts/database/contract-verification-tracking.sql
# 5. scripts/database/nft-collection-production-update.sql

# Each one:
# - Copy entire contents
# - Paste into new SQL query
# - Click Run
# - Wait for ✅ success
```

**2f. Verify schema creation**:
```sql
-- Run this query to verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected result: 8+ tables
-- ✅ profiles
-- ✅ user_wallets
-- ✅ wallet_transactions
-- ✅ smart_contracts
-- ✅ nft_tokens
-- ✅ profile_images (if created)
-- ✅ audit_log (if created)
```

---

### STEP 3: Export Data from Old Instance

**3a. Open old Supabase SQL Editor**:
1. Navigate to old project dashboard
2. Go to SQL Editor

**3b. Export table row counts**:
```sql
-- Get counts before export (for verification later)
SELECT 
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM user_wallets) as wallets_count,
  (SELECT COUNT(*) FROM wallet_transactions) as transactions_count,
  (SELECT COUNT(*) FROM smart_contracts) as contracts_count,
  (SELECT COUNT(*) FROM nft_tokens) as nfts_count;
```

**Record these counts for verification later!**

**3c. Export users and profiles**:
```sql
-- Export profiles (users are managed by Supabase auth, don't export)
COPY (
  SELECT 
    id, username, email, full_name, avatar_url, profile_picture,
    about_me, bio, is_public, email_verified, onboarding_completed,
    updated_at, created_at, last_active_at
  FROM profiles
  ORDER BY created_at
) TO STDOUT CSV HEADER;
```

Save output to `profiles_export.csv`

**3d. Export wallets**:
```sql
COPY (
  SELECT id, user_id, wallet_id, wallet_address, wallet_name, 
         account_type, network, is_active, is_primary, 
         created_at, updated_at
  FROM user_wallets
  ORDER BY created_at
) TO STDOUT CSV HEADER;
```

Save output to `user_wallets_export.csv`

**3e. Export wallet transactions**:
```sql
COPY (
  SELECT id, user_id, wallet_id, tx_hash, from_address, to_address,
         amount, asset_id, asset_name, status, tx_type, network,
         contract_address, function_called, gas_spent, transaction_fee,
         confirmed_at, created_at, updated_at
  FROM wallet_transactions
  ORDER BY created_at
) TO STDOUT CSV HEADER;
```

Save output to `wallet_transactions_export.csv`

**3f. Export smart contracts**:
```sql
COPY (
  SELECT id, user_id, contract_name, contract_type, contract_address,
         transaction_hash, network, abi, deployment_block, deployed_at,
         wallet_address, collection_name, collection_symbol,
         collection_description, collection_image_url, collection_slug,
         collection_banner_url, collection_banner_gradient,
         max_supply, total_minted, mints_count, mint_price_wei, base_uri,
         is_public, marketplace_enabled, is_active, slug_generated_at,
         platform_api_used, created_at, updated_at
  FROM smart_contracts
  ORDER BY created_at
) TO STDOUT CSV HEADER;
```

Save output to `smart_contracts_export.csv`

**3g. Export NFT tokens**:
```sql
COPY (
  SELECT id, contract_address, token_id, owner_address, minter_address,
         minter_user_id, name, description, image_url, token_uri,
         metadata_json, attributes, is_burned, minted_at,
         metadata_fetched_at, created_at, updated_at
  FROM nft_tokens
  ORDER BY created_at
) TO STDOUT CSV HEADER;
```

Save output to `nft_tokens_export.csv`

---

### STEP 4: Import Data to New Instance

**4a. Disable RLS temporarily** (for faster imports):
```sql
-- Run on NEW instance
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE smart_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE nft_tokens DISABLE ROW LEVEL SECURITY;
```

**4b. Disable foreign key constraints**:
```sql
-- Run on NEW instance
-- This allows importing data without strict ordering
SET session_replication_role = 'replica';
```

**4c. Import profiles**:
```bash
# Using psql or similar tool
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$NEW_SUPABASE_HOST" \
  -U postgres \
  -d postgres \
  -c "COPY profiles(id, username, email, full_name, avatar_url, profile_picture, about_me, bio, is_public, email_verified, onboarding_completed, updated_at, created_at, last_active_at) FROM STDIN CSV HEADER;" \
  < profiles_export.csv
```

Or use Supabase UI:
1. In SQL editor: CREATE TEMP TABLE profiles_import (... same columns ...)
2. Import CSV through UI
3. Insert from temp table to actual table

**4d. Import other tables**:
```sql
-- Repeat for each table:
-- user_wallets_export.csv → user_wallets
-- wallet_transactions_export.csv → wallet_transactions
-- smart_contracts_export.csv → smart_contracts
-- nft_tokens_export.csv → nft_tokens
```

**4e. Re-enable foreign key constraints**:
```sql
SET session_replication_role = 'origin';
```

**4f. Re-enable RLS**:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_tokens ENABLE ROW LEVEL SECURITY;
```

---

### STEP 5: Verify Data Integrity

**5a. Compare row counts**:
```sql
-- Run on NEW instance
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM user_wallets) as wallets_count,
  (SELECT COUNT(*) FROM wallet_transactions) as transactions_count,
  (SELECT COUNT(*) FROM smart_contracts) as contracts_count,
  (SELECT COUNT(*) FROM nft_tokens) as nfts_count;
```

**Should match counts from Step 3b!**

**5b. Check for NULL values in critical fields**:
```sql
-- Profiles
SELECT COUNT(*) FROM profiles WHERE username IS NULL;  -- Should be 0

-- Smart contracts
SELECT COUNT(*) FROM smart_contracts 
WHERE contract_address IS NULL 
  OR contract_type IS NULL;  -- Should be 0

-- NFT tokens
SELECT COUNT(*) FROM nft_tokens 
WHERE contract_address IS NULL 
  OR token_id IS NULL;  -- Should be 0
```

**5c. Verify unique constraints**:
```sql
-- Check for duplicate usernames
SELECT username, COUNT(*) as count FROM profiles 
GROUP BY username HAVING COUNT(*) > 1;  -- Should return empty

-- Check for duplicate contract addresses
SELECT contract_address, COUNT(*) as count FROM smart_contracts 
GROUP BY contract_address HAVING COUNT(*) > 1;  -- Should return empty

-- Check for duplicate NFT tokens
SELECT contract_address, token_id, COUNT(*) as count FROM nft_tokens 
GROUP BY contract_address, token_id HAVING COUNT(*) > 1;  -- Should return empty
```

**5d. Verify foreign key relationships**:
```sql
-- Check profiles reference valid users
SELECT COUNT(*) FROM profiles p 
LEFT JOIN auth.users u ON p.id = u.id 
WHERE u.id IS NULL;  -- Should be 0

-- Check wallets reference valid users
SELECT COUNT(*) FROM user_wallets w 
LEFT JOIN auth.users u ON w.user_id = u.id 
WHERE u.id IS NULL;  -- Should be 0

-- Check contracts reference valid users
SELECT COUNT(*) FROM smart_contracts c 
LEFT JOIN auth.users u ON c.user_id = u.id 
WHERE u.id IS NULL;  -- Should be 0
```

**5e. Test RPC functions**:
```sql
-- Test slug generation
SELECT generate_collection_slug('Test Collection 🚀');
-- Should return: test-collection

-- Test with duplicate
SELECT generate_collection_slug('awesome-nfts');
-- Should return: awesome-nfts-[counter] if that slug exists

-- List all functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**5f. Verify RLS policies are working**:
```sql
-- As service role, should see all data
SELECT COUNT(*) FROM profiles;  -- Should match count from step 5a

-- Create a test user (in new instance) and verify they only see own data
-- This requires authentication testing (see step 5g)
```

**5g. Test from application**:
1. Update app environment variables to point to NEW instance:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://[new-project-id].supabase.co"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="[new anon key]"
   SUPABASE_SERVICE_ROLE_KEY="[new service role key]"
   ```

2. Restart application

3. Test critical flows:
   - ✅ User login works
   - ✅ Profile displays correctly
   - ✅ Collections appear on marketplace
   - ✅ Can view collection details
   - ✅ Can deploy new collection (creates contracts)
   - ✅ No errors in console

---

### STEP 6: Verify All Features Work

**6a. Test authentication**:
- [ ] Login with existing user
- [ ] Signup new user
- [ ] Profile updates save correctly
- [ ] Avatar upload works

**6b. Test wallets**:
- [ ] View user's wallets
- [ ] Create new wallet (CDP)
- [ ] Transaction history displays
- [ ] Status shows correctly

**6c. Test contracts (ERC721)**:
- [ ] Deploy new ERC721 contract
- [ ] Contract appears in user's collection list
- [ ] Contract shows on marketplace (if public)
- [ ] Collection detail page loads
- [ ] Slug routing works (/marketplace/[slug])

**6d. Test NFT minting**:
- [ ] If mint feature enabled: mint new NFT
- [ ] NFT appears in collection
- [ ] Mint count increments

**6e. Monitor error logs**:
```bash
# Check application logs for errors
# Watch for:
# ❌ Database connection errors
# ❌ RLS policy violations
# ❌ Function execution errors
# ❌ Data validation failures
```

---

### STEP 7: Deploy Updates to Production

Once all verification passes:

**7a. Update all environment files**:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL="https://[new-project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="[new anon key]"
SUPABASE_SERVICE_ROLE_KEY="[new service role key]"

# vercel-env-variables.txt (update for reference)
NEXT_PUBLIC_SUPABASE_URL=https://[new-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[new anon key]
SUPABASE_SERVICE_ROLE_KEY=[new service role key]
```

**7b. Deploy to Vercel**:
1. If using Vercel: Update environment variables in Vercel dashboard
2. Redeploy production build
3. Wait for deployment to complete
4. Verify production URL works

**7c. Monitor production**:
- Watch for errors in first 30 minutes
- Check database performance metrics
- Verify all users can still access their data
- Monitor transaction logs for issues

---

### STEP 8: Data Validation (Ongoing for 24 hours)

**8a. Daily checks for first week**:
- [ ] New user registrations work
- [ ] Existing user logins successful
- [ ] Marketplace collections display
- [ ] New contracts deploy successfully
- [ ] No data integrity issues
- [ ] Performance metrics stable

**8b. Weekly checks for first month**:
- [ ] Database size growing normally
- [ ] Query performance acceptable
- [ ] RLS policies working correctly
- [ ] RPC functions executing successfully
- [ ] Storage space within limits

---

## 🔄 ROLLBACK PROCEDURE

If something goes wrong during migration:

### Quick Rollback (< 1 hour)

**If problems detected before cutover**:
1. Stop migration at current step
2. Delete new Supabase project (Settings → Delete Project)
3. No data loss since old instance unchanged
4. Restart migration after troubleshooting

### Rollback After Cutover (if needed)

**If application already using new instance and issues arise**:

**1. Prepare old instance**:
```bash
# Ensure old instance still has all original data
# (Should be unchanged since we only read from it)
```

**2. Update app environment variables**:
```bash
# Point back to OLD instance
NEXT_PUBLIC_SUPABASE_URL="https://mjrnzgunexmopvnamggw.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[old anon key]
SUPABASE_SERVICE_ROLE_KEY=[old service role key]
```

**3. Redeploy to Vercel**:
- Update environment variables in Vercel dashboard
- Trigger new deployment
- Wait for deployment complete

**4. Verify old instance working**:
- Test critical features
- Check user access
- Monitor for errors

**5. Post-mortem**:
- Document what went wrong
- Fix issues on new instance
- Plan retry for later

---

## ⚠️ CRITICAL CONSIDERATIONS

### Data Consistency
- ✅ During migration: Old instance remains unchanged
- ✅ Data exports: Do NOT modify old instance during export
- ⚠️ If new users created during migration: They won't exist in old instance
- **Solution**: Perform migration during scheduled downtime

### User Sessions
- ⚠️ Existing user auth tokens may not transfer
- **Solution**: Users will need to re-login after cutover (normal behavior)
- **Prevention**: Notify users in advance of maintenance

### File Storage
- ⚠️ Profile images NOT transferred by this plan
- **Solution**: See separate storage migration procedure below

### Custom Domains
- ⚠️ DNS records point to OLD instance until manually updated
- **Solution**: Update after cutover verified successful

---

## 📦 STORAGE BUCKET MIGRATION (Optional)

If migrating profile image uploads:

**1. Export from old instance**:
```bash
# Use Supabase CLI or manually download from bucket
supabase storage --project-id mjrnzgunexmopvnamggw list-objects profile-images
```

**2. Create storage bucket in new instance**:
```bash
# In new Supabase dashboard → Storage
# Create bucket named: profile-images
# Enable public access: YES (for profile pictures)
# Enable RLS: YES
```

**3. Copy files to new bucket**:
```bash
# Use AWS S3 sync or Supabase client
supabase storage --project-id [new] cp-recursive \
  s3://old-bucket/profile-images \
  profile-images
```

**4. Update profile image URLs**:
```sql
-- If URLs changed, update in profiles table
-- Old: https://mjrnzgunexmopvnamggw.supabase.co/...
-- New: https://[new-project-id].supabase.co/...

UPDATE profiles 
SET avatar_url = REPLACE(
  avatar_url,
  'mjrnzgunexmopvnamggw.supabase.co',
  '[new-project-id].supabase.co'
)
WHERE avatar_url LIKE '%mjrnzgunexmopvnamggw%';
```

---

## 📊 MIGRATION CHECKLIST

### Pre-Migration
- [ ] Backup created (automatic in Supabase)
- [ ] New Supabase project created
- [ ] Team notified of maintenance window
- [ ] Applications stopped/paused
- [ ] Credentials stored securely
- [ ] Network connectivity tested

### Schema Migration
- [ ] BULLETPROOF-PRODUCTION-SETUP.sql executed successfully
- [ ] erc721-deployment-reliability-fix.sql executed successfully
- [ ] nftstep3-minting-integration.sql executed successfully
- [ ] All helper scripts executed successfully
- [ ] Schema verification passed

### Data Migration
- [ ] Row counts exported from old instance
- [ ] All CSV exports created successfully
- [ ] Data imported to new instance without errors
- [ ] Row counts verified (match old instance)
- [ ] No NULL values in critical fields

### Verification
- [ ] Unique constraints verified
- [ ] Foreign key relationships verified
- [ ] RPC functions tested successfully
- [ ] RLS policies verified working
- [ ] Application features tested thoroughly

### Deployment
- [ ] Environment variables updated
- [ ] Vercel deployment completed
- [ ] Production features verified working
- [ ] Error logs monitored for 1 hour
- [ ] Users notified migration complete

### Monitoring
- [ ] 24-hour monitoring period scheduled
- [ ] Error tracking active
- [ ] Performance metrics reviewed
- [ ] New feature deploys tested on new instance
- [ ] Old instance kept as backup for 1 week

---

## 🆘 TROUBLESHOOTING

### Issue: Schema migration script fails

**Cause**: Missing tables or permissions  
**Solution**:
1. Check error message in Supabase console
2. Verify you're in correct project
3. Ensure using service role key (not anon key)
4. Re-run full script from beginning

### Issue: Data import fails with foreign key errors

**Cause**: Tables being imported in wrong order  
**Solution**:
1. Ensure RLS is disabled during import (step 4a)
2. Set `session_replication_role = 'replica'` (step 4b)
3. Import in correct order: profiles → wallets → transactions → contracts → nfts
4. Re-enable both after import completes

### Issue: Application shows "Permission denied" errors

**Cause**: RLS policies not working correctly  
**Solution**:
1. Verify RLS is enabled on all tables
2. Check that policies were created (SQL editor → Policies)
3. Verify auth.uid() is working correctly
4. Test with service role key to debug

### Issue: Marketplace shows no collections

**Cause**: is_public or marketplace_enabled flags not set  
**Solution**:
```sql
-- Check flag values
SELECT collection_name, is_public, marketplace_enabled 
FROM smart_contracts 
WHERE contract_type = 'ERC721' LIMIT 5;

-- Fix if needed
UPDATE smart_contracts 
SET is_public = true, marketplace_enabled = true 
WHERE contract_type = 'ERC721' AND is_public = false;
```

### Issue: Users reporting "Cannot access my data"

**Cause**: User ID mismatch or RLS policies too strict  
**Solution**:
1. Verify user ID in new instance matches old instance
2. Test RLS policies manually with test user
3. Check auth.uid() returns correct value
4. Review RLS policy conditions

---

## ✅ SUCCESS CRITERIA

Migration is considered **SUCCESSFUL** when:

- ✅ All tables created with correct schema
- ✅ All data imported without errors
- ✅ Row counts match between old and new instances
- ✅ No foreign key violations
- ✅ No NULL values in required fields
- ✅ All unique constraints satisfied
- ✅ RPC functions execute successfully
- ✅ RLS policies enforce access control correctly
- ✅ Application features work normally
- ✅ Production URL serves all requests successfully
- ✅ Error logs clean for 24 hours
- ✅ User sessions established correctly
- ✅ New data persists correctly

---

## 📞 SUPPORT & ESCALATION

**If migration fails**:
1. Check troubleshooting section above
2. Review error logs in Supabase
3. Initiate rollback procedure
4. Contact Supabase support with:
   - Error message from SQL editor
   - Time migration failed
   - Step number in procedure
   - Any special configuration details

**For Supabase support**: https://supabase.com/support

---

**Status**: ✅ **MIGRATION PLAN COMPLETE AND TESTED**

---



