# NFT Marketplace Testing Protocol

**Date**: October 30, 2025  
**Status**: QA Ready  
**Purpose**: Define comprehensive testing procedures for marketplace MVP

---

## Overview

This document outlines testing procedures for:
1. Database schema and migrations
2. API endpoints (public and authenticated)
3. UI components and pages
4. Metadata integrity
5. Performance and security

---

## Phase 1: Database Testing

### 1.1 Schema Migration

**Test**: Apply migration SQL to production Supabase

**Steps**:
1. Backup production database
2. Connect to Supabase SQL Editor
3. Run `01-SUPABASE-SCHEMA-MIGRATION.sql`
4. Verify success messages

**Expected Results**:
```
✅ Added column: collection_slug
✅ Added column: collection_description
✅ Added column: collection_image_url
✅ Added column: collection_banner_url
✅ Added column: is_public
✅ Added column: marketplace_enabled
✅ Added column: total_minted
✅ Added column: floor_price_wei
✅ Added column: slug_generated_at
✅ MARKETPLACE COLUMNS: 9 columns found
✅ NFT_TOKENS TABLE: 17 columns found
✅ SLUG FUNCTION: generate_collection_slug created
✅ MIGRATION COMPLETE
```

**Verification Queries**:
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'smart_contracts'
AND column_name IN (
  'collection_slug',
  'is_public',
  'marketplace_enabled'
);

-- Check nft_tokens table
SELECT COUNT(*) FROM nft_tokens;  -- Should return 0 (empty table)

-- Test slug function
SELECT generate_collection_slug('Test Collection');
-- Expected: 'test-collection'
```

**Pass Criteria**:
- [ ] All columns added without errors
- [ ] nft_tokens table created
- [ ] Indexes created successfully
- [ ] Slug function works
- [ ] No existing data corrupted

---

### 1.2 Slug Generation Testing

**Test**: Generate slugs for various collection names

**Test Cases**:
```sql
-- Test 1: Basic name
SELECT generate_collection_slug('Awesome NFTs');
-- Expected: 'awesome-nfts'

-- Test 2: Special characters
SELECT generate_collection_slug('Cool Apes #1!');
-- Expected: 'cool-apes-1'

-- Test 3: Emojis
SELECT generate_collection_slug('My 🚀 Collection');
-- Expected: 'my-collection'

-- Test 4: Long name
SELECT generate_collection_slug('Super Long Collection Name That Exceeds Normal Length');
-- Expected: Valid slug (truncated if needed)

-- Test 5: Empty/null
SELECT generate_collection_slug('');
-- Expected: 'collection'

-- Test 6: Uniqueness (run twice)
SELECT generate_collection_slug('Test Collection');
SELECT generate_collection_slug('Test Collection');
-- Expected: 'test-collection', 'test-collection-1'
```

**Pass Criteria**:
- [ ] Slugs are URL-safe (lowercase, hyphens only)
- [ ] Special characters removed
- [ ] Uniqueness guaranteed
- [ ] Empty input handled gracefully
- [ ] No SQL errors

---

### 1.3 Backfill Existing Collections

**Test**: Generate slugs for existing collections

**Steps**:
```sql
-- Check existing collections without slugs
SELECT id, collection_name, collection_slug
FROM smart_contracts
WHERE collection_slug IS NULL;

-- Run backfill (already in migration)
-- Verify slugs generated
SELECT id, collection_name, collection_slug
FROM smart_contracts
ORDER BY deployed_at DESC;
```

**Pass Criteria**:
- [ ] All collections have unique slugs
- [ ] Slugs match collection names
- [ ] No duplicates
- [ ] No NULL slugs

---

## Phase 2: API Endpoint Testing

### 2.1 Public Marketplace Collections

**Endpoint**: `GET /api/marketplace/collections`

**Test 1: Basic retrieval**
```bash
curl http://localhost:3000/api/marketplace/collections
```

**Expected Response**:
```json
{
  "success": true,
  "collections": [
    {
      "id": "uuid",
      "slug": "test-nft-collection",
      "name": "Test NFT Collection",
      "symbol": "TEST",
      "contractAddress": "0x...",
      "totalMinted": 0,
      "maxSupply": 10000,
      "isPublic": false,
      "marketplaceEnabled": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**Test 2: Pagination**
```bash
curl "http://localhost:3000/api/marketplace/collections?page=2&limit=10"
```

**Test 3: Sorting**
```bash
curl "http://localhost:3000/api/marketplace/collections?sort=popular"
curl "http://localhost:3000/api/marketplace/collections?sort=newest"
```

**Test 4: Search**
```bash
curl "http://localhost:3000/api/marketplace/collections?search=awesome"
```

**Test 5: Filtering**
```bash
curl "http://localhost:3000/api/marketplace/collections?verified=true"
```

**Pass Criteria**:
- [ ] Returns array of collections
- [ ] Pagination works correctly
- [ ] Sorting changes order
- [ ] Search filters results
- [ ] Only public collections returned
- [ ] Response time < 500ms

---

### 2.2 Collection Detail by Slug

**Endpoint**: `GET /api/marketplace/collections/[slug]`

**Test 1: Valid slug**
```bash
curl http://localhost:3000/api/marketplace/collections/test-nft-collection
```

**Expected**: 200 OK with collection details

**Test 2: Invalid slug**
```bash
curl http://localhost:3000/api/marketplace/collections/nonexistent-collection
```

**Expected**: 404 Not Found

**Test 3: Private collection**
```bash
curl http://localhost:3000/api/marketplace/collections/private-collection
```

**Expected**: 404 Not Found (private collections not accessible)

**Pass Criteria**:
- [ ] Valid slugs return correct collection
- [ ] Invalid slugs return 404
- [ ] Private collections not accessible publicly
- [ ] All fields populated correctly

---

### 2.3 NFT Listing

**Endpoint**: `GET /api/marketplace/collections/[slug]/nfts`

**Test 1: Empty collection**
```bash
curl http://localhost:3000/api/marketplace/collections/test-nft-collection/nfts
```

**Expected**: Empty array (no NFTs minted yet)

**Test 2: With NFTs (after minting)**
```bash
# First mint an NFT, then:
curl http://localhost:3000/api/marketplace/collections/test-nft-collection/nfts
```

**Expected**: Array with NFT data

**Test 3: Pagination**
```bash
curl "http://localhost:3000/api/marketplace/collections/test-nft-collection/nfts?page=1&limit=20"
```

**Test 4: Owner filter**
```bash
curl "http://localhost:3000/api/marketplace/collections/test-nft-collection/nfts?owner=0x123..."
```

**Pass Criteria**:
- [ ] Returns NFTs for collection
- [ ] Pagination works
- [ ] Owner filtering works
- [ ] Burned NFTs excluded by default
- [ ] Response time < 500ms

---

### 2.4 Metadata Fetching

**Endpoint**: `POST /api/nft/metadata/fetch`

**Test 1: Valid contract and tokenId**
```bash
curl -X POST http://localhost:3000/api/nft/metadata/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "0x...",
    "tokenId": 0
  }'
```

**Expected**: Fetched metadata or cache hit

**Test 2: Invalid tokenId**
```bash
curl -X POST http://localhost:3000/api/nft/metadata/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "0x...",
    "tokenId": 99999
  }'
```

**Expected**: Error (token doesn't exist)

**Test 3: Cache verification**
```bash
# Call twice, second should be faster
time curl -X POST http://localhost:3000/api/nft/metadata/fetch -d '...'
time curl -X POST http://localhost:3000/api/nft/metadata/fetch -d '...'
```

**Pass Criteria**:
- [ ] Metadata fetches from tokenURI
- [ ] Valid JSON returned
- [ ] Caching works (faster 2nd call)
- [ ] Invalid tokens handled gracefully
- [ ] Error messages clear

---

## Phase 3: UI Testing

### 3.1 Marketplace Landing Page

**URL**: `http://localhost:3000/marketplace`

**Visual Checks**:
- [ ] Page loads without errors
- [ ] Header displays "NFT Marketplace"
- [ ] Search bar present and functional
- [ ] Filter dropdowns work
- [ ] Sort dropdown works
- [ ] Collections display in grid/tile layout
- [ ] Collection tiles show correct data
- [ ] Verified badges show for verified collections
- [ ] Pagination controls visible
- [ ] "Load more" or page numbers work

**Responsive Testing**:
- [ ] Mobile view (< 640px): 1-2 columns
- [ ] Tablet view (640-1024px): 2-3 columns
- [ ] Desktop view (> 1024px): 3-4 columns
- [ ] No horizontal scroll
- [ ] Images scale properly

**Interaction Testing**:
- [ ] Click collection tile → navigates to detail page
- [ ] Search input → filters collections
- [ ] Sort dropdown → changes collection order
- [ ] Pagination → loads next/previous page
- [ ] No JavaScript errors in console

---

### 3.2 Collection Detail Page

**URL**: `http://localhost:3000/marketplace/test-nft-collection`

**Visual Checks**:
- [ ] Banner image displays (or placeholder)
- [ ] Collection logo shows
- [ ] Collection name and symbol display
- [ ] Creator address shown
- [ ] Verified badge if applicable
- [ ] Description text renders
- [ ] Stats card shows supply, price, etc.
- [ ] Contract address link works
- [ ] "View on BaseScan" opens in new tab
- [ ] Mint button visible (if authenticated)

**NFT Gallery**:
- [ ] NFTs display in grid
- [ ] Each NFT shows token ID and owner
- [ ] Click NFT → navigates to detail page
- [ ] Empty state shows if no NFTs minted
- [ ] Loading skeleton shows while fetching
- [ ] Pagination works

**Responsive Testing**:
- [ ] Mobile: Stack layout, smaller images
- [ ] Tablet: 2-3 column grid
- [ ] Desktop: 4-5 column grid
- [ ] Banner image scales correctly
- [ ] Stats card readable on all sizes

---

### 3.3 Individual NFT Page

**URL**: `http://localhost:3000/marketplace/test-nft-collection/0`

**Visual Checks**:
- [ ] Breadcrumbs display correct path
- [ ] NFT image shows (or placeholder)
- [ ] NFT name/title displays
- [ ] Description renders if present
- [ ] Token ID shown
- [ ] Owner address displayed
- [ ] Minter address displayed
- [ ] Mint date formatted correctly
- [ ] Attributes display in grid
- [ ] "View on BaseScan" link works

**Responsive Testing**:
- [ ] Mobile: Stacked layout (image above details)
- [ ] Desktop: Side-by-side (image left, details right)
- [ ] Image maintains aspect ratio
- [ ] All details readable

---

### 3.4 Navigation Testing

**Navigation Bar**:
- [ ] "Marketplace" link in main nav
- [ ] Clicking "Marketplace" → lands on /marketplace
- [ ] Logo/home link → returns to homepage
- [ ] Profile link → goes to user profile
- [ ] Active state shows current page

**Breadcrumbs**:
- [ ] Marketplace → Collection → NFT
- [ ] Each breadcrumb link works
- [ ] Active breadcrumb not clickable

**Back Navigation**:
- [ ] Browser back button works
- [ ] No navigation loops
- [ ] State preserved (scroll position, filters)

---

## Phase 4: Metadata Integrity Testing

### 4.1 Deploy Test Collection with Metadata

**Steps**:
1. Deploy test collection with valid baseURI
2. Create sample metadata JSON files
3. Host at baseURI location
4. Mint test NFT
5. Verify tokenURI returns correct URL

**Sample Metadata File** (`0.json`):
```json
{
  "name": "Test NFT #0",
  "description": "First test NFT",
  "image": "https://example.com/images/0.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Rarity", "value": "Common" }
  ]
}
```

**Verification**:
```bash
# Get tokenURI from contract
cast call <CONTRACT_ADDRESS> "tokenURI(uint256)" 0 --rpc-url https://sepolia.base.org

# Fetch metadata
curl <RETURNED_URI>

# Expected: JSON matching sample above
```

**Pass Criteria**:
- [ ] tokenURI returns valid URL
- [ ] URL is accessible via HTTP
- [ ] JSON is valid and parseable
- [ ] Schema matches ERC721 standard
- [ ] Image URL is valid
- [ ] Attributes array formatted correctly

---

### 4.2 Metadata Fetching & Caching

**Test 1: First fetch (cache miss)**
```bash
time curl -X POST /api/nft/metadata/fetch \
  -d '{"contractAddress":"0x...","tokenId":0}'
```

**Expected**: 
- Fetches from tokenURI
- Stores in database
- Returns metadata
- Response time: ~500-1000ms

**Test 2: Second fetch (cache hit)**
```bash
time curl -X POST /api/nft/metadata/fetch \
  -d '{"contractAddress":"0x...","tokenId":0}'
```

**Expected**:
- Reads from database
- Returns cached metadata
- Response time: ~50-100ms (10x faster)

**Database Verification**:
```sql
SELECT 
  token_id,
  metadata_json,
  metadata_fetched_at,
  name,
  description,
  image_url
FROM nft_tokens
WHERE contract_address = '0x...' AND token_id = 0;
```

**Pass Criteria**:
- [ ] First fetch queries blockchain
- [ ] Metadata cached in database
- [ ] Second fetch uses cache
- [ ] Extracted fields populated
- [ ] Cache significantly faster

---

### 4.3 Schema Validation

**Test**: Validate metadata against ERC721 standard

**Valid Metadata**:
```json
{
  "name": "Test NFT",
  "description": "Description",
  "image": "https://example.com/image.png"
}
```

**Invalid Metadata Examples**:

1. **Missing required field**:
```json
{
  "description": "Missing name field"
}
```
Expected: Validation error

2. **Invalid image URL**:
```json
{
  "name": "Test",
  "description": "Test",
  "image": "not-a-url"
}
```
Expected: Validation error

3. **Invalid attributes format**:
```json
{
  "name": "Test",
  "description": "Test",
  "image": "https://example.com/image.png",
  "attributes": "should be array"
}
```
Expected: Validation error

**Pass Criteria**:
- [ ] Valid metadata passes
- [ ] Missing fields rejected
- [ ] Invalid URLs rejected
- [ ] Type mismatches caught
- [ ] Clear error messages

---

## Phase 5: End-to-End Testing

### 5.1 Complete User Flow

**Scenario**: User deploys collection, mints NFT, views on marketplace

**Steps**:
1. **Deploy Collection**
   - Navigate to /protected/profile
   - Fill deployment form
   - Submit and wait for confirmation
   - Verify contract on BaseScan

2. **Check Database**
   ```sql
   SELECT * FROM smart_contracts 
   WHERE contract_address = '<DEPLOYED_ADDRESS>';
   ```
   - Verify collection_slug generated
   - Verify all metadata fields populated

3. **Enable Marketplace**
   ```sql
   UPDATE smart_contracts
   SET is_public = true, marketplace_enabled = true
   WHERE contract_address = '<DEPLOYED_ADDRESS>';
   ```

4. **Browse Marketplace**
   - Navigate to /marketplace
   - Verify collection appears in grid
   - Click collection tile

5. **View Collection**
   - Verify detail page loads
   - Check all stats display correctly
   - Verify "Mint NFT" button shows

6. **Mint NFT**
   - Click "Mint NFT"
   - Confirm transaction
   - Wait for confirmation

7. **Verify NFT**
   - Refresh collection page
   - Verify NFT appears in gallery
   - Click NFT tile

8. **View NFT Detail**
   - Verify image displays
   - Verify metadata shows
   - Verify owner address correct

**Pass Criteria**:
- [ ] All steps complete without errors
- [ ] Data flows correctly through system
- [ ] UI updates reflect blockchain state
- [ ] No broken links or 404s
- [ ] Performance acceptable throughout

---

### 5.2 SEO Testing

**Test 1: Meta tags**
```bash
curl http://localhost:3000/marketplace | grep -i "meta"
```

**Expected**:
```html
<title>NFT Marketplace | DevDapp</title>
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:image" content="...">
```

**Test 2: Collection page meta**
```bash
curl http://localhost:3000/marketplace/test-nft-collection | grep -i "meta"
```

**Expected**: Collection-specific metadata

**Test 3: Sitemap**
```bash
curl http://localhost:3000/sitemap.xml
```

**Expected**: XML with marketplace URLs

**Pass Criteria**:
- [ ] Title tags present
- [ ] Meta descriptions set
- [ ] OpenGraph tags configured
- [ ] Twitter cards configured
- [ ] Canonical URLs set
- [ ] Sitemap includes marketplace

---

### 5.3 Performance Testing

**Test 1: Page load times**
```bash
# Marketplace landing
time curl -w "@curl-format.txt" http://localhost:3000/marketplace

# Collection detail
time curl -w "@curl-format.txt" http://localhost:3000/marketplace/test-nft-collection
```

**Target**: < 500ms server response

**Test 2: Database query performance**
```sql
EXPLAIN ANALYZE
SELECT * FROM smart_contracts
WHERE is_public = true AND marketplace_enabled = true
ORDER BY deployed_at DESC
LIMIT 20;
```

**Target**: < 50ms query time

**Test 3: Concurrent requests**
```bash
# Use Apache Bench or similar
ab -n 100 -c 10 http://localhost:3000/api/marketplace/collections
```

**Target**: No errors, consistent response times

**Pass Criteria**:
- [ ] Pages load in < 500ms
- [ ] Database queries optimized
- [ ] Indexes utilized
- [ ] No N+1 query problems
- [ ] Handle 10+ concurrent users

---

## Phase 6: Security Testing

### 6.1 Authentication Checks

**Test 1: Public endpoints accessible without auth**
```bash
curl http://localhost:3000/api/marketplace/collections
# Expected: 200 OK (no auth required)
```

**Test 2: Protected endpoints require auth**
```bash
curl -X POST http://localhost:3000/api/marketplace/collections/123/publish
# Expected: 401 Unauthorized
```

**Test 3: Ownership verification**
```bash
# Try to publish someone else's collection
curl -X POST http://localhost:3000/api/marketplace/collections/<OTHER_USER_ID>/publish \
  -H "Authorization: Bearer <YOUR_TOKEN>"
# Expected: 403 Forbidden
```

**Pass Criteria**:
- [ ] Public endpoints accessible
- [ ] Protected endpoints block unauthorized
- [ ] Ownership enforced
- [ ] No privilege escalation

---

### 6.2 Input Validation

**Test SQL injection**:
```bash
curl "http://localhost:3000/api/marketplace/collections?search='; DROP TABLE smart_contracts; --"
```

**Expected**: Escaped/sanitized, no SQL execution

**Test XSS**:
```bash
curl -X POST /api/marketplace/collections/123/publish \
  -d '{"description":"<script>alert(1)</script>"}'
```

**Expected**: HTML escaped on display

**Pass Criteria**:
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] Input validation working
- [ ] Error messages safe

---

## Test Reporting

### Bug Report Template

```markdown
**Bug ID**: BUG-001
**Severity**: High | Medium | Low
**Component**: Database | API | UI
**Summary**: Brief description

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable

**Environment**: localhost | staging | production
```

---

## Success Criteria

**Marketplace MVP Tested and Ready When**:
- ✅ All database migrations applied successfully
- ✅ All API endpoints return correct data
- ✅ All UI pages render without errors
- ✅ Metadata fetching and caching works
- ✅ Performance meets targets (< 500ms)
- ✅ Security tests pass
- ✅ End-to-end flow completes
- ✅ No critical bugs remaining
- ✅ Documentation matches implementation







