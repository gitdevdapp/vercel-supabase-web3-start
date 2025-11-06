# 🚀 CANONICAL MIGRATION GUIDE: Private to Open Source Repository

**Date:** October 21, 2025  
**Status:** ✅ READY FOR EXECUTION  
**Source:** `vercel-supabase-web3` (Private) → `vercel-supabase-web3-start` (Public)

---

## 📋 Executive Summary

This is the **single, definitive guide** for migrating production code from the private repository to the open-source starter template. This migration includes:

✅ **Complete staking functionality** (RAIR token system)  
✅ **All SQL editor scripts** (database setup)  
✅ **Profile page with staking integration**  
✅ **Wallet system** (CDP integration)  
✅ **Authentication system** (Supabase)  
✅ **Homepage preserved** (starter template)  
❌ **SuperGuide excluded** (proprietary)  
❌ **All credentials redacted** (security)

---

## 🎯 Migration Goals

### What Gets Migrated
- ✅ **Staking System**: Complete RAIR token staking functionality
- ✅ **SQL Scripts**: All database setup and migration scripts
- ✅ **Profile System**: User profiles with staking integration
- ✅ **Wallet System**: CDP wallet integration
- ✅ **Authentication**: Supabase auth system
- ✅ **Core Components**: All non-proprietary React components
- ✅ **API Routes**: All backend API endpoints
- ✅ **Configuration**: Build configs, TypeScript, etc.
- ✅ **Tests**: All test files
- ✅ **Documentation**: Sanitized docs (credentials redacted)

### What Gets Excluded
- ❌ **SuperGuide Components**: `components/superguide/` (3 files)
- ❌ **Credentials**: All real API keys, secrets, tokens
- ❌ **DevDapp Branding**: Specific logos, copy, investor info
- ❌ **Environment Files**: `.env.local`, `vercel-env-variables.txt`

### What Gets Preserved
- ✅ **Homepage**: Starter template homepage remains intact
- ✅ **Basic Structure**: Core Next.js app structure
- ✅ **Generic Components**: Non-branded UI components

---

## 🔐 Security Audit Results

### ✅ SECURE: Files Not Committed
These files contain real credentials but are **NOT tracked in git**:
- `vercel-env-variables.txt` - Production credentials (gitignored)
- `.env.local` - Local development credentials (gitignored)
- `.env.production` - Production environment (gitignored)

### ⚠️ CRITICAL: Credentials in Documentation
**Files requiring redaction before migration:**

| File | Credential Type | Action |
|------|----------------|--------|
| `docs/testing/PRODUCTION-TEST-STEPS.md` | CDP_API_KEY_ID, CDP_API_KEY_SECRET | REDACT |
| `docs/diagnose/VERIFY-FIX.md` | CDP_API_KEY_ID, CDP_API_KEY_SECRET | REDACT |
| `docs/wallet/UPDATE-VERCEL-CDP-CREDENTIALS.md` | CDP_API_KEY_SECRET | REDACT |
| `docs/security/SECURITY-INCIDENT-REPORT.md` | CDP_API_KEY_ID | REDACT |

**Redaction Format:**
```diff
- CDP_API_KEY_ID=[REDACTED-CDP-API-KEY-ID]
- CDP_API_KEY_SECRET=[REDACTED-CDP-API-KEY-SECRET]
+ CDP_API_KEY_ID=[REDACTED-CDP-API-KEY-ID]
+ CDP_API_KEY_SECRET=[REDACTED-CDP-API-KEY-SECRET]
```

---

## 🏗️ Complete System Architecture

### Staking System Components
```
📁 components/staking/
├── StakingCard.tsx          # Main staking interface
├── StakingCardWrapper.tsx   # Wrapper with error handling
└── StakingProgress.tsx      # Progress visualization

📁 app/api/staking/
├── stake/route.ts           # POST /api/staking/stake
├── unstake/route.ts         # POST /api/staking/unstake
└── status/route.ts          # GET /api/staking/status

📁 Database Schema
├── profiles.rair_balance    # Available RAIR tokens
├── profiles.rair_staked     # Staked RAIR tokens
├── staking_transactions     # Transaction history
└── RPC Functions: stake_rair(), unstake_rair(), get_staking_status()
```

### SQL Scripts Inventory
```
📁 scripts/database/
├── MASTER-SUPABASE-SETUP.sql        # Primary setup (831 lines)
├── PRODUCTION-READY-SETUP.sql       # Alternative setup
├── BULLETPROOF-PRODUCTION-SETUP.sql  # Enhanced setup
├── enhanced-database-setup.sql       # Extended features
├── setup-profile-image-storage.sql   # Profile images
├── setup-supabase-database.sql       # Basic setup
└── web3-auth-migration.sql           # Auth migration

📁 scripts/testing/ (19 files)
├── test-auth-flow.js
├── test-complete-user-flow.js
├── test-production-e2e-flow.js
└── [16 other testing scripts]

📁 scripts/production/ (4 files)
├── setup-database.js
├── setup-production-database.js
├── validate-vercel-env.js
└── verify-production-setup.js
```

### Profile Page Integration
```
📁 app/protected/profile/page.tsx
├── SimpleProfileForm        # User profile editing
├── StakingCardWrapper      # Staking functionality
└── ProfileWalletCard       # Wallet integration

Features:
- Real-time staking balance updates
- SuperGuide access gating (≥3000 RAIR staked)
- Transaction history display
- Stake/unstake operations
```

---

## 📋 Pre-Migration Checklist

### 1. ✅ Verify Repository Access
```bash
# Test SSH access to both repositories
ssh -T git@github.com
# Expected: "Hi garrettair! You've successfully authenticated..."

# Verify access to both repos
git ls-remote git@github.com:garrettair/vercel-supabase-web3.git
git ls-remote git@github.com:gitdevdapp/vercel-supabase-web3-start.git
```

### 2. ✅ Redact Documentation Credentials
```bash
cd /Users/garrettair/Documents/vercel-supabase-web3

# Redact credentials in 4 files
# File 1: docs/testing/PRODUCTION-TEST-STEPS.md
# File 2: docs/diagnose/VERIFY-FIX.md  
# File 3: docs/wallet/UPDATE-VERCEL-CDP-CREDENTIALS.md
# File 4: docs/security/SECURITY-INCIDENT-REPORT.md

# Replace with [REDACTED-*] format
git add docs/testing/PRODUCTION-TEST-STEPS.md
git add docs/diagnose/VERIFY-FIX.md
git add docs/wallet/UPDATE-VERCEL-CDP-CREDENTIALS.md
git add docs/security/SECURITY-INCIDENT-REPORT.md
git commit -m "Sanitize documentation: Redact production credentials before public release"
```

### 3. ✅ Verify Credential Redaction
```bash
# Confirm all credentials are redacted
git grep -i "CDP_API_KEY_ID=[REDACTED]" && echo "❌ FAILED" || echo "✅ PASSED"
git grep -i "[REDACTED-CDP-SECRET]" && echo "❌ FAILED" || echo "✅ PASSED"
git grep -i "MIGHAgEAMBMGByqGSM49" && echo "❌ FAILED" || echo "✅ PASSED"

# Confirm no env files are tracked
git ls-files | grep -E "\.env|vercel-env-variables" | wc -l
# Expected: 0
```

### 4. ✅ Verify SuperGuide Exclusion
```bash
# Confirm SuperGuide components exist (will be excluded)
ls -la components/superguide/
# Should show: 3 .tsx files

# Confirm they're tracked in git (will be excluded during copy)
git ls-files | grep -i superguide
# Should show: all 3 files
```

---

## 🚀 Migration Execution Steps

### Step 1: Clone Target Repository
```bash
# Clone the start repository locally
git clone git@github.com:gitdevdapp/vercel-supabase-web3-start.git ~/migration-temp
cd ~/migration-temp

# Verify it's clean or has only starter files
git log --oneline | head -5
```

### Step 2: Copy Source Code (Excluding Proprietary & Credential Files)
```bash
#!/bin/bash
# Complete migration script

SOURCE="/Users/garrettair/Documents/vercel-supabase-web3"
TARGET="~/migration-temp"

echo "🚀 Starting migration from $SOURCE to $TARGET"

# Copy core directories
cp -r $SOURCE/app $TARGET/
cp -r $SOURCE/components $TARGET/
cp -r $SOURCE/lib $TARGET/
cp -r $SOURCE/types $TARGET/
cp -r $SOURCE/public $TARGET/
cp -r $SOURCE/supabase $TARGET/
cp -r $SOURCE/__tests__ $TARGET/
cp -r $SOURCE/scripts $TARGET/

# Copy configuration files
cp $SOURCE/package.json $TARGET/
cp $SOURCE/package-lock.json $TARGET/
cp $SOURCE/tsconfig.json $TARGET/
cp $SOURCE/next.config.ts $TARGET/
cp $SOURCE/tailwind.config.ts $TARGET/
cp $SOURCE/jest.config.js $TARGET/
cp $SOURCE/jest.setup.js $TARGET/
cp $SOURCE/postcss.config.mjs $TARGET/
cp $SOURCE/eslint.config.mjs $TARGET/
cp $SOURCE/components.json $TARGET/
cp $SOURCE/middleware.ts $TARGET/
cp $SOURCE/env-example.txt $TARGET/

# CRITICAL: Exclude SuperGuide components
rm -rf $TARGET/components/superguide
echo "✅ SuperGuide components excluded"

# CRITICAL: Exclude credential files
rm -f $TARGET/vercel-env-variables.txt
rm -f $TARGET/.env.local
rm -f $TARGET/.env.production
echo "✅ Credential files excluded"

# Verify exclusions
[ -d $TARGET/components/superguide ] && echo "❌ SuperGuide found!" || echo "✅ SuperGuide correctly excluded"
[ -f $TARGET/vercel-env-variables.txt ] && echo "❌ Credentials found!" || echo "✅ Credentials correctly excluded"

echo "✅ Migration copy complete"
```

### Step 3: Add & Commit to Target Repository
```bash
cd ~/migration-temp

# Stage all files
git add .

# Create comprehensive commit message
git commit -m "Complete migration from private repository

✅ Migrated complete staking system (RAIR tokens)
✅ Migrated all SQL editor scripts and database setup
✅ Migrated profile page with staking integration
✅ Migrated wallet system (CDP integration)
✅ Migrated authentication system (Supabase)
✅ Migrated all API routes and backend functionality
✅ Migrated all tests and configuration files
✅ Migrated sanitized documentation (credentials redacted)

❌ Excluded SuperGuide components (proprietary)
❌ Excluded credential files (security)
❌ Excluded DevDapp-specific branding

Total files migrated: $(git ls-files | wc -l)
SuperGuide components excluded: 3 files
Credential files excluded: 3 files

See CANONICAL-MIGRATION-GUIDE.md for complete details."

# Verify files
echo "Total files in migration:"
git ls-files | wc -l

echo "Verifying exclusions:"
git ls-files | grep -i "superguide" && echo "❌ SuperGuide found!" || echo "✅ SuperGuide correctly excluded"
git ls-files | grep -E "\.env|vercel-env-variables" && echo "❌ Credentials found!" || echo "✅ Credentials correctly excluded"
```

### Step 4: Push to Remote
```bash
cd ~/migration-temp

# Push to main branch of start repository
git push origin main

# Verify the push
git branch -vv
git log --oneline | head -10
```

### Step 5: Post-Migration Security Audit
```bash
cd ~/migration-temp

echo "=== POST-MIGRATION SECURITY AUDIT ==="

# 1. Search for any remaining credentials
echo "Scanning for exposed credentials..."
git grep -i "CDP_API_KEY_ID=[REDACTED]" && echo "❌ FOUND CREDENTIALS!" || echo "✅ No CDP credentials"
git grep -i "eyJhbGciOiJIUzI1Ni" && echo "❌ FOUND JWT!" || echo "✅ No JWT tokens"
git grep -i "[REDACTED-CDP-SECRET]" && echo "❌ FOUND CDP SECRET!" || echo "✅ No CDP secrets"

# 2. Verify SuperGuide is not included
echo "Verifying SuperGuide exclusion..."
git ls-files | grep -i "superguide" && echo "❌ SUPERGUIDE FOUND!" || echo "✅ SuperGuide correctly excluded"

# 3. Verify env files not committed
echo "Verifying credential files exclusion..."
git ls-files | grep -E "\.env|vercel-env-variables" && echo "❌ ENV FILES FOUND!" || echo "✅ No env files"

# 4. Count files
echo "Total files in public repository:"
git ls-files | wc -l

# 5. Verify staking system
echo "Verifying staking system migration..."
git ls-files | grep -i "staking" | wc -l
echo "Staking files found: $(git ls-files | grep -i staking | wc -l)"

# 6. Verify SQL scripts
echo "Verifying SQL scripts migration..."
git ls-files | grep "\.sql$" | wc -l
echo "SQL files found: $(git ls-files | grep '\.sql$' | wc -l)"

echo "=== AUDIT COMPLETE ==="
```

---

## 📊 Migration Verification Checklist

### ✅ Security Verification
- [ ] No credentials found in public repository
- [ ] No `.env` files in public repository
- [ ] No `vercel-env-variables.txt` in public repository
- [ ] All documentation credentials redacted
- [ ] SuperGuide components NOT in public repository

### ✅ Functionality Verification
- [ ] Staking system components migrated
- [ ] Staking API routes migrated
- [ ] SQL editor scripts migrated
- [ ] Profile page with staking integration migrated
- [ ] Wallet system migrated
- [ ] Authentication system migrated
- [ ] All tests migrated
- [ ] Configuration files migrated

### ✅ Repository Verification
- [ ] Public repository builds successfully
- [ ] All dependencies installed
- [ ] TypeScript compilation successful
- [ ] Tests pass
- [ ] README updated with setup instructions

---

## 🎯 Post-Migration Setup Instructions

### For New Users of the Public Repository

1. **Clone the repository**
   ```bash
   git clone https://github.com/gitdevdapp/vercel-supabase-web3-start.git
   cd vercel-supabase-web3-start
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env-example.txt .env.local
   # Edit .env.local with YOUR credentials from:
   # 1. Supabase: https://supabase.com/dashboard
   # 2. Coinbase CDP: https://portal.cdp.coinbase.com/
   ```

4. **Set up database**
   ```bash
   # Open Supabase Dashboard → SQL Editor
   # Copy and run: scripts/database/MASTER-SUPABASE-SETUP.sql
   ```

5. **Deploy to Vercel**
   ```bash
   # Connect GitHub repository to Vercel
   # Add environment variables in Vercel dashboard
   # Deploy
   ```

---

## 🔒 Security Notes

### For Public Repository
- 🔒 No credentials committed to this public repository
- 🔒 All sensitive files are gitignored
- 🔒 Use `.env.local` for local development (not committed)
- 🔒 Use Vercel dashboard for production environment variables
- 🔒 SuperGuide functionality excluded (proprietary)

### For Private Repository
- 🔒 Continue using .gitignore to protect credentials
- 🔒 Keep vercel-env-variables.txt locally (gitignored)
- 🔒 Review new docs before commits
- 🔒 Use placeholder values in examples

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Build fails after migration**  
A: Ensure all dependencies are installed: `npm install`

**Q: Staking not working**  
A: Verify database setup: Run `MASTER-SUPABASE-SETUP.sql` in Supabase

**Q: Authentication errors**  
A: Check environment variables in `.env.local` and Vercel dashboard

**Q: Wallet integration issues**  
A: Verify CDP credentials and API endpoints

### Getting Help

1. Check this migration guide
2. Review the README.md in the public repository
3. Check Supabase and Vercel documentation
4. Verify environment variable configuration

---

## ✅ Success Criteria

**Migration is successful when:**

- [ ] All 4 documentation files are redacted
- [ ] GitHub authentication works
- [ ] All source code copied to target repository
- [ ] `components/superguide/` NOT in public repository
- [ ] No credentials found in public repository
- [ ] No `.env` files in public repository
- [ ] Staking system fully functional
- [ ] SQL scripts available
- [ ] Profile page with staking integration working
- [ ] All tests pass
- [ ] Repository builds successfully
- [ ] README updated with setup instructions

---

## 🎉 Conclusion

This canonical migration guide provides everything needed to successfully migrate the private repository to a public open-source starter template while maintaining security and functionality.

**Key Points:**
- ✅ Complete staking system migration
- ✅ All SQL scripts included
- ✅ Profile page with staking integration
- ✅ SuperGuide excluded (proprietary)
- ✅ All credentials redacted
- ✅ Homepage preserved as starter template

**Next Steps:**
1. Follow the pre-migration checklist
2. Execute the migration steps
3. Run the post-migration security audit
4. Verify all functionality works
5. Update documentation for new users

**Status:** ✅ **READY FOR EXECUTION**

---

*This document consolidates all migration documentation into a single, comprehensive guide. All other migration documents can be deleted after successful migration.*
