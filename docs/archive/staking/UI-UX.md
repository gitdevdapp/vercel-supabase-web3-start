# RAIR Staking System - UI/UX Specification

## Design Principles

1. **Simplicity**: Clear, intuitive interface for staking/unstaking
2. **Transparency**: Always show current balances and transaction status
3. **Responsiveness**: Works seamlessly on mobile, tablet, and desktop
4. **Consistency**: Matches existing design system and patterns
5. **Accessibility**: WCAG 2.1 AA compliant
6. **Performance**: Fast, optimistic updates with server validation

## Color Scheme & Theming

### Theme Integration
- Use existing Tailwind theme variables
- Support both light and dark modes
- Consistent with current application design

### Color Usage
```typescript
// Status Colors
- Success: text-green-600 dark:text-green-400
- Error: text-destructive
- Warning: text-amber-600 dark:text-amber-400
- Info: text-blue-600 dark:text-blue-400

// Component Colors
- Background: bg-background
- Card: bg-card border-border
- Primary Button: bg-primary text-primary-foreground
- Secondary Button: bg-secondary text-secondary-foreground
- Disabled: opacity-50 cursor-not-allowed
```

## Responsive Breakpoints

```typescript
// Mobile First Approach
- xs: < 640px (mobile)
- sm: 640px - 768px (large mobile)
- md: 768px - 1024px (tablet)
- lg: 1024px - 1280px (desktop)
- xl: 1280px+ (large desktop)
```

## Page Layouts

### 1. Profile Page (`/app/protected/profile/page.tsx`)

#### Desktop Layout (>= 1024px)
```
┌──────────────────────────────────────────────────────┐
│  Profile                                              │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌───────────────────────┐  │
│  │  Profile Info      │  │  RAIR Staking         │  │
│  │  - Avatar          │  │  ┌─────────────────┐  │  │
│  │  - Name            │  │  │ Available       │  │  │
│  │  - Email           │  │  │ 10,000 RAIR     │  │  │
│  │  - Bio             │  │  ├─────────────────┤  │  │
│  └────────────────────┘  │  │ Staked          │  │  │
│                          │  │ 0 RAIR          │  │  │
│  ┌────────────────────┐  │  ├─────────────────┤  │  │
│  │  Wallet Addresses  │  │  │ Amount          │  │  │
│  │  - ETH: 0x...      │  │  │ [3000] RAIR     │  │  │
│  │  - SOL: ...        │  │  ├─────────────────┤  │  │
│  └────────────────────┘  │  │ [Quick Stake]   │  │  │
│                          │  │ [Stake][Unstake]│  │  │
│                          │  └─────────────────┘  │  │
│                          │  Access: 🔒 Locked    │  │
│                          └───────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

#### Tablet Layout (768px - 1024px)
```
┌────────────────────────────────────────┐
│  Profile                                │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  Profile Info (Full Width)       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  RAIR Staking (Full Width)       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Wallet Addresses (Full Width)   │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

#### Mobile Layout (< 768px)
```
┌──────────────────────┐
│  Profile             │
├──────────────────────┤
│  ┌────────────────┐  │
│  │  Profile Info  │  │
│  │  (Compact)     │  │
│  └────────────────┘  │
│  ┌────────────────┐  │
│  │  RAIR Staking  │  │
│  │  (Stacked)     │  │
│  │  Available:    │  │
│  │  10,000 RAIR   │  │
│  │                │  │
│  │  Staked:       │  │
│  │  0 RAIR        │  │
│  │                │  │
│  │  [____] RAIR   │  │
│  │  [Quick Stake] │  │
│  │  [Stake]       │  │
│  │  [Unstake]     │  │
│  └────────────────┘  │
└──────────────────────┘
```

### 2. Super Guide Page (`/app/superguide/page.tsx`)

#### All Sizes
```
┌────────────────────────────────────────────────┐
│  🌟 Super Guide - Premium Content              │
│  [Badge: RAIR Staker - 3000 RAIR Staked]       │
├────────────────────────────────────────────────┤
│  Enhanced guide content with additional        │
│  tutorials, examples, and advanced features    │
│  only available to users with 3000+ RAIR       │
│  staked.                                       │
└────────────────────────────────────────────────┘
```

## Component Specifications

### 1. StakingCard Component

**File**: `components/staking/StakingCard.tsx`

#### Visual Design
```
┌─────────────────────────────────────────────┐
│  RAIR Staking                               │
├─────────────────────────────────────────────┤
│  Your Balances                              │
│  ┌──────────────┐  ┌───────────────────┐   │
│  │ Available    │  │ Staked            │   │
│  │ 10,000       │  │ 0                 │   │
│  │ RAIR         │  │ RAIR              │   │
│  └──────────────┘  └───────────────────┘   │
├─────────────────────────────────────────────┤
│  Stake Amount                               │
│  ┌─────────────────────────────────┐        │
│  │ 3000                            │ RAIR   │
│  └─────────────────────────────────┘        │
│  ┌─────────────────────┐                    │
│  │ Quick Stake 3000    │                    │
│  └─────────────────────┘                    │
│  ┌──────────┐  ┌──────────┐                │
│  │  Stake   │  │ Unstake  │                │
│  └──────────┘  └──────────┘                │
├─────────────────────────────────────────────┤
│  ℹ️ Stake 3,000 RAIR to unlock Super Guide │
│  Progress: ████░░░░░░░ 0/3000              │
└─────────────────────────────────────────────┘
```

#### States

**Default State**
- All inputs enabled
- Buttons enabled based on balance
- Clean, minimal design

**Loading State**
- Disabled inputs
- Spinner on active button
- "Processing..." message

**Success State**
- Green checkmark animation
- "Successfully staked X RAIR"
- Fade out after 3 seconds

**Error State**
- Red error message
- Input border turns red
- Error icon

**Insufficient Balance**
- Stake button disabled
- Warning message: "Insufficient balance"
- Amount input max capped at available

**Insufficient Stake**
- Unstake button disabled
- Warning message: "Insufficient staked amount"
- Amount input max capped at staked

#### Interactions

1. **Input Amount**
   - Type: number
   - Min: 0
   - Max: rair_balance (for stake) or rair_staked (for unstake)
   - Validation: Integer only, no decimals
   - Clear on successful transaction

2. **Quick Stake 3000 Button**
   - Pre-fills amount with 3000
   - Disabled if balance < 3000
   - Tooltip: "Minimum for Super Guide access"

3. **Stake Button**
   - Primary style
   - Disabled when: amount ≤ 0 or amount > balance or loading
   - Click: Call stake API
   - Success: Update UI, show success message

4. **Unstake Button**
   - Secondary style
   - Disabled when: amount ≤ 0 or amount > staked or loading
   - Click: Call unstake API
   - Success: Update UI, show success message

#### Responsive Behavior

**Desktop (>= 1024px)**
- Two-column balance display
- Horizontal button layout
- Full-width card with padding

**Tablet (768px - 1024px)**
- Two-column balance display
- Horizontal button layout
- Adjusted padding

**Mobile (< 768px)**
- Stacked balance display (vertical)
- Stacked button layout (full-width)
- Reduced padding
- Larger touch targets

### 2. SuperGuideAccessBadge Component

**File**: `components/staking/SuperGuideAccessBadge.tsx`

#### Active State (>= 3000 staked)
```
┌────────────────────────────────┐
│ ✅ Super Guide Access Active   │
│ 3,000 RAIR Staked              │
└────────────────────────────────┘
```
- Green background: bg-green-100 dark:bg-green-900
- Green text: text-green-800 dark:text-green-200
- Checkmark icon

#### Inactive State (< 3000 staked)
```
┌────────────────────────────────┐
│ 🔒 Super Guide Locked          │
│ Stake 3,000 RAIR to unlock     │
└────────────────────────────────┘
```
- Gray background: bg-gray-100 dark:bg-gray-800
- Gray text: text-gray-600 dark:text-gray-400
- Lock icon

### 3. StakingProgress Component

**File**: `components/staking/StakingProgress.tsx`

#### Visual Design
```
Progress to Super Guide Access
████████░░░░░░░░░░░ 2,000 / 3,000 RAIR (66%)
1,000 RAIR more needed
```

#### States
- 0% - 33%: Red progress bar
- 34% - 66%: Amber progress bar
- 67% - 99%: Blue progress bar
- 100%: Green progress bar with checkmark

### 4. Navigation Link to Super Guide

**Location**: Main navigation, Profile page

#### When Accessible (>= 3000 staked)
```
🌟 Super Guide
```
- Normal link styling
- Clickable
- Badge indicator

#### When Locked (< 3000 staked)
```
🔒 Super Guide
```
- Muted styling: opacity-50
- Not clickable: pointer-events-none
- Tooltip: "Stake 3,000 RAIR to unlock"

## User Flows

### Flow 1: Stake 3000 RAIR

```
1. User navigates to Profile
   ↓
2. Sees RAIR Staking card
   ↓
3. Clicks "Quick Stake 3000"
   ↓
4. Amount field fills with 3000
   ↓
5. Clicks "Stake" button
   ↓
6. Loading state shows
   ↓
7. API call completes
   ↓
8. Success message shows
   ↓
9. Balances update
   ↓
10. Super Guide link becomes active
    ↓
11. User clicks Super Guide link
    ↓
12. Navigates to Super Guide page
    ↓
13. Server validates >= 3000 staked
    ↓
14. Super Guide content displays
```

### Flow 2: Attempt Access Without Stake

```
1. User navigates to /superguide
   ↓
2. Server checks staked amount
   ↓
3. User has < 3000 staked
   ↓
4. Redirect to /protected/profile
   ↓
5. URL param: ?error=insufficient_stake
   ↓
6. Toast message: "Stake 3,000 RAIR to access Super Guide"
   ↓
7. Staking card highlighted
```

### Flow 3: Unstake Below Threshold

```
1. User has 3000 RAIR staked
   ↓
2. Can access Super Guide
   ↓
3. Unstakes 1000 RAIR
   ↓
4. Now has 2000 staked
   ↓
5. Super Guide link shows lock icon
   ↓
6. If tries to access /superguide
   ↓
7. Redirected to profile
   ↓
8. Error message shown
```

## Error Messages

### User-Friendly Messages

```typescript
const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: "You don't have enough RAIR tokens to stake this amount.",
  INSUFFICIENT_STAKE: "You don't have enough staked RAIR to unstake this amount.",
  INVALID_AMOUNT: "Please enter a valid amount greater than 0.",
  NETWORK_ERROR: "Network error. Please try again.",
  UNAUTHORIZED: "Please log in to stake RAIR tokens.",
  ACCESS_DENIED: "You need at least 3,000 RAIR staked to access the Super Guide.",
  MINIMUM_NOT_MET: "You need to stake at least 3,000 RAIR to unlock Super Guide.",
};
```

## Loading States

### Card Loading
```
┌─────────────────────────────┐
│  RAIR Staking               │
│  ┌──────────────────────┐   │
│  │  ⟳ Loading balances  │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### Button Loading
```
┌──────────────────┐
│ ⟳ Staking...     │
└──────────────────┘
```

### Page Loading
```
┌─────────────────────────────┐
│  ⟳ Verifying access...      │
└─────────────────────────────┘
```

## Animations

### Stake Success
1. Button shows checkmark
2. Green flash on staked balance
3. Progress bar animates to new value
4. Badge updates with smooth transition

### Unstake Success
1. Button shows checkmark
2. Green flash on available balance
3. Progress bar animates to new value
4. Badge updates if threshold crossed

### Access Denied
1. Shake animation on lock icon
2. Red flash on requirement text
3. Focus on stake input

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals/tooltips

### Screen Reader Support
```html
<div aria-label="RAIR Staking Interface">
  <div aria-live="polite" aria-atomic="true">
    Available: 10,000 RAIR
  </div>
  <div aria-live="polite" aria-atomic="true">
    Staked: 0 RAIR
  </div>
  <label for="stake-amount">Amount to stake</label>
  <input 
    id="stake-amount"
    aria-describedby="stake-help"
    aria-invalid={hasError}
  />
  <button 
    aria-disabled={!canStake}
    aria-label="Stake RAIR tokens"
  >
    Stake
  </button>
</div>
```

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trapping in modals

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Status colors meet WCAG AA

## Performance Optimizations

### Optimistic Updates
```typescript
// Update UI immediately, rollback on error
const optimisticStake = async (amount: number) => {
  const prevBalance = rairBalance;
  const prevStaked = rairStaked;
  
  // Update UI
  setRairBalance(prevBalance - amount);
  setRairStaked(prevStaked + amount);
  
  try {
    // Call API
    await stakeRair(amount);
  } catch (error) {
    // Rollback on error
    setRairBalance(prevBalance);
    setRairStaked(prevStaked);
    showError(error.message);
  }
};
```

### Debounced Input
```typescript
// Debounce amount input validation
const debouncedValidation = useMemo(
  () => debounce(validateAmount, 300),
  []
);
```

### Memoization
```typescript
// Memoize expensive calculations
const hasAccess = useMemo(
  () => rairStaked >= 3000,
  [rairStaked]
);

const progressPercentage = useMemo(
  () => Math.min((rairStaked / 3000) * 100, 100),
  [rairStaked]
);
```

## Browser Compatibility

### Supported Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 13+
- Chrome Mobile: Last 2 versions

### Graceful Degradation
- Works without JavaScript (basic display)
- Falls back to standard inputs if number input unsupported
- Progress bar uses div if <progress> unsupported

## Testing Scenarios

### Visual Regression Tests
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] Dark mode renders correctly
- [ ] Light mode renders correctly

### Interaction Tests
- [ ] Can type in amount input
- [ ] Quick stake button fills amount
- [ ] Stake button disabled when insufficient
- [ ] Unstake button disabled when insufficient
- [ ] Success message shows on stake
- [ ] Error message shows on failure

### Navigation Tests
- [ ] Super Guide link active when >= 3000
- [ ] Super Guide link locked when < 3000
- [ ] Redirect works when accessing without stake
- [ ] Can navigate back to profile

### Responsive Tests
- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1280px width)
- [ ] Large desktop (1920px width)
- [ ] Rotate device (portrait/landscape)


