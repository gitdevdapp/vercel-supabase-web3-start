# Super Guide Implementation Plan

## Overview
Create a premium "Super Guide" page that mirrors the existing Guide component structure but with 100% more detailed and specific prompts to generate higher-quality results. Access will be restricted to users with 3000+ RAIR staked.

## Architecture & File Structure

### New Files to Create:
1. `/app/superguide/page.tsx` - Main Super Guide page with staking check
2. `/components/superguide/SuperGuideLockedView.tsx` - Locked view for non-stakers

### Files to Modify:
1. `/components/staking/StakingCard.tsx` - Add "Access Super Guide" button
2. `/app/protected/profile/page.tsx` - (may not need changes, depends on StakingCard integration)

## Phase 1: Core Implementation Strategy

### 1.1 Super Guide Page Structure
- Copy 99% of `/app/guide/page.tsx` 
- Replace all prompts with 100% more detailed versions
- Add staking validation:
  - Fetch user's `rair_staked` from `/api/staking/status`
  - If not authenticated → redirect to `/auth/login`
  - If authenticated but staked < 3000 → show SuperGuideLockedView
  - If staked >= 3000 → show full Super Guide

### 1.2 Enhanced Prompt Examples

**Regular Guide Example:**
```
"Install Git for me and ensure my Git credentials have read write access on this machine..."
```

**Super Guide Enhanced Example:**
```
"Install Git with the following comprehensive setup:
- Detect and use the optimal package manager for my OS (Homebrew for Mac, apt for Linux, etc.)
- Ensure Git is version 2.30+ for full feature support
- Configure GPG signing for commits (generate key if needed)
- Set up .gitattributes for consistent line endings across the team
- Configure credential.helper for secure authentication
- Verify SSH compatibility and generate Ed25519 key for GitHub (more secure than RSA)
- Test connection with multiple Git hosts (GitHub, GitLab, Bitbucket)
- Set up git hooks directory structure for future automation
- Configure Git aliases for common workflow commands
- Show all completed configurations in a summary table..."
```

## Phase 2: Staking Access Control Implementation

### 2.1 Access Check Logic
```typescript
// Check staking status
const response = await fetch('/api/staking/status');
const { rair_staked } = await response.json();

if (rair_staked < 3000) {
  // Show locked view or redirect
}
```

### 2.2 Integration Points
- Fetch staking status on page load
- Compare `rair_staked` against minimum (3000)
- Show appropriate view based on access

## Phase 3: UI Components

### SuperGuideLockedView Component
Display when user has < 3000 RAIR staked:
- Current balance
- Amount needed (3000 - current)
- Link to profile staking section
- Quick staking button
- Benefits of Super Guide access

### StakingCard Enhancement
Add button to StakingCard:
```
"📚 Access Super Guide" (enabled if rair_staked >= 3000)
Link: /superguide
```

## Phase 4: Prompt Enhancement Strategy

### All 5 Phases will be enhanced:

**Phase 1 - GitHub**: Version compatibility, SSH protocols, 2FA setup
**Phase 2 - Vercel**: NVM setup, CI/CD pipeline, preview deployments  
**Phase 3 - Supabase**: RLS policies, performance indexing, email templates
**Phase 4 - CDP**: Key rotation, webhook setup, rate limits
**Phase 5 - Testing**: Performance monitoring, security audit, load testing

Each prompt should include:
- Comprehensive context
- Expected outcomes
- Validation steps
- Troubleshooting
- Best practices
- Security considerations

## Testing Checklist

- [ ] Unauthenticated access → redirect to login
- [ ] Low staking balance (<3000) → show locked view
- [ ] High staking balance (>=3000) → show full guide
- [ ] Button visible in profile staking section
- [ ] No UI/style breaking issues
- [ ] Mobile responsive
- [ ] All components render correctly
- [ ] Navigation works
- [ ] Copy buttons functional

## Local Testing (localhost:3000)

```bash
# Kill existing port 3000
pkill -f localhost:3000

# Start dev server
npm run dev

# Test user
Email: test@test.com
Password: test123

# Test flow:
1. Login to profile
2. Stake 3000 RAIR
3. Click "Access Super Guide" button
4. Verify /superguide loads
5. Check for UI issues
6. Test all interactive elements
```

## Commit & Deploy

- Local testing must pass without errors
- No console errors or warnings
- No UI/style issues
- Commit with clear message
- Push to remote main branch
- Verify Vercel deployment succeeds

---

**Key Success Criteria:**
✅ 99% copy of Guide page
✅ 100% more detailed prompts
✅ 3000 RAIR staking requirement enforced
✅ Clickable from profile staking section
✅ No UI/style breaking issues
✅ Local testing passes
✅ Committed to remote main
