# Guide Page Fixes - Comprehensive Plan

**Created**: October 8, 2025  
**Updated**: October 8, 2025 (Code Review Complete)  
**Status**: ⚠️ VERIFIED ISSUES - Ready for Implementation  
**Priority**: CRITICAL  
**Breaking Changes**: None  
**Vercel Safe**: Yes

## Executive Summary

**CODE REVIEW COMPLETED** - Analysis confirms three critical issues with the `/guide` page:

1. **Text Wrapping NOT Guaranteed** ⚠️ CONFIRMED
   - Missing `break-words` in StepSection.tsx (line 39)
   - Missing wrapping utilities in CursorPrompt.tsx (line 30)
   - Will fail on mobile devices and with wide content (Nihonto SQL)

2. **Scroll Tracking WILL Break After Step 3-4** 🔴 CONFIRMED
   - IntersectionObserver rootMargin too restrictive: `-20% 0px -60% 0px` (line 51)
   - Single threshold `0` misses partial visibility (line 52)
   - Race condition in state updates (lines 38-46)

3. **NOT E2E Copy-Paste Ready** ⚠️ CONFIRMED
   - Database step asks Cursor to read file (line 366-369)
   - Requires file system navigation, not direct paste
   - Incompatible with Nihonto "first shot" requirement

**Full technical analysis**: See `/docs/guideui/COMPREHENSIVE-GUIDE-REVIEW.md`

## Problem Analysis

### 1. Spacing & Text Wrapping Issues 

**Current State:**
- Guide content spacing is inconsistent across different screen sizes
- Text is not wrapping properly in some containers
- Some sections appear cramped or overflow their containers
- The layout breaks at certain viewport dimensions

**Root Causes:**
- Fixed width constraints on prose content
- Missing responsive padding/margin adjustments
- Insufficient max-width handling for text content
- CursorPrompt component may have fixed dimensions

**Visual Evidence:** 
- Screenshot shows text overflow and spacing inconsistencies
- Progress bar at 31% suggests user is in "Fork Repository" section
- Layout appears compressed/improper wrapping

### 2. Missing Critical Setup Steps

**Current State:**
- Guide has 13 steps total (welcome + 12 setup steps)
- Step 6 "Deploy to Vercel" is too basic - doesn't cover:
  - Navigating Vercel dashboard after deployment
  - Connecting custom domain
  - Managing environment variables in UI
  - Understanding deployment previews vs production
- **No Namecheap/Domain Provider instructions**
- **No custom domain DNS setup**
- Users are left without guidance on getting a real domain name

**Missing Content:**
- How to purchase domain from Namecheap (or other provider)
- DNS configuration steps (A records, CNAME records)
- Vercel custom domain setup walkthrough
- Domain verification process
- SSL certificate confirmation

### 3. Left Nav Scroll Tracking Stops Working

**Current State:**
- IntersectionObserver successfully tracks first 3-4 steps
- After scrolling past initial steps, active step indicator freezes
- Steps beyond the initial sections don't register as "active"
- The sidebar doesn't auto-scroll to show later steps

**Technical Analysis:**
```tsx
// Current observer config (lines 35-54 in ProgressNav.tsx)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const stepId = entry.target.id
        setActiveStep(stepId)
        
        // Mark previous steps as completed
        const currentIndex = steps.findIndex(s => s.id === stepId)
        const completed = new Set<string>()
        steps.slice(0, currentIndex).forEach(s => completed.add(s.id))
        setCompletedSteps(completed)
      }
    })
  },
  {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  }
)
```

**Root Cause Hypothesis:**
1. **rootMargin issue**: `-20% 0px -60% 0px` creates a narrow trigger zone that might miss sections
2. **Multiple entries firing**: When multiple sections are in view, only the first one might win
3. **Race condition**: Setting state multiple times in quick succession may cause last-one-wins behavior
4. **Section height variance**: Later sections may be taller/shorter, affecting intersection detection

**Why it works for first 3-4 steps but fails later:**
- Initial steps (Welcome, Git, GitHub, Node) are shorter and fit within viewport
- Later steps (Vercel, Supabase, Database, Email) have more content and vary in height
- The rootMargin might work for compact sections but fail for longer ones
- As user scrolls faster through longer sections, intersection events may fire incorrectly

## Implementation Plan

### Phase 1: Fix Spacing & Text Wrapping ✅

**Goal:** Ensure guide renders perfectly at any viewport dimension with proper text wrapping

#### 1.1 Update StepSection Component
**File:** `/components/guide/StepSection.tsx`

**Changes Needed:**
- Add responsive padding that scales with viewport
- Ensure max-width constraints are fluid
- Add proper word-break rules for long URLs
- Improve prose container responsiveness

**Implementation:**
```tsx
// Update the section wrapper (line 15-18)
<section 
  id={id}
  className="pt-24 pb-12 md:pt-32 md:pb-16 scroll-mt-24"
>
  <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Ensure proper text wrapping */}
    <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none break-words">
      {children}
    </div>
  </div>
</section>
```

**Key Additions:**
- `break-words` - Forces long text to wrap
- Responsive prose sizes - `prose-sm` → `prose-base` → `prose-lg`
- Fluid width with `w-full`
- Responsive padding that works at all sizes

#### 1.2 Update CursorPrompt Component
**File:** `/components/guide/CursorPrompt.tsx`

**Changes Needed:**
- Ensure prompt text wraps properly
- Make container fully responsive
- Fix any fixed width constraints

**Implementation:**
```tsx
// Update prompt container (line 29-33)
<div className="p-4 w-full overflow-hidden">
  <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs sm:text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">
    {prompt}
  </div>
</div>
```

**Key Additions:**
- `w-full overflow-hidden` - Prevents horizontal overflow
- `break-words` - Wraps long words
- `whitespace-pre-wrap` - Preserves formatting but allows wrapping
- Responsive text size `text-xs sm:text-sm`

#### 1.3 Update Guide Page Layout
**File:** `/app/guide/page.tsx`

**Changes Needed:**
- Ensure main content area is responsive
- Fix desktop margin calculation
- Add proper spacing at all breakpoints

**Implementation:**
```tsx
// Update main tag (line 45)
<main className="w-full md:ml-80 pt-28 md:pt-20 px-0">
  {/* All content */}
</main>
```

#### 1.4 Add Global Responsive Utilities
**File:** `/app/globals.css`

**Add after existing guide styles:**
```css
/* Guide responsive text wrapping */
.guide-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.guide-content code {
  word-break: break-all;
}

/* Ensure CursorPrompt is always responsive */
.cursor-prompt-container {
  max-width: 100%;
  overflow-x: auto;
}

/* Mobile-specific guide adjustments */
@media (max-width: 767px) {
  .guide-step-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
```

**Testing Checklist for Phase 1:**
- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone 12)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1024px width (laptop)
- [ ] Test at 1440px width (desktop)
- [ ] Verify all CursorPrompt boxes wrap correctly
- [ ] Check long URLs wrap properly
- [ ] Ensure no horizontal scrolling at any width
- [ ] Verify code blocks are readable
- [ ] Test on Chrome, Safari, Firefox

### Phase 2: Add Vercel & Namecheap Domain Setup Steps ✅

**Goal:** Provide complete, thorough instructions for deploying to a live custom domain

#### 2.1 Expand Step 6: "Deploy to Vercel"

**Current Title:** "Setup Vercel & Deploy"  
**New Title:** "Deploy to Vercel & Configure Project"

**Add Detailed Vercel Dashboard Navigation:**

After the current Cursor AI deployment prompt, add:

```markdown
### Understanding Your Vercel Dashboard

After deployment, you'll land on your project dashboard. Here's what you need to know:

**Dashboard Overview:**
1. **Deployments Tab** (default view)
   - Shows all your deployments
   - Production deployments are marked with a 🌐 icon
   - Preview deployments are for testing

2. **Project Settings**
   - Environment Variables
   - Domains
   - Git integration settings
   - Build & Output Settings

3. **Your URLs:**
   - Production: `https://your-app.vercel.app`
   - Every git push creates a preview URL

**Manual Step - Explore Dashboard:**
1. After deployment, click on your project name
2. Note your production URL
3. Click "Settings" in the top navigation
4. Familiarize yourself with the left sidebar options
5. Keep this tab open for the next steps
```

#### 2.2 Add New Step 6.5: "Connect Custom Domain (Namecheap)"

**Insert between current Step 6 (Vercel) and Step 7 (Supabase)**

**Full Step Content:**

```tsx
<StepSection id="domain" title="Setup Custom Domain" emoji="🌐" estimatedTime="15 min">
  <p className="mb-4">
    Give your app a professional custom domain instead of the default `.vercel.app` URL.
  </p>

  {/* Option 1: Already Have a Domain */}
  <div className="my-6 p-4 border border-border bg-card rounded-lg">
    <h3 className="font-semibold text-foreground mb-3">Option A: I Already Own a Domain</h3>
    <p className="text-sm text-muted-foreground mb-2">
      Skip to Step 2 - Connect Domain to Vercel
    </p>
  </div>

  {/* Option 2: Buy New Domain */}
  <div className="my-6 p-4 border border-primary/30 bg-primary/5 rounded-lg">
    <h3 className="font-semibold text-foreground mb-3">Option B: Purchase a New Domain</h3>
    
    <p className="text-sm text-muted-foreground mb-4">
      <strong>Step 1: Buy Domain from Namecheap</strong>
    </p>
    
    <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm ml-4">
      <li>Visit <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">namecheap.com</a></li>
      <li>Search for your desired domain name (e.g., "myawesomeapp.com")</li>
      <li>Click "Add to Cart" on available domain</li>
      <li>Proceed to checkout</li>
      <li>Create Namecheap account if you don't have one</li>
      <li><strong>IMPORTANT:</strong> When asked about hosting:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>Select "No hosting" or skip hosting options</li>
          <li>You don't need Namecheap hosting (Vercel handles that)</li>
        </ul>
      </li>
      <li>Complete purchase (typically $10-15/year for .com)</li>
      <li>Wait for confirmation email (1-5 minutes)</li>
      <li>Log into Namecheap dashboard</li>
    </ol>
  </div>

  {/* Connect Domain to Vercel */}
  <div className="my-6 p-4 border border-border bg-card rounded-lg">
    <h3 className="font-semibold text-foreground mb-3">Step 2: Connect Domain to Vercel</h3>
    
    <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm ml-4">
      <li>Go to your Vercel project dashboard</li>
      <li>Click <strong>Settings</strong> → <strong>Domains</strong></li>
      <li>In the "Add Domain" field, enter your domain:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>For root domain: <code className="bg-muted px-1 py-0.5 rounded">yourdomain.com</code></li>
          <li>For www: <code className="bg-muted px-1 py-0.5 rounded">www.yourdomain.com</code></li>
          <li><strong>Recommended:</strong> Add both (one will redirect to the other)</li>
        </ul>
      </li>
      <li>Click <strong>"Add"</strong></li>
      <li>Vercel will show DNS configuration instructions</li>
      <li><strong>Keep this tab open</strong> - you'll need the DNS records</li>
    </ol>
  </div>

  {/* Configure DNS */}
  <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
    <h3 className="font-semibold text-foreground mb-3">Step 3: Configure DNS in Namecheap</h3>
    
    <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm ml-4">
      <li>Open a new tab and go to <a href="https://www.namecheap.com/myaccount/login" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Namecheap Dashboard</a></li>
      <li>Click <strong>Domain List</strong> in left sidebar</li>
      <li>Find your domain and click <strong>"Manage"</strong></li>
      <li>Go to <strong>Advanced DNS</strong> tab</li>
      <li>You'll see "HOST RECORDS" section - this is where we add DNS records</li>
      <li>Click <strong>"Add New Record"</strong> and add the following:
        
        <div className="my-3 p-3 bg-background border border-border rounded">
          <p className="font-semibold text-foreground mb-2">For Root Domain (yourdomain.com):</p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
            <li><strong>Type:</strong> A Record</li>
            <li><strong>Host:</strong> @ (means root domain)</li>
            <li><strong>Value:</strong> 76.76.21.21 (Vercel's IP)</li>
            <li><strong>TTL:</strong> Automatic</li>
          </ul>
        </div>

        <div className="my-3 p-3 bg-background border border-border rounded">
          <p className="font-semibold text-foreground mb-2">For WWW Subdomain:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
            <li><strong>Type:</strong> CNAME Record</li>
            <li><strong>Host:</strong> www</li>
            <li><strong>Value:</strong> cname.vercel-dns.com</li>
            <li><strong>TTL:</strong> Automatic</li>
          </ul>
        </div>
      </li>
      <li>Click <strong>"Save All Changes"</strong></li>
      <li><strong>IMPORTANT:</strong> Remove any default parking page records that might conflict</li>
    </ol>
  </div>

  {/* Verification */}
  <div className="my-6 p-4 border border-primary/30 bg-primary/5 rounded-lg">
    <h3 className="font-semibold text-foreground mb-3">Step 4: Verify & Wait for Propagation</h3>
    
    <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm ml-4">
      <li>Go back to your Vercel dashboard</li>
      <li>On the Domains page, Vercel will automatically verify DNS</li>
      <li>You'll see one of these statuses:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li><strong className="text-yellow-600">Pending</strong> - DNS not propagated yet</li>
          <li><strong className="text-green-600">Valid</strong> - Domain is live! ✅</li>
          <li><strong className="text-red-600">Invalid</strong> - Check your DNS settings</li>
        </ul>
      </li>
      <li><strong>Propagation Time:</strong> Can take 5 minutes to 48 hours
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>Usually works within 15-30 minutes</li>
          <li>Check status by refreshing Vercel dashboard</li>
        </ul>
      </li>
      <li>Once <strong className="text-green-600">Valid</strong>, visit your custom domain</li>
      <li>Vercel automatically provisions SSL certificate (HTTPS)</li>
    </ol>
  </div>

  {/* Troubleshooting */}
  <div className="my-6 p-4 border border-border bg-card rounded-lg">
    <h3 className="font-semibold text-foreground mb-3">Troubleshooting</h3>
    
    <CursorPrompt 
      prompt='My custom domain is showing "Invalid" in Vercel. Help me troubleshoot the DNS configuration. Check common issues like incorrect DNS records, propagation delays, or conflicting records in Namecheap.'
      title="Cursor AI: Troubleshoot Domain"
    />

    <div className="mt-4">
      <p className="text-sm font-semibold text-foreground mb-2">Common Issues:</p>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
        <li><strong>Wrong IP:</strong> Must be 76.76.21.21 (not 76.76.21.98)</li>
        <li><strong>Conflicting Records:</strong> Remove Namecheap parking page redirects</li>
        <li><strong>Wrong CNAME:</strong> Must be cname.vercel-dns.com (not just vercel.app)</li>
        <li><strong>@ vs Root:</strong> Use @ for root domain, not blank or "root"</li>
      </ul>
    </div>
  </div>

  {/* Alternative Providers */}
  <div className="my-6 p-4 bg-muted border border-border rounded-lg">
    <h3 className="text-sm font-semibold text-foreground mb-2">Using a Different Domain Provider?</h3>
    <p className="text-xs text-muted-foreground mb-2">
      The process is similar for GoDaddy, Google Domains, Cloudflare, etc:
    </p>
    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside ml-4">
      <li>Find DNS settings in your provider's dashboard</li>
      <li>Add the same A and CNAME records shown above</li>
      <li>Wait for propagation and verify in Vercel</li>
    </ol>
    
    <CursorPrompt 
      prompt='I bought my domain from [PROVIDER NAME]. Help me configure DNS records to point to Vercel. I need to add A record 76.76.21.21 and CNAME cname.vercel-dns.com. Walk me through finding DNS settings in [PROVIDER].'
      title="Cursor AI: Other Providers"
    />
  </div>

</StepSection>
```

#### 2.3 Update Step Navigation

**File:** `/components/guide/ProgressNav.tsx`

**Update steps array (lines 13-27):**
```tsx
const steps: Step[] = [
  { id: 'welcome', title: 'Welcome', emoji: '👋', estimatedTime: '2 min' },
  { id: 'git', title: 'Install Git', emoji: '📦', estimatedTime: '10 min' },
  { id: 'github', title: 'Setup GitHub', emoji: '🐙', estimatedTime: '3 min' },
  { id: 'node', title: 'Install Node.js', emoji: '⚡', estimatedTime: '5 min' },
  { id: 'fork', title: 'Fork Repository', emoji: '🍴', estimatedTime: '2 min' },
  { id: 'clone', title: 'Clone Repository', emoji: '📥', estimatedTime: '2 min' },
  { id: 'vercel', title: 'Deploy to Vercel', emoji: '▲', estimatedTime: '10 min' },
  { id: 'domain', title: 'Custom Domain', emoji: '🌐', estimatedTime: '15 min' }, // NEW
  { id: 'supabase', title: 'Setup Supabase', emoji: '🗄️', estimatedTime: '5 min' },
  { id: 'env', title: 'Environment Variables', emoji: '🔐', estimatedTime: '5 min' },
  { id: 'database', title: 'Setup Database', emoji: '🗃️', estimatedTime: '10 min' },
  { id: 'email', title: 'Configure Email', emoji: '📧', estimatedTime: '5 min' },
  { id: 'test', title: 'Test Everything', emoji: '✅', estimatedTime: '5 min' },
  { id: 'next', title: "What's Next", emoji: '🚀', estimatedTime: 'Ongoing' },
]
```

**Total Steps:** 14 (was 13)

#### 2.4 Update Email Configuration Step

**File:** `/app/guide/page.tsx`

**Update Step 10 (Email) to reference custom domain:**

```tsx
<p className="mb-4">
  Enable email signup and confirmation so users can create accounts. 
  <strong className="text-primary">Use your custom domain</strong> instead of the Vercel URL for a professional setup.
</p>

<CursorPrompt 
  prompt='Give me step-by-step instructions to configure email authentication in Supabase. I need to set the Site URL to my custom domain "https://yourdomain.com", add the necessary redirect URLs for auth callback and confirmation, and update the email confirmation template. Show me exactly what settings to change and what template HTML to use.'
/>
```

**Testing Checklist for Phase 2:**
- [ ] Verify new domain step appears in left nav
- [ ] Test progress calculation with 14 steps
- [ ] Ensure all Namecheap instructions are clear
- [ ] Verify DNS record formatting is readable
- [ ] Test CursorPrompt boxes wrap properly in domain step
- [ ] Check troubleshooting section is comprehensive
- [ ] Validate alternative provider instructions
- [ ] Ensure step IDs are unique and correct

### Phase 3: Fix Left Nav Scroll Tracking ✅

**Goal:** Ensure active step indicator works for ALL steps, not just the first 3-4

#### 3.1 Debug Current IntersectionObserver

**Root Cause Analysis:**

The issue is likely one of these:

1. **RootMargin Too Restrictive**
   - Current: `rootMargin: '-20% 0px -60% 0px'`
   - This creates a small trigger zone
   - Works for short sections, fails for tall ones

2. **Multiple Intersections Conflict**
   - When user scrolls fast, multiple sections intersect
   - Current code sets activeStep for each, last one wins
   - Might not be the intended step

3. **State Update Batching**
   - React batches setState calls
   - Multiple quick updates may cause incorrect final state

#### 3.2 Improved IntersectionObserver Implementation

**File:** `/components/guide/ProgressNav.tsx`

**Replace the entire useEffect (lines 34-62) with:**

```tsx
useEffect(() => {
  // Track which sections are currently intersecting
  const intersectingSteps = new Set<string>()
  
  const observer = new IntersectionObserver(
    (entries) => {
      // Update intersecting set based on all entries
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingSteps.add(entry.target.id)
        } else {
          intersectingSteps.delete(entry.target.id)
        }
      })

      // If any sections are intersecting, pick the topmost one
      if (intersectingSteps.size > 0) {
        // Find the first intersecting step in our steps array order
        const topMostStep = steps.find(step => intersectingSteps.has(step.id))
        
        if (topMostStep) {
          setActiveStep(topMostStep.id)
          
          // Mark previous steps as completed
          const currentIndex = steps.findIndex(s => s.id === topMostStep.id)
          const completed = new Set<string>()
          steps.slice(0, currentIndex).forEach(s => completed.add(s.id))
          setCompletedSteps(completed)
        }
      }
    },
    {
      // Use a more forgiving rootMargin
      // Triggers when section enters top 30% or bottom 30% of viewport
      rootMargin: '-30% 0px -30% 0px',
      threshold: [0, 0.1, 0.5, 0.9, 1.0] // Multiple thresholds for better detection
    }
  )

  // Observe all step sections
  steps.forEach(step => {
    const element = document.getElementById(step.id)
    if (element) {
      observer.observe(element)
    }
  })

  // Cleanup
  return () => {
    observer.disconnect()
    intersectingSteps.clear()
  }
}, [])
```

**Key Improvements:**

1. **Intersecting Set**: Tracks ALL currently visible sections
2. **Topmost Selection**: Always picks the first intersecting step (not last)
3. **Better RootMargin**: `-30% 0px -30% 0px` gives more trigger room
4. **Multiple Thresholds**: `[0, 0.1, 0.5, 0.9, 1.0]` detects partial intersections
5. **Cleanup**: Properly clears the Set on unmount

#### 3.3 Alternative Approach: Scroll-Based Detection

If IntersectionObserver still fails, use scroll position as backup:

**Add to ProgressNav.tsx:**

```tsx
// Fallback: Scroll-based active step detection
useEffect(() => {
  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 3
    
    // Find which section we're in based on scroll position
    for (let i = steps.length - 1; i >= 0; i--) {
      const element = document.getElementById(steps[i].id)
      if (element) {
        const { offsetTop } = element
        if (scrollPosition >= offsetTop) {
          setActiveStep(steps[i].id)
          
          // Mark previous steps as completed
          const completed = new Set<string>()
          steps.slice(0, i).forEach(s => completed.add(s.id))
          setCompletedSteps(completed)
          break
        }
      }
    }
  }

  // Use scroll as backup if IntersectionObserver fails
  // Throttle to avoid performance issues
  let ticking = false
  const throttledScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', throttledScroll, { passive: true })
  
  return () => window.removeEventListener('scroll', throttledScroll)
}, [])
```

#### 3.4 Enhanced Debugging

**Add temporary console logging to diagnose:**

```tsx
const observer = new IntersectionObserver(
  (entries) => {
    console.log('📊 Intersection entries:', entries.map(e => ({
      id: e.target.id,
      isIntersecting: e.isIntersecting,
      ratio: e.intersectionRatio
    })))
    
    // ... rest of observer code
  },
  // ... options
)
```

**Testing Checklist for Phase 3:**
- [ ] Scroll through entire guide slowly
- [ ] Verify active step updates for ALL 14 steps
- [ ] Test fast scrolling
- [ ] Check sidebar auto-scrolls to show active step
- [ ] Verify on Chrome, Safari, Firefox
- [ ] Test on different screen heights (laptop, desktop)
- [ ] Ensure no performance degradation
- [ ] Check completed steps update correctly
- [ ] Test clicking steps still works
- [ ] Verify progress bar updates to 100% at end

## Implementation Order

Execute in this exact order to minimize risk:

1. **Phase 1 (Styling)** - Fix text wrapping and responsive layout
   - Low risk, immediate visual improvement
   - No functional changes

2. **Phase 2 (Content)** - Add Vercel/Namecheap domain setup
   - Medium complexity
   - Adds value without breaking existing functionality
   - Update navigation to include new step

3. **Phase 3 (Scroll Tracking)** - Fix IntersectionObserver
   - Higher risk but isolated to ProgressNav component
   - Test thoroughly before deploying
   - Keep backup approach ready

## Rollback Plan

### If Phase 1 Breaks Styling:
```bash
git checkout HEAD -- components/guide/StepSection.tsx
git checkout HEAD -- components/guide/CursorPrompt.tsx
git checkout HEAD -- app/guide/page.tsx
git checkout HEAD -- app/globals.css
```

### If Phase 2 Navigation Breaks:
```bash
git checkout HEAD -- components/guide/ProgressNav.tsx
git checkout HEAD -- app/guide/page.tsx
```

### If Phase 3 Scroll Tracking Fails:
```bash
git checkout HEAD -- components/guide/ProgressNav.tsx
```

## Deployment Strategy

### Local Testing First:
```bash
npm run dev
# Test all phases thoroughly
# Check all breakpoints
# Verify all 14 steps work
```

### Build Verification:
```bash
npm run build
# Must succeed with no errors
# Check for TypeScript issues
# Verify no console warnings
```

### Vercel Deployment:
```bash
git add .
git commit -m "fix(guide): improve responsive layout, add domain setup, fix scroll tracking"
git push origin main
# Vercel auto-deploys
# Monitor deployment logs
# Test production URL immediately
```

## Success Criteria

### Phase 1 (Styling):
- ✅ No horizontal scroll at any width (320px - 2560px)
- ✅ All text wraps properly
- ✅ CursorPrompt boxes are readable on mobile
- ✅ Consistent spacing across all sections
- ✅ No layout shifts or jumps

### Phase 2 (Domain Setup):
- ✅ New "Custom Domain" step appears in navigation
- ✅ Progress calculation works with 14 steps
- ✅ Namecheap instructions are clear and complete
- ✅ DNS configuration is accurate
- ✅ Troubleshooting section is helpful
- ✅ Alternative provider guidance works

### Phase 3 (Scroll Tracking):
- ✅ Active step indicator works for ALL 14 steps
- ✅ Sidebar auto-scrolls to show active step
- ✅ No freezing after first 3-4 sections
- ✅ Smooth performance during scrolling
- ✅ Completed steps update correctly
- ✅ Progress bar reaches 100% at end

## Risk Assessment

### Low Risk Changes:
- Text wrapping fixes (Phase 1)
- Adding new content step (Phase 2)
- CSS responsive improvements (Phase 1)

### Medium Risk Changes:
- Updating steps array in ProgressNav (Phase 2)
- Adding new step section (Phase 2)

### Higher Risk Changes:
- Modifying IntersectionObserver logic (Phase 3)
- Changing scroll tracking behavior (Phase 3)

**Mitigation:**
- Test each phase independently
- Keep changes isolated to specific files
- Maintain rollback capability
- Test on multiple browsers/devices
- Monitor Vercel deployment closely

## Post-Deployment Verification

After deploying all phases:

1. **Visual Regression Testing:**
   - [ ] Check guide at 5 different screen sizes
   - [ ] Verify all CursorPrompt boxes render correctly
   - [ ] Ensure no text overflow anywhere
   - [ ] Confirm spacing is consistent

2. **Functional Testing:**
   - [ ] Scroll through all 14 steps
   - [ ] Verify active step indicator works throughout
   - [ ] Click each step in sidebar navigation
   - [ ] Check progress bar updates correctly
   - [ ] Test on mobile device

3. **Content Verification:**
   - [ ] Read through domain setup instructions
   - [ ] Verify all DNS records are accurate
   - [ ] Check all links work
   - [ ] Ensure Namecheap steps are clear

4. **Performance Check:**
   - [ ] No console errors
   - [ ] No layout shifts (CLS score)
   - [ ] Smooth scrolling performance
   - [ ] Fast page load time

## Future Enhancements

After these fixes are stable:

1. **Add Progress Persistence:**
   - Save completed steps to localStorage
   - Resume where user left off

2. **Add Step Validation:**
   - Check if user actually completed each step
   - Show warnings if skipping ahead

3. **Add Time Tracking:**
   - Track actual time spent vs estimated
   - Help improve time estimates

4. **Add Video Walkthroughs:**
   - Screen recordings for complex steps
   - Visual guides for Namecheap DNS

5. **Add Domain Provider Detection:**
   - Ask user which provider they use
   - Show provider-specific instructions

## Documentation Updates

After implementation, update:

- [ ] `/docs/guideui/README.md` - Add this plan and results
- [ ] `/docs/guideui/SCROLL-TRACKING-FIX.md` - Document Phase 3 solution
- [ ] `/docs/guideui/DOMAIN-SETUP-GUIDE.md` - Extract domain setup as standalone doc
- [ ] `/README.md` - Update guide step count (13 → 14)
- [ ] `/docs/current/README.md` - Note guide improvements

## Conclusion

This plan addresses all three critical issues:
1. ✅ Responsive layout with proper text wrapping
2. ✅ Complete domain setup instructions (Vercel + Namecheap)
3. ✅ Fixed scroll tracking for all steps

**Estimated Implementation Time:** 3-4 hours  
**Risk Level:** Low-Medium (isolated changes, good rollback plan)  
**User Impact:** High (significantly improves guide UX)  

All changes are non-breaking, Vercel-safe, and maintain backward compatibility.

---

**Next Steps:** Begin implementation with Phase 1 (styling fixes).

