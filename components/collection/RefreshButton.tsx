"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";

interface RefreshButtonProps {
  collectionSlug: string;
  collectionName: string;
  currentCount: number;
}

export function RefreshButton({
  collectionSlug,
  collectionName,
  currentCount,
}: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{
    before: number;
    after: number;
    status: string;
  } | null>(null);

  const handleRefresh = async () => {
    // Native browser confirmation dialog
    const message = `Refresh "${collectionName}"?\n\nThis will sync the collection's NFT count with the blockchain.${
      currentCount > 0 ? `\n\nCurrent count: ${currentCount} NFTs` : ""
    }`;

    if (!confirm(message)) {
      return; // User cancelled
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setRefreshResult(null);

    try {
      const response = await fetch(
        `/api/collection/${collectionSlug}/refresh`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to refresh collection");
        return;
      }

      setRefreshResult({
        before: data.before_count,
        after: data.after_count,
        status: data.sync_status,
      });

      if (data.needs_refresh) {
        setSuccess(true);
        // onRefreshComplete?.(data.after_count); // Removed as per edit hint
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during refresh"
      );
    } finally {
      setIsLoading(false);
      // Auto-clear feedback after 5 seconds
      setTimeout(() => {
        setError(null);
        setSuccess(false);
        setRefreshResult(null);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RotateCcw className="w-4 h-4" />
        {isLoading ? "Refreshing..." : "Refresh Collection"}
      </Button>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md text-sm animate-in fade-in">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {success && refreshResult && (
        <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md text-sm animate-in fade-in">
          <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-green-700 dark:text-green-300">
            <p className="font-medium">Refresh Complete</p>
            <p className="text-xs">
              {refreshResult.before} → {refreshResult.after} NFTs
            </p>
            <p className="text-xs mt-1">{refreshResult.status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
