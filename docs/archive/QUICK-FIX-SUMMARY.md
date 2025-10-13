# Guide Fixes - Quick Summary

**Date**: October 8, 2025  
**Status**: Ready to implement  
**Risk Level**: Low-Medium  
**Vercel Safe**: ✅ Yes

## Problems Identified

### 1. 🎨 Spacing & Text Wrapping Issues
- Text doesn't wrap properly at all screen sizes
- Some content overflows containers
- CursorPrompt boxes not fully responsive
- Spacing inconsistent across breakpoints

### 2. 📝 Missing Critical Content
- Vercel setup too basic - no dashboard navigation
- **No Namecheap/domain provider instructions**
- **No DNS setup guide**
- Users can't set up custom domains

### 3. 🐛 Left Nav Scroll Bug
- Active step indicator works for steps 1-4
- **Breaks/freezes for steps 5-13**
- Sidebar doesn't show which step you're on when scrolling
- IntersectionObserver configuration issue

## Solution Overview

### Phase 1: Fix Styling & Responsiveness ⏱️ 1 hour
**Files to update:**
- `components/guide/StepSection.tsx` - Add responsive padding, text wrapping
- `components/guide/CursorPrompt.tsx` - Fix prompt box responsiveness  
- `app/guide/page.tsx` - Update main content area
- `app/globals.css` - Add responsive utilities

**Key changes:**
- Add `break-words` and `whitespace-pre-wrap` for text wrapping
- Responsive prose sizes: `prose-sm` → `prose-base` → `prose-lg`
- Proper width constraints with `w-full` and `max-w-4xl`
- Test at 320px, 768px, 1024px, 1440px

### Phase 2: Add Domain Setup Instructions ⏱️ 2 hours
**Files to update:**
- `app/guide/page.tsx` - Add new step section after Vercel
- `components/guide/ProgressNav.tsx` - Update steps array (13 → 14)

**New step: "Setup Custom Domain"**
- Option A: Already own domain → skip to Vercel connection
- Option B: Buy from Namecheap step-by-step
  - How to search and purchase domain
  - Skipping unnecessary hosting options
  - Navigating to DNS settings
- DNS Configuration walkthrough:
  - A Record: `@` → `76.76.21.21`
  - CNAME: `www` → `cname.vercel-dns.com`
- Vercel domain connection process
- Propagation and verification
- Troubleshooting common issues
- Alternative providers (GoDaddy, Google Domains, etc.)

### Phase 3: Fix Scroll Tracking ⏱️ 30-60 min
**File to update:**
- `components/guide/ProgressNav.tsx` - Fix IntersectionObserver

**Root cause:**
- Current rootMargin: `-20% 0px -60% 0px` is too restrictive
- Only single threshold `[0]` misses partial intersections
- Multiple simultaneous intersections conflict

**Solution:**
```tsx
// Track ALL intersecting sections, pick topmost one
const intersectingSteps = new Set<string>()

const observer = new IntersectionObserver(
  (entries) => {
    // Update set
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        intersectingSteps.add(entry.target.id)
      } else {
        intersectingSteps.delete(entry.target.id)
      }
    })

    // Pick first intersecting step in array order
    const topMostStep = steps.find(step => intersectingSteps.has(step.id))
    if (topMostStep) {
      setActiveStep(topMostStep.id)
      // ... mark completed
    }
  },
  {
    rootMargin: '-30% 0px -30% 0px', // More forgiving
    threshold: [0, 0.1, 0.5, 0.9, 1.0] // Multiple thresholds
  }
)
```

## Implementation Order

1. ✅ **Phase 1 first** (styling) - Safe, immediate visual improvement
2. ✅ **Phase 2 second** (content) - Adds value, no breakage risk  
3. ✅ **Phase 3 last** (scroll fix) - Higher complexity, test thoroughly

## Testing Checklist

### Phase 1 - Responsive Layout
- [ ] No horizontal scroll at 320px (iPhone SE)
- [ ] Text wraps at 375px (iPhone 12)
- [ ] Proper layout at 768px (tablet)
- [ ] Desktop works at 1024px and 1440px
- [ ] All CursorPrompt boxes readable

### Phase 2 - Domain Setup
- [ ] New step appears in nav (14 total)
- [ ] Progress % calculates correctly
- [ ] All DNS records are accurate
- [ ] Namecheap instructions clear
- [ ] Links to Namecheap/Vercel work
- [ ] Troubleshooting section helpful

### Phase 3 - Scroll Tracking  
- [ ] Active step updates for ALL 14 steps
- [ ] No freezing after step 4
- [ ] Sidebar auto-scrolls to show active
- [ ] Works with fast scrolling
- [ ] Progress bar reaches 100%

## Quick Deploy

```bash
# Test locally
npm run dev

# Build check
npm run build

# Deploy
git add .
git commit -m "fix(guide): responsive layout, domain setup, scroll tracking"
git push origin main
```

## Rollback If Needed

```bash
# Rollback specific phase
git checkout HEAD -- components/guide/StepSection.tsx  # Phase 1
git checkout HEAD -- components/guide/CursorPrompt.tsx # Phase 1
git checkout HEAD -- app/guide/page.tsx                # Phase 1 & 2
git checkout HEAD -- components/guide/ProgressNav.tsx  # Phase 2 & 3
git checkout HEAD -- app/globals.css                   # Phase 1
```

## Success Metrics

✅ **Phase 1**: Zero horizontal scroll, perfect text wrapping  
✅ **Phase 2**: Users can setup custom domain end-to-end  
✅ **Phase 3**: Active step indicator works for entire guide  

## Full Details

See `GUIDE-FIXES-PLAN.md` for:
- Detailed technical analysis
- Complete code snippets
- Extensive troubleshooting guides
- Risk assessment
- Alternative approaches

---

**Estimated Total Time**: 3-4 hours  
**Files Modified**: 5  
**New Steps Added**: 1 (domain setup)  
**Bugs Fixed**: 2 (wrapping, scroll tracking)

