# Collection Slug Generation Strategy

**Date**: October 30, 2025  
**Status**: Production Ready  
**Purpose**: Define URL-safe slug generation for NFT collection marketplace routing

---

## Overview

Collection slugs enable clean, SEO-friendly URLs for NFT collections:
- **Before**: `/collection?address=0x5f5987441329Bb34F728E5da65C9102aECd4124F`
- **After**: `/marketplace/awesome-nft-collection`

---

## Slug Requirements

### Characteristics
- **URL-safe**: Only lowercase letters, numbers, hyphens
- **Unique**: No two collections can have the same slug
- **Readable**: Human-friendly representation of collection name
- **Stable**: Once generated, slugs should not change
- **SEO-friendly**: Contains relevant keywords from collection name

### Format Rules
1. Convert to lowercase
2. Trim leading/trailing whitespace
3. Replace spaces and special characters with hyphens
4. Remove consecutive hyphens
5. Remove leading/trailing hyphens
6. Maximum length: 100 characters
7. Minimum length: 1 character
8. Fallback: "collection" if empty after processing

---

## Slug Generation Algorithm

### PostgreSQL Implementation

```sql
CREATE OR REPLACE FUNCTION generate_collection_slug(p_collection_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- Step 1: Normalize to lowercase and trim
  v_slug := lower(trim(p_collection_name));
  
  -- Step 2: Replace non-alphanumeric characters with hyphens
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  
  -- Step 3: Remove leading/trailing hyphens
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');
  
  -- Step 4: Handle empty result
  IF v_slug = '' OR v_slug IS NULL THEN
    v_slug := 'collection';
  END IF;
  
  -- Step 5: Ensure uniqueness by appending counter
  WHILE EXISTS (SELECT 1 FROM smart_contracts WHERE collection_slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := regexp_replace(v_slug, '-\d+$', '', 'g') || '-' || v_counter;
  END LOOP;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;
```

---

## Slug Generation Examples

### Standard Cases

| Collection Name | Generated Slug |
|----------------|----------------|
| "Awesome NFTs" | `awesome-nfts` |
| "Cool Apes #1" | `cool-apes-1` |
| "My 🚀 Collection" | `my-collection` |
| "Test_NFT-2025" | `test-nft-2025` |
| "   Spaces   " | `spaces` |

### Collision Handling

If "Awesome NFTs" already exists:

| Attempt | Collection Name | Generated Slug |
|---------|----------------|----------------|
| 1st | "Awesome NFTs" | `awesome-nfts` |
| 2nd | "Awesome NFTs" | `awesome-nfts-1` |
| 3rd | "Awesome NFTs" | `awesome-nfts-2` |

### Edge Cases

| Collection Name | Generated Slug | Reason |
|----------------|----------------|--------|
| "" (empty) | `collection` | Fallback for empty input |
| "!!!" | `collection` | Only special chars → fallback |
| "123" | `123` | Numbers are valid |
| "A B C D E F" | `a-b-c-d-e-f` | Multiple spaces → single hyphens |

---

## Integration Points

### 1. Contract Deployment Flow

**When**: During `log_contract_deployment` RPC function call  
**How**: Automatically generate slug from `p_collection_name`

```typescript
// In API: /api/contract/deploy
const deployment = await deployERC721({ name, symbol, maxSupply, mintPrice });

// Database automatically generates slug via RPC function
await supabase.rpc('log_contract_deployment', {
  p_collection_name: name, // "Awesome NFTs"
  // Slug automatically generated: "awesome-nfts"
  ...
});
```

### 2. Manual Slug Override (Future Feature)

Allow users to customize slugs before publishing to marketplace:

```typescript
// API endpoint: POST /api/marketplace/collections/[id]/slug
await supabase
  .from('smart_contracts')
  .update({ 
    collection_slug: customSlug,
    slug_generated_at: new Date().toISOString()
  })
  .eq('id', collectionId);
```

### 3. Slug Lookup for Routing

```typescript
// In Next.js page: app/marketplace/[slug]/page.tsx
const { slug } = params;

const { data: collection } = await supabase
  .from('smart_contracts')
  .select('*')
  .eq('collection_slug', slug)
  .eq('is_public', true)
  .single();
```

---

## Database Schema

### smart_contracts Table Columns

```sql
collection_slug TEXT UNIQUE,           -- URL-safe slug
slug_generated_at TIMESTAMPTZ,         -- When slug was created
collection_name TEXT,                  -- Original name (unchanged)
```

### Indexes

```sql
-- Fast slug lookup for marketplace routing
CREATE INDEX idx_smart_contracts_slug 
  ON smart_contracts(collection_slug);

-- Uniqueness constraint
ALTER TABLE smart_contracts 
  ADD CONSTRAINT unique_collection_slug 
  UNIQUE (collection_slug);
```

---

## URL Structure

### Marketplace Routes

| Route | Purpose | Example |
|-------|---------|---------|
| `/marketplace` | Browse all collections | - |
| `/marketplace/[slug]` | Collection detail page | `/marketplace/awesome-nfts` |
| `/marketplace/[slug]/[tokenId]` | Individual NFT page | `/marketplace/awesome-nfts/42` |

### SEO Benefits

**Clean URLs**:
- ✅ `devdapp.com/marketplace/awesome-nfts`
- ❌ `devdapp.com/marketplace?id=123&address=0x...`

**Search Engine Indexing**:
- Keywords in URL (e.g., "awesome-nfts")
- Human-readable structure
- Shareable links

---

## Slug Validation

### Valid Slug Pattern

```typescript
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isValidSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= 100 &&
    SLUG_PATTERN.test(slug) &&
    !slug.startsWith('-') &&
    !slug.endsWith('-')
  );
}
```

### Frontend Validation (Custom Slug Entry)

```typescript
export function validateCustomSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { valid: false, error: 'Slug cannot be empty' };
  }
  
  if (slug.length > 100) {
    return { valid: false, error: 'Slug too long (max 100 characters)' };
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens allowed' };
  }
  
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with hyphen' };
  }
  
  if (slug.includes('--')) {
    return { valid: false, error: 'Consecutive hyphens not allowed' };
  }
  
  return { valid: true };
}
```

---

## Migration Strategy

### Existing Collections

```sql
-- Generate slugs for all existing collections
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

### New Deployments

Automatically handled in `log_contract_deployment` RPC function.

---

## Testing Checklist

- [ ] Test slug generation with various collection names
- [ ] Verify uniqueness constraint prevents duplicates
- [ ] Test collision handling (append -1, -2, etc)
- [ ] Validate edge cases (empty, special chars, long names)
- [ ] Test marketplace URL routing with slugs
- [ ] Verify SEO-friendly URL structure
- [ ] Test slug lookup performance with indexes
- [ ] Validate slug remains stable after generation

---

## Future Enhancements

### Custom Slug Editor
- Allow collection owners to customize slugs
- Validate custom slugs before saving
- Prevent breaking changes to published collections

### Slug History
- Track slug changes for 301 redirects
- Maintain old URLs for SEO preservation

### Reserved Slugs
- Block common route names: `api`, `admin`, `new`, `create`
- Prevent trademark violations

---

## Success Metrics

**Slug Generation Working When**:
- All new collections automatically get unique slugs
- URLs are clean and readable
- No slug collisions or errors
- Marketplace routing works with slugs
- SEO-friendly structure in place







