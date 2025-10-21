'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, BookOpen, Crown } from 'lucide-react';
import Link from 'next/link';

// Default dummy data for when Supabase is unavailable
const DUMMY_USER_COUNT = 247;

export function TokenomicsHomepage() {
  const [userCount, setUserCount] = useState<number | null>(DUMMY_USER_COUNT);
  const [loading, setLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const supabase = createClient();
        const { data, error: dbError } = await supabase.rpc('get_total_user_count');

        if (dbError) {
          console.warn('Supabase RPC unavailable, using dummy data:', dbError.message);
          setIsUsingDummyData(true);
          setUserCount(DUMMY_USER_COUNT);
        } else if (data !== null && data !== undefined) {
          setUserCount(data);
          setIsUsingDummyData(false);
        } else {
          console.warn('No user count data returned, using dummy data');
          setIsUsingDummyData(true);
          setUserCount(DUMMY_USER_COUNT);
        }
      } catch (err) {
        console.warn('Failed to fetch user stats, using dummy data:', err instanceof Error ? err.message : String(err));
        setIsUsingDummyData(true);
        setUserCount(DUMMY_USER_COUNT);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
    const interval = setInterval(fetchUserStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate token tier based on position
  const calculateTierInfo = (position: number) => {
    if (position <= 100) return { tier: 'Tier 1', tokens: '10,000', label: 'Early Adopter' };
    if (position <= 500) return { tier: 'Tier 2', tokens: '5,000', label: 'Community Builder' };
    if (position <= 1000) return { tier: 'Tier 3', tokens: '2,500', label: 'Active Member' };
    if (position <= 2000) return { tier: 'Tier 4', tokens: '1,250', label: 'Contributor' };
    return { tier: 'Tier 5+', tokens: '625+', label: 'Community Member' };
  };

  const currentUserInfo = userCount ? calculateTierInfo(userCount) : null;

  // Skeleton loader
  if (loading) {
    return (
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl space-y-12">
          <div className="h-20 bg-secondary rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Tokenomics
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Community Growth Rewards
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join early and earn RAIR tokens based on your signup position.
          </p>
          {isUsingDummyData && (
            <p className="text-xs text-muted-foreground italic mt-3">
              (Demo data - connect to Supabase for live updates)
            </p>
          )}
        </div>

        {/* Token Distribution & Emission Curve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Distribution Breakdown */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Users 1-100</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">10,000 RAIR</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Users 101-500</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">5,000 RAIR</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Users 501-1K</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">2,500 RAIR</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Users 1K-2K</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">1,250 RAIR</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-sm">Users 2K+</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">625+ RAIR</span>
              </div>
            </div>
          </div>

          {/* Emission Curve */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">Emissions Growth</h3>
            <div className="space-y-5">
              {[
                { label: 'Users 1-100', tokens: 10000, width: 100 },
                { label: 'Users 101-500', tokens: 5000, width: 50 },
                { label: 'Users 501-1K', tokens: 2500, width: 25 },
                { label: 'Users 1K-2K', tokens: 1250, width: 12.5 },
                { label: 'Users 2K+', tokens: 625, width: 6.25 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {item.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${item.width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current User Position */}
        {currentUserInfo && userCount && (
          <div className="rounded-lg p-8 border border-border bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Position</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              #{userCount?.toLocaleString()}
            </h3>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
              {currentUserInfo.label}
            </p>
            <p className="text-lg font-bold text-foreground">
              {currentUserInfo.tokens} RAIR Tokens
            </p>
          </div>
        )}

        {/* Free vs Premium */}
        <div className="border-t border-border pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Guide */}
            <div className="rounded-lg p-8 border border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Free Guide</h3>
              </div>
              <p className="text-muted-foreground mb-8 text-sm">
                Access comprehensive foundational knowledge at no cost.
              </p>
              <Link href="/guide" className="inline-flex w-full justify-center py-3 px-4 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm">
                Start Learning
              </Link>
            </div>

            {/* Premium Access */}
            <div className="rounded-lg p-8 border-2 border-blue-600 dark:border-blue-400 bg-card relative">
              <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded-full">
                Premium
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Premium Access</h3>
              </div>
              <p className="text-muted-foreground mb-8 text-sm">
                Unlock premium AI guides with RAIR tokens.
              </p>
              <Link href="/superguide" className="inline-flex w-full justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all font-semibold text-sm">
                Unlock Premium
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
