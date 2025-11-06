'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface CollectionTileProps {
  collection: {
    collection_slug: string;
    collection_name: string;
    collection_symbol: string;
    collection_image_url?: string | null;
    total_minted?: number;
    max_supply?: number;
    verified?: boolean;
  };
  isClickable?: boolean;
  onClickCard?: () => void;
}

export function CollectionTile({
  collection,
  isClickable = true,
  onClickCard
}: CollectionTileProps) {
  const {
    collection_slug,
    collection_name,
    collection_symbol,
    collection_image_url,
    total_minted = 0,
    max_supply = 1,
    verified = false
  } = collection;

  const progress = Math.min((total_minted / max_supply) * 100, 100);

  const content = (
    <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Collection Image */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
          {collection_image_url ? (
            <Image
              src={collection_image_url}
              alt={collection_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <span className="text-white text-xl font-bold text-center px-4">
                {collection_symbol}
              </span>
            </div>
          )}
          
          {/* Verified Badge */}
          {verified && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 hover:bg-green-600">✓ Verified</Badge>
            </div>
          )}
        </div>

        {/* Collection Info */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Name and Symbol */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {collection_name}
            </h3>
            <p className="text-sm text-muted-foreground">{collection_symbol}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground font-medium">
                {total_minted}/{max_supply} Minted
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* View Button */}
          <div className="mt-auto">
            <Link
              href={`/marketplace/${collection_slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isClickable) {
    return content;
  }

  return (
    <div onClick={onClickCard} className="cursor-pointer">
      {content}
    </div>
  );
}









