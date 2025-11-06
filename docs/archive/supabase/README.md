# Supabase Documentation

## 🚀 Single Source of Truth

**All Supabase documentation has been consolidated into a single canonical guide.**

📖 **[SUPABASE-CANONICAL-GUIDE.md](SUPABASE-CANONICAL-GUIDE.md)** - Complete reference for schema, migration, and API integration

## Quick Start

1. **For Migration:** Follow the Complete Migration Procedure in the canonical guide
2. **For Schema Reference:** Use the All Tables & Columns section
3. **For API Integration:** Reference the API Routes Reference section
4. **For Verification:** Use Supabase CLI verification commands

## Migration Scripts

**Location:** `scripts/master/`
- `00-foundation.sql` - Core infrastructure (profiles, wallets, transactions)
- `01-smart-contracts.sql` - NFT collections and marketplace
- `02-nft-system.sql` - NFT tokens, staking, and Web3 auth

**Total Migration Time:** 15-20 minutes

## Verification

Run verification queries and use Supabase CLI to confirm migration success:

```bash
# Install and setup CLI
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Verify migration state
supabase db inspect schema
supabase db inspect functions
supabase db inspect policies
```

---

**📖 [Read the Complete Guide →](SUPABASE-CANONICAL-GUIDE.md)**