# 🎯 Points & Rewards Removal Plan

**Status**: Ready for Implementation
**Date**: October 16, 2025
**Goal**: Remove redundant Points & Rewards section while preserving critical Staking functionality

---

## 📊 Executive Summary

The application currently has two overlapping systems for token management:
1. **Points System** (user_points table) - Tracks PR contributions and token balances
2. **Staking System** (profiles table columns) - Tracks RAIR balance and staked amount

Since the staking system is the active, production-deployed system with Super Guide access gating, we will remove the redundant points system entirely.

---

## ✅ Verification: Staking is Independent

**Current Staking Architecture:**
- ✅ Staking data stored in `profiles` table (`rair_balance`, `rair_staked` columns)
- ✅ API endpoints: `/api/staking/status`, `/api/staking/stake`, `/api/staking/unstake`
- ✅ Components: `StakingCard.tsx`, `StakingCardWrapper.tsx`, `SuperGuideAccessWrapper.tsx`
- ✅ Super Guide gating: Based on `rair_staked >= 3000`
- ✅ Database functions: `stake_rair()`, `unstake_rair()` RPC functions
- ✅ No dependencies on `user_points` table

**Result:** Staking system is fully independent. Safe to remove points system.

---

## 🗂️ Files to Remove/Modify

### SECTION A: Frontend Components (Remove)

**Files to delete:**
1. `/components/profile/ProfilePointsCard.tsx` - Main points display component
2. `/components/profile/ProfilePointsCard.test.tsx` (if exists) - Tests for points card

**Reason:** This component is purely for displaying the points system which is being removed.

### SECTION B: Profile Page (Modify)

**File:** `/app/protected/profile/page.tsx`

**Changes needed:**
- Remove import: `import { ProfilePointsCard } from "@/components/profile/ProfilePointsCard";`
- Remove JSX: The `<div className="mb-6"><ProfilePointsCard /></div>` section (lines 53-56)

**Result:** Profile page will show only Profile Form, Staking Card, and Wallet Card

### SECTION C: Database (Remove)

**File:** `/docs/points/POINTS-SYSTEM-SQL-SETUP.sql`

**Action:** Delete this file - it's no longer needed

**Note:** The `user_points` table and associated functions/triggers should remain in production for now (for data preservation). They'll become dormant but won't break anything.

### SECTION D: Documentation (Archive/Remove)

**Files to delete or archive:**
1. `/docs/points/` - Entire directory (6 files)
2. Any references in other documentation files

**Alternative:** Move to `/docs/archive/points-removal/` if keeping for historical reference

---

## 🔄 Implementation Steps

### Step 1: Remove Frontend Component
```bash
rm /components/profile/ProfilePointsCard.tsx
```

### Step 2: Update Profile Page
- Remove import and JSX from `/app/protected/profile/page.tsx`
- Keep `StakingCardWrapper` import and usage (CRITICAL)
- Keep `ProfileWalletCard` import and usage

### Step 3: Clean Up Documentation
- Archive `/docs/points/` to `/docs/archive/` OR delete entirely

### Step 4: Verify No Broken References
```bash
grep -r "ProfilePointsCard" .
grep -r "user_points" . --include="*.tsx" --include="*.ts"
```
Should return: No matches (except in removed files)

### Step 5: Local Testing (after removal)
1. `npm run build` - Verify no build errors
2. `npm run dev` - Start dev server
3. Login with test credentials
4. Verify profile page loads without errors
5. Verify Staking Card is visible
6. Test staking functionality
7. Verify Super Guide access gating works

### Step 6: Vercel Build Testing
1. Push to test branch
2. Deploy preview on Vercel
3. Verify build succeeds
4. Test all functionality in preview

---

## 🧪 Testing Checklist

### Test Credentials
```
Email: devdapp_test_2025oct15@mailinator.com
Password: TestPassword123!
Current Balance: 3,000+ RAIR
```

### Pre-Removal Baseline (Run These Tests First)
- [ ] Login works
- [ ] Profile page loads
- [ ] ProfilePointsCard displays correctly
- [ ] StakingCard displays correctly
- [ ] Can stake tokens
- [ ] Can unstake tokens
- [ ] Super Guide access gating works (3000+ RAIR)

### Post-Removal Tests
- [ ] No console errors on profile page
- [ ] Profile page loads without ProfilePointsCard
- [ ] Profile Form still displays (left column)
- [ ] StakingCard still displays (right column)
- [ ] Wallet Card still displays (right column)
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] Can still stake tokens
- [ ] Can still unstake tokens
- [ ] Super Guide still requires 3000+ RAIR
- [ ] Can access Super Guide when requirements met

### Build Tests
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] No ESLint warnings in profile components

### Vercel Tests
- [ ] Preview build succeeds
- [ ] No build errors in Vercel logs
- [ ] Preview site loads without 500 errors
- [ ] All functionality works in preview

---

## ⚠️ Important Notes

### What We're NOT Removing
- ✅ Staking functionality (keep all)
- ✅ Super Guide gating (keep all)
- ✅ Staking API endpoints (keep all)
- ✅ Profiles table columns (keep all)
- ✅ Database RPC functions for staking (keep all)

### What We ARE Removing
- ❌ ProfilePointsCard component
- ❌ Points system documentation
- ❌ Visual references to "Points & Rewards"

### Database Preservation
The `user_points` table in Supabase can remain for data preservation:
- No active code references it
- Won't cause errors if it exists
- Can be deleted later if desired
- Keeps historical PR/contribution data safe

---

## 📋 Success Criteria

✅ **All criteria must be met before considering task complete:**

1. ProfilePointsCard component removed
2. Profile page loads without the card
3. Staking Card is fully visible and functional
4. Super Guide gating still works (requires 3000+ RAIR)
5. Can stake and unstake different amounts
6. No build errors locally
7. No build errors on Vercel preview
8. No broken TypeScript references
9. All tests pass
10. Profile page responsive design intact

---

## 🚀 Rollback Plan

If issues occur:
1. Git restore the deleted files
2. Git restore modified files
3. Clear build cache: `rm -rf .next`
4. Rebuild: `npm run build`
5. Test locally before re-deploying

---

## 📝 Related Files (Reference Only)

**Files that will NOT be modified (dependencies intact):**
- `/components/staking/StakingCard.tsx` - No changes needed
- `/components/staking/StakingCardWrapper.tsx` - No changes needed
- `/components/staking/StakingProgress.tsx` - No changes needed
- `/components/superguide/SuperGuideAccessWrapper.tsx` - No changes needed
- `/app/api/staking/*` - No changes needed
- `/lib/profile.ts` - No changes needed

---

## 🎬 Next Steps

1. ✅ Review this plan
2. Run pre-removal tests (baseline)
3. Remove ProfilePointsCard.tsx
4. Update app/protected/profile/page.tsx
5. Run local tests
6. Push to test branch
7. Run Vercel preview tests
8. Push to main if all tests pass
9. Monitor production for 24 hours
10. Archive documentation
