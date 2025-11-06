# Next.js Routing Implementation

**Date**: October 30, 2025  
**Status**: Implementation Ready  
**Purpose**: Define Next.js App Router structure for NFT marketplace

---

## Overview

The marketplace uses Next.js 14+ App Router with:
- **Dynamic routes** for collection slugs and token IDs
- **Public pages** (no authentication required)
- **SEO optimization** with metadata
- **Server components** for performance

---

## Route Structure

```
app/
├── marketplace/
│   ├── page.tsx                          # GET /marketplace
│   ├── [slug]/
│   │   ├── page.tsx                      # GET /marketplace/[slug]
│   │   ├── [tokenId]/
│   │   │   └── page.tsx                  # GET /marketplace/[slug]/[tokenId]
│   │   └── loading.tsx
│   ├── loading.tsx
│   └── error.tsx
│
├── api/
│   ├── marketplace/
│   │   └── collections/
│   │       ├── route.ts                  # GET /api/marketplace/collections
│   │       └── [slug]/
│   │           ├── route.ts              # GET /api/marketplace/collections/[slug]
│   │           └── nfts/
│   │               └── route.ts          # GET /api/marketplace/collections/[slug]/nfts
│   └── nft/
│       └── metadata/
│           └── fetch/
│               └── route.ts              # POST /api/nft/metadata/fetch
```

---

## Page Implementation

### 1. Marketplace Landing Page

**File**: `app/marketplace/page.tsx`

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { SearchAndFilters } from '@/components/marketplace/SearchAndFilters';
import { CollectionGrid } from '@/components/marketplace/CollectionGrid';
import { CollectionTileSkeleton } from '@/components/marketplace/CollectionTileSkeleton';

export const metadata: Metadata = {
  title: 'NFT Marketplace | DevDapp',
  description: 'Browse and discover unique NFT collections created on DevDapp',
  openGraph: {
    title: 'NFT Marketplace | DevDapp',
    description: 'Browse and discover unique NFT collections',
    images: ['/images/marketplace-og.png'],
  },
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const sort = searchParams.sort || 'newest';
  const search = searchParams.search;

  // Fetch collections from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections?page=${page}&sort=${sort}${search ? `&search=${search}` : ''}`,
    {
      cache: 'no-store', // Revalidate on each request
      // Or use: next: { revalidate: 300 } for 5-minute cache
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch collections');
  }

  const { collections, pagination } = await response.json();

  return (
    <div className="container mx-auto px-4 py-8">
      <MarketplaceHeader />
      
      <Suspense fallback={<div>Loading filters...</div>}>
        <SearchAndFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CollectionTileSkeleton key={i} />
            ))}
          </div>
        }
      >
        <CollectionGrid collections={collections} />
      </Suspense>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {pagination.page > 1 && (
            <a
              href={`/marketplace?page=${pagination.page - 1}&sort=${sort}`}
              className="px-4 py-2 border rounded hover:bg-muted"
            >
              ← Previous
            </a>
          )}
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.hasMore && (
            <a
              href={`/marketplace?page=${pagination.page + 1}&sort=${sort}`}
              className="px-4 py-2 border rounded hover:bg-muted"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 2. Collection Detail Page

**File**: `app/marketplace/[slug]/page.tsx`

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionBanner } from '@/components/marketplace/CollectionBanner';
import { CollectionHeader } from '@/components/marketplace/CollectionHeader';
import { CollectionStats } from '@/components/marketplace/CollectionStats';
import { NFTGrid } from '@/components/marketplace/NFTGrid';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections/${params.slug}`
  );

  if (!response.ok) {
    return {
      title: 'Collection Not Found',
    };
  }

  const { collection } = await response.json();

  return {
    title: `${collection.name} (${collection.symbol}) | DevDapp Marketplace`,
    description: collection.description || `View ${collection.name} NFT collection`,
    openGraph: {
      title: collection.name,
      description: collection.description,
      images: collection.imageUrl ? [collection.imageUrl] : [],
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; owner?: string };
}) {
  // Fetch collection details
  const collectionResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections/${params.slug}`,
    { cache: 'no-store' }
  );

  if (!collectionResponse.ok) {
    notFound();
  }

  const { collection } = await collectionResponse.json();

  // Fetch NFTs
  const page = parseInt(searchParams.page || '1');
  const owner = searchParams.owner;

  const nftsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections/${params.slug}/nfts?page=${page}${owner ? `&owner=${owner}` : ''}`,
    { cache: 'no-store' }
  );

  const { nfts, pagination } = nftsResponse.ok
    ? await nftsResponse.json()
    : { nfts: [], pagination: { page: 1, totalPages: 0, hasMore: false } };

  return (
    <div>
      <CollectionBanner collection={collection} />
      <CollectionHeader collection={collection} />
      <CollectionStats collection={collection} />

      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading NFTs...</div>}>
          <NFTGrid nfts={nfts} collectionSlug={params.slug} />
        </Suspense>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            {pagination.page > 1 && (
              <a
                href={`/marketplace/${params.slug}?page=${pagination.page - 1}`}
                className="px-4 py-2 border rounded hover:bg-muted"
              >
                ← Previous
              </a>
            )}
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.hasMore && (
              <a
                href={`/marketplace/${params.slug}?page=${pagination.page + 1}`}
                className="px-4 py-2 border rounded hover:bg-muted"
              >
                Next →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 3. Individual NFT Page

**File**: `app/marketplace/[slug]/[tokenId]/page.tsx`

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; tokenId: string };
}): Promise<Metadata> {
  // Fetch NFT metadata
  const collectionResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections/${params.slug}`
  );

  if (!collectionResponse.ok) {
    return { title: 'NFT Not Found' };
  }

  const { collection } = await collectionResponse.json();

  return {
    title: `${collection.name} #${params.tokenId} | DevDapp`,
    description: `View NFT #${params.tokenId} from ${collection.name} collection`,
  };
}

export default async function NFTPage({
  params,
}: {
  params: { slug: string; tokenId: string };
}) {
  // Fetch collection
  const collectionResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections/${params.slug}`
  );

  if (!collectionResponse.ok) {
    notFound();
  }

  const { collection } = await collectionResponse.json();

  // Fetch NFT details
  const nftsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/collections/${params.slug}/nfts`
  );

  const { nfts } = await nftsResponse.json();
  const nft = nfts.find((n: any) => n.tokenId === parseInt(params.tokenId));

  if (!nft) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:underline">
          Marketplace
        </Link>
        {' / '}
        <Link href={`/marketplace/${params.slug}`} className="hover:underline">
          {collection.name}
        </Link>
        {' / '}
        <span>#{params.tokenId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {nft.imageUrl ? (
            <Image
              src={nft.imageUrl}
              alt={nft.name || `NFT #${nft.tokenId}`}
              fill
              className="object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🎨</span>
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {nft.name || `${collection.name} #${nft.tokenId}`}
            </h1>
            <p className="text-muted-foreground">
              From{' '}
              <Link
                href={`/marketplace/${params.slug}`}
                className="hover:underline font-medium"
              >
                {collection.name}
              </Link>
            </p>
          </div>

          {nft.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{nft.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token ID</span>
                <span className="font-medium">#{nft.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-mono text-sm">
                  {nft.ownerAddress.slice(0, 10)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minter</span>
                <span className="font-mono text-sm">
                  {nft.minterAddress.slice(0, 10)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minted</span>
                <span>{new Date(nft.mintedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {nft.attributes && nft.attributes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {nft.attributes.map((attr: any, i: number) => (
                    <div key={i} className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {attr.trait_type}
                      </p>
                      <p className="font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link
                href={`https://sepolia.basescan.org/token/${collection.contractAddress}?a=${nft.tokenId}`}
                target="_blank"
              >
                View on BaseScan →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Navigation Integration

### Update Main Navigation

**File**: `components/navigation/MainNav.tsx`

```typescript
import Link from 'next/link';

export function MainNav() {
  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className="font-bold text-xl">
        DevDapp
      </Link>
      <Link href="/marketplace" className="hover:underline">
        Marketplace
      </Link>
      <Link href="/protected/profile" className="hover:underline">
        Profile
      </Link>
      <Link href="/guide" className="hover:underline">
        Guide
      </Link>
    </nav>
  );
}
```

---

## Loading States

**File**: `app/marketplace/loading.tsx`

```typescript
import { CollectionTileSkeleton } from '@/components/marketplace/CollectionTileSkeleton';

export default function MarketplaceLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-32 mb-8" /> {/* Header skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CollectionTileSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling

**File**: `app/marketplace/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Marketplace error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || 'Failed to load marketplace'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

---

## Not Found Page

**File**: `app/marketplace/[slug]/not-found.tsx`

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CollectionNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Collection Not Found</h1>
      <p className="text-muted-foreground mb-8">
        This collection doesn't exist or has been removed from the marketplace.
      </p>
      <Button asChild>
        <Link href="/marketplace">← Back to Marketplace</Link>
      </Button>
    </div>
  );
}
```

---

## Route Configuration

### Middleware (Optional)

If you need marketplace-specific middleware:

**File**: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add marketplace-specific logic here
  // e.g., analytics, rate limiting, etc.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/marketplace/:path*'],
};
```

---

## SEO Optimization

### Sitemap Generation

**File**: `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devdapp.com';

  // Fetch all public collections
  const response = await fetch(`${baseUrl}/api/marketplace/collections?limit=100`);
  const { collections } = await response.json();

  const collectionUrls = collections.map((collection: any) => ({
    url: `${baseUrl}/marketplace/${collection.slug}`,
    lastModified: new Date(collection.deployedAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...collectionUrls,
  ];
}
```

---

## Testing Checklist

- [ ] `/marketplace` loads and displays collections
- [ ] `/marketplace/[slug]` shows collection details
- [ ] `/marketplace/[slug]/[tokenId]` shows NFT details
- [ ] Navigation links work
- [ ] Breadcrumbs function correctly
- [ ] Loading states display
- [ ] Error states handle gracefully
- [ ] 404 pages show for invalid slugs
- [ ] Pagination works
- [ ] SEO metadata is correct
- [ ] Sitemap generates properly

---

## Success Metrics

**Routing Complete When**:
- All marketplace routes accessible
- Dynamic routing works with slugs
- Navigation is seamless
- SEO metadata is properly configured
- Loading and error states handled
- Breadcrumbs provide context
- Performance is optimized







