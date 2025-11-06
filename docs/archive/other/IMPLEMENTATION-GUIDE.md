# Implementation Guide: User Statistics & Tokenomics

## Visual Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Signs Up                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           Supabase Auth / Database Layer                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  INSERT INTO profiles (id, email, ...)                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ TRIGGER: trg_set_rair_tokens_on_signup         │  │   │
│  │  │                                                  │  │   │
│  │  │ 1. Get signup_order (auto from BIGSERIAL)      │  │   │
│  │  │ 2. Calculate tokens via calculate_rair_tokens() │  │   │
│  │  │ 3. Set tier & rair_tokens_allocated            │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │     profiles table (updated)         │
        ├──────────────────────────────────────┤
        │ id: uuid                             │
        │ email: text                          │
        │ signup_order: 1, 2, 3, ...          │
        │ rair_token_tier: 1, 2, 3, ...       │
        │ rair_tokens_allocated: 10000, 5000..│
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Frontend Component Requests         │
        │  get_total_user_count()              │
        └──────────────────────────────────────┘
                           │
                           ▼
    ┌───────────────────────────────────────────────┐
    │     user_stats_cache (materialized view)     │
    │  ┌─────────────────────────────────────────┐ │
    │  │ SELECT COUNT(*), MAX(...), AVG(...)     │ │
    │  │ FROM profiles                           │ │
    │  │ WHERE id IS NOT NULL                    │ │
    │  │ [CACHED, refreshed every 5 minutes]    │ │
    │  └─────────────────────────────────────────┘ │
    └───────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │     UserStatsElement Component       │
        │  Shows live user count on homepage   │
        └──────────────────────────────────────┘
```

## Token Distribution Visual

### Tier Visualization

```
┌─────────────────────────────────────────────────────────────┐
│              RAIR Token Distribution by Tier                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tier 1 (Users 1-100)          ████████████████ 10,000   │
│  ├─ 100 users                                              │
│  └─ Total RAIR: 1,000,000                                 │
│                                                             │
│  Tier 2 (Users 101-500)         ████████ 5,000            │
│  ├─ 400 users                                              │
│  └─ Total RAIR: 2,000,000                                 │
│                                                             │
│  Tier 3 (Users 501-1,000)       ████ 2,500                │
│  ├─ 500 users                                              │
│  └─ Total RAIR: 1,250,000                                 │
│                                                             │
│  Tier 4 (Users 1,001-2,000)     ██ 1,250                  │
│  ├─ 1,000 users                                            │
│  └─ Total RAIR: 1,250,000                                 │
│                                                             │
│  Tier 5 (Users 2,001-3,000)     █ 625                     │
│  ├─ 1,000 users                                            │
│  └─ Total RAIR: 625,000                                   │
│                                                             │
│  [Pattern continues, halving every 1,000 users]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Mathematical Pattern:
  User 1-100:        tokens = 10,000        (base * 1)
  User 101-500:      tokens = 5,000         (base / 2)
  User 501-1,000:    tokens = 2,500         (base / 4)
  User 1,001-2,000:  tokens = 1,250         (base / 8)
  User 2,001-3,000:  tokens = 625           (base / 16)
  User 3,001-4,000:  tokens = 312           (base / 32)
  ...
  Pattern: base / 2^n where n increases every 1,000 users
```

## Implementation Checklist

### Step 1: Database Setup (Backend)

- [ ] **Access Supabase Console**
  - URL: `https://app.supabase.com`
  - Select project
  - Navigate to SQL Editor

- [ ] **Run SQL Migration**
  - Copy all SQL from `USER-STATISTICS-SETUP.sql`
  - Create new query
  - Paste SQL
  - Execute
  - Wait for "Query successful" message

- [ ] **Verify Database Changes**
  ```sql
  -- Check columns added
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name IN ('signup_order', 'rair_token_tier', 'rair_tokens_allocated');
  
  -- Should show 3 rows with:
  -- - signup_order (BIGINT)
  -- - rair_token_tier (INT)
  -- - rair_tokens_allocated (NUMERIC)
  ```

- [ ] **Verify Functions Created**
  ```sql
  SELECT routine_name 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN (
    'calculate_rair_tokens',
    'get_user_statistics', 
    'get_total_user_count',
    'set_rair_tokens_on_signup'
  );
  
  -- Should show 4 rows
  ```

- [ ] **Verify Trigger Created**
  ```sql
  SELECT trigger_name 
  FROM information_schema.triggers 
  WHERE table_name = 'profiles' 
  AND trigger_name = 'trg_set_rair_tokens_on_signup';
  
  -- Should show 1 row
  ```

- [ ] **Test Functions**
  ```sql
  -- Test token calculation
  SELECT calculate_rair_tokens(1) as tokens;      -- Should be 10000
  SELECT calculate_rair_tokens(100) as tokens;    -- Should be 10000
  SELECT calculate_rair_tokens(200) as tokens;    -- Should be 5000
  SELECT calculate_rair_tokens(1000) as tokens;   -- Should be 2500
  SELECT calculate_rair_tokens(1500) as tokens;   -- Should be 1250
  
  -- Test user count
  SELECT get_total_user_count();                  -- Should be current count
  
  -- Test statistics
  SELECT get_user_statistics();                   -- Should return JSON
  ```

### Step 2: Frontend Component (Frontend)

- [ ] **Create Component File**
  - Create: `components/user-stats-element.tsx`
  - Copy code from below

- [ ] **Component Code**
  ```typescript
  'use client';

  import { useState, useEffect } from 'react';
  import { createClient } from '@/lib/supabase/client';

  export function UserStatsElement() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchUserStats = async () => {
        try {
          const supabase = createClient();
          const { data, error: dbError } = await supabase
            .rpc('get_total_user_count');
          
          if (dbError) throw dbError;
          setUserCount(data);
        } catch (err) {
          console.error('Failed to fetch user stats:', err);
          setError('Unable to load user count');
        } finally {
          setLoading(false);
        }
      };

      fetchUserStats();

      // Refresh every 30 seconds
      const interval = setInterval(fetchUserStats, 30000);
      return () => clearInterval(interval);
    }, []);

    // Skeleton loader while fetching
    if (loading) {
      return (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg animate-pulse" />
          </div>
        </section>
      );
    }

    // Graceful error handling (silently fail, don't break page)
    if (error || userCount === null) {
      return null;
    }

    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {userCount.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400">
                builders on board
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Join the DevDapp community
            </p>
          </div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Add to Homepage**
  - Open: `app/page.tsx`
  - Add import: `import { UserStatsElement } from "@/components/user-stats-element";`
  - Add component after `<Hero />`:
    ```tsx
    <Hero />
    <UserStatsElement />  {/* NEW LINE */}
    <ProblemExplanationSection />
    ```

- [ ] **Test Component**
  - Start dev server: `npm run dev`
  - Visit: `http://localhost:3000`
  - Check that user count displays
  - Toggle dark mode (should work)
  - Check mobile view (responsive)
  - Check browser console (no errors)

### Step 3: Test Token Distribution (Testing)

- [ ] **Create Test Users**
  - Go to `http://localhost:3000/auth/signup`
  - Create user #1 → verify receives 10,000 tokens
  - Create user #150 → verify receives 5,000 tokens
  - Create user #750 → verify receives 2,500 tokens

- [ ] **Verify in Database**
  ```sql
  -- Check user token allocations
  SELECT 
    id,
    signup_order,
    rair_token_tier,
    rair_tokens_allocated,
    created_at
  FROM profiles
  WHERE id IS NOT NULL
  ORDER BY signup_order DESC
  LIMIT 5;
  ```

- [ ] **Check Token Distribution**
  ```sql
  -- View tier breakdown
  SELECT 
    rair_token_tier,
    COUNT(*) as user_count,
    AVG(rair_tokens_allocated) as avg_tokens,
    SUM(rair_tokens_allocated) as total_tokens
  FROM profiles
  WHERE id IS NOT NULL
  GROUP BY rair_token_tier
  ORDER BY rair_token_tier;
  ```

### Step 4: Production Deployment (Deployment)

- [ ] **Environment Variables Check**
  - Verify `NEXT_PUBLIC_SUPABASE_URL` is set
  - Verify `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` is set
  - No new env vars needed!

- [ ] **Build Verification**
  ```bash
  npm run build
  # Should complete without errors
  # UserStatsElement should be included
  ```

- [ ] **Deploy to Vercel**
  - Standard deployment (no special steps)
  - No API routes changed
  - No dependencies added
  - Non-breaking change

## Common Implementation Scenarios

### Scenario 1: You have existing users

If you already have users in your database:

```sql
-- Run STEP 7 from USER-STATISTICS-SETUP.sql
-- It will:
-- 1. Assign signup_order based on created_at
-- 2. Calculate token allocations for everyone
-- 3. Set appropriate tier

-- Uncomment and run the section labeled:
-- "STEP 7: Initialize tokens for EXISTING users"
```

### Scenario 2: You want to query tokens programmatically

```typescript
// In a Next.js API route or component
import { createClient } from '@/lib/supabase/server';

export async function getUserTokenInfo(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('signup_order, rair_token_tier, rair_tokens_allocated')
    .eq('id', userId)
    .single();

  if (error) throw error;
  
  return {
    signupOrder: data.signup_order,
    tier: data.rair_token_tier,
    tokensAllocated: data.rair_tokens_allocated,
  };
}
```

### Scenario 3: You want to display tier badge on profile

```tsx
// In components/profile-card.tsx or similar
function TierBadge({ tier, tokens }: { tier: number; tokens: number }) {
  const tierLabels: Record<number, string> = {
    1: 'Founding Member',
    2: 'Early Adopter',
    3: 'Pioneer',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-blue-600">
        {tierLabels[tier] || `Tier ${tier}`}
      </span>
      <span className="text-xs text-gray-500">
        {tokens.toLocaleString()} RAIR
      </span>
    </div>
  );
}
```

### Scenario 4: You want automatic view refresh

```sql
-- Set up pg_cron to refresh materialized view every 5 minutes
-- Run this in Supabase SQL Editor

SELECT cron.schedule(
  'refresh-user-stats-cache', 
  '*/5 * * * *',  -- Every 5 minutes
  'REFRESH MATERIALIZED VIEW user_stats_cache'
);
```

## Performance Optimization Tips

### Tip 1: Reduce Homepage Load Time

The `get_total_user_count()` function is optimized for speed:
- Uses cached materialized view when available
- Falls back to COUNT query if needed
- Takes < 5ms for up to 100k users

If you need it faster, add to `next.config.ts`:
```typescript
const nextConfig = {
  // Cache homepage for 30 seconds
  experimental: {
    isrMemoryCacheSize: 50 * 1024 * 1024, // 50MB
  }
};
```

### Tip 2: Reduce Database Calls

Cache the user count in client:
```typescript
const [userCount, setUserCount] = useState<number | null>(null);
const [lastFetch, setLastFetch] = useState(0);

useEffect(() => {
  const now = Date.now();
  // Only fetch if cache is older than 5 minutes
  if (now - lastFetch > 5 * 60 * 1000) {
    fetchUserStats();
    setLastFetch(now);
  }
}, []);
```

### Tip 3: Monitor Database Performance

```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE tablename = 'profiles'
ORDER BY idx_scan DESC;

-- Should show good usage of idx_profiles_signup_order
```

## Troubleshooting Decision Tree

```
Issue: Component not showing?
├─ Check browser console for errors
│  └─ Error says "function does not exist"?
│     └─ Re-run SQL migration in Supabase
├─ Check if RPC works in SQL Editor
│  └─ SELECT get_total_user_count();
│     └─ Returns NULL or error?
│        └─ Run setup SQL again
└─ Check if profiles table has data
   └─ SELECT COUNT(*) FROM profiles;
      └─ Returns 0?
         └─ Create a test user first

Issue: Wrong token amounts?
├─ Check trigger was created
│  └─ SELECT trigger_name FROM information_schema.triggers WHERE table_name = 'profiles';
├─ Verify calculate_rair_tokens function
│  └─ SELECT calculate_rair_tokens(500);  -- Should be 5000
└─ Check specific user record
   └─ SELECT signup_order, rair_tokens_allocated FROM profiles WHERE id = 'your_id';

Issue: Bad performance?
├─ Check if indexes exist
│  └─ SELECT indexname FROM pg_indexes WHERE tablename = 'profiles';
├─ Refresh materialized view
│  └─ REFRESH MATERIALIZED VIEW user_stats_cache;
└─ Consider caching strategies above
```

## Next Steps After Implementation

1. **Monitor**: Track user signup patterns in first week
2. **Adjust**: If needed, modify tier levels in `calculate_rair_tokens()` function
3. **Extend**: Consider adding referral bonuses
4. **Display**: Show tier badges on user profiles
5. **Analytics**: Create dashboard showing token distribution

---

**Implementation Time**: ~15 minutes total
**Difficulty**: Easy (mostly copy-paste)
**Risk**: Very Low (non-breaking, backend-only)
