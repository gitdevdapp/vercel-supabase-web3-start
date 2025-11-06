# Points & Rewards System Documentation

**Version:** 1.0  
**Last Updated:** October 15, 2025  
**Status:** ✅ Ready for Implementation  

---

## 📚 Documentation Index

This directory contains comprehensive documentation for implementing the Points & Rewards system in the user profile page.

### Core Documents

1. **[POINTS-REWARDS-IMPLEMENTATION-PLAN.md](./POINTS-REWARDS-IMPLEMENTATION-PLAN.md)** ⭐ **START HERE**
   - Complete technical implementation plan
   - Database architecture
   - UI/UX component specifications
   - Integration instructions
   - Critical review checklist
   - **Read Time:** 15 minutes
   - **Audience:** Developers, Technical Leads

2. **[QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md)** 🚀 **IMPLEMENTATION GUIDE**
   - Step-by-step implementation instructions
   - Testing procedures
   - Troubleshooting guide
   - Sample data for testing
   - **Read Time:** 5 minutes
   - **Audience:** Developers implementing the feature

3. **[POINTS-SYSTEM-SQL-SETUP.sql](./POINTS-SYSTEM-SQL-SETUP.sql)** 💾 **DATABASE SCRIPT**
   - Complete SQL setup script
   - Copy-paste ready for Supabase SQL Editor
   - Includes verification queries
   - **Execution Time:** 3-5 seconds
   - **Audience:** Database administrators, Developers

4. **[VISUAL-MOCKUPS.md](./VISUAL-MOCKUPS.md)** 🎨 **DESIGN REFERENCE**
   - ASCII wireframes for desktop and mobile
   - Component breakdown
   - Color and spacing specifications
   - Dark mode variants
   - **Read Time:** 10 minutes
   - **Audience:** Designers, Frontend Developers

---

## 🎯 Quick Navigation

### I want to understand the full scope
→ Read [POINTS-REWARDS-IMPLEMENTATION-PLAN.md](./POINTS-REWARDS-IMPLEMENTATION-PLAN.md)

### I'm ready to implement
→ Follow [QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md)

### I need the database script
→ Copy [POINTS-SYSTEM-SQL-SETUP.sql](./POINTS-SYSTEM-SQL-SETUP.sql)

### I need visual reference
→ See [VISUAL-MOCKUPS.md](./VISUAL-MOCKUPS.md)

---

## 📋 Feature Overview

### What is the Points & Rewards System?

A user-facing points tracking and token rewards system integrated into the profile page that displays:

**Core Statistics:**
- PRs Submitted (total contributions)
- PRs Approved (accepted contributions)

**Token Balances:**
- **RAIR** (Primary Reward Token) - prominently displayed
- **bETH, sETH, APE** (Secondary Tokens) - supporting balances

**Claim Interface:**
- Wallet address input for future claims
- "Coming Soon" state for claim functionality

### Key Features

✅ **Mobile-First Design**
- Collapse/expand on mobile for space efficiency
- Always expanded on desktop

✅ **Zero Dependencies**
- Uses only existing UI components
- No new npm packages required

✅ **Non-Breaking Integration**
- Positioned above existing wallet card
- Preserves all existing layouts

✅ **Future-Proof Architecture**
- Database ready for claim functionality
- Extensible token balance system

---

## 🏗️ System Architecture

### Database Layer

```
┌─────────────────────────────────────┐
│ auth.users (Supabase Auth)         │
└───────────┬─────────────────────────┘
            │
            │ Foreign Key
            ↓
┌─────────────────────────────────────┐
│ public.profiles                     │
│ - user profile data                 │
└───────────┬─────────────────────────┘
            │
            │ Trigger (auto-create)
            ↓
┌─────────────────────────────────────┐
│ public.user_points (NEW)            │
│ - prs_submitted                     │
│ - prs_approved                      │
│ - rair_balance                      │
│ - beth_balance                      │
│ - seth_balance                      │
│ - ape_balance                       │
│ - claim_wallet_address              │
│ - timestamps                        │
└─────────────────────────────────────┘
```

### Frontend Layer

```
/app/protected/profile/page.tsx
├── CollapsibleGuideAccess
└── Grid Layout
    ├── Left: SimpleProfileForm (existing)
    └── Right:
        ├── ProfilePointsCard (NEW)
        │   ├── Core Stats Display
        │   ├── Token Balances Display
        │   └── Claim Interface
        └── ProfileWalletCard (existing)
```

---

## 🚀 Implementation Timeline

### Phase 1: Database Setup (5 minutes)
- Execute SQL script in Supabase SQL Editor
- Verify table creation and RLS policies

### Phase 2: Component Development (30 minutes)
- Create `ProfilePointsCard.tsx` component
- Implement responsive design
- Add state management

### Phase 3: Integration (10 minutes)
- Update profile page with new component
- Position above wallet card
- Verify layout

### Phase 4: Testing (20 minutes)
- Desktop testing (multiple breakpoints)
- Mobile testing (collapse/expand)
- Dark mode verification
- Data loading tests

### Phase 5: Polish (15 minutes)
- Smooth transitions
- Accessibility improvements
- Final QA

**Total Estimated Time:** ~80 minutes (1.5 hours)

---

## ✅ Pre-Implementation Checklist

Before starting implementation, ensure:

- [ ] Supabase project is accessible
- [ ] `profiles` table exists in database
- [ ] Local development environment is running
- [ ] You have access to Supabase SQL Editor
- [ ] You're familiar with existing UI component patterns
- [ ] You've read the implementation plan

---

## 🔍 Critical Review Summary

The implementation plan has been reviewed for:

### ✅ Zero New Dependencies
- Uses existing UI components only
- No new npm packages
- Leverages existing Supabase client

### ✅ No Breaking Changes
- Profile page layout unchanged
- Existing components untouched
- Non-destructive database changes

### ✅ Design Consistency
- Matches ProfileWalletCard pattern
- Uses existing color scheme
- Follows typography scale
- Dark mode compatible

### ✅ Mobile Responsiveness
- Collapse/expand functionality
- Touch-friendly targets (≥44px)
- No horizontal scroll
- Smooth transitions

### ✅ Future-Proof
- Claim wallet infrastructure ready
- Extensible token system
- Scalable database design

---

## 📊 Database Schema Reference

### Table: `user_points`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `prs_submitted` | INTEGER | Total PRs submitted |
| `prs_approved` | INTEGER | Total PRs approved |
| `rair_balance` | DECIMAL(30,18) | RAIR token balance |
| `beth_balance` | DECIMAL(30,18) | bETH token balance |
| `seth_balance` | DECIMAL(30,18) | sETH token balance |
| `ape_balance` | DECIMAL(30,18) | APE token balance |
| `claim_wallet_address` | TEXT | User's claim wallet |
| `last_claim_at` | TIMESTAMPTZ | Last claim timestamp |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last update |

### RLS Policies

1. Users can view their own points (SELECT)
2. Users can update their own points (UPDATE)
3. Users can insert their own points (INSERT)

---

## 🎨 UI Component Reference

### ProfilePointsCard

**Location:** `/components/profile/ProfilePointsCard.tsx`

**Features:**
- Responsive collapse/expand
- Real-time data loading from Supabase
- Token balance formatting
- "Coming Soon" claim functionality
- Loading and error states

**Dependencies:**
- `@/components/ui/card`
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/label`
- `lucide-react` icons
- `@/lib/supabase/client`

---

## 🧪 Testing Strategy

### Desktop Testing
- [ ] 1920px (Full HD)
- [ ] 1440px (Standard Desktop)
- [ ] 1024px (Small Desktop)

### Mobile Testing
- [ ] 375px (iPhone SE)
- [ ] 414px (iPhone 11 Pro Max)
- [ ] 768px (iPad)

### Functional Testing
- [ ] Data loads correctly
- [ ] Zero state displays properly
- [ ] Collapse/expand works
- [ ] Claim button shows message
- [ ] Dark mode works

### Performance Testing
- [ ] Page load < 2s
- [ ] No console errors
- [ ] Lighthouse score ≥90

---

## 🐛 Common Issues & Solutions

### Issue: Data not loading
**Solution:** Check Supabase RLS policies, verify user authentication

### Issue: Mobile collapse not working
**Solution:** Verify window width detection, check responsive breakpoints

### Issue: Layout breaks on mobile
**Solution:** Ensure no fixed widths, verify grid classes

### Issue: Dark mode colors incorrect
**Solution:** Use CSS variables, check Tailwind dark: classes

---

## 🔧 Maintenance Notes

### Updating Token Balances
Token balances are stored in the database. To update:

```sql
UPDATE public.user_points
SET 
  rair_balance = rair_balance + 100.50,
  updated_at = NOW()
WHERE user_id = 'user-id-here';
```

### Adding New Token Types
To add a new token:

1. Add column to `user_points` table
2. Update `ProfilePointsCard` component
3. Add to token grid display

### Implementing Claim Functionality
When ready to implement claims:

1. Create smart contract integration
2. Update claim button handler
3. Add transaction signing
4. Update `last_claim_at` timestamp

---

## 📞 Support & Questions

### Documentation Questions
- Review implementation plan for details
- Check visual mockups for design specs
- Refer to quick start guide for step-by-step

### Technical Issues
- Check troubleshooting section in quick start guide
- Review Supabase dashboard for database errors
- Check browser console for frontend errors

### Enhancement Requests
- Review "Future Enhancements" section in implementation plan
- Consider scalability and performance impact
- Document proposed changes

---

## 📈 Success Metrics

### Technical Metrics
- Page load time < 2s
- Zero console errors
- Lighthouse score ≥90
- Zero accessibility violations

### User Experience Metrics
- Smooth expand/collapse transitions
- Clear visual hierarchy
- Readable on all screen sizes
- Dark mode compatibility

### Business Metrics
- User engagement with points
- Token balance views
- Claim interest (button clicks)

---

## 🎯 Future Roadmap

### Phase 1: Foundation (Current)
- ✅ Database schema
- ✅ UI components
- ✅ Basic display

### Phase 2: Automation (Future)
- PR tracking integration
- Automated point updates
- Real-time balance updates

### Phase 3: Claims (Future)
- Smart contract integration
- Transaction signing
- Gas fee estimation
- Claim history

### Phase 4: Engagement (Future)
- Leaderboard
- Historical charts
- Achievements system
- Notifications

---

## 📝 Version History

### Version 1.0 (October 15, 2025)
- Initial implementation plan
- Database schema design
- UI component specifications
- Quick start guide
- Visual mockups

---

## ✅ Final Checklist

Before considering this feature complete:

- [ ] SQL script executed successfully
- [ ] Table and RLS policies verified
- [ ] Component created and integrated
- [ ] Desktop testing passed
- [ ] Mobile testing passed
- [ ] Dark mode verified
- [ ] Accessibility checked
- [ ] Performance benchmarked
- [ ] Documentation reviewed
- [ ] Code committed to repository

---

**Ready to implement?** Start with the [QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md) 🚀

---

*Last Updated: October 15, 2025*  
*Maintained by: Development Team*  
*Status: Ready for Implementation*


