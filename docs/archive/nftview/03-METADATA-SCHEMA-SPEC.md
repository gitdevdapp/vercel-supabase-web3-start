# NFT Metadata Schema Specification

**Date**: October 30, 2025  
**Status**: Production Ready  
**Purpose**: Define NFT metadata structure for ERC721 collections on DevDapp marketplace

---

## Overview

NFT metadata follows the **ERC721 Metadata Standard** (EIP-721) and is compatible with OpenSea, Rarible, and other major NFT marketplaces.

---

## Metadata JSON Schema

### Standard Format (OpenSea Compatible)

```json
{
  "name": "NFT #1",
  "description": "First NFT in the Awesome Collection",
  "image": "https://example.com/images/1.png",
  "external_url": "https://devdapp.com/marketplace/awesome-nfts/1",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    },
    {
      "trait_type": "Power",
      "value": 85,
      "display_type": "number"
    },
    {
      "trait_type": "Generation",
      "value": 1,
      "display_type": "number"
    }
  ],
  "background_color": "3B82F6"
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Name of the individual NFT |
| `description` | string | ✅ Yes | Description of the NFT |
| `image` | string (URL) | ✅ Yes | Image URL (HTTPS, IPFS, or Arweave) |
| `external_url` | string (URL) | ❌ No | Link to NFT page on DevDapp |
| `attributes` | array | ❌ No | Traits/properties array |
| `background_color` | string (hex) | ❌ No | 6-char hex color (no #) |
| `animation_url` | string (URL) | ❌ No | Video/audio/3D model URL |
| `youtube_url` | string (URL) | ❌ No | YouTube video link |

---

## Token URI Implementation

### SimpleERC721 Contract

```solidity
// contracts/SimpleERC721.sol
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "Token does not exist");
    return string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"));
}
```

**Example**:
- `baseURI` = `"https://example.com/metadata/"`
- `tokenId` = `42`
- `tokenURI(42)` = `"https://example.com/metadata/42.json"`

### Setting Base URI

```solidity
// Only owner can set baseURI
function setBaseURI(string memory newBaseURI) public onlyOwner {
    baseURI = newBaseURI;
}
```

---

## Metadata Storage Options

### Option 1: Centralized Server (Simple)

**Host metadata on your own server**:
```
https://yourdomain.com/metadata/0.json
https://yourdomain.com/metadata/1.json
https://yourdomain.com/metadata/2.json
```

**Pros**:
- Easy to update metadata
- Fast access
- No blockchain fees

**Cons**:
- Centralized (not decentralized)
- Server downtime affects NFTs
- Trust required

### Option 2: IPFS (Decentralized)

**Use IPFS for immutable metadata**:
```
ipfs://QmYourCIDHere/0.json
ipfs://QmYourCIDHere/1.json
```

**Pros**:
- Decentralized storage
- Immutable metadata
- Industry standard

**Cons**:
- Cannot update metadata
- Pinning service required
- Gateway reliability

### Option 3: Arweave (Permanent Storage)

**Permanent storage on Arweave**:
```
https://arweave.net/transaction-id-0
https://arweave.net/transaction-id-1
```

**Pros**:
- Permanent storage
- One-time payment
- No ongoing costs

**Cons**:
- Initial upload cost
- Cannot update metadata
- Less familiar to users

---

## Metadata Fetching Strategy

### API Endpoint: POST /api/nft/metadata/fetch

**Purpose**: Fetch and cache metadata from tokenURI

**Input**:
```typescript
{
  contractAddress: "0x5f5987441329Bb34F728E5da65C9102aECd4124F",
  tokenId: 42
}
```

**Process**:
1. Query contract for `baseURI` (on-chain read)
2. Construct full URI: `baseURI + tokenId + ".json"`
3. Fetch JSON from URI
4. Validate schema
5. Cache in `nft_tokens` table
6. Extract key fields (name, description, image_url)
7. Return validated metadata

**Output**:
```typescript
{
  success: true,
  metadata: {
    name: "NFT #42",
    description: "...",
    image: "https://...",
    attributes: [...]
  },
  cached: true,
  fetchedAt: "2025-10-30T12:00:00Z"
}
```

---

## Database Schema for Metadata Caching

### nft_tokens Table

```sql
CREATE TABLE nft_tokens (
  id UUID PRIMARY KEY,
  contract_address TEXT NOT NULL,
  token_id BIGINT NOT NULL,
  
  -- Metadata caching
  token_uri TEXT,                    -- Full URI (e.g., ipfs://...)
  metadata_json JSONB,               -- Full metadata object
  metadata_fetched_at TIMESTAMPTZ,   -- Last fetch timestamp
  metadata_fetch_error TEXT,         -- Error message if fetch failed
  
  -- Extracted fields for fast queries
  name TEXT,                         -- NFT name
  description TEXT,                  -- NFT description
  image_url TEXT,                    -- Image URL
  attributes JSONB,                  -- Traits array
  
  -- Ownership
  owner_address TEXT NOT NULL,
  minter_address TEXT NOT NULL,
  
  UNIQUE(contract_address, token_id)
);
```

---

## Metadata Validation

### TypeScript Schema

```typescript
import { z } from 'zod';

const AttributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
  display_type: z.enum(['number', 'boost_percentage', 'boost_number', 'date']).optional(),
  max_value: z.number().optional(),
});

export const NFTMetadataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Image must be valid URL'),
  external_url: z.string().url().optional(),
  animation_url: z.string().url().optional(),
  youtube_url: z.string().url().optional(),
  background_color: z.string().regex(/^[0-9A-Fa-f]{6}$/).optional(),
  attributes: z.array(AttributeSchema).optional(),
});

export type NFTMetadata = z.infer<typeof NFTMetadataSchema>;
```

### Validation Function

```typescript
export async function fetchAndValidateMetadata(
  tokenUri: string
): Promise<{ valid: boolean; metadata?: NFTMetadata; error?: string }> {
  try {
    // Fetch metadata JSON
    const response = await fetch(tokenUri, { 
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const json = await response.json();
    
    // Validate against schema
    const validation = NFTMetadataSchema.safeParse(json);
    
    if (!validation.success) {
      return { 
        valid: false, 
        error: `Invalid schema: ${validation.error.message}` 
      };
    }
    
    return { valid: true, metadata: validation.data };
    
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

---

## Image Requirements

### Recommended Specifications

| Aspect | Specification |
|--------|---------------|
| Format | PNG, JPEG, GIF, SVG, WebP |
| Size | 512x512px to 2048x2048px |
| Aspect Ratio | 1:1 (square) preferred |
| File Size | < 10MB |
| Hosting | HTTPS, IPFS, or Arweave |

### Image URL Formats

**HTTPS**:
```
https://example.com/images/nft-1.png
```

**IPFS**:
```
ipfs://QmYourImageCIDHere
```

**IPFS Gateway** (for browser display):
```
https://ipfs.io/ipfs/QmYourImageCIDHere
https://cloudflare-ipfs.com/ipfs/QmYourImageCIDHere
```

**Arweave**:
```
https://arweave.net/transaction-id
```

---

## Attribute Types

### Standard Attributes

```json
{
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    }
  ]
}
```

### Numeric Attributes

```json
{
  "attributes": [
    {
      "trait_type": "Power",
      "value": 85,
      "display_type": "number",
      "max_value": 100
    }
  ]
}
```

### Percentage Boosts

```json
{
  "attributes": [
    {
      "trait_type": "Speed Boost",
      "value": 15,
      "display_type": "boost_percentage"
    }
  ]
}
```

### Date Attributes

```json
{
  "attributes": [
    {
      "trait_type": "Birthday",
      "value": 1704067200,
      "display_type": "date"
    }
  ]
}
```

---

## Metadata Update Strategy

### For Mutable Collections (Centralized)

**Update metadata files on server**:
1. Update JSON file at tokenURI
2. Invalidate cache in database
3. Refetch metadata

```typescript
// API: POST /api/nft/metadata/refresh
await supabase
  .from('nft_tokens')
  .update({ 
    metadata_fetched_at: null,
    metadata_fetch_error: null 
  })
  .eq('contract_address', contractAddress)
  .eq('token_id', tokenId);
```

### For Immutable Collections (IPFS/Arweave)

**Cannot update metadata** - design carefully before deployment.

---

## Testing Checklist

- [ ] Deploy test collection with valid baseURI
- [ ] Create sample metadata JSON files
- [ ] Mint test NFT (tokenId 0)
- [ ] Call `tokenURI(0)` on contract
- [ ] Fetch metadata from returned URI
- [ ] Validate metadata against schema
- [ ] Cache metadata in database
- [ ] Display NFT in marketplace UI
- [ ] Test image loading (HTTPS, IPFS gateway)
- [ ] Test attribute rendering

---

## Example Metadata Files

### Metadata for NFT #0

**File**: `0.json`
```json
{
  "name": "Genesis NFT",
  "description": "The first NFT in the Awesome Collection",
  "image": "https://example.com/images/genesis.png",
  "external_url": "https://devdapp.com/marketplace/awesome-nfts/0",
  "attributes": [
    { "trait_type": "Generation", "value": "Genesis" },
    { "trait_type": "Rarity", "value": "Legendary" },
    { "trait_type": "Power", "value": 100, "display_type": "number" }
  ]
}
```

### Metadata for NFT #1

**File**: `1.json`
```json
{
  "name": "Common NFT #1",
  "description": "A standard NFT from the collection",
  "image": "https://example.com/images/1.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Rarity", "value": "Common" },
    { "trait_type": "Power", "value": 50, "display_type": "number" }
  ]
}
```

---

## Success Metrics

**Metadata System Working When**:
- `tokenURI()` returns valid URL for all minted NFTs
- Metadata JSON files are accessible
- Schema validation passes for all metadata
- Images display correctly in marketplace
- Attributes render properly
- Cache updates correctly
- Error handling works for invalid metadata







