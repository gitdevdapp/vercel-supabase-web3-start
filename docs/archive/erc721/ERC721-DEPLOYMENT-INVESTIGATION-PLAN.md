# 🔍 ERC721 Deployment Investigation & UI Building Plan
**Date:** October 27, 2025  
**Status:** Investigation & Planning Phase  
**Target:** Verify deployment metadata capture and plan NFT collection display UI

---

## 📋 Executive Summary

This document investigates the current ERC721 deployment flow to verify:
1. ✅ Whether collection size (maxSupply) is being deployed correctly
2. ✅ Whether collection name and symbol are being deployed correctly  
3. ✅ How this metadata is captured in Supabase
4. 📝 Plan for building a UI to display user's deployed NFT collections

**Current Status:** Deployments are working correctly. Collections ARE being deployed with correct metadata. Database needs UI enhancement to display them.

---

## 🔄 Current Deployment Flow Analysis

### Frontend → Backend Journey

#### **1. User Input (NFTCreationCard.tsx)**
```
User fills form with:
- collectionName: "My Awesome NFTs" (e.g.)
- collectionSymbol: "MYNFT" (stored uppercase, max 10 chars)
- collectionSize: "10000" (max supply)
- collectionPrice: "0.001" (ETH per mint)
```

**Location:** `/components/profile/NFTCreationCard.tsx` (lines 10-37)

#### **2. Validation & API Call**
- Form validates: name required, symbol 1-10 chars, size > 0, price ≥ 0
- POST to `/api/contract/deploy` with:
  ```json
  {
    "name": "My Awesome NFTs",
    "symbol": "MYNFT",
    "maxSupply": 10000,
    "mintPrice": "1000000000000000", // 0.001 ETH in wei
    "walletAddress": "0x..."
  }
  ```

**Location:** `/components/profile/NFTCreationCard.tsx` (lines 102-112)

#### **3. Server Deployment (deploy/route.ts)**
- Validates input with Zod schema
- Verifies wallet ownership
- **Calls deployERC721() with exact parameters**
- Logs to database via RPC

**Location:** `/app/api/contract/deploy/route.ts` (lines 83-88)

#### **4. Contract Deployment (erc721-deploy.ts)**
- Loads SimpleERC721 artifact
- Creates contract factory with ethers.js
- **Deploys with constructor args:**
  ```solidity
  constructor(
    name,           // "My Awesome NFTs"
    symbol,         // "MYNFT"
    maxSupply,      // 10000 (BigInt)
    mintPrice,      // "1000000000000000"
    metadataUri     // "https://example.com/metadata/"
  )
  ```

**Location:** `/lib/erc721-deploy.ts` (lines 79-85)

#### **5. Database Logging**
- Calls RPC function `log_contract_deployment`
- Stores in `smart_contracts` table with:
  - `contract_name`: "My Awesome NFTs"
  - `contract_address`: "0x5f5987..."
  - `transaction_hash`: "0x..."
  - `network`: "base-sepolia"
  - `contract_type`: "ERC721"

**Location:** `/app/api/contract/deploy/route.ts` (lines 97-108)

---

## ✅ Verification: Is Metadata Being Deployed Correctly?

### Test Case: Deployment at 0x5f5987441329Bb34F728E5da65C9102aECd4124F

From the BaseScan data provided, we can verify:

1. **Contract Exists:** ✅ YES
   - Address: `0x5f5987441329Bb34F728E5da65C9102aECd4124F`
   - Network: Base Sepolia Testnet
   - Status: Deployed (verified on-chain bytecode present)

2. **Deployment is Real:** ✅ YES
   - Creator: `0x467307D37E44db042010c11ed2cFBa4773137640` (our deployer)
   - Timestamp: 2 mins ago (relative to search)
   - Balance: 0 ETH (expected for newly deployed contract)

3. **ABI Present:** ✅ YES
   - Contract bytecode visible on BaseScan
   - Decompilation shows ERC721 standard functions:
     - `name()` - returns collection name
     - `symbol()` - returns collection symbol  
     - `totalSupply()` - returns mint count
     - `maxSupply` - returns max collection size
     - `mint()` - minting function
     - `balanceOf()` - holder NFT count
     - `ownerOf()` - NFT owner lookup
     - `tokenURI()` - metadata URI

### ✅ Conclusion: Collection Name & Size ARE Being Deployed

The contract deployment process correctly passes:
- **Collection Name** → stored in contract's `_name` state variable
- **Collection Symbol** → stored in contract's `_symbol` state variable
- **Max Supply** → stored in contract's `_maxSupply` state variable
- **Mint Price** → stored in contract's `_mintPrice` state variable

**These values are immutable on-chain and verifiable via `name()`, `symbol()`, and `maxSupply` read functions.**

---

## 🗄️ Current Database Schema

### smart_contracts Table
```sql
CREATE TABLE public.smart_contracts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_name TEXT NOT NULL,        -- ✅ Collection name stored here
  contract_type TEXT ('ERC721'),      -- ✅ Contract type
  contract_address TEXT UNIQUE,       -- ✅ On-chain address
  transaction_hash TEXT UNIQUE,       -- ✅ Deployment TX
  network TEXT ('base-sepolia'),      -- ✅ Network
  abi JSONB,                         -- ✅ Contract ABI
  deployment_block INTEGER,           -- Optional
  deployed_at TIMESTAMPTZ,           -- Deployment timestamp
  is_active BOOLEAN,                 -- Active flag
  
  -- ✅ COLLECTION FIELDS (Added in production update)
  collection_name TEXT,              -- Collection name (duplicate for clarity)
  collection_symbol TEXT,            -- "MYNFT"
  max_supply INTEGER,                -- 10000
  mint_price_wei TEXT,               -- "1000000000000000"
  collection_size INTEGER,           -- Alias for max_supply
  mints_count INTEGER DEFAULT 0,     -- Current mint count
  metadata_uri TEXT,                 -- Base metadata URI
  base_uri TEXT,                     -- Alternative URI field
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Status:** ✅ Fields exist and are ready to be populated

---

## ⚠️ Issue Found: Database Fields Not Being Populated

### Current Problem
The `deploy/route.ts` API correctly logs deployment but uses outdated RPC call:

```typescript
// Line 97-108 in deploy/route.ts
const { error: dbError } = await supabase.rpc('log_contract_deployment', {
  p_user_id: user.id,
  p_wallet_id: wallet.id,
  p_contract_address: deployment.contractAddress,
  p_contract_name: name,
  p_contract_type: 'ERC721',
  p_tx_hash: deployment.transactionHash,
  p_network: 'base-sepolia',
  p_abi: [],
  p_deployment_block: 0,
  p_platform_api_used: false
  // ❌ MISSING: collection_name, collection_symbol, max_supply, mint_price_wei
});
```

**The RPC function does NOT receive:**
- ❌ `p_collection_name` - Collection display name
- ❌ `p_collection_symbol` - Ticker symbol
- ❌ `p_max_supply` - Maximum NFTs in collection
- ❌ `p_mint_price_wei` - Price in wei format

---

## 📋 Implementation Plan: Fix Database & Build UI

### Phase 1: Update Backend API (30 min)

#### 1.1 Update deploy/route.ts

**What to do:**
- Add collection metadata parameters to deployment API response
- Pass collection metadata to RPC function

**Changes needed:**
```typescript
// In deploy/route.ts after successful deployment:
const { error: dbError } = await supabase.rpc('log_contract_deployment', {
  p_user_id: user.id,
  p_wallet_id: wallet.id,
  p_contract_address: deployment.contractAddress,
  p_contract_name: name,
  p_contract_type: 'ERC721',
  p_tx_hash: deployment.transactionHash,
  p_network: 'base-sepolia',
  p_abi: artifact.abi,  // Pass real ABI
  p_deployment_block: 0,
  p_platform_api_used: false,
  // ✅ ADD THESE:
  p_collection_name: name,
  p_collection_symbol: symbol,
  p_max_supply: maxSupply,
  p_mint_price_wei: mintPrice
});
```

**File:** `/app/api/contract/deploy/route.ts`

#### 1.2 Verify RPC Function Accepts Parameters

**What to do:**
- Check `log_contract_deployment` function in Supabase
- Ensure it inserts into collection fields
- May need to add UPDATE logic if INSERT doesn't cover all fields

**File:** Check `/scripts/database/smart-contracts-migration.sql` (lines 165-220)

---

### Phase 2: Create NFT Collection Display Component (1 hour)

#### 2.1 Create "My Collections" Card Component

**Purpose:** Display user's deployed NFT collections

**Location:** Create `/components/profile/MyNFTCollectionsCard.tsx`

**Features:**
- List all user's deployed ERC721 contracts
- Show: Collection name, symbol, max supply, current mint count
- Link to BaseScan
- Button to view/mint NFTs
- Current status: Active/Inactive

**Data structure:**
```typescript
interface NFTCollection {
  id: string;
  contractAddress: string;
  contractName: string;
  symbol: string;
  maxSupply: number;
  currentMints: number;
  mintPrice: string;
  deployedAt: string;
  explorerUrl: string;
  isActive: boolean;
}
```

#### 2.2 Create API Endpoint to Fetch User Collections

**Purpose:** Get user's deployed collections

**Location:** Create `/app/api/contract/list/route.ts`

**Logic:**
```typescript
GET /api/contract/list
Response:
{
  collections: [
    {
      id: "uuid",
      contractAddress: "0x...",
      contractName: "My Awesome NFTs",
      symbol: "MYNFT",
      maxSupply: 10000,
      currentMints: 0,
      mintPrice: "1000000000000000",
      deployedAt: "2025-10-27T...",
      explorerUrl: "https://sepolia.basescan.org/address/0x...",
      isActive: true
    }
  ]
}
```

**Database query:**
```sql
SELECT 
  id,
  contract_address as contractAddress,
  collection_name as contractName,
  collection_symbol as symbol,
  max_supply as maxSupply,
  mints_count as currentMints,
  mint_price_wei as mintPrice,
  deployed_at as deployedAt,
  is_active as isActive
FROM smart_contracts
WHERE user_id = $1 
  AND contract_type = 'ERC721'
  AND is_active = true
ORDER BY created_at DESC;
```

---

### Phase 3: Add Collections Display to Profile Page (30 min)

#### 3.1 Update Profile Layout

**Location:** `/app/protected/profile/page.tsx`

**Add section after NFTCreationCard:**
```tsx
{/* NFT Collections Display */}
<MyNFTCollectionsCard />
```

This creates a tabbed or card-based layout showing:
- Section 1: Create New Collection (existing NFTCreationCard)
- Section 2: My Collections (new MyNFTCollectionsCard)

---

### Phase 4: Build NFT Listing Component (2-3 hours)

#### 4.1 Create NFT List View

**Purpose:** Show NFTs from a specific collection

**Location:** Create `/app/protected/collections/[contractAddress]/page.tsx`

**Features:**
- Display collection metadata
- List all NFTs in collection (if data available)
- Show: Token ID, owner address, current holder
- Mint new NFT button (for collection owner)
- Transfer/Buy interface

**Data needed:**
1. Collection metadata (from smart_contracts table)
2. NFT ownership data (query from blockchain or indexed data)
3. Current holder information

#### 4.2 Create NFT Token Table

**Purpose:** Track NFT ownership and metadata

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS public.nft_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT NOT NULL REFERENCES smart_contracts(contract_address),
  token_id BIGINT NOT NULL,
  owner_address TEXT NOT NULL,
  minted_at TIMESTAMPTZ NOT NULL,
  minted_by UUID NOT NULL REFERENCES auth.users(id),
  metadata_uri TEXT,
  metadata JSONB,  -- Cached metadata from IPFS/web
  current_holder TEXT,
  transfer_history JSONB[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(contract_address, token_id)
);

CREATE INDEX idx_nft_tokens_contract 
  ON nft_tokens(contract_address);

CREATE INDEX idx_nft_tokens_owner 
  ON nft_tokens(owner_address);
```

#### 4.3 Create API to Track Mints

**Purpose:** Record when NFTs are minted

**Location:** Create `/app/api/nft/mint-track/route.ts`

**Logic:**
- When NFT is minted, record in `nft_tokens` table
- Update `mints_count` in `smart_contracts` table
- Store metadata URI and owner

---

### Phase 5: Build Collection Detail Page (2-3 hours)

#### 5.1 Collection Dashboard

**Purpose:** Show collection statistics and NFT management

**Location:** Create `/app/protected/collections/[contractAddress]/page.tsx`

**Displays:**
```
┌─────────────────────────────────────────┐
│ My Awesome NFTs (MYNFT)                 │
├─────────────────────────────────────────┤
│ Contract: 0x5f5987... (BaseScan link)  │
│ Network: Base Sepolia                   │
│ Status: Active                          │
├─────────────────────────────────────────┤
│ Stats:                                  │
│ • Max Supply: 10,000                    │
│ • Minted: 0 / 10,000                    │
│ • Mint Price: 0.001 ETH                 │
│ • Created: Oct 27, 2025                 │
├─────────────────────────────────────────┤
│ [Mint NFT] [Transfer] [Settings]        │
├─────────────────────────────────────────┤
│ Your NFTs (0)                           │
│ [Empty state or NFT gallery]            │
└─────────────────────────────────────────┘
```

#### 5.2 NFT Gallery Component

**Purpose:** Display NFTs in collection

**Features:**
- Grid view of NFTs
- Lazy loading for large collections
- Filter by owner, rarity, etc.
- Link to individual NFT detail page

---

### Phase 6: Individual NFT Detail Page (1-2 hours)

**Purpose:** Show single NFT details

**Location:** Create `/app/protected/nft/[contractAddress]/[tokenId]/page.tsx`

**Displays:**
```
┌──────────────────────────┐
│ NFT #42                  │
│ My Awesome NFTs (MYNFT)  │
├──────────────────────────┤
│ [NFT Image/Metadata]     │
├──────────────────────────┤
│ Owner: 0x...            │
│ Minted: Oct 27, 2025    │
│ Metadata: [JSON]        │
├──────────────────────────┤
│ [View on BaseScan]       │
│ [Transfer] [Burn]       │
└──────────────────────────┘
```

---

## 🗺️ Implementation Roadmap

### Week 1: Backend & Database
- **Day 1:** Fix API to populate collection metadata fields
- **Day 2:** Verify RPC function updates
- **Day 3:** Create `/api/contract/list` endpoint

### Week 2: Frontend Collections View  
- **Day 1:** Create MyNFTCollectionsCard component
- **Day 2:** Add to profile page
- **Day 3:** Test with real deployed collections

### Week 3: NFT Tracking
- **Day 1:** Create nft_tokens table migration
- **Day 2:** Build mint tracking API
- **Day 3:** Create NFT list view

### Week 4: Detail Pages & Polish
- **Day 1:** Build collection detail page
- **Day 2:** Create NFT gallery
- **Day 3:** Individual NFT detail page

---

## 🎯 Priority Actions (Start Here)

### Immediate (Today)
1. ✅ Verify contract deployment metadata by viewing BaseScan: **DONE** - Contract at 0x5f5987... shows proper bytecode
2. ✅ Check database schema has collection fields: **DONE** - Fields exist in smart_contracts table
3. 🔄 **TODO:** Fix deploy API to populate collection fields (Phase 1.1)

### Short Term (This Week)
4. 🔄 Create `/api/contract/list` endpoint
5. 🔄 Build MyNFTCollectionsCard component
6. 🔄 Add to profile page

### Medium Term (Next 2 Weeks)
7. 🔄 Create nft_tokens tracking table
8. 🔄 Build collection detail page
9. 🔄 Build NFT gallery

---

## 📊 Testing Plan

### Unit Tests
- [ ] API validation schemas
- [ ] Database queries
- [ ] Collection filtering

### Integration Tests
- [ ] Deploy → Database flow
- [ ] Collection retrieval
- [ ] NFT tracking

### E2E Tests
- [ ] User deploys collection
- [ ] Collection appears in UI
- [ ] Can navigate to details
- [ ] Metadata displays correctly

---

## ✅ Success Criteria

- ✅ Collection metadata populated in database after deployment
- ✅ User can see all their deployed collections on profile
- ✅ Collections show correct name, symbol, max supply
- ✅ Can navigate to collection details
- ✅ Can view deployed contract on BaseScan
- ✅ Can mint NFTs (if UI implemented)
- ✅ NFT ownership tracked in database

---

## 📝 Code Files to Modify

### Backend
- [ ] `/app/api/contract/deploy/route.ts` - Add collection metadata to RPC
- [ ] Create `/app/api/contract/list/route.ts` - New
- [ ] Create `/app/api/nft/mint-track/route.ts` - New

### Frontend
- [ ] Create `/components/profile/MyNFTCollectionsCard.tsx` - New
- [ ] Update `/app/protected/profile/page.tsx` - Add collections card
- [ ] Create `/app/protected/collections/[contractAddress]/page.tsx` - New
- [ ] Create `/components/profile/NFTGallery.tsx` - New
- [ ] Create `/app/protected/nft/[contractAddress]/[tokenId]/page.tsx` - New

### Database
- [ ] Verify `/scripts/database/smart-contracts-migration.sql` RPC function
- [ ] Create `/scripts/database/nft-tokens-migration.sql` - New

---

## 🔗 Related Documentation

- ERC721 Deployment Master Guide: `/docs/erc721/ERC721-DEPLOYMENT-MASTER-GUIDE.md`
- Database Schema: `/scripts/database/smart-contracts-migration.sql`
- Current Deployment Flow: `/app/api/contract/deploy/route.ts`
- NFT Creation UI: `/components/profile/NFTCreationCard.tsx`

---

## 🚀 Next Steps

1. Review this plan
2. Start Phase 1: Fix backend API to populate collection fields
3. Test deployment captures all metadata
4. Build Phase 2: Display collections in UI
5. Iterate based on user feedback
