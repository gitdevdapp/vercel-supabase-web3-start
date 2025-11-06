/**
 * Mock NFT Data Generator
 * 
 * Generates realistic mock NFT data for marketplace demonstrations
 * All data is deterministic (same seed = same output) for reproducibility
 */

interface MockNFT {
  token_id: string;
  name: string;
  description: string;
  image: string;
  owner_address: string;
  minted_at: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

interface MockCollection {
  collection_slug: string;
  collection_name: string;
  collection_symbol: string;
  collection_description: string;
  collection_image_url: string;
  collection_banner_url: string;
  collection_banner_gradient?: { colors: string[]; angle: number };
  contract_address?: string;
  total_minted: number;
  max_supply: number;
  mint_price_wei: string;
  verified?: boolean;
  nfts: MockNFT[];
}

/**
 * Generate a deterministic pseudo-random number based on seed
 * Using simple hash function for consistency
 */
function seededRandom(seed: string, index: number): number {
  const input = `${seed}${index}`;
  let hash = 0;
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash) % 1000 / 1000;
}

/**
 * Generate a fake but realistic-looking Ethereum address
 */
function generateFakeAddress(seed: string): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  
  for (let i = 0; i < 40; i++) {
    const index = Math.floor(seededRandom(seed, i) * chars.length);
    address += chars[index];
  }
  
  return address;
}

/**
 * Get a consistent placeholder image URL for an NFT
 */
export function getMockImageUrl(collectionName: string, tokenId: string): string {
  // Use colors based on collection name hash
  const colorIndex = Math.abs(
    collectionName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  ) % 10;
  
  const colors = [
    'FF6B6B', // Red
    '4ECDC4', // Teal
    '45B7D1', // Blue
    'FFA07A', // Light Salmon
    '98D8C8', // Mint
    'F7DC6F', // Yellow
    'BB8FCE', // Purple
    '85C1E2', // Light Blue
    'F8B88B', // Peach
    '82E0AA'  // Green
  ];
  
  const color = colors[colorIndex];
  return `https://via.placeholder.com/400x400?bg=${color}&text=NFT%20${tokenId}`;
}

/**
 * Get a deterministic banner gradient for a collection
 * Same collection name always returns the same gradient
 */
export function getMockBannerGradient(collectionName: string): { colors: string[]; angle: number } {
  const gradients = [
    { colors: ['#667EEA', '#764BA2', '#F093FB', '#4158D0'], angle: 45 },
    { colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'], angle: 135 },
    { colors: ['#4FB3D9', '#87CEEB', '#E0F6FF'], angle: 90 },
    { colors: ['#FF9A56', '#FF6A88', '#CE5A57'], angle: 225 },
    { colors: ['#A8EDEA', '#FED6E3', '#FF9FF3'], angle: 180 },
    { colors: ['#FF5733', '#C70039', '#900C3F'], angle: 315 },
    { colors: ['#5F27CD', '#00D2D3', '#30336B'], angle: 60 },
    { colors: ['#50C878', '#90EE90', '#3CB371'], angle: 150 },
    { colors: ['#9B59B6', '#8E44AD', '#6C3483'], angle: 270 },
    { colors: ['#006994', '#0099CC', '#0FBDFF'], angle: 45 },
    { colors: ['#FF4500', '#FF8C00', '#FFA500'], angle: 120 },
    { colors: ['#2E8B57', '#3CB371', '#90EE90'], angle: 225 },
    { colors: ['#483D8B', '#6A5ACD', '#9370DB'], angle: 90 },
    { colors: ['#DC143C', '#FF1493', '#FF69B4'], angle: 180 },
    { colors: ['#20B2AA', '#48D1CC', '#AFEEEE'], angle: 315 },
    { colors: ['#FFD700', '#FFA500', '#FF8C00'], angle: 60 },
    { colors: ['#C44569', '#F8B500', '#FFC300'], angle: 150 },
    { colors: ['#FA8BFF', '#2BD2FF', '#2BFF88'], angle: 270 },
    { colors: ['#FF6348', '#FFA502', '#FFD32A'], angle: 45 },
    { colors: ['#A8EDEA', '#FED6E3', '#FF9FF3'], angle: 90 }
  ];
  
  // Use hash of collection name to deterministically select gradient
  const hash = Math.abs(
    collectionName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  );
  const gradientIndex = hash % gradients.length;
  return gradients[gradientIndex];
}

/**
 * Trait options for mock NFTs
 */
const TRAITS = {
  rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
  color: ['Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver'],
  type: ['Type A', 'Type B', 'Type C', 'Type D'],
  level: ['1', '2', '3', '4', '5']
};

/**
 * Generate mock traits for an NFT
 */
function generateTraits(seed: string): Array<{ trait_type: string; value: string }> {
  const traits = [];
  
  traits.push({
    trait_type: 'Rarity',
    value: TRAITS.rarity[Math.floor(seededRandom(seed, 0) * TRAITS.rarity.length)]
  });
  
  traits.push({
    trait_type: 'Color',
    value: TRAITS.color[Math.floor(seededRandom(seed, 1) * TRAITS.color.length)]
  });
  
  traits.push({
    trait_type: 'Type',
    value: TRAITS.type[Math.floor(seededRandom(seed, 2) * TRAITS.type.length)]
  });
  
  traits.push({
    trait_type: 'Level',
    value: TRAITS.level[Math.floor(seededRandom(seed, 3) * TRAITS.level.length)]
  });
  
  return traits;
}

/**
 * Generate a single mock NFT
 */
export function generateMockNFT(
  tokenId: string,
  collectionName: string,
  collectionSlug: string
): MockNFT {
  const seed = `${collectionSlug}-${tokenId}`;
  
  // Generate deterministic mint date (within last 90 days)
  const daysAgo = Math.floor(seededRandom(seed, 100) * 90);
  const mintDate = new Date();
  mintDate.setDate(mintDate.getDate() - daysAgo);
  
  return {
    token_id: tokenId,
    name: `${collectionName} #${tokenId}`,
    description: `A unique digital asset from the ${collectionName} collection. This NFT represents a one-of-a-kind item with specific attributes.`,
    image: getMockImageUrl(collectionName, tokenId),
    owner_address: generateFakeAddress(seed),
    minted_at: mintDate.toISOString(),
    attributes: generateTraits(seed)
  };
}

/**
 * Generate multiple mock NFTs for a collection
 */
export function generateMockNFTs(
  count: number,
  collectionName: string,
  collectionSlug: string
): MockNFT[] {
  const nfts: MockNFT[] = [];
  
  for (let i = 1; i <= count; i++) {
    nfts.push(generateMockNFT(i.toString(), collectionName, collectionSlug));
  }
  
  return nfts;
}

/**
 * Generate a complete mock collection with NFTs
 */
export function generateMockCollection(
  collectionName: string,
  collectionSlug: string,
  symbol: string,
  maxSupply: number = 10000,
  mintPriceWei: string = '0'
): MockCollection {
  const nftCount = Math.min(8, maxSupply); // Show up to 8 mock NFTs
  const totalMinted = Math.floor((seededRandom(collectionSlug, 0) * maxSupply) * 0.3) + 1;
  
  return {
    collection_slug: collectionSlug,
    collection_name: collectionName,
    collection_symbol: symbol,
    collection_description: `A curated collection of digital art and collectibles. Each NFT in this collection is unique and represents a one-of-a-kind digital asset with special traits and characteristics.`,
    collection_image_url: getMockImageUrl(collectionName, '0'),
    collection_banner_url: '', // Removed: was `https://via.placeholder.com/1200x300?bg=4ECDC4&text=${encodeURIComponent(collectionName)}` - let gradients from database show instead
    collection_banner_gradient: getMockBannerGradient(collectionName),
    contract_address: generateFakeAddress(collectionSlug),
    total_minted: Math.min(totalMinted, maxSupply),
    max_supply: maxSupply,
    mint_price_wei: mintPriceWei,
    nfts: generateMockNFTs(nftCount, collectionName, collectionSlug)
  };
}

/**
 * Generate mock collections for marketplace landing page
 */
export function generateMockMarketplaceCollections(count: number = 6) {
  const sampleNames = [
    'Cyber Apes',
    'Pixel Dreams',
    'Mystic Realms',
    'Digital Canvas',
    'NFT Genesis',
    'Blockchain Gems',
    'Virtual Worlds',
    'Quantum Art'
  ];
  
  const collections = [];
  
  for (let i = 0; i < Math.min(count, sampleNames.length); i++) {
    const name = sampleNames[i];
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const symbol = name.split(' ').map(w => w[0]).join('');
    
    collections.push(
      generateMockCollection(
        name,
        slug,
        symbol,
        Math.floor(Math.random() * 5000) + 1000,
        '100000000000000000' // 0.1 ETH in Wei
      )
    );
  }
  
  return collections;
}

export default {
  generateMockNFT,
  generateMockNFTs,
  generateMockCollection,
  generateMockMarketplaceCollections,
  getMockImageUrl
};

