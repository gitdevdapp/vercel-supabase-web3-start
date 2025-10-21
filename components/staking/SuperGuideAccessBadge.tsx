'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock } from 'lucide-react';

interface SuperGuideAccessBadgeProps {
  hasAccess: boolean;
  className?: string;
}

export function SuperGuideAccessBadge({ hasAccess, className = '' }: SuperGuideAccessBadgeProps) {
  if (hasAccess) {
    return (
      <Badge
        variant="default"
        className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${className}`}
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        Super Guide Access
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      <Lock className="h-3 w-3 mr-1" />
      Super Guide Locked
    </Badge>
  );
}
