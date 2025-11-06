import { createClient } from "@/lib/supabase/server";
import { CollectionTile } from "@/components/marketplace/CollectionTile";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "NFT Collections Marketplace",
  description: "Browse and explore NFT collections"
};

export default async function MarketplacePage() {
  const supabase = await createClient();

  // Fetch public collections from database - ONLY real collections
  const { data: collections, error } = await supabase
    .from("smart_contracts")
    .select(
      "id, collection_slug, collection_name, collection_symbol, collection_image_url, total_minted, max_supply"
    )
    .eq("is_public", true)
    .eq("marketplace_enabled", true)
    .order("created_at", { ascending: false });

  // 🚨 CRITICAL FIX: No mock data fallback - only show REAL collections from database
  const displayCollections = collections || [];

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">NFT Collections</h1>
            <p className="text-muted-foreground mt-2">
              Browse and explore curated NFT collections
            </p>
          </div>
          <Link href="/protected/profile">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Deploy Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="w-full">
        {displayCollections && displayCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCollections.map((collection) => (
              <CollectionTile
                key={collection.collection_slug}
                collection={{
                  collection_slug: collection.collection_slug || "",
                  collection_name: collection.collection_name || "Unnamed Collection",
                  collection_symbol: collection.collection_symbol || "NFT",
                  collection_image_url: collection.collection_image_url,
                  total_minted: collection.total_minted || 0,
                  max_supply: collection.max_supply || 1
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No collections available yet. Be the first to deploy!
            </p>
            <Link href="/protected/profile">
              <Button>Deploy Your First Collection</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">
            {displayCollections?.length || 0}
          </p>
          <p className="text-muted-foreground">Collections</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">
            {displayCollections?.reduce((sum, c) => sum + (c.total_minted || 0), 0) || 0}
          </p>
          <p className="text-muted-foreground">NFTs Minted</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">
            {displayCollections?.reduce((sum, c) => sum + (c.max_supply || 0), 0) || 0}
          </p>
          <p className="text-muted-foreground">Total Supply</p>
        </div>
      </div>
    </div>
  );
}

