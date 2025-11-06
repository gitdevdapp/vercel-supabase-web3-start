# NFT Marketplace UI Specification

**Date**: October 30, 2025  
**Status**: Design Ready  
**Purpose**: Define UI components and layouts for public NFT marketplace

---

## Overview

The marketplace UI consists of:
1. **Landing Page** - Browse all collections in tile/grid view
2. **Collection Detail** - View individual collection with NFT gallery
3. **NFT Detail** - Single NFT page with metadata
4. **Components** - Reusable UI elements

---

## Page 1: Marketplace Landing Page

### Route
`/marketplace` or `/app/marketplace/page.tsx`

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ← Home    [Logo]  Marketplace  Profile  [Connect Wallet]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              NFT Marketplace                                │
│         Discover unique digital collectibles                │
│                                                             │
│  [🔍 Search collections...] [Filter ▼] [Sort: Newest ▼]   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Image   │  │  Image   │  │  Image   │  │  Image   │  │
│  │          │  │          │  │          │  │          │  │
│  │ Awesome  │  │  Cool    │  │  Rare    │  │  Super   │  │
│  │   NFTs   │  │  Apes    │  │  Tokens  │  │  Cards   │  │
│  │          │  │          │  │          │  │          │  │
│  │ 100/10k  │  │ 50/500   │  │ 25/100   │  │ 5/50     │  │
│  │ ✓ Verified│ │          │  │ ✓ Verified│ │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   ...    │  │   ...    │  │   ...    │  │   ...    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│              [← Previous]  Page 1 of 3  [Next →]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### MarketplaceHeader
```tsx
// components/marketplace/MarketplaceHeader.tsx
export function MarketplaceHeader() {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        NFT Marketplace
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Discover unique digital collectibles created on DevDapp
      </p>
    </div>
  );
}
```

#### SearchAndFilters
```tsx
// components/marketplace/SearchAndFilters.tsx
export function SearchAndFilters({
  onSearch,
  onFilterChange,
  onSortChange
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search collections..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full"
        />
      </div>
      <Select onValueChange={onFilterChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Collections</SelectItem>
          <SelectItem value="verified">Verified Only</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onSortChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="minted">Most Minted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### CollectionGrid
```tsx
// components/marketplace/CollectionGrid.tsx
export function CollectionGrid({ collections }: CollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No collections found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {collections.map((collection) => (
        <CollectionTile key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
```

#### CollectionTile
```tsx
// components/marketplace/CollectionTile.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CollectionTile({ collection }: CollectionTileProps) {
  const mintedPercent = (collection.totalMinted / collection.maxSupply) * 100;

  return (
    <Link href={`/marketplace/${collection.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-0">
          {/* Collection Image */}
          <div className="aspect-square relative bg-muted">
            {collection.imageUrl ? (
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                fill
                className="object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">🖼️</span>
              </div>
            )}
          </div>

          {/* Collection Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg truncate">
                {collection.name}
              </h3>
              {collection.isVerified && (
                <Badge variant="secondary" className="shrink-0">
                  ✓ Verified
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {collection.symbol}
            </p>

            {/* Mint Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minted</span>
                <span className="font-medium">
                  {collection.totalMinted.toLocaleString()} / {collection.maxSupply.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${mintedPercent}%` }}
                />
              </div>
            </div>

            {/* Floor Price */}
            {collection.floorPrice && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Floor</span>
                <span className="font-medium">
                  {(Number(collection.floorPrice) / 1e18).toFixed(4)} ETH
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## Page 2: Collection Detail Page

### Route
`/marketplace/[slug]` or `/app/marketplace/[slug]/page.tsx`

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ← Marketplace    Awesome NFTs                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              [Banner Image - 1400x400]                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌────┐                                                     │
│  │Logo│  Awesome NFTs (ANFT)                    [Mint NFT] │
│  └────┘  By 0x1234...5678  ✓ Verified on BaseScan         │
│                                                             │
│  This is an amazing collection of unique NFTs with          │
│  incredible artwork and utility...                          │
│                                                             │
│  📊 Stats:                                                  │
│  • Total Supply: 100 / 10,000 minted (1%)                  │
│  • Mint Price: 0.001 ETH                                   │
│  • Floor Price: 0.001 ETH                                  │
│  • Created: Oct 30, 2025                                   │
│  • Network: Base Sepolia                                   │
│  • Contract: 0x5f59...4124F  [View on BaseScan]           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [All NFTs] [Available] [My NFTs]         🔍 [Filter ▼]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │  #0     │  │  #1     │  │  #2     │  │  #3     │      │
│  │ [Image] │  │ [Image] │  │ [Image] │  │ [Image] │      │
│  │         │  │         │  │         │  │         │      │
│  │ Owner   │  │ Owner   │  │ Owner   │  │ Owner   │      │
│  │ 0x123..│  │ 0x456..│  │ 0x789..│  │ 0xabc..│      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                             │
│              [← Previous]  Page 1 of 10  [Next →]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### CollectionBanner
```tsx
// components/marketplace/CollectionBanner.tsx
export function CollectionBanner({ collection }: CollectionBannerProps) {
  return (
    <div className="relative w-full h-64 md:h-96 bg-gradient-to-r from-blue-500 to-purple-600">
      {collection.bannerUrl ? (
        <Image
          src={collection.bannerUrl}
          alt={`${collection.name} banner`}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-6xl opacity-50">🎨</span>
        </div>
      )}
    </div>
  );
}
```

#### CollectionHeader
```tsx
// components/marketplace/CollectionHeader.tsx
export function CollectionHeader({ collection }: CollectionHeaderProps) {
  const explorerUrl = `https://sepolia.basescan.org/address/${collection.contractAddress}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Logo */}
        <div className="w-32 h-32 shrink-0">
          {collection.imageUrl ? (
            <Image
              src={collection.imageUrl}
              alt={collection.name}
              width={128}
              height={128}
              className="rounded-lg border-4 border-background shadow-lg"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <span className="text-5xl">🖼️</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {collection.name} ({collection.symbol})
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>By {collection.creatorAddress.slice(0, 10)}...</span>
                {collection.isVerified && (
                  <Badge variant="secondary">✓ Verified on BaseScan</Badge>
                )}
                <Link href={explorerUrl} target="_blank" className="hover:underline">
                  View Contract →
                </Link>
              </div>
            </div>
            
            <Button size="lg">
              Mint NFT
            </Button>
          </div>

          {collection.description && (
            <p className="text-muted-foreground max-w-3xl">
              {collection.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### CollectionStats
```tsx
// components/marketplace/CollectionStats.tsx
export function CollectionStats({ collection }: CollectionStatsProps) {
  const mintedPercent = (collection.totalMinted / collection.maxSupply) * 100;

  return (
    <div className="container mx-auto px-4 pb-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Collection Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
              <p className="text-2xl font-bold">
                {collection.totalMinted.toLocaleString()} / {collection.maxSupply.toLocaleString()}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${mintedPercent}%` }}
                />
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mint Price</p>
              <p className="text-2xl font-bold">
                {(Number(collection.mintPrice) / 1e18).toFixed(4)} ETH
              </p>
            </div>

            {collection.floorPrice && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Floor Price</p>
                <p className="text-2xl font-bold">
                  {(Number(collection.floorPrice) / 1e18).toFixed(4)} ETH
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="text-lg font-medium">
                {new Date(collection.deployedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### NFTGrid
```tsx
// components/marketplace/NFTGrid.tsx
export function NFTGrid({ nfts }: NFTGridProps) {
  if (nfts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No NFTs minted yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {nfts.map((nft) => (
        <NFTTile key={nft.id} nft={nft} />
      ))}
    </div>
  );
}
```

#### NFTTile
```tsx
// components/marketplace/NFTTile.tsx
export function NFTTile({ nft }: NFTTileProps) {
  return (
    <Link href={`/marketplace/${collection.slug}/${nft.tokenId}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="aspect-square relative bg-muted">
            {nft.imageUrl ? (
              <Image
                src={nft.imageUrl}
                alt={nft.name}
                fill
                className="object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
            )}
          </div>
          <div className="p-3 space-y-1">
            <p className="font-semibold text-sm">#{nft.tokenId}</p>
            <p className="text-xs text-muted-foreground truncate">
              Owner: {nft.ownerAddress.slice(0, 10)}...
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Grid Layouts

| Screen Size | Columns |
|-------------|---------|
| Mobile | 1-2 columns |
| Tablet | 2-3 columns |
| Desktop | 3-4 columns |
| Large Desktop | 4-5 columns |

---

## Color Scheme

Using shadcn/ui theme variables:
- **Primary**: Collection accent color
- **Secondary**: Badges, verified status
- **Muted**: Backgrounds, disabled states
- **Card**: Collection/NFT cards
- **Border**: Card borders, dividers

---

## Loading States

```tsx
export function CollectionTileSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Testing Checklist

- [ ] Marketplace landing page renders
- [ ] Collection tiles display correctly
- [ ] Search functionality works
- [ ] Filters and sorting work
- [ ] Pagination works
- [ ] Collection detail page loads
- [ ] NFT grid displays
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Images load and display
- [ ] Links navigate correctly
- [ ] Loading states show
- [ ] Empty states display
- [ ] Error handling works

---

## Success Metrics

**UI Ready When**:
- All pages render without errors
- Components are responsive
- Images load correctly
- Navigation works smoothly
- Loading states provide feedback
- Empty and error states handled
- Design is polished and professional







