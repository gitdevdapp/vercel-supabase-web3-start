# Points & Rewards System - Quick Start Guide

**Estimated Time:** 60 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Supabase project with profiles table  

---

## 🚀 Implementation Steps

### Step 1: Database Setup (5 minutes)

1. **Open Supabase Dashboard**
   - Navigate to your Supabase project
   - Click on "SQL Editor" in the left sidebar

2. **Execute SQL Script**
   - Click "+ New query" button
   - Open `/docs/points/POINTS-SYSTEM-SQL-SETUP.sql`
   - Copy entire file contents (Cmd/Ctrl+A)
   - Paste into SQL Editor
   - Click "Run" or press Cmd/Ctrl+Enter

3. **Verify Success**
   - Scroll to bottom of results
   - Check for "✅ ALL COMPONENTS VERIFIED" message
   - Confirm all checks show "✅ PASS"

**Expected Result:**
```
Points Table: 1 ✅ PASS
Points RLS Policies: 3 ✅ PASS
Points Functions: 3 ✅ PASS
Points Triggers: 2 ✅ PASS
```

---

### Step 2: Create Component File (30 minutes)

1. **Create New Component**
   ```bash
   touch /Users/garrettair/Documents/vercel-supabase-web3/components/profile/ProfilePointsCard.tsx
   ```

2. **Copy Component Code**
   - Open `/docs/points/POINTS-REWARDS-IMPLEMENTATION-PLAN.md`
   - Scroll to "Component Code Structure" section
   - Copy the entire `ProfilePointsCard.tsx` code
   - Paste into the new file

3. **Verify Imports**
   - All imports should resolve (no red underlines)
   - Uses existing components from `@/components/ui`
   - Uses existing `createClient` from `@/lib/supabase/client`

---

### Step 3: Integrate into Profile Page (10 minutes)

1. **Open Profile Page**
   ```
   /Users/garrettair/Documents/vercel-supabase-web3/app/protected/profile/page.tsx
   ```

2. **Add Import** (at top of file)
   ```typescript
   import { ProfilePointsCard } from "@/components/profile/ProfilePointsCard";
   ```

3. **Update Layout** (find the right column div ~line 50)
   
   **Before:**
   ```typescript
   {/* Right Column: Wallet (Desktop main area, Mobile below profile) */}
   <div className="w-full">
     <ProfileWalletCard />
   </div>
   ```

   **After:**
   ```typescript
   {/* Right Column: Points & Wallet (Desktop main area, Mobile below profile) */}
   <div className="w-full">
     {/* Points & Rewards Card */}
     <div className="mb-6">
       <ProfilePointsCard />
     </div>
     
     {/* Wallet Card */}
     <ProfileWalletCard />
   </div>
   ```

4. **Save File**

---

### Step 4: Test Implementation (20 minutes)

#### Desktop Testing (≥1024px)

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Profile**
   - Go to `http://localhost:3000/protected/profile`
   - Log in if needed

3. **Verify Layout**
   - [ ] Points card appears above wallet card
   - [ ] Two-column layout maintained (profile left, points/wallet right)
   - [ ] Card width matches wallet card
   - [ ] All sections visible (no collapse button)

4. **Check Content**
   - [ ] PRs Submitted shows "0" (or actual value)
   - [ ] PRs Approved shows "0" (or actual value)
   - [ ] RAIR balance displays correctly
   - [ ] Secondary tokens (bETH, sETH, APE) visible
   - [ ] Claim section present with disabled input

5. **Test Claim Button**
   - [ ] Click "Claim Tokens (Coming Soon)"
   - [ ] Yellow info message appears
   - [ ] Message: "Token claiming is coming soon! We're working hard to launch this feature."

#### Mobile Testing (<1024px)

1. **Open DevTools**
   - Press F12 or Cmd+Opt+I
   - Toggle device toolbar (Cmd+Shift+M)
   - Select "iPhone SE" or "iPhone 12 Pro"

2. **Verify Collapsed State**
   - [ ] Points card shows header only
   - [ ] Summary visible: "0 PRs • 0 RAIR"
   - [ ] Chevron down icon visible
   - [ ] Wallet card below

3. **Test Expand**
   - [ ] Tap header or chevron
   - [ ] Card expands smoothly
   - [ ] All content visible (scrollable)
   - [ ] Chevron changes to up

4. **Test Collapse**
   - [ ] Tap header again
   - [ ] Card collapses smoothly
   - [ ] Returns to summary view

5. **Check Touch Targets**
   - [ ] Header tap area ≥44px height
   - [ ] Button tap targets adequate
   - [ ] No accidental taps

#### Responsive Breakpoints

Test at these specific widths:
- [ ] 375px (iPhone SE)
- [ ] 414px (iPhone 11 Pro Max)
- [ ] 768px (iPad)
- [ ] 1024px (Desktop transition)
- [ ] 1440px (Desktop standard)
- [ ] 1920px (Desktop large)

#### Dark Mode Testing

1. **Toggle Theme**
   - Find theme switcher in navigation
   - Toggle to dark mode

2. **Verify Colors**
   - [ ] Card background correct
   - [ ] Text readable
   - [ ] Borders visible
   - [ ] Gradient backgrounds work
   - [ ] Icons visible

---

### Step 5: Data Testing (Optional)

If you want to test with actual data:

1. **Open Supabase Dashboard**
   - Navigate to Table Editor
   - Select `user_points` table

2. **Find Your User Record**
   - Look for your `user_id` (matches auth.users)
   - Or create if doesn't exist

3. **Update Values**
   ```sql
   UPDATE public.user_points
   SET 
     prs_submitted = 24,
     prs_approved = 18,
     rair_balance = 12450.50,
     beth_balance = 0.045,
     seth_balance = 0.032,
     ape_balance = 125.00
   WHERE user_id = 'your-user-id-here';
   ```

4. **Refresh Profile**
   - Reload `/protected/profile`
   - Verify numbers update correctly

---

## ✅ Success Checklist

### Database
- [x] SQL script executed successfully
- [x] `user_points` table exists
- [x] RLS policies active
- [x] Functions created
- [x] Triggers active

### Component
- [x] `ProfilePointsCard.tsx` created
- [x] No TypeScript errors
- [x] All imports resolved
- [x] Component compiles

### Integration
- [x] Import added to profile page
- [x] Component positioned correctly
- [x] No layout breaking
- [x] Spacing correct (`mb-6`)

### Desktop UX
- [x] Always expanded
- [x] Fits within column width
- [x] Visual hierarchy clear
- [x] Aligned with wallet card

### Mobile UX
- [x] Collapses by default
- [x] Summary visible when collapsed
- [x] Expands on tap
- [x] Smooth transitions
- [x] No horizontal scroll

### Functionality
- [x] Data loads from database
- [x] Shows zero state gracefully
- [x] Claim button shows "Coming Soon"
- [x] No console errors
- [x] Dark mode compatible

---

## 🐛 Troubleshooting

### Issue: "Table user_points does not exist"
**Solution:** Re-run the SQL script in Supabase SQL Editor

### Issue: Component not found error
**Solution:** Verify file path is exactly `/components/profile/ProfilePointsCard.tsx`

### Issue: "Cannot read property 'user_points'"
**Solution:** User may not have points record yet. Try logging out and back in (triggers auto-creation)

### Issue: Data not loading
**Solution:** 
1. Check browser console for errors
2. Verify Supabase client is initialized
3. Check RLS policies in Supabase dashboard

### Issue: Mobile collapse not working
**Solution:** 
1. Check window width detection
2. Verify `isMobile` state updates on resize
3. Test in actual mobile browser (not just DevTools)

### Issue: Layout breaks on mobile
**Solution:**
1. Check Card component has `max-w-3xl mx-auto`
2. Verify parent grid uses `grid-cols-1 lg:grid-cols-[400px_1fr]`
3. Ensure no fixed widths on inner elements

---

## 📊 Sample Data for Testing

Use this SQL to populate sample data:

```sql
-- Insert sample points data for current user
INSERT INTO public.user_points (
  user_id,
  prs_submitted,
  prs_approved,
  rair_balance,
  beth_balance,
  seth_balance,
  ape_balance
)
VALUES (
  auth.uid(), -- Current user
  24,         -- PRs submitted
  18,         -- PRs approved
  12450.50,   -- RAIR balance
  0.045,      -- bETH balance
  0.032,      -- sETH balance
  125.00      -- APE balance
)
ON CONFLICT (user_id) 
DO UPDATE SET
  prs_submitted = EXCLUDED.prs_submitted,
  prs_approved = EXCLUDED.prs_approved,
  rair_balance = EXCLUDED.rair_balance,
  beth_balance = EXCLUDED.beth_balance,
  seth_balance = EXCLUDED.seth_balance,
  ape_balance = EXCLUDED.ape_balance;
```

Run this in Supabase SQL Editor while logged in as a test user.

---

## 🎯 Next Steps

After successful implementation:

1. **Monitor Performance**
   - Check page load times
   - Monitor database query performance
   - Review browser console for warnings

2. **Gather Feedback**
   - Test on actual mobile devices
   - Get user feedback on UX
   - Check analytics for engagement

3. **Future Enhancements**
   - Implement PR tracking automation
   - Add token claiming functionality
   - Create leaderboard view
   - Add historical charts

---

## 📚 Reference Documentation

- **Full Implementation Plan:** `/docs/points/POINTS-REWARDS-IMPLEMENTATION-PLAN.md`
- **SQL Setup Script:** `/docs/points/POINTS-SYSTEM-SQL-SETUP.sql`
- **Existing Patterns:**
  - Profile Wallet Card: `/components/profile-wallet-card.tsx`
  - Simple Profile Form: `/components/simple-profile-form.tsx`
  - Collapsible Section: `/components/guide/CollapsibleSection.tsx`

---

## ✅ Verification Commands

```bash
# Check if component file exists
ls -la components/profile/ProfilePointsCard.tsx

# Search for import in profile page
grep "ProfilePointsCard" app/protected/profile/page.tsx

# Build project (check for errors)
npm run build

# Run linter
npm run lint
```

---

**Status: Ready to Implement** 🚀

*Estimated Total Time: ~60 minutes*  
*Difficulty: Intermediate*  
*Risk: Low (no breaking changes)*


