# RAIR Staking System - Complete Plan

## Overview
A staking system that allows users to stake RAIR tokens to unlock premium content (Super Guide). Users need at least 3000 RAIR staked to access the Super Guide.

## Database Schema (Supabase SQL)

### 1. Add Columns to Profiles Table
We'll add two new columns to the existing `profiles` table:
- `rair_balance` (numeric): User's available RAIR token balance
- `rair_staked` (numeric): User's currently staked RAIR tokens

### 2. Create Staking Transactions Table
Track all staking/unstaking activities for audit and history:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `transaction_type` (text): 'stake' or 'unstake'
- `amount` (numeric): Amount of RAIR tokens
- `balance_before` (numeric): Balance before transaction
- `balance_after` (numeric): Balance after transaction
- `staked_before` (numeric): Staked amount before transaction
- `staked_after` (numeric): Staked amount after transaction
- `created_at` (timestamp)

### 3. RLS Policies
- Users can only view their own staking transactions
- Users can only update their own staking balances (through RPC functions)
- Prevent direct updates to balance/staked fields

## Backend Implementation

### API Routes

#### 1. `/api/staking/stake` (POST)
**Purpose**: Stake RAIR tokens
**Request Body**:
```json
{
  "amount": 3000
}
```
**Process**:
1. Verify user is authenticated
2. Get current balances from database
3. Validate user has enough RAIR balance
4. Debit from `rair_balance`
5. Credit to `rair_staked`
6. Create transaction record
7. Return updated balances

**Response**:
```json
{
  "success": true,
  "rair_balance": 0,
  "rair_staked": 3000,
  "transaction_id": "uuid"
}
```

#### 2. `/api/staking/unstake` (POST)
**Purpose**: Unstake RAIR tokens
**Request Body**:
```json
{
  "amount": 3000
}
```
**Process**:
1. Verify user is authenticated
2. Get current balances
3. Validate user has enough staked RAIR
4. Debit from `rair_staked`
5. Credit to `rair_balance`
6. Create transaction record
7. Return updated balances

**Response**:
```json
{
  "success": true,
  "rair_balance": 3000,
  "rair_staked": 0,
  "transaction_id": "uuid"
}
```

#### 3. `/api/staking/status` (GET)
**Purpose**: Get current staking status
**Response**:
```json
{
  "rair_balance": 1000,
  "rair_staked": 3000,
  "has_superguide_access": true
}
```

### Database Functions (Supabase RPC)

#### 1. `stake_rair(p_amount numeric)`
Atomic function to handle staking:
```sql
- BEGIN transaction
- Lock user's profile row
- Check balance >= amount
- Update balances
- Insert transaction record
- COMMIT
- Return new balances
```

#### 2. `unstake_rair(p_amount numeric)`
Atomic function to handle unstaking:
```sql
- BEGIN transaction
- Lock user's profile row
- Check staked >= amount
- Update balances
- Insert transaction record
- COMMIT
- Return new balances
```

## Frontend Implementation

### Pages

#### 1. `/app/superguide/page.tsx`
- Protected route requiring authentication
- Server-side check for staked RAIR >= 3000
- Redirect to staking page if insufficient stake
- Display enhanced guide content

#### 2. Update `/app/protected/profile/page.tsx`
- Add staking section showing:
  - Available RAIR balance
  - Staked RAIR balance
  - Stake/Unstake functionality
  - Link to Super Guide (if eligible)

### Components

#### 1. `components/staking/StakingCard.tsx`
**Purpose**: Main staking interface
**Features**:
- Display current balances
- Input for stake/unstake amount
- Quick action button for 3000 RAIR
- Validation and error handling
- Loading states
- Success/error messages

**UI Elements**:
```
┌─────────────────────────────────────┐
│  RAIR Staking                       │
├─────────────────────────────────────┤
│  Available: 5,000 RAIR              │
│  Staked: 0 RAIR                     │
├─────────────────────────────────────┤
│  Amount: [________] RAIR            │
│  [Stake 3000] [Stake] [Unstake]     │
├─────────────────────────────────────┤
│  ℹ️ Stake 3000 RAIR to unlock       │
│     Super Guide access              │
└─────────────────────────────────────┘
```

#### 2. `components/staking/StakingStatus.tsx`
**Purpose**: Display staking status and Super Guide access
**Features**:
- Visual indicator of staking status
- Progress bar to 3000 RAIR
- Link to Super Guide (if eligible)
- Badge showing access level

#### 3. `components/staking/SuperGuideAccessBadge.tsx`
**Purpose**: Visual badge for Super Guide access
**Variants**:
- Active (>= 3000 staked): Green checkmark
- Inactive (< 3000 staked): Gray lock icon

### Middleware Updates

Update `/middleware.ts`:
- Add `/superguide` to protected routes
- No special middleware needed (server-side validation in page)

## Access Control Logic

### Server-Side Validation
```typescript
// In /app/superguide/page.tsx
async function getSuperGuideAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('rair_staked')
    .eq('user_id', user.id)
    .single();
  
  if (!profile || profile.rair_staked < 3000) {
    redirect('/protected/profile?error=insufficient_stake');
  }
  
  return true;
}
```

### Client-Side Validation
```typescript
// In StakingCard component
const canAccessSuperGuide = rairStaked >= 3000;

// Disable Super Guide link if insufficient stake
<Link 
  href="/superguide"
  className={!canAccessSuperGuide ? 'opacity-50 pointer-events-none' : ''}
>
  Super Guide {!canAccessSuperGuide && '🔒'}
</Link>
```

## Styling Requirements

### Responsive Design
- Mobile (< 640px): Stacked layout, full-width buttons
- Tablet (640px - 1024px): 2-column layout
- Desktop (> 1024px): 3-column layout with sidebar

### Theme Compliance
- Use existing Tailwind theme colors
- Dark/light mode support via existing theme-switcher
- Consistent with current UI patterns

### Component Styling
```typescript
// Match existing component patterns from profile-form.tsx
- Card backgrounds: bg-background border border-border
- Inputs: focus:ring-ring focus:border-ring
- Buttons: Primary (stake), Secondary (unstake)
- Text: text-foreground, text-muted-foreground
- Success: text-green-600 dark:text-green-400
- Error: text-destructive
```

## Validation Rules

### Staking Validation
1. User must be authenticated
2. Amount must be > 0
3. Amount must be <= available balance
4. Amount must be integer (whole RAIR tokens)

### Unstaking Validation
1. User must be authenticated
2. Amount must be > 0
3. Amount must be <= staked balance
4. Amount must be integer (whole RAIR tokens)

### Super Guide Access
1. User must be authenticated
2. User must have rair_staked >= 3000
3. Check performed on every page load (server-side)

## Error Handling

### API Errors
- `INSUFFICIENT_BALANCE`: "Insufficient RAIR balance"
- `INSUFFICIENT_STAKE`: "Insufficient staked RAIR"
- `INVALID_AMOUNT`: "Invalid amount specified"
- `UNAUTHORIZED`: "You must be logged in"
- `DATABASE_ERROR`: "Database error occurred"

### UI Error Display
- Toast notifications for errors
- Inline validation messages
- Clear error states in forms

## Testing Checklist

### Manual Testing
- [ ] Login with test user
- [ ] View initial RAIR balance
- [ ] Stake 3000 RAIR
- [ ] Verify balance decreased by 3000
- [ ] Verify staked increased to 3000
- [ ] Access Super Guide successfully
- [ ] Unstake 1000 RAIR (leaving 2000 staked)
- [ ] Verify cannot access Super Guide
- [ ] Verify redirect to profile with error
- [ ] Stake 1000 RAIR again (total 3000)
- [ ] Verify can access Super Guide again
- [ ] Test with insufficient balance
- [ ] Test with zero balance
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test dark/light mode

### Database Verification
- [ ] Check transaction records created
- [ ] Verify balances in database match UI
- [ ] Verify RLS policies work correctly
- [ ] Test concurrent staking attempts

## Migration Path

### Phase 1: Database Setup
1. Run SQL migration to add columns
2. Create staking_transactions table
3. Set up RLS policies
4. Create RPC functions

### Phase 2: Backend Implementation
1. Create API routes
2. Add error handling
3. Test with Postman/curl

### Phase 3: Frontend Implementation
1. Create staking components
2. Add to profile page
3. Create Super Guide page
4. Add navigation links

### Phase 4: Testing
1. Manual testing all flows
2. Database verification
3. Cross-browser testing
4. Responsive design testing

## Security Considerations

1. **SQL Injection**: Use parameterized queries
2. **CSRF**: Verify user session on all mutations
3. **Race Conditions**: Use database transactions
4. **Input Validation**: Validate amounts server-side
5. **Authorization**: Always verify user owns the balance
6. **RLS Policies**: Prevent direct table access

## Future Enhancements (Out of Scope)

- Staking rewards/interest
- Time-locked staking
- Multiple staking tiers
- Staking history page
- Export transaction history
- Email notifications for staking events
- Minimum staking period
- Unstaking cooldown period


