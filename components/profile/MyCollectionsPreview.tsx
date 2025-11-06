'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionTile } from '@/components/marketplace/CollectionTile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useDeploymentRefresh } from '@/lib/hooks/useDeploymentRefresh';

interface Collection {
  id: string;
  collection_slug: string;
  collection_name: string;
  collection_symbol: string;
  collection_image_url?: string | null;
  total_minted?: number;
  max_supply?: number;
  verified?: boolean;
}

export function MyCollectionsPreview() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✨ NEW: Listen for deployment completion signals
  const deploymentRefreshTrigger = useDeploymentRefresh();

  // ✨ Extracted: Fetch function can now be reused
  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/contract/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      
      // Show all collections, not just those with slugs
      // This ensures collections appear immediately after deployment
      const validCollections = (data.contracts || []).filter(
        (c: any) => c.collection_name && c.id
      );
      
      setCollections(validCollections);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load collections';
      setError(message);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Original: Fetch on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // ✨ NEW: Refetch when deployment completes
  useEffect(() => {
    if (deploymentRefreshTrigger > 0) {
      console.log('📢 Deployment detected, refreshing collections...');
      fetchCollections();
    }
  }, [deploymentRefreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  // Show only first 3 collections
  const displayCollections = collections.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Collections Preview</span>
          <Link href="/protected/profile/mycontracts">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCollections.map((collection) => {
            // Use collection_slug if available, otherwise use ID as fallback
            const displaySlug = collection.collection_slug || `collection-${collection.id}`;
            
            return (
              <CollectionTile
                key={collection.id}
                collection={{
                  collection_slug: displaySlug,
                  collection_name: collection.collection_name,
                  collection_symbol: collection.collection_symbol,
                  collection_image_url: collection.collection_image_url,
                  total_minted: collection.total_minted || 0,
                  max_supply: collection.max_supply || 1,
                  verified: collection.verified || false
                }}
              />
            );
          })}
        </div>

        {collections.length > 3 && (
          <div className="mt-6 text-center">
            <Link href="/protected/profile/mycontracts">
              <Button variant="outline" className="gap-2">
                View All {collections.length} Collections
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

