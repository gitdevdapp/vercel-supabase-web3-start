'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface Gradient {
  colors: string[];
  angle: number;
}

interface NFTTileProps {
  nft: {
    token_id: number | string;
    name?: string;
    description?: string;
    image_url?: string;
    owner_address?: string;
    minted_at?: string;
    attributes?: NFTAttribute[];
  };
  collectionName: string;
  gradient?: Gradient;
  onClick?: () => void;
}

export function NFTTile({
  nft,
  collectionName,
  gradient,
  onClick
}: NFTTileProps) {
  const {
    token_id,
    name,
    image_url,
    owner_address,
    minted_at,
    attributes = []
  } = nft;

  // Get main trait for badge display
  const rarityTrait = attributes.find(a => a.trait_type === 'Rarity');

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'epic':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'rare':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'uncommon':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Build CSS gradient from database JSON or use default
  const getGradientStyle = (): string => {
    if (!gradient || !gradient.colors || gradient.colors.length === 0) {
      // Fallback default gradient
      return 'linear-gradient(135deg, #cfe9f3, #e5f0f7)';
    }
    const angle = gradient.angle || 135;
    const colors = gradient.colors.join(', ');
    return `linear-gradient(${angle}deg, ${colors})`;
  };

  // Format timestamp - simple built-in formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  // Abbreviate address for display
  const abbreviateAddress = (address?: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const baseScanTx = owner_address 
    ? `https://sepolia.basescan.org/address/${owner_address}`
    : null;

  return (
    <div onClick={onClick} className="cursor-pointer group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
        <CardContent className="p-0 flex flex-col h-full">
          {/* NFT Image with Database-Driven Gradient - Square Aspect */}
          <div
            className="relative w-full aspect-square overflow-hidden"
            style={{ backgroundImage: getGradientStyle() }}
          >
            {image_url && (
              <Image
                src={image_url}
                alt={name || `Token #${token_id}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 20vw"
                onError={(e) => {
                  // Hide image on error, gradient shows through as fallback
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            
            {/* Token ID Badge - Large and Bold */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-3xl font-bold">TOKEN #{token_id}</span>
            </div>

            {/* Rarity Badge */}
            {rarityTrait && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className={`${getRarityColor(rarityTrait.value)} text-white`}>
                  {rarityTrait.value}
                </Badge>
              </div>
            )}
          </div>

          {/* NFT Info */}
          <div className="flex-1 p-4 flex flex-col gap-3">
            {/* Token ID Display */}
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-muted-foreground">
                Token #{token_id}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Mint Date */}
            {minted_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-base">📅</span>
                <span>Minted {formatDate(minted_at)}</span>
              </div>
            )}

            {/* Owner Address */}
            {owner_address && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-base">👤</span>
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">
                  {abbreviateAddress(owner_address)}
                </code>
              </div>
            )}

            {/* View on BaseScan Link */}
            {baseScanTx && (
              <a 
                href={baseScanTx}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-auto pt-2"
              >
                <span>View on BaseScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Attributes Preview - if available */}
            {attributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {attributes.slice(0, 2).map((attr) => (
                  <Badge
                    key={`${attr.trait_type}-${attr.value}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {attr.value}
                  </Badge>
                ))}
                {attributes.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{attributes.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

