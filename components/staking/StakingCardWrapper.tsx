'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';

const StakingCard = dynamic(() => import('./StakingCard').then(mod => mod.StakingCard), {
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          RAIR Staking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false
});

export function StakingCardWrapper() {
  return <StakingCard />;
}
