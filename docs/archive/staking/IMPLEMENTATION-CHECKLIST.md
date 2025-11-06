# RAIR Staking System - Implementation Checklist

## Phase 1: Database Setup ✓

### Supabase SQL Editor
- [ ] Run DATABASE.md SQL script in Supabase SQL Editor
  - [ ] Add rair_balance and rair_staked columns to profiles
  - [ ] Create staking_transactions table
  - [ ] Set up RLS policies
  - [ ] Create stake_rair() function
  - [ ] Create unstake_rair() function
  - [ ] Create get_staking_status() function
  - [ ] Grant execute permissions
- [ ] Verify tables and columns created
- [ ] Verify functions created
- [ ] Test functions with test queries

## Phase 2: API Routes

- [ ] Create `/app/api/staking/stake/route.ts`
  - [ ] Validate user authentication
  - [ ] Call stake_rair RPC function
  - [ ] Return success/error response
  
- [ ] Create `/app/api/staking/unstake/route.ts`
  - [ ] Validate user authentication
  - [ ] Call unstake_rair RPC function
  - [ ] Return success/error response
  
- [ ] Create `/app/api/staking/status/route.ts`
  - [ ] Validate user authentication
  - [ ] Call get_staking_status RPC function
  - [ ] Return staking status

## Phase 3: Components

- [ ] Create `components/staking/StakingCard.tsx`
  - [ ] Display balances
  - [ ] Input for amount
  - [ ] Quick stake 3000 button
  - [ ] Stake button
  - [ ] Unstake button
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Success messages
  - [ ] Responsive design

- [ ] Create `components/staking/SuperGuideAccessBadge.tsx`
  - [ ] Active state (>= 3000 staked)
  - [ ] Inactive state (< 3000 staked)
  - [ ] Responsive design

- [ ] Create `components/staking/StakingProgress.tsx`
  - [ ] Progress bar to 3000 RAIR
  - [ ] Percentage calculation
  - [ ] Color coding by progress
  - [ ] Responsive design

## Phase 4: Pages

- [ ] Update `/app/protected/profile/page.tsx`
  - [ ] Add StakingCard component
  - [ ] Fetch staking status on load
  - [ ] Handle error query param
  - [ ] Show toast for insufficient stake error

- [ ] Create `/app/superguide/page.tsx`
  - [ ] Server-side auth check
  - [ ] Server-side staking check (>= 3000)
  - [ ] Redirect to profile if insufficient
  - [ ] Display enhanced guide content
  - [ ] Show SuperGuideAccessBadge

## Phase 5: Navigation

- [ ] Update navigation components
  - [ ] Add Super Guide link
  - [ ] Show lock icon when < 3000 staked
  - [ ] Disable link when locked
  - [ ] Add tooltip

## Phase 6: Testing

### Database Tests
- [ ] Test stake_rair function directly in SQL
- [ ] Test unstake_rair function directly in SQL
- [ ] Test get_staking_status function
- [ ] Verify RLS policies work
- [ ] Test concurrent staking attempts
- [ ] Verify transaction records created

### API Tests
- [ ] Test /api/staking/stake with valid amount
- [ ] Test /api/staking/stake with insufficient balance
- [ ] Test /api/staking/stake with invalid amount
- [ ] Test /api/staking/stake without auth
- [ ] Test /api/staking/unstake with valid amount
- [ ] Test /api/staking/unstake with insufficient stake
- [ ] Test /api/staking/unstake with invalid amount
- [ ] Test /api/staking/unstake without auth
- [ ] Test /api/staking/status

### UI Tests
- [ ] Login with test user
- [ ] View initial RAIR balance (should be 10,000)
- [ ] View staking card on profile
- [ ] Click "Quick Stake 3000"
- [ ] Verify amount fills with 3000
- [ ] Click "Stake" button
- [ ] Verify loading state shows
- [ ] Verify success message shows
- [ ] Verify balances update (7,000 available, 3,000 staked)
- [ ] Verify Super Guide link becomes active
- [ ] Navigate to Super Guide
- [ ] Verify Super Guide content displays
- [ ] Navigate back to profile
- [ ] Unstake 1,000 RAIR
- [ ] Verify balances update (8,000 available, 2,000 staked)
- [ ] Verify Super Guide link shows lock
- [ ] Try to access /superguide
- [ ] Verify redirect to profile with error
- [ ] Verify error toast shows
- [ ] Stake 1,000 RAIR again
- [ ] Verify can access Super Guide again

### Responsive Tests
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1280px)
- [ ] Test on large desktop (1920px)
- [ ] Test portrait/landscape on mobile
- [ ] Test dark mode
- [ ] Test light mode

### Browser Tests
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Chrome Mobile

### Edge Cases
- [ ] Try to stake 0 RAIR
- [ ] Try to stake negative amount
- [ ] Try to stake more than balance
- [ ] Try to unstake more than staked
- [ ] Try to access Super Guide with 2,999 staked
- [ ] Try to access Super Guide with exactly 3,000 staked
- [ ] Try to stake with no balance
- [ ] Refresh page during transaction
- [ ] Network error handling

## Phase 7: Documentation

- [ ] Update README with staking feature
- [ ] Add API documentation
- [ ] Add component documentation
- [ ] Document environment variables (if any)

## Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No linter errors
- [ ] Responsive on all breakpoints
- [ ] Dark/light mode working
- [ ] Database migration applied to production
- [ ] Environment variables set (if any)
- [ ] Vercel deployment successful
- [ ] Production smoke test

## Rollback Plan

If issues arise:
1. Remove navigation links to Super Guide
2. Hide staking components
3. Run rollback SQL script
4. Redeploy previous version

## Success Criteria

✓ User can stake RAIR tokens
✓ User can unstake RAIR tokens
✓ Balances update correctly in database
✓ UI reflects database state accurately
✓ Super Guide only accessible with >= 3000 staked
✓ Server-side validation prevents unauthorized access
✓ Responsive on all screen sizes
✓ Works in all supported browsers
✓ No Vercel build errors
✓ No breaking changes to existing features


