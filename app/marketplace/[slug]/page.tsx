import { createClient } from "@/lib/supabase/server";
import { NFTTile } from "@/components/marketplace/NFTTile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MintButton } from "@/components/marketplace/MintButton";
import { RefreshButton } from "@/components/collection/RefreshButton";
import { CollectionRefreshProvider } from "@/components/collection/CollectionRefreshProvider";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient();

  const { slug } = await params;

  const { data: collection } = await supabase
    .from("smart_contracts")
    .select("collection_name, collection_description")
    .eq("collection_slug", slug)
    .eq("is_public", true)
    .single();

  return {
    title: collection?.collection_name || "Collection",
    description: collection?.collection_description || "NFT Collection"
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  // Fetch collection from database - MUST exist and be public
  const { data: collection, error } = await supabase
    .from("smart_contracts")
    .select("*")
    .eq("collection_slug", slug)
    .eq("is_public", true)
    .single();

  // 🚨 CRITICAL FIX: Remove mock data fallback - collections MUST be in database
  // No more dummy data generation for non-existent collections
  if (!collection || error) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6 p-8">
        <Link href="/marketplace">
          <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </Button>
        </Link>
        
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Collection Not Found</h1>
            <p className="text-muted-foreground">
              This collection doesn't exist or is not available for public minting.
            </p>
            <p className="text-sm text-slate-500">
              Collection slug: <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">{slug}</code>
            </p>
          </div>
          <Link href="/marketplace">
            <Button>Browse Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Real collection data from database - use it as-is
  const displayCollection = collection;

  // Extract gradient from collection - use database value if available, otherwise default
  const gradient = collection?.nft_default_gradient || {
    colors: ["#cfe9f3", "#e5f0f7"],
    angle: 135
  };

  // 🆕 Display real NFTs from the database (when available)
  // Fetch minted NFTs from nft_tokens table
  const { data: realNFTs = [] } = await supabase
    .from('nft_tokens')
    .select('*')
    .eq('contract_address', collection.contract_address)
    .eq('is_burned', false)
    .order('minted_at', { ascending: false });

  const progress = displayCollection.max_supply
    ? (displayCollection.total_minted / displayCollection.max_supply) * 100
    : 0;

  const baseScanUrl = collection && collection.contract_address
    ? `https://sepolia.basescan.org/address/${collection.contract_address}`
    : null;

  const nftsToDisplay = realNFTs && Array.isArray(realNFTs) ? realNFTs : [];

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-8">
      <Link href="/marketplace">
        <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Button>
      </Link>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {/* Collection Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{displayCollection.collection_name}</h1>
              <div className="flex gap-2 flex-wrap items-center">
                {displayCollection.is_public && (
                  <Badge variant="secondary">Public Collection</Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Minted</span>
                <span className="font-medium">{displayCollection.total_minted} / {displayCollection.max_supply}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Description */}
            {displayCollection.collection_description && (
              <p className="text-muted-foreground">{displayCollection.collection_description}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 flex-col sm:flex-row">
              {/* Only show BaseScan button if we have a real contract address */}
              {baseScanUrl && (
                <a href={baseScanUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="gap-2 w-full">
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
              
              {/* 🆕 Mint Button - Only show if we have REAL contract address from database */}
              {collection?.contract_address && displayCollection.total_minted < displayCollection.max_supply && (
                <div className="flex-1">
                  <MintButton
                    contractAddress={collection.contract_address}
                    collectionName={displayCollection.collection_name}
                    mintPrice={collection.mint_price_wei?.toString() || '0'}
                    maxSupply={displayCollection.max_supply}
                    totalMinted={displayCollection.total_minted}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Collection Image and Info */}
          <div className="md:col-span-1 space-y-4">
            {/* Collection Image */}
            <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
              {displayCollection.collection_banner_url ? (
                <Image
                  src={displayCollection.collection_banner_url}
                  alt={displayCollection.collection_name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div 
                  className="relative w-full h-full rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(${displayCollection.collection_banner_gradient?.angle || 45}deg, ${(displayCollection.collection_banner_gradient?.colors || ["#667EEA", "#764BA2"]).join(', ')})`
                  }}
                />
              )}
            </div>

            {/* Collection Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{displayCollection.collection_symbol}</span>
                {displayCollection.verified && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {displayCollection.collection_description ||
                  "A curated collection of digital art and collectibles."}
              </p>
            </div>
          </div>
        </div>

        {/* NFTs Grid Section */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">NFTs in Collection</h2>
              <p className="text-muted-foreground mt-1">
                {nftsToDisplay.length > 0 
                  ? `Displaying ${nftsToDisplay.length} minted NFTs`
                  : 'No NFTs have been minted from this collection yet. Mint one to get started!'}
              </p>
            </div>
            
            <RefreshButton
              collectionSlug={slug}
              collectionName={displayCollection.collection_name}
              currentCount={nftsToDisplay.length}
            />
          </div>

          {nftsToDisplay.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nftsToDisplay.map((nft) => (
                <NFTTile
                  key={nft.token_id}
                  nft={nft}
                  gradient={gradient}
                  collectionName={displayCollection.collection_name}
                />
              ))}
            </div>
          )}
          
          {nftsToDisplay.length === 0 && (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-muted-foreground">
                No NFTs have been minted yet from this collection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✨ Auto-refresh provider for NFT mints */}
      <CollectionRefreshProvider collectionSlug={slug} />
    </div>
  );
}
