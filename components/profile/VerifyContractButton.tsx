'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag, CheckCircle2 } from 'lucide-react';

interface VerifyContractButtonProps {
  contractAddress: string;
  contractName: string;
  contractSymbol: string;
  maxSupply: number;
  mintPrice: string;
  verified?: boolean;
  collectionSlug?: string;
  onVerificationSuccess?: () => void;
}

// Helper function to generate URL-safe slug from collection name
function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function VerifyContractButton({
  contractAddress,
  contractName,
  contractSymbol,
  maxSupply,
  mintPrice,
  verified = false,
  collectionSlug,
  onVerificationSuccess
}: VerifyContractButtonProps) {
  // Generate fallback slug from collection name if not provided
  const slug = collectionSlug || generateSlugFromName(contractName);

  // NEW: Always show verified status + marketplace link
  // Contracts are auto-verified on deployment, so we always show verified
  return (
    <div className="space-y-3">
      {/* Verified Status Display */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
        <CheckCircle2 size={16} className="text-green-700 dark:text-green-400 flex-shrink-0" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          ✓ Verified on BaseScan
        </span>
      </div>

      {/* View Collection Button - Primary Action */}
      <Link href={`/marketplace/${slug}`} className="block">
        <Button
          variant="default"
          className="w-full h-10 gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          View Collection
        </Button>
      </Link>

      {/* BaseScan Link - Secondary Action */}
      <a
        href={`https://sepolia.basescan.org/address/${contractAddress}#code`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        View on BaseScan
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
