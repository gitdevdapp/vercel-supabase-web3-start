# Quick Start Guide: NFT Marketplace Implementation

**Date**: October 30, 2025  
**Purpose**: Step-by-step guide to execute the implementation roadmap  
**Estimated Time**: 2-3 weeks

---

## Start Here: Pre-Implementation Checklist

Before beginning, verify you have:

```bash
✅ Node.js 18+ installed
✅ npm or yarn package manager
✅ Supabase project set up and configured
✅ Base Sepolia testnet wallet connected
✅ ERC721 deployment already working
✅ Access to Supabase SQL editor
✅ Local dev server can run: npm run dev
```

---

## Phase 1: Foundation (Day 1 - 7 hours)

### Step 1.1: Apply Database Schema Migration

**Time**: 3 hours

**What to Do**:
1. Open your Supabase project dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Open file: `/docs/nftview/01-SUPABASE-SCHEMA-MIGRATION.sql`
4. Copy entire SQL file
5. Paste into Supabase SQL editor
6. Click "Run"
7. Verify no errors (should see "✅ Added column" messages)

**Verify Success**:
```sql
-- Run this query in Supabase
SELECT 
  collection_slug,
  collection_description,
  collection_image_url,
  is_public,
  marketplace_enabled
FROM smart_contracts 
LIMIT 1;
```

Should return columns without errors.

**Troubleshooting**:
```sql
-- If columns already exist, that's OK
-- Check what's missing:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'smart_contracts' 
ORDER BY column_name;

-- Verify nft_tokens table exists:
SELECT * FROM nft_tokens LIMIT 1;
```

---

### Step 1.2: Create Slug Generation Function

**Time**: 2 hours

**What to Do**:
1. Open Supabase **SQL Editor** → **New Query**
2. Copy slug function from: `/docs/nftview/02-SLUG-GENERATION-STRATEGY.md`
   - Look for section: "PostgreSQL Implementation"
   - Copy the full `CREATE OR REPLACE FUNCTION generate_collection_slug()` block
3. Paste into SQL editor
4. Run query
5. Verify no errors

**Test the Function**:
```sql
-- Test basic slug generation
SELECT generate_collection_slug('Awesome NFTs');
-- Expected: 'awesome-nfts'

SELECT generate_collection_slug('Cool Apes #1');
-- Expected: 'cool-apes-1'

SELECT generate_collection_slug('!!!');
-- Expected: 'collection' (fallback)

-- Test collision handling
SELECT generate_collection_slug('Awesome NFTs');
-- First time: 'awesome-nfts'
-- Second time: 'awesome-nfts-1'
-- Third time: 'awesome-nfts-2'
```

**Success Criteria**: All tests return expected values

---

### Step 1.3: Update Contract Deployment RPC

**Time**: 2 hours

**What to Do**:
1. Locate the RPC function in Supabase: `log_contract_deployment`
   - In Supabase dashboard → **Database** → **Functions** → Find `log_contract_deployment`
2. Verify it calls `generate_collection_slug()` to auto-generate slug
3. If not, update it to:
   ```sql
   v_slug := generate_collection_slug(p_collection_name);
   UPDATE smart_contracts 
   SET collection_slug = v_slug, slug_generated_at = NOW()
   WHERE id = ...;
   ```

**Verify in Code**:
1. Open: `/app/api/contract/deploy/route.ts`
2. Find: `await supabase.rpc('log_contract_deployment', { ... })`
3. Check that `p_collection_name` is being passed
4. Result: All new contract deployments get auto-generated slugs

**Test**:
1. Deploy a new test contract
2. Check database: Verify `collection_slug` was populated
3. Should not be NULL

**Success Criteria**: New deployments create slugs automatically

---

## Phase 2: UI Components (Day 2-3 - 20 hours)

### Step 2.1: Create Mock Data File

**Time**: 2 hours

**File to Create**: `lib/mock-marketplace-data.ts`

**Template**:
```typescript
// lib/mock-marketplace-data.ts

export const mockCollections = [
  {
    id: "mock-1",
    slug: "awesome-nfts",
    name: "Awesome NFTs",
    symbol: "ANFT",
    description: "Amazing collection of unique digital art created by talented artists",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec642fedbc?w=512&h=512&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1579621970563-ebec642fedbc?w=1400&h=400&fit=crop",
    contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
    network: "base-sepolia",
    totalMinted: 150,
    maxSupply: 10000,
    mintPrice: "1000000000000000", // 0.001 ETH
    floorPrice: "1000000000000000",
    isVerified: true,
    creatorAddress: "0x467307D37E44db042010c11ed2cFBa4773137640",
    deployedAt: "2025-10-30T12:00:00Z"
  },
  {
    id: "mock-2",
    slug: "cool-apes",
    name: "Cool Apes",
    symbol: "APES",
    description: "A collection of cool digital apes",
    imageUrl: "https://images.unsplash.com/photo-1634497696157-00adf3eda7ac?w=512&h=512&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1634497696157-00adf3eda7ac?w=1400&h=400&fit=crop",
    contractAddress: "0xaabbccddee",
    network: "base-sepolia",
    totalMinted: 50,
    maxSupply: 500,
    mintPrice: "2000000000000000", // 0.002 ETH
    floorPrice: "3000000000000000",
    isVerified: false,
    creatorAddress: "0xsomeaddress",
    deployedAt: "2025-10-25T08:00:00Z"
  },
  // Add 3-5 more mock collections
];

export const mockNFTs = [
  {
    id: "mock-nft-1",
    contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
    tokenId: 0,
    name: "Awesome NFT #0",
    description: "First NFT in the collection",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec642fedbc?w=512&h=512&fit=crop",
    tokenUri: "https://example.com/metadata/0.json",
    ownerAddress: "0x123456789abcdef",
    minterAddress: "0x987654321fedcba",
    attributes: [
      { trait_type: "Background", value: "Blue" },
      { trait_type: "Rarity", value: "Common" }
    ],
    isBurned: false,
    mintedAt: "2025-10-30T11:00:00Z"
  },
  // Add 20+ more mock NFTs across collections
];
```

**Success**: File imports without errors: `import { mockCollections, mockNFTs } from "@/lib/mock-marketplace-data"`

---

### Step 2.2: Create Marketplace Landing Page

**Time**: 6 hours

**File to Create**: `app/marketplace/page.tsx`

**Implementation**:
```typescript
// app/marketplace/page.tsx
import { mockCollections } from "@/lib/mock-marketplace-data";
import { CollectionGrid } from "@/components/marketplace/CollectionGrid";
import { SearchAndFilters } from "@/components/marketplace/SearchAndFilters";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";

export default function MarketplacePage() {
  const collections = mockCollections;

  return (
    <div className="container mx-auto px-4 py-8">
      <MarketplaceHeader />
      <SearchAndFilters 
        onSearch={() => {}} 
        onFilterChange={() => {}} 
        onSortChange={() => {}}
      />
      <CollectionGrid collections={collections} />
    </div>
  );
}
```

**Components to Create** (in `components/marketplace/`):

1. **MarketplaceHeader.tsx** - Title + description
2. **SearchAndFilters.tsx** - Search box, filter dropdown, sort dropdown
3. **CollectionGrid.tsx** - Grid layout component
4. **CollectionTile.tsx** - Individual collection card

See `/docs/nftview/05-MARKETPLACE-UI-SPEC.md` for component code.

**Success**: 
- `npm run dev` → Visit `http://localhost:3000/marketplace`
- See grid of collection tiles
- Collections display: image, name, symbol, minted progress, verified badge, floor price

---

### Step 2.3: Create Collection Detail Page

**Time**: 8 hours

**File to Create**: `app/marketplace/[slug]/page.tsx`

**Implementation**:
```typescript
// app/marketplace/[slug]/page.tsx
import { mockCollections, mockNFTs } from "@/lib/mock-marketplace-data";
import { CollectionBanner } from "@/components/marketplace/CollectionBanner";
import { CollectionHeader } from "@/components/marketplace/CollectionHeader";
import { CollectionStats } from "@/components/marketplace/CollectionStats";
import { NFTGrid } from "@/components/marketplace/NFTGrid";

export default function CollectionPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const collection = mockCollections.find(c => c.slug === params.slug);
  
  if (!collection) {
    return <div className="text-center py-16">Collection not found</div>;
  }
  
  const nfts = mockNFTs.filter(n => n.contractAddress === collection.contractAddress);

  return (
    <div>
      <CollectionBanner collection={collection} />
      <CollectionHeader collection={collection} />
      <CollectionStats collection={collection} />
      <NFTGrid nfts={nfts} collection={collection} />
    </div>
  );
}
```

**Components to Create**:

1. **CollectionBanner.tsx** - Hero image/gradient
2. **CollectionHeader.tsx** - Logo, name, creator, mint button
3. **CollectionStats.tsx** - Stats card (supply, price, created)
4. **NFTGrid.tsx** - Grid of NFT tiles
5. **NFTTile.tsx** - Individual NFT card
6. **Pagination.tsx** - Pagination controls

See `/docs/nftview/05-MARKETPLACE-UI-SPEC.md` for detailed code.

**Success**:
- `http://localhost:3000/marketplace/awesome-nfts` loads
- Shows collection detail with banner, header, stats
- NFT grid displays 20+ NFTs with owner addresses
- Invalid slug: `http://localhost:3000/marketplace/invalid` shows "not found"

---

### Step 2.4: Polish & Test Responsive Design

**Time**: 4 hours

**Tasks**:
1. Add loading skeletons (use Skeleton from shadcn/ui)
2. Add empty state messages
3. Test on mobile (use browser dev tools):
   - iPhone 12: 390×844
   - iPad: 768×1024
   - Desktop: 1440×900
4. Verify grid responsive:
   - Mobile: 1-2 columns
   - Tablet: 2-3 columns
   - Desktop: 4 columns

**Responsive Test Command**:
```bash
npm run dev
# Open browser dev tools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Test various screen sizes
```

**Success**: UI looks polished on all screen sizes

---

## Phase 3: API Endpoints (Day 4 - 8 hours)

### Step 3.1: Create API Endpoint Structure

**Time**: 4 hours

**Files to Create**:

1. `app/api/marketplace/collections/route.ts` - GET collections
2. `app/api/marketplace/collections/[slug]/route.ts` - GET collection by slug
3. `app/api/marketplace/collections/[slug]/nfts/route.ts` - GET NFTs

**Template for Each Endpoint**:
```typescript
// app/api/marketplace/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mockCollections } from "@/lib/mock-marketplace-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  
  // Return mock data (will replace with Supabase query in Phase 4)
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return NextResponse.json({
    success: true,
    collections: mockCollections.slice(start, end),
    pagination: {
      page,
      limit,
      total: mockCollections.length,
      totalPages: Math.ceil(mockCollections.length / limit),
      hasMore: end < mockCollections.length
    }
  });
}
```

**Success**: 
- `curl http://localhost:3000/api/marketplace/collections` returns mock data
- All three endpoints respond without errors

---

### Step 3.2: Update Landing Page to Use API

**Time**: 2 hours

**Change in**: `app/marketplace/page.tsx`

**Before**:
```typescript
import { mockCollections } from "@/lib/mock-marketplace-data";
```

**After**:
```typescript
"use client";

import { useEffect, useState } from "react";

export default function MarketplacePage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace/collections")
      .then(res => res.json())
      .then(data => {
        setCollections(data.collections);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // ... same JSX as before
  );
}
```

**Success**: Landing page fetches from API and displays mock data

---

### Step 3.3: Update Collection Detail to Use API

**Time**: 2 hours

**Similar to step 3.2**, change `app/marketplace/[slug]/page.tsx` to fetch from API instead of using mock data directly.

---

## Phase 4: Real Data Integration (Day 6-8 - 16 hours)

### Step 4.1: Connect API to Supabase

**Time**: 4 hours

**Change in**: `app/api/marketplace/collections/route.ts`

**Replace Mock Data**:
```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 100);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: collections, error, count } = await supabase
    .from('smart_contracts')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .eq('marketplace_enabled', true)
    .eq('is_active', true)
    .order('deployed_at', { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    collections: collections || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (count || 0) > page * limit
    }
  });
}
```

**Test**:
```bash
curl http://localhost:3000/api/marketplace/collections
# Should return empty array initially (no public collections yet)
```

---

### Step 4.2: Backfill Existing Collections with Slugs

**Time**: 3 hours

**What to Do**:
1. Supabase SQL Editor → New Query
2. Copy this SQL:
```sql
-- Backfill slugs for existing contracts
DO $$
DECLARE
  v_contract RECORD;
  v_slug TEXT;
BEGIN
  FOR v_contract IN 
    SELECT id, collection_name 
    FROM smart_contracts 
    WHERE collection_slug IS NULL
  LOOP
    v_slug := generate_collection_slug(v_contract.collection_name);
    
    UPDATE smart_contracts
    SET 
      collection_slug = v_slug,
      slug_generated_at = NOW()
    WHERE id = v_contract.id;
  END LOOP;
  
  RAISE NOTICE 'Slug generation complete!';
END $$;
```
3. Run query
4. Verify all contracts now have slugs

**Verify**:
```sql
SELECT collection_name, collection_slug FROM smart_contracts WHERE collection_slug IS NULL;
-- Should return 0 rows
```

---

### Step 4.3: Create Test Collection

**Time**: 2 hours

**What to Do**:
1. Go to your app's deployment/profile page
2. Deploy a new test ERC721 contract:
   - Name: "Test Marketplace Collection"
   - Symbol: "TEST"
   - Max Supply: 100
   - Mint Price: 0.001 ETH
3. After deployment, manually update the contract in database:
```sql
UPDATE smart_contracts
SET 
  is_public = true,
  marketplace_enabled = true,
  collection_description = 'This is a test collection for the marketplace',
  collection_image_url = 'https://images.unsplash.com/photo-1634497696157-00adf3eda7ac?w=512&h=512',
  collection_banner_url = 'https://images.unsplash.com/photo-1634497696157-00adf3eda7ac?w=1400&h=400'
WHERE contract_name = 'Test Marketplace Collection';
```

**Test**:
```bash
curl http://localhost:3000/api/marketplace/collections
# Should now return 1 collection
```

---

### Step 4.4-4.5: Connect Detail Page & NFT Tracking

**Time**: 3 hours + 4 hours

**These require**:
1. Creating `/api/marketplace/collections/[slug]/route.ts` that queries Supabase
2. Updating mint endpoint to log to `nft_tokens` table
3. Creating `/api/marketplace/collections/[slug]/nfts/route.ts`

See `08-IMPLEMENTATION-ROADMAP.md` Phase 4 for detailed instructions.

---

## Phase 5-7: Advanced Features & Testing

Skip for now, focus on getting the above working first.

---

## Verification Checklist

### ✅ Phase 1 Complete
```bash
# Verify in Supabase
SELECT COUNT(*) as column_count FROM information_schema.columns 
WHERE table_name = 'smart_contracts' 
AND column_name IN ('collection_slug', 'is_public', 'marketplace_enabled');
# Should return 3

# Test slug function
SELECT generate_collection_slug('Test Collection');
# Should return 'test-collection'
```

### ✅ Phase 2 Complete
```bash
npm run dev
# Visit: http://localhost:3000/marketplace
# Should see: Grid of mock collections
# Visit: http://localhost:3000/marketplace/awesome-nfts
# Should see: Collection detail with NFT grid
```

### ✅ Phase 3 Complete
```bash
# Test API endpoints
curl http://localhost:3000/api/marketplace/collections
curl http://localhost:3000/api/marketplace/collections/awesome-nfts
curl http://localhost:3000/api/marketplace/collections/awesome-nfts/nfts

# All should return JSON with correct schema
```

### ✅ Phase 4 Complete
```bash
# Deploy test contract
# Then:
curl http://localhost:3000/api/marketplace/collections
# Should return real data from Supabase (1+ collections)

# Visit: http://localhost:3000/marketplace
# Should show: Test collection in real grid
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module @/components/marketplace/..."

**Solution**: Make sure all component files are created in `components/marketplace/` directory before importing them.

```bash
mkdir -p components/marketplace
touch components/marketplace/MarketplaceHeader.tsx
touch components/marketplace/SearchAndFilters.tsx
# etc...
```

### Issue 2: "collection_slug already exists" error

**Solution**: Schema migration already ran. That's OK. Check:
```sql
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'smart_contracts' 
AND column_name = 'collection_slug';
# Should return 1
```

### Issue 3: "No collections showing on marketplace"

**Checklist**:
- [ ] Is collection in `smart_contracts` table?
- [ ] Is `is_public = true`?
- [ ] Is `marketplace_enabled = true`?
- [ ] Is `is_active = true`?
- [ ] Does collection have `collection_slug`?

```sql
SELECT id, collection_name, is_public, marketplace_enabled, is_active, collection_slug 
FROM smart_contracts 
ORDER BY deployed_at DESC 
LIMIT 5;
```

### Issue 4: "404 on /marketplace/[slug]"

**Check**:
- [ ] Slug exists in database?
- [ ] Is public and enabled?
- [ ] Slug in URL matches database exactly?

```sql
SELECT collection_slug FROM smart_contracts WHERE is_public = true;
```

---

## Next Steps After Quick Start

1. **Complete Phase 4** fully (NFT tracking, metadata fetching)
2. **Add Collection Publishing UI** (Phase 5.2)
3. **Implement Search & Filtering** (Phase 5.3)
4. **End-to-End Testing** (Phase 7)

Each phase builds on the previous one. Don't skip ahead.

---

## Support

For detailed implementation, see:
- `08-IMPLEMENTATION-ROADMAP.md` - Full roadmap with all details
- `05-MARKETPLACE-UI-SPEC.md` - UI component specifications
- `04-MARKETPLACE-API-SPEC.md` - API endpoint specifications
- `02-SLUG-GENERATION-STRATEGY.md` - Slug generation details







