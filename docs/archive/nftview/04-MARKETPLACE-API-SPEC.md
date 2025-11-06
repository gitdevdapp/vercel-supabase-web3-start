# NFT Marketplace API Specification

**Date**: October 30, 2025  
**Status**: Production Ready  
**Purpose**: Define public API endpoints for browsing and interacting with NFT collections

---

## Overview

The marketplace API provides **public endpoints** (no authentication required) for browsing collections and **authenticated endpoints** for collection management.

---

## Public Endpoints (No Auth Required)

### GET /api/marketplace/collections

**Purpose**: Browse all public NFT collections

**Query Parameters**:
```typescript
{
  page?: number;        // Page number (default: 1)
  limit?: number;       // Results per page (default: 20, max: 100)
  sort?: 'newest' | 'oldest' | 'popular' | 'minted';
  verified?: boolean;   // Filter by verified status
  search?: string;      // Search collection names
}
```

**Response**:
```typescript
{
  success: true,
  collections: [
    {
      id: "uuid",
      slug: "awesome-nfts",
      name: "Awesome NFTs",
      symbol: "ANFT",
      description: "An amazing NFT collection",
      imageUrl: "https://example.com/collection.png",
      bannerUrl: "https://example.com/banner.png",
      contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
      network: "base-sepolia",
      totalMinted: 100,
      maxSupply: 10000,
      mintPrice: "1000000000000000",
      floorPrice: "1000000000000000",
      creatorAddress: "0x467307D37E44db042010c11ed2cFBa4773137640",
      creatorUserId: "uuid",
      isVerified: true,
      deployedAt: "2025-10-30T12:00:00Z"
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 50,
    totalPages: 3,
    hasMore: true
  }
}
```

**Implementation**:
```typescript
// app/api/marketplace/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const sort = searchParams.get('sort') || 'newest';
  const verified = searchParams.get('verified') === 'true';
  const search = searchParams.get('search');
  
  const supabase = await createClient();
  
  let query = supabase
    .from('smart_contracts')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .eq('marketplace_enabled', true)
    .eq('is_active', true);
  
  if (verified) {
    query = query.eq('verified', true);
  }
  
  if (search) {
    query = query.or(`collection_name.ilike.%${search}%,collection_description.ilike.%${search}%`);
  }
  
  // Sorting
  switch (sort) {
    case 'newest':
      query = query.order('deployed_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('deployed_at', { ascending: true });
      break;
    case 'popular':
      query = query.order('total_minted', { ascending: false });
      break;
    case 'minted':
      query = query.order('total_minted', { ascending: false });
      break;
  }
  
  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  const { data: collections, error, count } = await query;
  
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

---

### GET /api/marketplace/collections/[slug]

**Purpose**: Get detailed information about a specific collection

**Response**:
```typescript
{
  success: true,
  collection: {
    id: "uuid",
    slug: "awesome-nfts",
    name: "Awesome NFTs",
    symbol: "ANFT",
    description: "An amazing NFT collection with unique artwork",
    imageUrl: "https://example.com/collection.png",
    bannerUrl: "https://example.com/banner.png",
    contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
    network: "base-sepolia",
    baseURI: "https://example.com/metadata/",
    
    // Supply info
    totalMinted: 100,
    maxSupply: 10000,
    mintPrice: "1000000000000000",
    floorPrice: "1000000000000000",
    
    // Creator info
    creatorAddress: "0x467307D37E44db042010c11ed2cFBa4773137640",
    creatorUserId: "uuid",
    walletAddress: "0x...",
    
    // Status
    isVerified: true,
    isActive: true,
    isPublic: true,
    marketplaceEnabled: true,
    
    // Timestamps
    deployedAt: "2025-10-30T12:00:00Z",
    verifiedAt: "2025-10-30T13:00:00Z",
    
    // On-chain info
    transactionHash: "0x...",
    deploymentBlock: 12345,
    explorerUrl: "https://sepolia.basescan.org/address/0x..."
  }
}
```

**Implementation**:
```typescript
// app/api/marketplace/collections/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const supabase = await createClient();
  
  const { data: collection, error } = await supabase
    .from('smart_contracts')
    .select('*')
    .eq('collection_slug', slug)
    .eq('is_public', true)
    .eq('marketplace_enabled', true)
    .single();
  
  if (error || !collection) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    collection
  });
}
```

---

### GET /api/marketplace/collections/[slug]/nfts

**Purpose**: Get NFTs from a specific collection with pagination

**Query Parameters**:
```typescript
{
  page?: number;           // Page number (default: 1)
  limit?: number;          // Results per page (default: 20)
  owner?: string;          // Filter by owner address
  burned?: boolean;        // Include burned NFTs (default: false)
}
```

**Response**:
```typescript
{
  success: true,
  nfts: [
    {
      id: "uuid",
      contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
      tokenId: 0,
      name: "Awesome NFT #0",
      description: "First NFT in collection",
      imageUrl: "https://example.com/images/0.png",
      tokenUri: "https://example.com/metadata/0.json",
      
      // Ownership
      ownerAddress: "0x123...",
      minterAddress: "0x467...",
      minterUserId: "uuid",
      
      // Metadata
      attributes: [
        { trait_type: "Background", value: "Blue" },
        { trait_type: "Rarity", value: "Common" }
      ],
      metadataJson: { /* full metadata */ },
      metadataFetchedAt: "2025-10-30T12:00:00Z",
      
      // Status
      isBurned: false,
      transferCount: 0,
      
      // Timestamps
      mintedAt: "2025-10-30T11:00:00Z",
      lastTransferAt: null
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasMore: true
  }
}
```

**Implementation**:
```typescript
// app/api/marketplace/collections/[slug]/nfts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const owner = searchParams.get('owner');
  const burned = searchParams.get('burned') === 'true';
  
  const supabase = await createClient();
  
  // Get collection first
  const { data: collection } = await supabase
    .from('smart_contracts')
    .select('contract_address')
    .eq('collection_slug', slug)
    .eq('is_public', true)
    .single();
  
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }
  
  // Query NFTs
  let query = supabase
    .from('nft_tokens')
    .select('*', { count: 'exact' })
    .eq('contract_address', collection.contract_address);
  
  if (!burned) {
    query = query.eq('is_burned', false);
  }
  
  if (owner) {
    query = query.eq('owner_address', owner.toLowerCase());
  }
  
  query = query.order('token_id', { ascending: true });
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  const { data: nfts, error, count } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    success: true,
    nfts: nfts || [],
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

---

## Authenticated Endpoints (Auth Required)

### POST /api/marketplace/collections/[id]/publish

**Purpose**: Publish a private collection to the marketplace

**Authentication**: Required (user must own collection)

**Request**:
```typescript
{
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
}
```

**Response**:
```typescript
{
  success: true,
  message: "Collection published to marketplace",
  collection: {
    id: "uuid",
    slug: "awesome-nfts",
    isPublic: true,
    marketplaceEnabled: true
  }
}
```

**Implementation**:
```typescript
// app/api/marketplace/collections/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  // Verify ownership
  const { data: collection } = await supabase
    .from('smart_contracts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }
  
  // Update collection
  const { data: updated, error } = await supabase
    .from('smart_contracts')
    .update({
      is_public: true,
      marketplace_enabled: true,
      collection_description: body.description || collection.collection_description,
      collection_image_url: body.imageUrl || collection.collection_image_url,
      collection_banner_url: body.bannerUrl || collection.collection_banner_url
    })
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    success: true,
    message: 'Collection published to marketplace',
    collection: updated
  });
}
```

---

### POST /api/nft/metadata/fetch

**Purpose**: Fetch and cache NFT metadata from tokenURI

**Authentication**: Optional (but recommended for rate limiting)

**Request**:
```typescript
{
  contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
  tokenId: 42
}
```

**Response**:
```typescript
{
  success: true,
  metadata: {
    name: "Awesome NFT #42",
    description: "NFT description",
    image: "https://example.com/images/42.png",
    attributes: [...]
  },
  tokenUri: "https://example.com/metadata/42.json",
  cached: true,
  fetchedAt: "2025-10-30T12:00:00Z"
}
```

**Implementation**:
```typescript
// app/api/nft/metadata/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const fetchMetadataSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenId: z.number().int().min(0)
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = fetchMetadataSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error },
      { status: 400 }
    );
  }
  
  const { contractAddress, tokenId } = validation.data;
  const supabase = await createClient();
  
  // Check if already cached
  const { data: cached } = await supabase
    .from('nft_tokens')
    .select('*')
    .eq('contract_address', contractAddress)
    .eq('token_id', tokenId)
    .single();
  
  if (cached && cached.metadata_json) {
    return NextResponse.json({
      success: true,
      metadata: cached.metadata_json,
      tokenUri: cached.token_uri,
      cached: true,
      fetchedAt: cached.metadata_fetched_at
    });
  }
  
  // Get baseURI from contract (would need ethers.js integration)
  // For now, return placeholder
  return NextResponse.json({
    success: false,
    error: 'Metadata fetching not yet implemented'
  }, { status: 501 });
}
```

---

## Error Responses

### Standard Error Format

```typescript
{
  success: false,
  error: "Error message",
  details?: any  // Additional error details
}
```

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 501 | Not Implemented | Feature not ready |

---

## Rate Limiting

### Recommendations

| Endpoint | Rate Limit | Reason |
|----------|------------|--------|
| GET /marketplace/collections | 100 req/min | Public browsing |
| GET /marketplace/collections/[slug] | 60 req/min | Detail page views |
| GET /marketplace/collections/[slug]/nfts | 30 req/min | Heavy query |
| POST /nft/metadata/fetch | 10 req/min | External API calls |

---

## Caching Strategy

### Response Caching

```typescript
// Add cache headers for public endpoints
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ /* data */ });
  
  // Cache for 5 minutes
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  
  return response;
}
```

### Database Query Optimization

- Use indexes for slug, owner, contract lookups
- Cache collection counts
- Paginate large result sets
- Use `select('specific, columns')` not `select('*')`

---

## Testing Checklist

- [ ] Test public collection browsing (no auth)
- [ ] Test collection detail by slug
- [ ] Test NFT listing with pagination
- [ ] Test owner filtering
- [ ] Test search functionality
- [ ] Test publish collection (auth required)
- [ ] Test ownership verification
- [ ] Test error handling (404, 401, 500)
- [ ] Test rate limiting
- [ ] Verify response schemas
- [ ] Test cache headers

---

## Success Metrics

**API Ready When**:
- All endpoints return correct data
- Public access works without authentication
- Authenticated endpoints verify ownership
- Pagination works correctly
- Error handling is robust
- Performance is acceptable (< 500ms response time)
- Cache strategy improves load times







