# NFT Marketplace Implementation Roadmap

**Date**: October 30, 2025  
**Status**: Execution Ready  
**Purpose**: Optimal implementation sequence prioritizing UI-first validation with mock data, then real Supabase integration

---

## Critical Analysis of Doc 07 Recommendations

**Current Order (Doc 07)**:
1. Database Schema (PRIORITY 1)
2. Slug Generation (PRIORITY 1)
3. Metadata System (PRIORITY 2)
4. Public APIs (PRIORITY 2)
5. UI Components (PRIORITY 3)
6. Routing (PRIORITY 3)
7. Testing (PRIORITY 4)

**Problem**: This is backend-first, requiring multiple iterations before seeing working UI.

**New Strategy**: **UI-First with Mock Data → Real Data Integration**
- Build and validate UI components immediately with mock data
- Ensures visual/UX correctness before complex backend logic
- Reduces risk of rebuilding UI components later
- Allows parallel work on backend while UI is validated

---

## Phase 1: Foundation & Infrastructure Setup

### Step 1.1: Database Schema Migration (3 hours)
**Priority**: CRITICAL - Foundational  
**Must Do Before**: Everything else  

**Tasks**:
1. Review `01-SUPABASE-SCHEMA-MIGRATION.sql` requirements
2. Verify existing `smart_contracts` table structure
3. Add marketplace columns:
   - `collection_slug` (UNIQUE, indexed)
   - `collection_description`
   - `collection_image_url`
   - `collection_banner_url`
   - `is_public` (default: false)
   - `marketplace_enabled` (default: false)
   - `total_minted` (default: 0)
   - `floor_price_wei`
   - `slug_generated_at`
   - `wallet_address`
4. Create `nft_tokens` table with structure from doc 01
5. Create indexes:
   - `idx_smart_contracts_slug` - Fast slug lookup
   - `idx_smart_contracts_public` - Marketplace visibility
   - `idx_nft_tokens_contract` - Contract NFT queries
   - `idx_nft_tokens_owner` - Owner queries

**Success**: `psql` query returns all new columns without errors

---

### Step 1.2: Slug Generation Function (2 hours)
**Priority**: CRITICAL - Foundational  
**Must Do Before**: Backfill and API implementation  

**Tasks**:
1. Create PostgreSQL function `generate_collection_slug()`
2. Implement from `02-SLUG-GENERATION-STRATEGY.md`
3. Test with examples:
   - "Awesome NFTs" → "awesome-nfts" ✅
   - "Cool Apes #1" → "cool-apes-1" ✅
   - "!!!" → "collection" (fallback) ✅
   - Collision handling with counter append ✅

**Success**: Function runs without errors, produces expected slugs

---

### Step 1.3: Update Log Contract Deployment RPC (2 hours)
**Priority**: HIGH - Integrates with existing flow  
**Must Do Before**: Real contract deployments  

**Tasks**:
1. Locate: `/app/api/contract/deploy/route.ts`
2. Find existing call to `log_contract_deployment` RPC
3. Verify RPC function in Supabase automatically generates slug
4. Add `wallet_address` parameter to RPC call
5. Test deployment flow still works

**Success**: New contract deployment includes auto-generated slug

---

## Phase 2: UI Components with Mock Data

### Step 2.1: Create Mock Data Generator (2 hours)
**Priority**: HIGH - Unblocks UI development  
**Must Do Before**: UI component work  

**File**: `lib/mock-marketplace-data.ts`

**Mock Data Structure**:
```typescript
// Mock collections (5-10 sample collections)
const mockCollections = [
  {
    id: "mock-1",
    slug: "awesome-nfts",
    name: "Awesome NFTs",
    symbol: "ANFT",
    description: "Amazing collection of unique digital art...",
    imageUrl: "https://placehold.co/512x512?text=Awesome+NFTs",
    bannerUrl: "https://placehold.co/1400x400?text=Awesome+NFTs+Banner",
    contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
    network: "base-sepolia",
    totalMinted: 150,
    maxSupply: 10000,
    mintPrice: "1000000000000000", // 0.001 ETH in wei
    floorPrice: "1000000000000000",
    isVerified: true,
    deployedAt: "2025-10-30T12:00:00Z"
  },
  // ... more collections
]

// Mock NFTs for each collection
const mockNFTs = [
  {
    id: "mock-nft-1",
    contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
    tokenId: 0,
    name: "Awesome NFT #0",
    description: "First NFT in the collection",
    imageUrl: "https://placehold.co/512x512?text=NFT+0",
    tokenUri: "https://example.com/metadata/0.json",
    ownerAddress: "0x123456789abcdef",
    minterAddress: "0x987654321fedcba",
    attributes: [],
    isBurned: false,
    mintedAt: "2025-10-30T11:00:00Z"
  },
  // ... more NFTs
]
```

**Success**: Mock data exported and can be imported in components

---

### Step 2.2: Create Marketplace Landing Page (6 hours)
**Priority**: HIGH - Core user experience  
**File**: `/app/marketplace/page.tsx`  
**Use**: Mock data only (no database calls yet)

**Components to Build**:
1. **MarketplaceHeader** - Title, description
2. **SearchAndFilters** - Search input, filter dropdowns
3. **CollectionGrid** - Grid layout for collection tiles
4. **CollectionTile** - Individual collection card with:
   - Collection image
   - Name, symbol
   - Minted progress bar
   - Verified badge
   - Floor price
   - Responsive design

**Key Implementation Details**:
```typescript
// app/marketplace/page.tsx
import { mockCollections } from "@/lib/mock-marketplace-data";

export default function MarketplacePage() {
  // Start with all mock collections (no filtering yet)
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
      <Pagination 
        page={1} 
        totalPages={1} 
        onPageChange={() => {}}
      />
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Page loads without errors
- ✅ 5-10 collection tiles display in responsive grid
- ✅ Collections are clickable (links to `/marketplace/[slug]` - will 404 for now)
- ✅ Design matches UI spec from doc 05
- ✅ Responsive on mobile/tablet/desktop
- ✅ Images load or show placeholder emoji
- ✅ Progress bars, badges, pricing display correctly

---

### Step 2.3: Create Collection Detail Page (8 hours)
**Priority**: HIGH - Core user experience  
**File**: `/app/marketplace/[slug]/page.tsx`  
**Use**: Mock data with slug parameter matching

**Components to Build**:
1. **CollectionBanner** - Hero image/gradient
2. **CollectionHeader** - Logo, title, creator info, mint button
3. **CollectionStats** - Supply, price, created date stats card
4. **NFTGrid** - Grid of NFT tiles
5. **NFTTile** - Individual NFT card with token ID and owner
6. **Pagination** - For NFT listing

**Key Implementation Details**:
```typescript
// app/marketplace/[slug]/page.tsx
import { mockCollections, mockNFTs } from "@/lib/mock-marketplace-data";

export default function CollectionPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Find matching collection by slug
  const collection = mockCollections.find(c => c.slug === params.slug);
  
  if (!collection) {
    return <div>Collection not found</div>;
  }
  
  // Find NFTs for this collection
  const nfts = mockNFTs.filter(
    n => n.contractAddress === collection.contractAddress
  );

  return (
    <div>
      <CollectionBanner collection={collection} />
      <CollectionHeader collection={collection} />
      <CollectionStats collection={collection} />
      <NFTGrid nfts={nfts} collection={collection} />
      <Pagination page={1} totalPages={1} />
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Page loads with specific collection data
- ✅ URLs like `/marketplace/awesome-nfts` work
- ✅ Invalid slugs show 404
- ✅ All sections render (banner, header, stats, NFTs)
- ✅ Stats display correct numbers from mock data
- ✅ NFT grid shows 20+ mock NFTs with pagination
- ✅ Mint button is visible (not functional yet)
- ✅ Links to BaseScan work (external)
- ✅ Design matches UI spec

---

### Step 2.4: Polish UI & Responsive Design (4 hours)
**Priority**: MEDIUM - UX refinement  

**Tasks**:
1. Add loading skeletons (from doc 05)
2. Add empty state messages
3. Test responsive design on mobile/tablet/desktop
4. Add hover effects and transitions
5. Verify color scheme uses shadcn/ui theme correctly
6. Add dark mode support if needed
7. Create reusable UI components in `/components/marketplace/`

**Files to Create**:
- `components/marketplace/MarketplaceHeader.tsx`
- `components/marketplace/SearchAndFilters.tsx`
- `components/marketplace/CollectionGrid.tsx`
- `components/marketplace/CollectionTile.tsx`
- `components/marketplace/CollectionBanner.tsx`
- `components/marketplace/CollectionHeader.tsx`
- `components/marketplace/CollectionStats.tsx`
- `components/marketplace/NFTGrid.tsx`
- `components/marketplace/NFTTile.tsx`
- `components/marketplace/Pagination.tsx`

**Success**: UI looks polished and matches design spec

---

## Phase 3: API Endpoints with Mock Data

### Step 3.1: Create API Endpoint Structure (4 hours)
**Priority**: HIGH - Enables real data integration  
**Use**: Return mock data initially (no database calls)

**Endpoints to Create**:

#### GET `/api/marketplace/collections`
```typescript
// app/api/marketplace/collections/route.ts
// Returns paginated mock collections
// Query params: page, limit, sort, verified, search (ignored in mock phase)
```

#### GET `/api/marketplace/collections/[slug]`
```typescript
// app/api/marketplace/collections/[slug]/route.ts
// Returns single mock collection by slug
```

#### GET `/api/marketplace/collections/[slug]/nfts`
```typescript
// app/api/marketplace/collections/[slug]/nfts/route.ts
// Returns mock NFTs for collection with pagination
```

**Success**: All endpoints return mock data with correct schema

---

### Step 3.2: Update Landing Page to Use API (2 hours)
**Priority**: MEDIUM - Validation layer  

**Tasks**:
1. Replace mock data import with API call
2. Use `useEffect` with loading/error states
3. Implement search, filter, sort handling
4. Update pagination to work with API

**Result**: Landing page now fetches from API but still using mock data

---

### Step 3.3: Update Collection Detail to Use API (2 hours)
**Priority**: MEDIUM - Validation layer  

**Tasks**:
1. Replace mock data with API calls to `/api/marketplace/collections/[slug]`
2. Fetch NFTs from `/api/marketplace/collections/[slug]/nfts`
3. Handle loading/error states
4. Implement NFT pagination

**Result**: Collection detail page now fetches from API but still using mock data

---

## Phase 4: Real Data Integration

### Step 4.1: Connect API to Supabase (4 hours)
**Priority**: HIGH - Real data begins flowing  

**File**: `app/api/marketplace/collections/route.ts`

**Implementation**:
```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const sort = searchParams.get('sort') || 'newest';
  
  const supabase = await createClient();
  
  let query = supabase
    .from('smart_contracts')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .eq('marketplace_enabled', true)
    .eq('is_active', true);
  
  // Add sorting, filtering, pagination
  // See doc 04 for full implementation
  
  const { data, error, count } = await query;
  
  return NextResponse.json({
    success: true,
    collections: data || [],
    pagination: { /* ... */ }
  });
}
```

**Acceptance Criteria**:
- ✅ API queries Supabase smart_contracts table
- ✅ Filters by `is_public=true` and `marketplace_enabled=true`
- ✅ Returns data in expected schema
- ✅ Pagination works
- ✅ Sorting works (newest, oldest, popular)
- ✅ Currently returns empty array if no public collections (expected)

---

### Step 4.2: Backfill Existing Collections (3 hours)
**Priority**: HIGH - Makes real data available  

**Tasks**:
1. Query all existing contracts from `smart_contracts` table
2. Generate slugs for those without them
3. Update `is_public=false` and `marketplace_enabled=false` by default
4. Verify no slug collisions

**SQL**:
```sql
-- Generate slugs for existing contracts
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
END $$;
```

**Acceptance Criteria**:
- ✅ All existing contracts now have slugs
- ✅ No slug collisions
- ✅ Slugs are unique and stable

---

### Step 4.3: Create Test Collection for Marketplace (2 hours)
**Priority**: HIGH - Enables end-to-end testing  

**Tasks**:
1. Deploy test ERC721 contract to Base Sepolia
2. Store contract address
3. Update smart_contracts record with:
   - `is_public=true`
   - `marketplace_enabled=true`
   - `collection_description` and images
4. Mint 5-10 NFTs to the test collection
5. Log each mint to `nft_tokens` table

**Result**: At least one public collection visible on `/marketplace`

---

### Step 4.4: Connect Collection Detail to Real Data (3 hours)
**Priority**: HIGH - Real data on detail page  

**File**: `app/api/marketplace/collections/[slug]/route.ts`

**Tasks**:
1. Query `smart_contracts` by `collection_slug`
2. Verify `is_public=true` before returning
3. Return full collection data from database

**Result**: `/marketplace/[slug]` now shows real collection data

---

### Step 4.5: Implement NFT Token Tracking (4 hours)
**Priority**: HIGH - NFTs display correctly  

**File**: `app/api/marketplace/collections/[slug]/nfts/route.ts`

**Tasks**:
1. Query `nft_tokens` table by `contract_address`
2. Join with collection info
3. Implement pagination
4. Handle filters (owner, burned status)

**Issue to Resolve**: NFTs currently not logged to `nft_tokens` during mint
- Need to update `/app/api/contract/mint/route.ts` to:
  1. After successful mint, insert into `nft_tokens` table
  2. Include: tokenId, owner, minter, metadata URL
  3. Use contract's tokenURI to fetch metadata (if available)

**Result**: Real NFTs display on collection detail page

---

## Phase 5: Metadata & Advanced Features

### Step 5.1: Implement Metadata Fetching (6 hours)
**Priority**: MEDIUM - Better NFT display  

**File**: `app/api/nft/metadata/fetch/route.ts`

**Tasks**:
1. Accept `contractAddress` and `tokenId`
2. Get contract's `baseURI` from smart_contracts table
3. Construct tokenURI: `baseURI + tokenId + ".json"`
4. Fetch metadata JSON from URL
5. Validate against ERC721 metadata standard
6. Cache in `nft_tokens.metadata_json`
7. Store fetch timestamp in `metadata_fetched_at`

**Challenge**: Currently `baseURI` is hardcoded to `https://example.com/metadata/`
- Need to make baseURI configurable during deployment
- Update deployment form to allow custom baseURI
- Store in smart_contracts.base_uri column

**Result**: NFT metadata (name, description, image, attributes) displays on marketplace

---

### Step 5.2: Add Collection Publishing UI (3 hours)
**Priority**: MEDIUM - User controls visibility  

**File**: Update `/app/protected/profile/page.tsx`

**Tasks**:
1. In `DeployedContractsCard`, add "Publish to Marketplace" button
2. Show publish modal with:
   - Collection description field
   - Collection image URL
   - Collection banner URL
3. Call `POST /api/marketplace/collections/[id]/publish`
4. Update smart_contracts record with:
   - `is_public=true`
   - `marketplace_enabled=true`
   - Collection metadata

**Result**: Users can make collections public from profile page

---

### Step 5.3: Search & Filtering (3 hours)
**Priority**: MEDIUM - Better discovery  

**Tasks**:
1. Implement search in API (`ILIKE` for partial matches)
2. Implement filters (verified only, min/max supply)
3. Update SearchAndFilters component
4. Test with real data

**Result**: Users can search and filter collections

---

## Phase 6: Marketplace Publishing Workflow

### Step 6.1: User Deploys Contract (Already Works)
**Tasks**:
1. User submits NFT creation form
2. API deploys ERC721 contract to Base Sepolia
3. Contract stored in smart_contracts table
4. Slug auto-generated
5. Collection is **private** by default

---

### Step 6.2: User Mints NFTs (Need to Update)
**Tasks**:
1. User calls mint endpoint
2. Contract executes mint on-chain
3. **NEW**: Log to `nft_tokens` table
4. **NEW**: Update `smart_contracts.total_minted`
5. **NEW**: Update `smart_contracts.floor_price_wei`

---

### Step 6.3: User Publishes to Marketplace (New)
**Tasks**:
1. User goes to profile page
2. Clicks "Publish" on collection
3. Modal appears for collection metadata
4. User adds: description, image URL, banner URL
5. User clicks "Publish"
6. Collection becomes visible on `/marketplace`

---

### Step 6.4: Public Browses Marketplace (Already Works)
**Tasks**:
1. Public visits `/marketplace`
2. Sees published collections in grid
3. Clicks collection to view detail page
4. Sees NFTs minted in collection
5. (Future) Buys/bids on NFTs

---

## Phase 7: Testing & Validation

### Step 7.1: End-to-End Marketplace Flow Test (4 hours)
**Priority**: HIGH - Validate entire system  

**Test Sequence**:
1. ✅ Deploy new test collection
2. ✅ Verify slug generated correctly
3. ✅ Collection private by default (not on `/marketplace`)
4. ✅ User publishes collection with metadata
5. ✅ Collection appears on `/marketplace`
6. ✅ Click collection → detail page loads
7. ✅ Mint test NFT
8. ✅ NFT appears in collection grid
9. ✅ Click NFT tile (future: detail page)
10. ✅ Metadata fetches and displays
11. ✅ Search finds collection
12. ✅ Filter/sort work

---

### Step 7.2: Performance Testing (2 hours)
**Priority**: MEDIUM - Ensure scalability  

**Tests**:
1. Page load time < 500ms with 100+ collections
2. NFT grid load time < 1s with 1000+ NFTs
3. Search response time < 200ms
4. Verify indexes are being used

---

### Step 7.3: Security & Error Handling (2 hours)
**Priority**: MEDIUM - Stability  

**Tests**:
1. Invalid slug returns 404
2. Private collections return 404
3. Malformed API requests return 400
4. Rate limiting works on public endpoints
5. No SQL injection vulnerabilities

---

## Implementation Timeline

### Week 1
- **Phase 1**: Database schema (3h) + Slug function (2h) + RPC update (2h) = 7h
- **Phase 2**: Mock data (2h) + Landing page (6h) + Detail page (8h) + Polish (4h) = 20h
- **Total**: ~27 hours = 3-4 days of solid work

### Week 2
- **Phase 3**: API endpoints structure (4h) + Update landing (2h) + Update detail (2h) = 8h
- **Phase 4**: Connect to Supabase (4h) + Backfill (3h) + Test collection (2h) + Detail API (3h) + NFT tracking (4h) = 16h
- **Total**: ~24 hours = 3 days of solid work

### Week 3
- **Phase 5**: Metadata (6h) + Publishing UI (3h) + Search (3h) = 12h
- **Phase 6**: (Already works - validation only) = 2h
- **Phase 7**: E2E testing (4h) + Performance (2h) + Security (2h) = 8h
- **Total**: ~22 hours = 3 days of solid work

**Overall**: 2-3 weeks of dedicated implementation

---

## Risk Mitigation

### Risk 1: Mock Data Doesn't Match Real Schema
**Mitigation**:
- Create mock data based on exact Supabase schema
- Document all fields in mock-marketplace-data.ts
- Validate mock data structure in tests

### Risk 2: API Changes Break UI Components
**Mitigation**:
- Use TypeScript interfaces to define expected API response
- Create error boundaries for API errors
- Test API contracts before integration

### Risk 3: Performance Issues at Scale
**Mitigation**:
- Add proper indexes during Phase 1
- Implement pagination from the start
- Cache frequently accessed data
- Monitor query performance

### Risk 4: Metadata Hosting Infrastructure Missing
**Mitigation**:
- Plan for this in Phase 5
- Options: IPFS, Arweave, or centralized storage
- Start with placeholder URLs for testing
- Document metadata structure clearly

### Risk 5: User Experience Confusion (Private by Default)
**Mitigation**:
- Show clear "Publishing" workflow in profile
- Add tooltips explaining public/private
- Show examples of published collections
- Create docs for users

---

## Success Criteria (Checkpoint)

### After Phase 2 (UI Complete)
- ✅ `/marketplace` renders perfectly with mock data
- ✅ `/marketplace/[slug]` routes work
- ✅ UI is responsive and matches spec
- ✅ All components are reusable and well-organized

### After Phase 4 (Real Data Integration)
- ✅ At least 1 public collection visible on marketplace
- ✅ NFTs display in collection detail
- ✅ API endpoints query Supabase correctly
- ✅ Slug generation works for all existing contracts

### After Phase 7 (Full MVP)
- ✅ Complete end-to-end user flow works
- ✅ Performance acceptable under load
- ✅ Error handling robust
- ✅ Marketplace fully functional

---

## Key Differences from Doc 07 Recommendation

| Doc 07 Order | This Roadmap | Why? |
|--------------|--------------|------|
| Schema first | Schema first | ✅ Same (foundational) |
| Slug generation next | Slug generation next | ✅ Same (foundational) |
| Metadata system | Mock data + API structure | 🔄 Reordered - don't need metadata until real data exists |
| Public APIs | API stubs with mock data | 🔄 Build structure now, integrate later |
| UI Components | UI Components (phase 2!) | ⬆️ **Moved up to phase 2** - validate UX early |
| Routing | Routing (phase 2!) | ⬆️ **Moved up** - included with UI |
| Testing | E2E only at end | 🔄 Moved to phase 7 - after integration complete |

**Key Insight**: By building UI with mock data first, we:
1. ✅ Validate design decisions early
2. ✅ Avoid rebuilding components later
3. ✅ Get visual feedback immediately
4. ✅ Catch UX problems before backend is final
5. ✅ Enable parallel development (UI team vs backend team)

---

## Quick Start Commands

```bash
# Phase 1: Database setup
# 1. Copy 01-SUPABASE-SCHEMA-MIGRATION.sql to Supabase SQL editor
# 2. Execute the migration
# 3. Verify: SELECT * FROM smart_contracts LIMIT 1;

# Phase 2: Create mock data file
# cp lib/mock-marketplace-data.ts.template lib/mock-marketplace-data.ts

# Phase 2: Create UI components
# mkdir -p components/marketplace
# Create each component file listed in Step 2.4

# Test local dev
npm run dev
# Visit http://localhost:3000/marketplace
# Should see mock data with full UI
```

---

## Open Questions / Follow-ups

1. **Metadata Storage**: Where will metadata JSONs be hosted?
   - Decision needed for Phase 5
   - Options: IPFS, Arweave, S3, Vercel Blob Storage

2. **Image Hosting**: How will collection/NFT images be uploaded?
   - Decision needed for Phase 6
   - Options: User provides URL, upload to Vercel, S3

3. **Secondary Market**: Will marketplace include trading?
   - Decision affects Phase 6+
   - Requires escrow smart contract

4. **Creator Royalties**: Will collection creators earn from secondary sales?
   - Decision affects metadata and contract architecture

5. **Collection Verification**: Manual or automated?
   - How do users prove they own a collection?






