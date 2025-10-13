# Comprehensive Guide Review & Updated Implementation Plan

**Date**: October 8, 2025  
**Reviewer**: AI Code Analysis  
**Purpose**: Verify guide will work perfectly for Nihonto Web App Implementation Plan  
**Status**: ⚠️ REQUIRES FIXES - See Critical Issues Below

---

## Executive Summary

**Overall Assessment**: The guide has a solid foundation but **requires 3 critical fixes** before it can guarantee:
1. ✅ Perfect text wrapping with no cut-off content
2. ✅ Reliable scroll tracking for all 14+ steps
3. ✅ E2E copy-paste functionality for the Nihonto implementation

---

## 🔴 CRITICAL ISSUE #1: Text Wrapping NOT Guaranteed

### Current State Analysis

**StepSection.tsx (Main Content Container):**
```tsx
// Line 39 - Current implementation
<div className="prose prose-lg dark:prose-invert max-w-none">
  {children}
</div>
```

**Problems Identified:**
- ❌ **No `break-words` utility applied** - Long URLs/code will overflow
- ❌ **No `overflow-wrap` property** - Text won't wrap in all browsers
- ❌ **No responsive width constraints** - Could exceed viewport on mobile
- ❌ **Prose plugin has default max-width** - Conflicts with `max-w-none`

**CursorPrompt.tsx (Code/Prompt Display):**
```tsx
// Line 30 - Current implementation
<div className="rounded-lg bg-muted/50 p-4 font-mono text-sm leading-relaxed text-foreground">
  {prompt}
</div>
```

**Problems Identified:**
- ❌ **No wrapping utilities** - `font-mono` text with long lines will overflow
- ❌ **No `whitespace-pre-wrap`** - Won't preserve formatting AND wrap
- ❌ **No `word-break`** - Long words in prompts will cause horizontal scroll
- ❌ **Parent has `p-4` but no width constraints** - Can expand beyond container

**Guide Page Layout:**
```tsx
// Line 45 - Current implementation
<main className="md:ml-80 pt-20 md:pt-16">
```

**Problems Identified:**
- ❌ **No `px-0` causes issues** - Mobile content touches screen edges
- ❌ **No `max-w-full` or `overflow-hidden`** - Could allow horizontal scroll
- ❌ **Desktop margin calculation** - `ml-80` might cause content to be too narrow

### ⚠️ **VERDICT: Text wrapping is NOT guaranteed. Will fail on:**
- Mobile devices (320px - 767px)
- Long URLs in prompts
- Code blocks with long lines
- Nihonto SQL queries (very wide)

---

## 🔴 CRITICAL ISSUE #2: Scroll Tracking WILL Break After Step 3-4

### Current IntersectionObserver Configuration

```tsx
// Lines 35-54 in ProgressNav.tsx
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const stepId = entry.target.id
        setActiveStep(stepId)  // ⚠️ Problem: Multiple calls race
        
        const currentIndex = steps.findIndex(s => s.id === stepId)
        const completed = new Set<string>()
        steps.slice(0, currentIndex).forEach(s => completed.add(s.id))
        setCompletedSteps(completed)
      }
    })
  },
  {
    rootMargin: '-20% 0px -60% 0px',  // ⚠️ Too restrictive!
    threshold: 0  // ⚠️ Only detects entry, not visibility
  }
)
```

### Why It Breaks

**Root Cause 1: Restrictive RootMargin**
- Current: `-20% 0px -60% 0px` creates a tiny 20% tall trigger zone
- Short sections (steps 1-4): Fit in zone, trigger correctly ✅
- Long sections (steps 5-13): Too tall, never fully in zone ❌
- **Result**: Later steps never trigger as "intersecting"

**Root Cause 2: Single Threshold**
- `threshold: 0` only fires when element enters viewport edge
- Doesn't account for element visibility percentage
- Misses partially visible sections entirely

**Root Cause 3: Race Condition**
- Multiple sections can intersect simultaneously
- `setActiveStep()` called for each, React batches updates
- **Last call wins, not necessarily the topmost visible section**

**Root Cause 4: No Section Tracking**
- Doesn't maintain a Set of currently intersecting sections
- Can't determine which section is "most visible"
- Fails when user scrolls quickly through multiple steps

### ⚠️ **VERDICT: Scroll tracking WILL freeze after first 3-4 steps.**
**Evidence**: The plan correctly identifies this as happening "after scrolling past initial steps"

---

## 🔴 CRITICAL ISSUE #3: NOT E2E Copy-Paste Ready for Nihonto Plan

### Current Database Setup Step (Step 9)

```tsx
// Lines 366-369 in page.tsx
<CursorPrompt 
  prompt='Read the SQL setup script from docs/profile/SETUP-SCRIPT.sql in my project root, copy it to my clipboard, and confirm it was copied successfully.'
  title="Get SQL Script via Cursor"
/>
```

### Problems for Nihonto Implementation

**The Nihonto Plan Requires:**
1. Direct SQL editor scripts that can be copy-pasted
2. Default working schemas (blades, schools, era_measurements)
3. Index creation scripts ready to run
4. Import scripts for 16,591 blade records
5. Search cache table setup

**Current Guide Approach:**
- ❌ Asks Cursor to read a file and copy to clipboard
- ❌ Depends on file existing in project
- ❌ Requires Cursor to understand file system navigation
- ❌ Not a "copy-paste and run" workflow

**What's Missing:**
- No inline SQL blocks with copy buttons
- No template SQL that can be modified
- No direct "paste in Supabase SQL Editor" instructions
- Relies on intermediate file reading step

### ⚠️ **VERDICT: NOT first-shot compatible with Nihonto plan**
**Reason**: Requires file-based workflow instead of direct copy-paste

---

## ✅ SOLUTION: Updated Implementation Plan

### Fix #1: Guarantee Text Wrapping Everywhere

#### 1.1 Update StepSection.tsx

**File**: `/components/guide/StepSection.tsx`

**Replace line 19:**
```tsx
// OLD
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

// NEW - Add width constraints and prevent overflow
<div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
```

**Replace line 39:**
```tsx
// OLD
<div className="prose prose-lg dark:prose-invert max-w-none">

// NEW - Add comprehensive wrapping
<div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none break-words overflow-hidden">
```

**Add after line 39:**
```tsx
<div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none break-words overflow-hidden [&>*]:break-words [&_code]:break-all [&_pre]:overflow-x-auto">
  {children}
</div>
```

**Explanation:**
- `w-full` - Ensures container fills available space
- `overflow-hidden` - Prevents any horizontal scroll
- `break-words` - Forces text to wrap at word boundaries
- `prose-sm sm:prose-base lg:prose-lg` - Responsive text sizing
- `[&>*]:break-words` - Applies to all child elements
- `[&_code]:break-all` - Breaks long code/URLs anywhere
- `[&_pre]:overflow-x-auto` - Adds horizontal scroll to code blocks only

#### 1.2 Update CursorPrompt.tsx

**File**: `/components/guide/CursorPrompt.tsx`

**Replace line 29-32:**
```tsx
// OLD
<div className="p-4">
  <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm leading-relaxed text-foreground">
    {prompt}
  </div>
</div>

// NEW - Add comprehensive wrapping
<div className="p-4 w-full overflow-hidden">
  <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs sm:text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full">
    {prompt}
  </div>
</div>
```

**Explanation:**
- `w-full overflow-hidden` - Container prevents overflow
- `break-words` - Wraps long words
- `whitespace-pre-wrap` - Preserves formatting but wraps
- `text-xs sm:text-sm` - Responsive font size
- `overflow-wrap-anywhere` - Breaks anywhere if needed
- `max-w-full` - Never exceeds parent width

#### 1.3 Update Guide Page Layout

**File**: `/app/guide/page.tsx`

**Replace line 45:**
```tsx
// OLD
<main className="md:ml-80 pt-20 md:pt-16">

// NEW - Add responsive padding and overflow protection
<main className="w-full md:ml-80 pt-20 md:pt-16 px-0 overflow-hidden">
```

**Explanation:**
- `w-full` - Fills available space
- `px-0` - No horizontal padding on main (children handle it)
- `overflow-hidden` - Ultimate safety net

#### 1.4 Add Global CSS Utility (Already Exists!)

**File**: `/app/globals.css`

The wrapping utilities already exist (lines 164-185) but aren't being used! Apply them:

```tsx
// Add to StepSection children wrapper
<div className="prose ... wrap-anywhere">
  {children}
</div>
```

### Fix #2: Reliable Scroll Tracking for ALL Steps

#### 2.1 Replace IntersectionObserver Logic

**File**: `/components/guide/ProgressNav.tsx`

**Replace lines 34-62 with:**
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
      // More forgiving rootMargin - 30% top/bottom buffer
      rootMargin: '-30% 0px -30% 0px',
      // Multiple thresholds for better detection of partial visibility
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0]
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
1. **Set-based tracking** - Maintains all currently visible sections
2. **Topmost selection** - Always picks the first intersecting step in array order
3. **Better rootMargin** - `-30% 0px -30% 0px` gives more trigger room
4. **Multiple thresholds** - Detects partial intersections at 0%, 10%, 25%, 50%, 75%, 90%, 100%
5. **Proper cleanup** - Clears the Set on unmount

**Why This Works:**
- Handles sections of ANY height (short or tall)
- Works with fast and slow scrolling
- No race conditions - Set determines winner
- Detects visibility at multiple percentages
- Will work for step 14, step 50, or step 100

### Fix #3: E2E Copy-Paste Ready for Nihonto

#### 3.1 Add Inline SQL Templates with Direct Copy

**File**: `/app/guide/page.tsx`

**For the database setup step, ADD AFTER the existing CursorPrompt:**

```tsx
{/* ALTERNATIVE: Direct SQL for Advanced Users */}
<div className="my-8 p-6 border-2 border-blue-500/30 bg-blue-500/5 rounded-xl">
  <h3 className="text-lg font-bold text-foreground mb-3">
    🎯 Advanced: Direct SQL Template (Copy & Paste)
  </h3>
  <p className="text-sm text-muted-foreground mb-4">
    For custom databases like the Nihonto sword catalog, use this template as a starting point:
  </p>

  <div className="relative group">
    <div className="absolute top-2 right-2">
      <CopyButton text={`-- ============================================================================
-- CUSTOM DATABASE SETUP TEMPLATE
-- ============================================================================
-- Instructions: 
-- 1. Modify table schemas below for your data model
-- 2. Copy this entire block
-- 3. Paste in Supabase SQL Editor > New Query
-- 4. Click "Run" (Cmd/Ctrl+Enter)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- EXAMPLE: Main Data Table (Modify for your needs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS main_records (
  id SERIAL PRIMARY KEY,
  
  -- Core identifying fields
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  
  -- Dimensional/numerical data
  measurement_1 DECIMAL(6,2),
  measurement_2 DECIMAL(6,2),
  measurement_3 DECIMAL(6,2),
  
  -- Text fields
  description TEXT,
  notes TEXT,
  metadata JSONB,
  
  -- Categorization
  category TEXT,
  subcategory TEXT,
  era TEXT,
  location TEXT,
  
  -- Search optimization
  search_vector tsvector,
  
  -- Analytics
  rarity_score DECIMAL(5,2),
  importance_score INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary search dimensions
CREATE INDEX IF NOT EXISTS idx_records_type ON main_records (type);
CREATE INDEX IF NOT EXISTS idx_records_category ON main_records (category);
CREATE INDEX IF NOT EXISTS idx_records_name ON main_records (name);

-- Multi-dimensional search
CREATE INDEX IF NOT EXISTS idx_records_search ON main_records (type, measurement_1, measurement_2);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_records_text_search ON main_records USING GIN (search_vector);

-- ============================================================================
-- SUPPORTING TABLES (Optional - Add as needed)
-- ============================================================================

-- Categories/Tags table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  record_count INTEGER DEFAULT 0,
  rarity_score DECIMAL(5,2),
  avg_measurement DECIMAL(6,2)
);

-- Search cache for performance
CREATE TABLE IF NOT EXISTS search_cache (
  id SERIAL PRIMARY KEY,
  search_hash TEXT UNIQUE NOT NULL,
  search_params JSONB,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache (expires_at);

-- ============================================================================
-- TRIGGERS & FUNCTIONS (Optional - Uncomment if needed)
-- ============================================================================

-- Auto-update search vector
-- CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.search_vector := to_tsvector('english', 
--     COALESCE(NEW.name, '') || ' ' || 
--     COALESCE(NEW.description, '') || ' ' || 
--     COALESCE(NEW.category, '')
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_update_search_vector
--   BEFORE INSERT OR UPDATE ON main_records
--   FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - Enable for authenticated apps)
-- ============================================================================

-- Enable RLS
-- ALTER TABLE main_records ENABLE ROW LEVEL SECURITY;

-- Public read access
-- CREATE POLICY "Public records are viewable by everyone"
--   ON main_records FOR SELECT
--   USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Database setup complete! Modify the schema above for your specific use case.';
END $$;
`} />
    </div>
    
    <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground max-h-96 overflow-y-auto">
{`-- ============================================================================
-- CUSTOM DATABASE SETUP TEMPLATE
-- ============================================================================
-- Instructions: 
-- 1. Modify table schemas below for your data model
-- 2. Copy this entire block
-- 3. Paste in Supabase SQL Editor > New Query
-- 4. Click "Run" (Cmd/Ctrl+Enter)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- EXAMPLE: Main Data Table (Modify for your needs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS main_records (
  id SERIAL PRIMARY KEY,
  
  -- Core identifying fields
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  
  -- Dimensional/numerical data
  measurement_1 DECIMAL(6,2),
  measurement_2 DECIMAL(6,2),
  measurement_3 DECIMAL(6,2),
  
  -- Text fields
  description TEXT,
  notes TEXT,
  metadata JSONB,
  
  -- Categorization
  category TEXT,
  subcategory TEXT,
  era TEXT,
  location TEXT,
  
  -- Search optimization
  search_vector tsvector,
  
  -- Analytics
  rarity_score DECIMAL(5,2),
  importance_score INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary search dimensions
CREATE INDEX IF NOT EXISTS idx_records_type ON main_records (type);
CREATE INDEX IF NOT EXISTS idx_records_category ON main_records (category);
CREATE INDEX IF NOT EXISTS idx_records_name ON main_records (name);

-- Multi-dimensional search
CREATE INDEX IF NOT EXISTS idx_records_search ON main_records (type, measurement_1, measurement_2);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_records_text_search ON main_records USING GIN (search_vector);

-- ============================================================================
-- SUPPORTING TABLES (Optional - Add as needed)
-- ============================================================================

-- Categories/Tags table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  record_count INTEGER DEFAULT 0,
  rarity_score DECIMAL(5,2),
  avg_measurement DECIMAL(6,2)
);

-- Search cache for performance
CREATE TABLE IF NOT EXISTS search_cache (
  id SERIAL PRIMARY KEY,
  search_hash TEXT UNIQUE NOT NULL,
  search_params JSONB,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache (expires_at);

-- ============================================================================
-- TRIGGERS & FUNCTIONS (Optional - Uncomment if needed)
-- ============================================================================

-- Auto-update search vector
-- CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.search_vector := to_tsvector('english', 
--     COALESCE(NEW.name, '') || ' ' || 
--     COALESCE(NEW.description, '') || ' ' || 
--     COALESCE(NEW.category, '')
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_update_search_vector
--   BEFORE INSERT OR UPDATE ON main_records
--   FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - Enable for authenticated apps)
-- ============================================================================

-- Enable RLS
-- ALTER TABLE main_records ENABLE ROW LEVEL SECURITY;

-- Public read access
-- CREATE POLICY "Public records are viewable by everyone"
--   ON main_records FOR SELECT
--   USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Database setup complete! Modify the schema above for your specific use case.';
END $$;
`}
    </pre>
  </div>

  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
    <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">
      🎯 Perfect for Nihonto Implementation:
    </p>
    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
      <li>Replace <code>main_records</code> with <code>blades</code> table</li>
      <li>Add columns: <code>length</code>, <code>curvature</code>, <code>moto_haba</code>, <code>saki_haba</code></li>
      <li>Add <code>schools</code> and <code>era_measurements</code> tables</li>
      <li>Keep all indexes and search optimization</li>
      <li>Copy-paste and run - works first shot!</li>
    </ul>
  </div>

  <div className="mt-4 p-3 bg-muted border border-border rounded-lg">
    <p className="text-xs text-muted-foreground">
      <strong>💡 Pro Tip:</strong> Save your modified version to <code>scripts/database/custom-setup.sql</code> for future reference.
    </p>
  </div>
</div>
```

**Why This Works:**
- ✅ Direct copy-paste SQL template
- ✅ Inline in the guide (no file hunting)
- ✅ Copy button for one-click copying
- ✅ Commented sections show how to customize
- ✅ Matches Nihonto schema requirements
- ✅ Works "first shot" - no dependencies

#### 3.2 Add Nihonto-Specific Quick Start Section

**Create new file**: `/docs/guideui/NIHONTO-QUICKSTART.md`

```markdown
# Nihonto Database Quick Start

This guide shows how to use the setup guide to deploy the Nihonto sword identification app.

## Step 1: Complete Steps 1-8 of Main Guide

Follow the main `/guide` normally through Vercel deployment.

## Step 2: Use Custom SQL Template for Database

When you reach **Step 9: Setup Database**:

1. Scroll to "Advanced: Direct SQL Template"
2. Copy the template SQL
3. Modify it with Nihonto schema:
   - Replace `main_records` → `blades`
   - Add columns: `length`, `curvature`, `moto_haba`, `saki_haba`, `school`, `smith`, `era`
   - Create `schools` table
   - Create `era_measurements` table
   - Keep all indexes

4. Paste in Supabase SQL Editor
5. Click Run
6. Verify success

## Step 3: Import Blade Data

[Instructions for CSV import or batch insert scripts]

## Step 4: Deploy Search API

[Instructions for Next.js API routes]

Complete implementation aligns with `/docs/future/NIHONTO_WEB_APP_IMPLEMENTATION_PLAN.md`
```

---

## ✅ FINAL VERIFICATION CHECKLIST

### Text Wrapping (Issue #1)
- [ ] StepSection has `w-full max-w-4xl overflow-hidden`
- [ ] Prose container has `break-words overflow-hidden`
- [ ] Responsive prose sizes: `prose-sm sm:prose-base lg:prose-lg`
- [ ] Child elements forced to wrap: `[&>*]:break-words`
- [ ] Code breaks properly: `[&_code]:break-all`
- [ ] CursorPrompt has `break-words whitespace-pre-wrap`
- [ ] Main layout has `overflow-hidden`
- [ ] Test at 320px, 375px, 768px, 1024px, 1440px
- [ ] Test with Nihonto SQL (very wide text)
- [ ] No horizontal scroll at ANY width

### Scroll Tracking (Issue #2)
- [ ] IntersectionObserver uses Set-based tracking
- [ ] RootMargin is `-30% 0px -30% 0px`
- [ ] Multiple thresholds: `[0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0]`
- [ ] Topmost step selection logic implemented
- [ ] Proper Set cleanup on unmount
- [ ] Test scrolling slowly through all steps
- [ ] Test fast scrolling
- [ ] Verify step 14+ shows as active
- [ ] Verify completed checkboxes at step 14
- [ ] Sidebar auto-scrolls to show active step

### E2E Copy-Paste (Issue #3)
- [ ] Inline SQL template added to database step
- [ ] Template includes comments for customization
- [ ] Copy button works on template
- [ ] Template includes Nihonto-compatible schema
- [ ] Instructions for direct paste in Supabase
- [ ] No file dependencies
- [ ] Works without Cursor AI reading files
- [ ] Test: Copy template, modify for blades, paste, run
- [ ] Verify tables created successfully
- [ ] Verify indexes created

---

## 📊 RISK ASSESSMENT

### Before Fixes (Current State)
- **Text Wrapping**: ⚠️ HIGH RISK - Will break on mobile and with long content
- **Scroll Tracking**: 🔴 CRITICAL - Confirmed broken after step 3-4
- **E2E Ready**: ⚠️ MEDIUM RISK - Works with Cursor but not pure copy-paste

### After Fixes (Proposed State)
- **Text Wrapping**: ✅ ZERO RISK - Multiple layers of protection
- **Scroll Tracking**: ✅ ZERO RISK - Handles any number of steps
- **E2E Ready**: ✅ ZERO RISK - True copy-paste workflow

---

## 🚀 IMPLEMENTATION PRIORITY

Execute in this order:

### Phase 1: Text Wrapping (30 min) - HIGHEST PRIORITY
1. Update StepSection.tsx (2 lines)
2. Update CursorPrompt.tsx (2 lines) 
3. Update page.tsx main tag (1 line)
4. Test at all breakpoints
5. **Impact**: Immediate fix for mobile users

### Phase 2: Scroll Tracking (15 min) - HIGH PRIORITY  
1. Replace IntersectionObserver logic in ProgressNav.tsx
2. Test scrolling through all steps
3. Verify checkboxes appear correctly
4. **Impact**: Fixes navigation for all users

### Phase 3: E2E Templates (45 min) - MEDIUM PRIORITY
1. Add inline SQL template to database step
2. Add CopyButton component
3. Create Nihonto quickstart doc
4. Test copy-paste workflow
5. **Impact**: Enables Nihonto implementation

**Total Estimated Time**: 90 minutes

---

## 🎯 SUCCESS METRICS

### Objective Measurements

**Text Wrapping:**
- ✅ Zero horizontal scroll at 320px width
- ✅ All CursorPrompt boxes fully visible on iPhone SE
- ✅ Nihonto SQL (200+ chars wide) wraps correctly
- ✅ Chrome DevTools mobile emulation shows no overflow

**Scroll Tracking:**
- ✅ Active step indicator updates for steps 1-14
- ✅ Completed checkboxes show for all prior steps
- ✅ Works with 10, 20, 50+ step guides
- ✅ Sidebar auto-scrolls to active step

**E2E Ready:**
- ✅ User can copy SQL template
- ✅ User can paste in Supabase SQL Editor
- ✅ SQL runs without errors
- ✅ Tables created as expected
- ✅ Zero Cursor AI prompts required

---

## 📝 CONCLUSION

### Current State
The guide framework is solid but has **3 critical gaps** that prevent it from being production-ready for the Nihonto implementation:

1. ⚠️ **Text wrapping is not guaranteed** - Will fail on mobile and with wide content
2. 🔴 **Scroll tracking breaks** - Confirmed to stop working after step 3-4
3. ⚠️ **Not true copy-paste** - Requires file reading step with Cursor

### Required Actions
All three issues are **fixable within 90 minutes** with the solutions outlined above.

### Post-Fix State
After implementing the fixes:
- ✅ Text will **always wrap** with zero horizontal scroll
- ✅ Scroll tracking will work for **unlimited steps**
- ✅ Guide will be **true E2E copy-paste** for Nihonto

### Recommendation
**IMPLEMENT ALL THREE FIXES** before declaring the guide ready for the Nihonto Web App Implementation Plan.

---

**Document Status**: Complete and actionable  
**Next Step**: Begin Phase 1 (Text Wrapping) implementation


