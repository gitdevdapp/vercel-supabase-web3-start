# Left Navigation Redesign Plan
## Date: October 14, 2025

## Objective
Update the desktop left navigation to reflect the new phase-based organizational structure, showing current phase, completed steps, and implementing smart auto-scrolling to keep the active step centered in view.

---

## Current State Analysis

### Existing Structure (Flat)
The current `ProgressNav.tsx` displays 14 flat steps:
- Welcome
- Install Git
- Setup GitHub
- Install Node.js
- Fork Repository
- Clone Repository
- Deploy to Vercel
- Custom Domain (Optional)
- Setup Supabase
- Environment Variables
- Setup Database
- Configure Email
- Test Everything
- What's Next

### Issues with Current Design
1. **No Phase Grouping** - All steps are flat, no hierarchy
2. **No Phase Indicators** - Users don't know which phase they're in
3. **Doesn't Match Guide Content** - Guide page has 5 phases but nav doesn't
4. **Poor Scanning** - Hard to see overall progress at a glance
5. **Auto-scroll Uses "nearest"** - Active step can be at top or bottom of scroll view (not centered)

---

## New Structure (Phase-Based)

### 5 Major Phases with Sub-Steps

#### Phase 1: GitHub Setup
- 1.1 Install Git
- 1.2 Create GitHub Account
- 1.3 Setup SSH Keys
- 1.4 Fork Repository

#### Phase 2: Vercel Deployment
- 2.1 Install Node.js
- 2.2 Clone Repository
- 2.3 Create Vercel Account & Deploy
- 2.4 Custom Domain (Optional)

#### Phase 3: Supabase Setup
- 3.1 Create Supabase Account
- 3.2 Configure Environment Variables
- 3.3 Setup Database
- 3.4 Configure Email Authentication

#### Phase 4: Coinbase Developer Program (REQUIRED)
- 4.1 Create CDP Account
- 4.2 Generate API Keys
- 4.3 Add CDP to Vercel

#### Phase 5: Testing & Verification
- 5.1 Test User Authentication
- 5.2 Test Wallet Creation (CRITICAL)
- 5.3 Verify Supabase Contains Wallet Address (CRITICAL)
- 5.4 Test Send Transaction (CRITICAL)
- 5.5 Additional Tests

---

## Design Requirements

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│ Setup Guide                         │
│ Progress: 14%                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ ┌─────────────────────────────────┐ │ ← Scrollable area
│ │ ✅ Phase 1: GitHub Setup        │ │   starts here
│ │   ✅ 1.1 Install Git            │ │
│ │   → 1.2 Create GitHub Account   │ │ ← Active step
│ │      (highlighted, centered)    │ │   should stay
│ │   ⚪ 1.3 Setup SSH Keys         │ │   in middle
│ │   ⚪ 1.4 Fork Repository        │ │
│ │                                 │ │
│ │ ⚪ Phase 2: Vercel Deployment   │ │
│ │   ⚪ 2.1 Install Node.js        │ │
│ │   ⚪ 2.2 Clone Repository       │ │
│ │   ⚪ 2.3 Deploy to Vercel       │ │
│ │   ⚪ 2.4 Custom Domain (Opt)    │ │
│ │                                 │ │
│ │ ⚪ Phase 3: Supabase Setup      │ │
│ │   (collapsed when not active)   │ │
│ │                                 │ │
│ │ ⚪ Phase 4: CDP (REQUIRED)      │ │
│ │   (collapsed when not active)   │ │
│ │                                 │ │
│ │ ⚪ Phase 5: Testing             │ │
│ │   (collapsed when not active)   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Key Features

1. **Phase Sections**
   - Bold phase headers (H3-style)
   - Phase number and name
   - Overall phase status (completed, in-progress, pending)
   - Collapsible/expandable sections
   - Active phase always expanded

2. **Sub-Steps**
   - Indented under phase headers
   - Step numbering (1.1, 1.2, etc.)
   - Individual completion status
   - Active step highlighted
   - Estimated time shown

3. **Status Indicators**
   - ✅ Green checkmark for completed
   - 🔵 Blue dot/arrow for active/in-progress
   - ⚪ Gray circle for pending
   - Special marker for REQUIRED phases

4. **Auto-Scroll Behavior**
   - **CRITICAL**: Active step should scroll to CENTER of visible area
   - Use `block: 'center'` instead of `block: 'nearest'`
   - Smooth scroll animation
   - Maintain center position as user progresses

---

## Implementation Plan

### Step 1: Update Data Structure

**File:** `components/guide/ProgressNav.tsx`

**Changes:**
1. Replace flat `steps` array with `phases` array
2. Each phase contains:
   - `id`: string (for intersection observer)
   - `title`: string
   - `phaseNumber`: number (1-5)
   - `emoji`: string
   - `isRequired`: boolean (for Phase 4)
   - `steps`: array of sub-steps

**New Data Structure:**
```typescript
interface SubStep {
  id: string
  title: string
  shortTitle: string // For compact display
  estimatedTime: string
  isOptional?: boolean
}

interface Phase {
  id: string
  phaseNumber: number
  title: string
  emoji: string
  isRequired?: boolean // For Phase 4
  description: string
  steps: SubStep[]
}

const phases: Phase[] = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'GitHub Setup',
    emoji: '🐙',
    description: 'Configure GitHub as your master login',
    steps: [
      { id: 'git', title: '1.1 Install Git', shortTitle: 'Install Git', estimatedTime: '5 min' },
      { id: 'github', title: '1.2 Create GitHub Account', shortTitle: 'GitHub Account', estimatedTime: '5 min' },
      { id: 'ssh', title: '1.3 Setup SSH Keys', shortTitle: 'SSH Keys', estimatedTime: '5 min' },
      { id: 'fork', title: '1.4 Fork Repository', shortTitle: 'Fork Repo', estimatedTime: '3 min' }
    ]
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Vercel Deployment',
    emoji: '▲',
    description: 'Deploy your application to production',
    steps: [
      { id: 'node', title: '2.1 Install Node.js', shortTitle: 'Node.js', estimatedTime: '3 min' },
      { id: 'clone', title: '2.2 Clone Repository', shortTitle: 'Clone Repo', estimatedTime: '5 min' },
      { id: 'vercel', title: '2.3 Create Vercel Account & Deploy', shortTitle: 'Deploy', estimatedTime: '10 min' },
      { id: 'domain', title: '2.4 Custom Domain', shortTitle: 'Domain', estimatedTime: '20 min', isOptional: true }
    ]
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: 'Supabase Setup',
    emoji: '🗄️',
    description: 'Configure database and authentication',
    steps: [
      { id: 'supabase', title: '3.1 Create Supabase Account', shortTitle: 'Supabase Account', estimatedTime: '7 min' },
      { id: 'env', title: '3.2 Configure Environment Variables', shortTitle: 'Env Vars', estimatedTime: '10 min' },
      { id: 'database', title: '3.3 Setup Database', shortTitle: 'Database', estimatedTime: '10 min' },
      { id: 'email', title: '3.4 Configure Email', shortTitle: 'Email', estimatedTime: '5 min' }
    ]
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Coinbase Developer Program',
    emoji: '💰',
    isRequired: true,
    description: 'Enable Web3 wallet creation (REQUIRED)',
    steps: [
      { id: 'coinbase', title: '4.1 Create CDP Account', shortTitle: 'CDP Account', estimatedTime: '3 min' },
      { id: 'cdp-keys', title: '4.2 Generate API Keys', shortTitle: 'API Keys', estimatedTime: '10 min' },
      { id: 'cdp-env', title: '4.3 Add CDP to Vercel', shortTitle: 'CDP Env Vars', estimatedTime: '5 min' }
    ]
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Testing & Verification',
    emoji: '✅',
    description: 'Verify end-to-end functionality',
    steps: [
      { id: 'test-auth', title: '5.1 Test User Authentication', shortTitle: 'Test Auth', estimatedTime: '3 min' },
      { id: 'test-wallet', title: '5.2 Test Wallet Creation', shortTitle: 'Test Wallet', estimatedTime: '5 min' },
      { id: 'test-supabase', title: '5.3 Verify Supabase', shortTitle: 'Verify DB', estimatedTime: '3 min' },
      { id: 'test-transaction', title: '5.4 Test Send Transaction', shortTitle: 'Test TX', estimatedTime: '5 min' },
      { id: 'test-additional', title: '5.5 Additional Tests', shortTitle: 'More Tests', estimatedTime: '3 min' }
    ]
  }
]
```

### Step 2: Update State Management

**New State Variables:**
```typescript
const [activeStep, setActiveStep] = useState('git') // Current sub-step
const [activePhase, setActivePhase] = useState(1) // Current phase number
const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set())
const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1])) // Start with Phase 1 expanded
```

**Logic Updates:**
1. Track which phase user is in based on active step
2. Automatically expand active phase
3. Collapse previous/next phases (optional - can keep all expanded)
4. Calculate phase completion percentage
5. Mark phase as complete when all sub-steps complete

### Step 3: Fix Auto-Scroll to Center

**Current Code (Line 98-103):**
```typescript
activeButton.scrollIntoView({
  behavior: 'smooth',
  block: 'nearest', // ❌ This causes active step to be at top or bottom
  inline: 'nearest'
})
```

**New Code:**
```typescript
activeButton.scrollIntoView({
  behavior: 'smooth',
  block: 'center', // ✅ This keeps active step in the CENTER
  inline: 'nearest'
})
```

**Why This Matters:**
- `block: 'nearest'` scrolls the minimum amount needed
- `block: 'center'` always positions element in vertical center
- Better UX: user always sees context above and below active step
- Easier to see "where am I" and "what's next"

### Step 4: Update Render Logic

**Phase Header Rendering:**
```typescript
{phases.map((phase) => {
  const isActivePhase = activePhase === phase.phaseNumber
  const isPhaseCompleted = completedPhases.has(phase.phaseNumber)
  const isExpanded = expandedPhases.has(phase.phaseNumber)
  
  return (
    <div key={phase.id} className="mb-2">
      {/* Phase Header Button */}
      <button
        onClick={() => togglePhaseExpansion(phase.phaseNumber)}
        className={`w-full text-left rounded-lg p-3 ${
          isActivePhase 
            ? 'bg-primary/10 border-l-4 border-primary' 
            : isPhaseCompleted
            ? 'bg-green-500/5 border-l-4 border-green-500'
            : 'bg-muted/30'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Phase Status Icon */}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isPhaseCompleted ? 'bg-green-500' : isActivePhase ? 'bg-primary' : 'bg-muted'
          }`}>
            {isPhaseCompleted ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <span className="text-sm">{phase.emoji}</span>
            )}
          </div>
          
          {/* Phase Title */}
          <div className="flex-1">
            <p className={`text-sm font-bold ${
              isActivePhase ? 'text-primary' : isPhaseCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
            }`}>
              Phase {phase.phaseNumber}: {phase.title}
            </p>
            {phase.isRequired && (
              <span className="text-xs text-red-500 font-semibold">REQUIRED</span>
            )}
          </div>
          
          {/* Expand/Collapse Icon */}
          <ChevronRight className={`w-4 h-4 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </div>
      </button>
      
      {/* Sub-Steps (Collapsible) */}
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-3">
          {phase.steps.map((step) => {
            const isActive = activeStep === step.id
            const isCompleted = completedSteps.has(step.id)
            
            return (
              <button
                key={step.id}
                data-step-id={step.id}
                onClick={() => scrollToStep(step.id)}
                className={`w-full text-left rounded p-2 transition-all ${
                  isActive 
                    ? 'bg-primary/10 border-l-2 border-primary' 
                    : isCompleted
                    ? 'bg-muted/50'
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Step Status Icon */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isActive
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-white' : 'bg-muted-foreground'
                      }`} />
                    )}
                  </div>
                  
                  {/* Step Title */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${
                      isActive 
                        ? 'text-primary' 
                        : isCompleted
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}>
                      {step.title}
                      {step.isOptional && (
                        <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.estimatedTime}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})}
```

### Step 5: Update Progress Calculation

**Overall Progress:**
```typescript
// Count all sub-steps across all phases
const totalSteps = phases.reduce((sum, phase) => sum + phase.steps.length, 0)
const completedCount = completedSteps.size
const progress = ((completedCount / totalSteps) * 100).toFixed(0)
```

**Per-Phase Progress:**
```typescript
const getPhaseProgress = (phaseNumber: number): number => {
  const phase = phases.find(p => p.phaseNumber === phaseNumber)
  if (!phase) return 0
  
  const phaseStepIds = phase.steps.map(s => s.id)
  const completedInPhase = phaseStepIds.filter(id => completedSteps.has(id)).length
  
  return (completedInPhase / phase.steps.length) * 100
}
```

### Step 6: Update Intersection Observer

**Track Both Steps and Phases:**
```typescript
useEffect(() => {
  const intersectingSteps = new Set<string>()
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingSteps.add(entry.target.id)
        } else {
          intersectingSteps.delete(entry.target.id)
        }
      })

      if (intersectingSteps.size > 0) {
        // Find first intersecting step
        let topMostStep: SubStep | null = null
        let topMostPhase: Phase | null = null
        
        for (const phase of phases) {
          for (const step of phase.steps) {
            if (intersectingSteps.has(step.id)) {
              topMostStep = step
              topMostPhase = phase
              break
            }
          }
          if (topMostStep) break
        }
        
        if (topMostStep && topMostPhase) {
          setActiveStep(topMostStep.id)
          setActivePhase(topMostPhase.phaseNumber)
          
          // Auto-expand active phase
          setExpandedPhases(prev => new Set(prev).add(topMostPhase.phaseNumber))
          
          // Mark previous steps as completed
          const allSteps = phases.flatMap(p => p.steps)
          const currentIndex = allSteps.findIndex(s => s.id === topMostStep.id)
          const completed = new Set<string>()
          allSteps.slice(0, currentIndex).forEach(s => completed.add(s.id))
          setCompletedSteps(completed)
          
          // Mark previous phases as completed
          const completedPhaseNumbers = new Set<number>()
          for (let i = 0; i < phases.length; i++) {
            const phase = phases[i]
            if (phase.phaseNumber < topMostPhase.phaseNumber) {
              completedPhaseNumbers.add(phase.phaseNumber)
            }
          }
          setCompletedPhases(completedPhaseNumbers)
        }
      }
    },
    {
      rootMargin: '-30% 0px -30% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0]
    }
  )

  // Observe all step IDs
  phases.forEach(phase => {
    phase.steps.forEach(step => {
      const element = document.getElementById(step.id)
      if (element) observer.observe(element)
    })
  })

  return () => {
    observer.disconnect()
    intersectingSteps.clear()
  }
}, [])
```

---

## Visual Design Details

### Color Scheme

**Phase Headers:**
- Active: `bg-primary/10 border-l-4 border-primary`
- Completed: `bg-green-500/5 border-l-4 border-green-500`
- Pending: `bg-muted/30`

**Sub-Steps:**
- Active: `bg-primary/10 border-l-2 border-primary`
- Completed: `bg-muted/50`
- Pending: `hover:bg-muted/30`

**Status Icons:**
- Completed: Green circle with white checkmark
- Active: Primary color circle
- Pending: Muted circle

**Required Badge:**
- Phase 4: Red text "REQUIRED" badge
- Critical tests: Red warning icon

### Typography

**Phase Headers:**
- Font: `text-sm font-bold`
- Active: `text-primary`
- Completed: `text-green-600 dark:text-green-400`
- Pending: `text-muted-foreground`

**Sub-Steps:**
- Font: `text-xs font-medium`
- Active: `text-primary`
- Completed: `text-foreground`
- Pending: `text-muted-foreground`

### Spacing & Sizing

**Phase Header:**
- Padding: `p-3`
- Gap: `gap-2`
- Icon size: `w-6 h-6`
- Margin bottom: `mb-2`

**Sub-Steps:**
- Padding: `p-2`
- Gap: `gap-2`
- Icon size: `w-5 h-5`
- Left border: `border-l-2 border-muted`
- Margin left: `ml-4`
- Padding left: `pl-3`

---

## Update Guide Page IDs

### Current Issue
The guide page (`app/guide/page.tsx`) has phase sections but the individual steps might need ID updates to match the new navigation structure.

### Required Changes

**Ensure these IDs exist in page.tsx:**
```typescript
// Phase 1
<StepSection id="git" ...>           // ✅ Exists (line 102)
<StepSection id="github" ...>        // ✅ Exists (line 126)
<StepSection id="ssh" ...>           // ❌ MISSING - currently no SSH step
<StepSection id="fork" ...>          // ✅ Exists (line 161)

// Phase 2
<StepSection id="node" ...>          // ✅ Exists (line 192)
<StepSection id="clone" ...>         // ✅ Exists (line 208)
<StepSection id="vercel" ...>        // ✅ Exists (line 223)
<StepSection id="domain" ...>        // ❌ Currently in CollapsibleSection (line 262)

// Phase 3
<StepSection id="supabase" ...>      // ✅ Exists (line 294)
<StepSection id="env" ...>           // ✅ Exists (line 327)
<StepSection id="database" ...>      // ✅ Exists (line 376)
<StepSection id="email" ...>         // ✅ Exists (line 415)

// Phase 4
<StepSection id="coinbase" ...>      // ✅ Exists (line 451)
<StepSection id="cdp-keys" ...>      // ✅ Exists (line 464)
<StepSection id="cdp-env" ...>       // ✅ Exists (line 519)

// Phase 5
<StepSection id="test-auth" ...>     // ✅ Exists (line 572)
<StepSection id="test-wallet" ...>   // ✅ Exists (line 596)
<StepSection id="test-supabase" ...> // ✅ Exists (line 624)
<StepSection id="test-transaction" ...> // ✅ Exists (line 653)
<StepSection id="test-additional" ...>  // ✅ Exists (line 694)
```

**Action Items:**
1. ✅ Verify SSH step exists or add it
2. ✅ Move domain from CollapsibleSection to StepSection with id="domain"
3. ✅ Ensure all IDs match exactly between ProgressNav and page.tsx

---

## Mobile Considerations

### Mobile Top Bar (No Changes)
- Keep existing mobile top bar
- Shows phase instead of step
- Displays: "Phase 1: GitHub Setup → 1.2 Create Account"
- No collapsible behavior on mobile

### Responsive Breakpoint
- Desktop nav: `hidden md:block` (768px+)
- Mobile bar: `md:hidden` (< 768px)
- No changes to breakpoints

---

## Testing Checklist

### Functionality Tests
- [ ] Phase sections render correctly
- [ ] Sub-steps appear under correct phase
- [ ] Active step highlights correctly
- [ ] Active step auto-scrolls to CENTER of nav
- [ ] Completed steps show checkmark
- [ ] Completed phases show green indicator
- [ ] Phase collapse/expand works
- [ ] Active phase auto-expands
- [ ] Progress percentage calculates correctly
- [ ] Click on step scrolls to content
- [ ] Phase 4 shows "REQUIRED" badge
- [ ] Optional steps show "(Optional)" label

### Visual Tests
- [ ] Phase headers distinct from sub-steps
- [ ] Color scheme consistent (primary, green, muted)
- [ ] Icons sized appropriately (phase vs step)
- [ ] Indentation clear (sub-steps under phases)
- [ ] Hover states work on all buttons
- [ ] Smooth animations on expand/collapse
- [ ] Smooth scroll animations
- [ ] Dark mode looks good
- [ ] Light mode looks good

### Scroll Behavior Tests
- [ ] Active step scrolls to CENTER (not top/bottom)
- [ ] Scrolling is smooth, not janky
- [ ] Scroll container doesn't overflow
- [ ] Can manually scroll nav without jumping
- [ ] Auto-scroll doesn't interfere with manual scroll
- [ ] Works with long phase lists
- [ ] Works with collapsed phases
- [ ] Padding at bottom prevents cut-off

### Intersection Observer Tests
- [ ] Observer detects step changes correctly
- [ ] Phase number updates when crossing phase boundary
- [ ] Completed steps tracked accurately
- [ ] No console errors
- [ ] Performance is good (no lag)

### Edge Cases
- [ ] Works when starting at middle of guide (refresh)
- [ ] Works when jumping between phases
- [ ] Works when all phases collapsed
- [ ] Works when all phases expanded
- [ ] Handles optional steps correctly
- [ ] Last step marks as complete at 100%

---

## Implementation Timeline

### Phase 1: Data Structure (30 min)
- Update phases array
- Update interfaces
- Update state variables

### Phase 2: Rendering (45 min)
- Build phase header component
- Build sub-step component
- Add collapse/expand logic
- Style all states (active, completed, pending)

### Phase 3: Auto-Scroll Fix (15 min)
- Change `block: 'nearest'` to `block: 'center'`
- Test scrolling behavior
- Adjust if needed

### Phase 4: Progress Calculation (20 min)
- Update overall progress calc
- Add per-phase progress calc

### Phase 5: Intersection Observer (30 min)
- Update observer to track phases
- Update completed logic
- Update auto-expand logic

### Phase 6: Testing (60 min)
- Run all tests from checklist above
- Fix any bugs found
- Test dark/light mode
- Test responsive behavior

### Phase 7: Guide Page Updates (20 min)
- Add missing IDs (if any)
- Verify all IDs match
- Test end-to-end flow

**Total Estimated Time:** 3.3 hours

---

## Files to Modify

### Primary File
- `components/guide/ProgressNav.tsx` - Complete rewrite of navigation logic

### Secondary Files (If Needed)
- `app/guide/page.tsx` - Add missing step IDs (SSH, ensure domain has id)
- `components/guide/StepSection.tsx` - Verify it accepts all required props

### No New Dependencies
- Uses existing React hooks (useState, useEffect, useRef)
- Uses existing lucide-react icons (Check, ChevronRight)
- Uses existing Tailwind classes
- No npm package additions

---

## Success Criteria

### User Experience
1. ✅ User can see which phase they're in at a glance
2. ✅ User can see completed vs pending phases
3. ✅ User can see sub-steps within each phase
4. ✅ Active step stays centered in scroll view
5. ✅ User can collapse/expand phases as needed
6. ✅ Phase 4 is clearly marked as REQUIRED
7. ✅ Progress bar reflects accurate completion
8. ✅ Navigation scrolls smoothly without issues

### Technical
1. ✅ No TypeScript errors
2. ✅ No console errors
3. ✅ Smooth animations (no jank)
4. ✅ Intersection Observer works correctly
5. ✅ All step IDs match between nav and content
6. ✅ Auto-scroll uses `block: 'center'`
7. ✅ Mobile nav still works

### Visual
1. ✅ Clear visual hierarchy (phases > steps)
2. ✅ Consistent color scheme
3. ✅ Dark mode works
4. ✅ Light mode works
5. ✅ Icons sized appropriately
6. ✅ Spacing feels right
7. ✅ Hover states obvious

---

## Rollback Plan

### If Issues Found
1. Git commit before changes: `git commit -am "Before nav redesign"`
2. If broken, revert: `git revert HEAD`
3. Keep new data structure in separate branch
4. Investigate issues in isolation

### Non-Breaking Requirements
- Must not break mobile nav
- Must not break content scrolling
- Must not break existing links
- Must not break dark mode
- Must compile without errors

---

## Future Enhancements (Not in Scope)

### Potential Additions
1. Phase-level progress bars
2. Estimated time remaining per phase
3. Keyboard navigation (arrow keys)
4. Jump to next incomplete step button
5. Print-friendly summary
6. Persist expanded state in localStorage
7. Share progress URL (with hash params)

---

## Appendix: Why Center Scroll Matters

### Current Behavior (block: 'nearest')
```
┌─────────────────┐
│ Step 1.1        │ ← completed
│ Step 1.2        │ ← completed
│ Step 1.3        │ ← completed
│ → Active Step   │ ← active (stuck at bottom)
└─────────────────┘
    ↓ scroll down
┌─────────────────┐
│ → Active Step   │ ← active (jumps to top)
│ Step 1.5        │
│ Step 1.6        │
│ Step 1.7        │
└─────────────────┘
```

### New Behavior (block: 'center')
```
┌─────────────────┐
│ Step 1.1        │ ← can see context
│ Step 1.2        │
│ → Active Step   │ ← active (centered)
│ Step 1.4        │ ← can see what's next
│ Step 1.5        │
└─────────────────┘
    ↓ scroll down (stays centered)
┌─────────────────┐
│ Step 1.2        │
│ Step 1.3        │
│ → Active Step   │ ← still centered
│ Step 1.5        │
│ Step 1.6        │
└─────────────────┘
```

**Benefits:**
- Always see 2-3 steps above active
- Always see 2-3 steps below active
- Know where you are in the flow
- Anticipate what's coming next
- Better mental model of progress

---

## End of Plan

This plan provides:
✅ Clear organizational structure (5 phases)
✅ Visual hierarchy (phases > sub-steps)
✅ Status tracking (completed, active, pending)
✅ Smart auto-scroll (centered positioning)
✅ Collapsible sections (reduce overwhelm)
✅ Phase-aware progress tracking
✅ REQUIRED phase highlighting
✅ Comprehensive testing checklist
✅ Implementation timeline
✅ No new dependencies
✅ Clean, streamlined navigation (removed problematic lower sections)

Next step: Implement changes in `components/guide/ProgressNav.tsx` and test locally.

**Note:** Removed the "Current Phase" card and other lower nav sections that had scrolling issues. The redesign now focuses on a clean, simple header with progress bar followed by the main scrollable navigation list.

