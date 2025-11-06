# 🔧 Immediate Fix: Populate Collection Metadata in Database

**Priority:** 🔴 HIGH  
**Effort:** 5 minutes  
**Files:** 1 to modify  
**Impact:** Collections will be visible in database for UI building  

---

## Problem

When users deploy an NFT collection, the database **only stores the contract address and name**, but **NOT the collection details** like:
- ❌ Collection symbol ("MYNFT")
- ❌ Max supply (10000)
- ❌ Mint price (in wei)

This means the database is missing crucial metadata needed to display collections to users.

---

## Solution

Add 4 additional parameters to the RPC call in the deployment API endpoint.

---

## The Fix

### File to Modify
**Location:** `/app/api/contract/deploy/route.ts`

### Current Code (Lines 97-108)

```typescript
// Log deployment to database
const { error: dbError } = await supabase.rpc('log_contract_deployment', {
  p_user_id: user.id,
  p_wallet_id: wallet.id,
  p_contract_address: deployment.contractAddress,
  p_contract_name: name,
  p_contract_type: 'ERC721',
  p_tx_hash: deployment.transactionHash,
  p_network: 'base-sepolia',
  p_abi: [], // Will be set separately if needed
  p_deployment_block: 0,
  p_platform_api_used: false
});
```

### Fixed Code (Add 4 Parameters)

```typescript
// Log deployment to database
const { error: dbError } = await supabase.rpc('log_contract_deployment', {
  p_user_id: user.id,
  p_wallet_id: wallet.id,
  p_contract_address: deployment.contractAddress,
  p_contract_name: name,
  p_contract_type: 'ERC721',
  p_tx_hash: deployment.transactionHash,
  p_network: 'base-sepolia',
  p_abi: [], // Will be set separately if needed
  p_deployment_block: 0,
  p_platform_api_used: false,
  // ✅ ADD THESE 4 PARAMETERS:
  p_collection_name: name,
  p_collection_symbol: symbol,
  p_max_supply: maxSupply,
  p_mint_price_wei: mintPrice
});
```

---

## What Each Parameter Does

| Parameter | Value | Maps To DB Column | Purpose |
|-----------|-------|------------------|---------|
| `p_collection_name` | `name` | `collection_name` | Display name in UI |
| `p_collection_symbol` | `symbol` | `collection_symbol` | Ticker/symbol display |
| `p_max_supply` | `maxSupply` | `max_supply` | Collection size limit |
| `p_mint_price_wei` | `mintPrice` | `mint_price_wei` | Cost per mint (wei format) |

---

## Implementation Steps

### Step 1: Open the file
```bash
code /app/api/contract/deploy/route.ts
```

### Step 2: Find line 97-108
Look for the `supabase.rpc('log_contract_deployment',` call

### Step 3: Add the 4 parameters
Insert these lines before the closing `});`:

```typescript
  p_collection_name: name,
  p_collection_symbol: symbol,
  p_max_supply: maxSupply,
  p_mint_price_wei: mintPrice
```

### Step 4: Save the file
The file will auto-format with your editor's formatter

### Step 5: Test it
1. Go to https://devdapp.com/protected/profile
2. Deploy a new collection with test data
3. Check database to verify fields are populated

---

## How to Verify It Works

### Method 1: Check Supabase UI
1. Go to https://supabase.com/dashboard
2. Open your project (mjrnzgunexmopvnamggw)
3. Navigate to `smart_contracts` table
4. Find your new deployment
5. Verify these columns have values (not NULL):
   - `collection_name` ✅
   - `collection_symbol` ✅
   - `max_supply` ✅
   - `mint_price_wei` ✅

### Method 2: Run SQL Query
```sql
SELECT 
  contract_name,
  collection_name,
  collection_symbol,
  max_supply,
  mint_price_wei,
  deployed_at
FROM public.smart_contracts
WHERE user_id = 'your-user-id'
  AND contract_type = 'ERC721'
ORDER BY created_at DESC
LIMIT 1;
```

Expected output:
```
contract_name       | collection_name     | collection_symbol | max_supply | mint_price_wei
My Awesome NFTs     | My Awesome NFTs     | MYNFT             | 10000      | 1000000000000000
```

### Method 3: Check API Response
The deploy endpoint already returns this data to the user:
```json
{
  "success": true,
  "contractAddress": "0x...",
  "transactionHash": "0x...",
  "explorerUrl": "https://sepolia.basescan.org/address/0x...",
  "contract": {
    "name": "My Awesome NFTs",          ✅
    "symbol": "MYNFT",                  ✅
    "maxSupply": 10000,                 ✅
    "mintPrice": "1000000000000000",    ✅
    "network": "base-sepolia"
  }
}
```

---

## What Happens After This Fix

### Immediately (Next Deploy)
- ✅ New collections will have complete metadata in database
- ✅ Collections are now queryable by symbol, max_supply, etc.
- ✅ Database is ready for UI features

### Next Phase (Build UI)
With this data in the database, you can now:
1. Create `/api/contract/list` endpoint to fetch collections
2. Build `MyNFTCollectionsCard` component to display them
3. Add to profile page to show user's collections
4. Build collection detail pages
5. Build NFT gallery/management UI

---

## Database Schema Reference

The `smart_contracts` table already has these columns (added by migration):

```sql
collection_name TEXT          -- Collection display name
collection_symbol TEXT        -- Ticker symbol (e.g., "MYNFT")
max_supply INTEGER            -- Maximum NFTs allowed (e.g., 10000)
mint_price_wei TEXT           -- Mint cost in wei (e.g., "1000000000000000")
```

These are in addition to existing columns like `contract_name`, `contract_address`, etc.

---

## RPC Function Reference

The RPC function `log_contract_deployment` accepts these parameters:

```typescript
// In scripts/database/smart-contracts-migration.sql
CREATE OR REPLACE FUNCTION public.log_contract_deployment(
  p_user_id UUID,
  p_wallet_id UUID,
  p_contract_address TEXT,
  p_contract_name TEXT,
  p_contract_type TEXT,
  p_tx_hash TEXT,
  p_network TEXT,
  p_abi JSONB,
  p_deployment_block INTEGER,
  p_platform_api_used BOOLEAN,
  p_collection_name TEXT,              -- ✅ Already supported
  p_collection_symbol TEXT,            -- ✅ Already supported
  p_max_supply INTEGER,                -- ✅ Already supported
  p_mint_price_wei TEXT                -- ✅ Already supported
) RETURNS uuid AS $$
```

The RPC function already handles these parameters! We just need to pass them.

---

## After This Fix: Next Priority

Once verified working, start Phase 2:

### Create Collection List API

**File:** `/app/api/contract/list/route.ts` (NEW)

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: collections, error } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('user_id', user.id)
      .eq('contract_type', 'ERC721')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ collections });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Troubleshooting

### Issue: RPC function doesn't accept new parameters

**Solution:** Check if RPC function needs updating
```sql
-- Verify function signature
SELECT pg_get_functiondef('public.log_contract_deployment'::regprocedure);

-- If needed, update function to accept new params
ALTER FUNCTION public.log_contract_deployment(...) 
  ADD PARAMETER p_collection_name TEXT,
  ADD PARAMETER p_collection_symbol TEXT,
  ADD PARAMETER p_max_supply INTEGER,
  ADD PARAMETER p_mint_price_wei TEXT;
```

### Issue: Database columns are NULL after fix

**Possible causes:**
1. RPC function not updated (see above)
2. Parameters named incorrectly (check spelling)
3. Variable values are wrong type (e.g., maxSupply should be int, not string)

**Debug steps:**
```typescript
// Add console logs before RPC call
console.log('About to call RPC with:');
console.log('  collection_name:', name);
console.log('  collection_symbol:', symbol);
console.log('  max_supply:', maxSupply, 'type:', typeof maxSupply);
console.log('  mint_price_wei:', mintPrice, 'type:', typeof mintPrice);
```

### Issue: TypeScript errors

**Solution:** Check parameter types:
```typescript
p_collection_name: name,         // string ✅
p_collection_symbol: symbol,     // string ✅
p_max_supply: maxSupply,         // number ✅
p_mint_price_wei: mintPrice      // string (BigInt stringified) ✅
```

---

## Success Criteria

After applying this fix:

- ✅ Deploy a new collection
- ✅ Check database table `smart_contracts`
- ✅ Find your collection
- ✅ `collection_name` column has value
- ✅ `collection_symbol` column has value
- ✅ `max_supply` column has value
- ✅ `mint_price_wei` column has value

Once all 4 are populated, you're ready to build the UI!

---

## Time Estimate

- Reading this: 5 minutes
- Applying fix: 2 minutes
- Testing: 5 minutes
- **Total: 10-15 minutes**

---

## Next Documents to Read

1. **After fix verified:** `/docs/erc721/ERC721-DEPLOYMENT-INVESTIGATION-PLAN.md` (Full plan)
2. **For building UI:** Phase 2 section in plan (Collection list component)
3. **For database understanding:** `/scripts/database/smart-contracts-migration.sql`

---

**Status:** Ready to implement  
**Risk:** Very low - just adding parameters  
**Rollback:** Simple - just remove the 4 parameters  
**Dependencies:** None - RPC function already supports these
