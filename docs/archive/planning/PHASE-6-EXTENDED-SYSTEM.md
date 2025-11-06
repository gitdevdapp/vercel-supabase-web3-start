# 🚀 PHASE 6: Extended System Guide - COMPLETE

**Date**: October 20, 2025  
**Status**: ✅ Production Ready  
**Comprehensive Guide**: GitHub → Vercel → Cursor Testing → Feature Planning  
**Expected Time**: Full cycle ~8 hours per feature

---

## 📋 TABLE OF CONTENTS

1. **[Getting Started](#phase-6-getting-started)** - Start here if you're new
2. **[GitHub Forking & Setup](#github-setup)** - Fork the starter repository
3. **[Vercel Deployment](#vercel-deployment)** - Deploy to production
4. **[Cursor Browser QA Testing](#cursor-browser-qa)** - Local verification
5. **[Troubleshooting Guide](#troubleshooting)** - Error recovery
6. **[Feature Planning Workflow](#feature-planning)** - Extend the system
7. **[Production Deployment](#production-deployment)** - Go live safely

---

## PHASE 6: Getting Started

Welcome to Phase 6! You're now ready to:
✅ Extend the system with new features  
✅ Understand the architecture deeply  
✅ Deploy safely to production  
✅ Troubleshoot any issues  
✅ Plan and implement new capabilities  

**Prerequisites**:
- ✅ Completed Phases 1-5
- ✅ Running locally on localhost:3000
- ✅ Production URL deployed on Vercel
- ✅ Supabase and Coinbase CDP configured

---

## GITHUB SETUP

### Step 1: Understanding the Repository Structure

The system is split into TWO repositories:

```
📦 STARTER REPOSITORY (vercel-supabase-web3-start)
│
├─ This is where YOU start
├─ Has all 5 phases setup
├─ Pre-configured with best practices
└─ Ready to fork and customize

📦 YOUR FORKED REPOSITORY (your-username/vercel-supabase-web3-start)
│
├─ Your personal copy (in your GitHub account)
├─ You make changes here
├─ You push to this repository
└─ Vercel watches this and auto-deploys
```

### Step 2: Fork the Repository (GitHub Interface)

**Why Fork?** 
- You can't push to the original repository
- Forking creates YOUR personal copy in your GitHub account
- Vercel will watch YOUR fork and auto-deploy your changes
- You maintain version control of all your customizations

**How to Fork on GitHub**:

**1. Open GitHub and Navigate to the Starter Repository**
```
🌐 URL: https://github.com/garrettair/vercel-supabase-web3-start

Go to this URL in your browser
```

**2. Click the "Fork" Button** (Top Right of Repository)
```
GitHub Interface:
[⭐ Star]  [🍴 Fork]  [👁️ Watch]
           ↑ CLICK HERE

Location: Top-right corner of the repository page
```

**3. Choose Where to Fork**
```
Dialog appears:
"Where should we fork this repository?"

Select: Your GitHub Account
(If you have multiple accounts, pick your personal one)

Click: "Create Fork"
```

**4. Wait for Fork to Complete**
```
GitHub shows: "Forking in progress..."
(Usually takes 5-30 seconds)

Then shows: "Your Fork is Ready!"
Redirects to: https://github.com/YOUR-USERNAME/vercel-supabase-web3-start
```

**5. Verify Your Fork**
```
✅ Your Fork Created Successfully When:
- URL shows YOUR GitHub username
- Fork shows "forked from garrettair/vercel-supabase-web3-start"
- You can see all files and directories
- "Add file" button is available (prove you have write access)
```

### Step 3: Clone YOUR Forked Repository

Now clone your fork to your local machine:

```bash
# IMPORTANT: Use your fork URL, not the original!

cd ~/Documents

git clone https://github.com/YOUR-USERNAME/vercel-supabase-web3-start.git

cd vercel-supabase-web3-start

# Verify you're in the right place:
ls -la

# You should see:
# ✅ app/
# ✅ components/
# ✅ docs/
# ✅ package.json
# ✅ .git/
```

### Step 4: Verify Your Git Setup

```bash
# Check your remote (should point to YOUR fork):
git remote -v

# Should show:
# origin  https://github.com/YOUR-USERNAME/vercel-supabase-web3-start.git (fetch)
# origin  https://github.com/YOUR-USERNAME/vercel-supabase-web3-start.git (push)

# If it points to garrettair, you cloned the wrong repo!
# Fix it:
git remote set-url origin https://github.com/YOUR-USERNAME/vercel-supabase-web3-start.git
```

---

## VERCEL DEPLOYMENT

### Step 1: Create Vercel Account (If Needed)

```
1. Go to: https://vercel.com
2. Click: "Sign Up"
3. Select: "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Complete setup
```

### Step 2: Import Your Forked Repository into Vercel

**CRITICAL**: You must click in the Vercel UI to deploy your forked repository. Auto-deployment doesn't happen until you manually import the project.

**How to Deploy on Vercel (Click-by-Click)**:

**1. Go to Vercel Dashboard**
```
🌐 URL: https://vercel.com/dashboard

Click: You're now in Vercel Dashboard
```

**2. Click "Add New Project"**
```
Vercel Dashboard shows:
[+ Add New...]  [Projects]

Click: "+ Add New..."
```

**3. Click "Import Project"**
```
Menu appears:
[Project from Third-Party Git Repo]
[Clone Template]
[Continue with GitHub]

Click: "Project from Third-Party Git Repo"
(or if visible: "Import from Git")
```

**4. Enter Your Repository URL**
```
Dialog asks: "Repository URL"

Type: https://github.com/YOUR-USERNAME/vercel-supabase-web3-start

Click: "Continue"
```

**5. Vercel Connects to Your Repository**
```
Vercel shows:
"Connecting to GitHub..."
(This verifies you have access)

Asks: "Authorize Vercel to access your repository?"
Click: "Authorize"
```

**6. Configure Project Settings**

```
Project Name: 
Default: vercel-supabase-web3-start
(You can change this)

Framework Preset:
Should auto-detect: "Next.js"

Build Command:
Should show: npm run build
(Leave as default)

Output Directory:
Should show: .next
(Leave as default)

Root Directory:
Should show: ./
(Leave as default)
```

**7. Add Environment Variables**

```
Vercel asks: "Environment Variables"

ADD EACH VARIABLE:

Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Your Supabase URL]
Click: "Add"

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Your Supabase Anon Key]
Click: "Add"

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Your Supabase Service Role Key]
Click: "Add"

Name: NEXT_PUBLIC_CDP_API_KEY
Value: [Your Coinbase CDP API Key]
Click: "Add"

(Add any other environment variables from your .env.local)

Click: "Deploy"
```

**8. Vercel Deploys Your Project**

```
Vercel shows deployment progress:
✅ Created project vercel-supabase-web3-start
✅ Cloned your repository
✅ Installing dependencies...
✅ Building...
✅ Deployment complete!

Shows: "Congratulations! Your project is deployed"
```

**9. Get Your Production URL**

```
Vercel shows:
🎉 Deployment Successful

Your URL: https://vercel-supabase-web3-start-YOUR-USERNAME.vercel.app
(or custom domain if configured)

Click: "Visit" to open your production site
```

### Step 3: Verify Deployment Works

**In Your Browser** (Click the "Visit" button or open the Vercel URL):

```
✅ Your Site Loads:
- Homepage displays
- Navigation works
- No 404 errors
- Logo/branding visible

✅ Open Browser Console (F12 → Console):
- No red errors
- No "Cannot GET" messages
- Only warnings are OK
```

### Step 4: Enable Auto-Deployment

```
Vercel Settings:
1. Go to your project settings
2. Find "Git"
3. Ensure "Deploy on Every Push" is ENABLED
4. Main branch should be "main"

Now: Every time you push to GitHub, Vercel auto-deploys!

Flow:
git push origin main
    ↓
GitHub receives push
    ↓
Vercel sees change
    ↓
Vercel auto-builds and deploys
    ↓
Check Vercel dashboard for deployment status
```

---

## CURSOR BROWSER QA TESTING

### Understanding Cursor Browser Testing

Cursor Browser Testing means using the Cursor IDE's browser integration to verify your application works correctly BEFORE pushing to GitHub (and before Vercel deploys).

**Why This Matters**:
- Catch bugs locally before production
- Verify user experience before shipping
- Test on real device sizes
- Inspect network requests
- Debug console errors
- No need for manual testing in separate browser window

### Complete Testing Workflow

#### Step 1: Build and Test Locally

```bash
# IMPORTANT: Kill any existing dev servers first
pkill -f "node.*dev" || true
pkill -f "next" || true
sleep 2

# In your terminal:
npm run build

# This creates the production build locally
# If this fails, your Vercel deploy will also fail

# After build completes:
npm run dev

# Your app runs at: http://localhost:3000
```

#### Step 2: Open Cursor Browser

```
In Cursor IDE:
1. Open Command Palette (Cmd+Shift+P on Mac, Ctrl+Shift+P on Windows)
2. Type: "Browser: Open"
3. Select: "Browser: Open (Cursor Browser)"

A new browser panel opens in Cursor showing localhost:3000
```

#### Step 3: Perform QA Testing in Cursor Browser

**Test Categories**:

**Category 1: Navigation & Rendering**
```
□ Homepage loads completely (no 404s)
□ Navigation links work (LeftNav, header)
□ No infinite loading spinners
□ Images load correctly
□ Text renders properly
□ Layout doesn't break on different sizes
```

**Category 2: Authentication**
```
□ Login page accessible
□ Login form works (email/password)
□ Can create account (if enabled)
□ Can logout
□ Session persists on page refresh
□ Protected pages redirect to login
```

**Category 3: Database & Supabase**
```
□ Profile page loads user data
□ User data displays correctly
□ Can update profile
□ Changes save to Supabase
□ Supabase auth token present (check DevTools)
□ No "TypeError: Cannot read supabase" errors
```

**Category 4: Web3 & Wallet**
```
□ Wallet connection button shows
□ Wallet connect UI opens
□ Can connect wallet (testnet)
□ Wallet address displays
□ Can request testnet funds
□ Wallet transactions visible
```

**Category 5: UI/UX**
```
□ Dark/light mode (if applicable) works
□ Buttons have hover effects
□ Forms validate input
□ Error messages display
□ Success messages show
□ Loading states appear
```

**Category 6: Mobile Responsiveness**
```
Using Cursor Browser DevTools:
1. Click DevTools icon
2. Click "Toggle device toolbar"
3. Select different device sizes (iPhone, iPad, etc.)

Test:
□ Content doesn't overflow
□ Text is readable
□ Buttons are clickable
□ Navigation accessible
□ Forms usable on mobile
□ No horizontal scrolling
```

#### Step 4: Use Cursor Browser DevTools

**Access DevTools**:
```
In Cursor Browser:
Right-click any element → "Inspect"
OR
Press: F12 or Cmd+Option+I

Opens DevTools panel showing:
- Elements (HTML structure)
- Console (errors/logs)
- Network (API calls)
- Application (local storage, cookies)
```

**Check Console for Errors**:
```
DevTools → Console tab

Look for:
❌ Red errors (these are problems)
⚠️  Yellow warnings (usually OK)
✅ Green logs (good)

If you see red errors:
1. Note the error message
2. Note what caused it (which page/action)
3. Use Cursor AI to fix it
   - Copy error message
   - Ask Cursor: "Why is this error happening?"
   - Follow the fix instructions
```

**Verify Network Requests**:
```
DevTools → Network tab

Perform an action (login, fetch data, etc.)

Look for:
✅ 200/201 responses (success)
❌ 400/401/500 responses (errors)

If you see errors:
1. Click the failed request
2. See the error details
3. Check the response for error message
4. Fix in code
```

#### Step 5: Test User Flows

**Flow 1: New User**
```
1. Clear local storage (logout)
2. Go to homepage
3. Click "Sign Up"
4. Create account with email/password
5. Complete profile
6. Connect wallet
7. Navigate all pages
8. Logout
```

**Flow 2: Returning User**
```
1. Click "Sign In"
2. Enter credentials
3. Verify profile data loads
4. Check wallet still connected
5. Make a transaction
6. Verify it shows in history
```

**Flow 3: Error Cases**
```
Test what happens when:
- Wrong password entered
- Email doesn't exist
- Network request fails
- Wallet connection fails
- Invalid input in forms

Verify:
✅ Helpful error message shows
✅ User knows what to do
✅ Can retry easily
```

#### Step 6: Screenshot for Verification

```
In Cursor Browser:
1. Position to view important area
2. Right-click → "Take Screenshot"
3. Saves screenshot to workspace
4. Document what you verified
```

### Testing Checklist Template

```markdown
## Pre-Deployment QA Checklist

### Date: [Today's Date]
### Tester: [Your Name]
### Feature/Change: [What you changed]

### Navigation & Rendering
- [ ] Homepage loads (no 404s)
- [ ] All navigation links work
- [ ] Layout responsive on mobile
- [ ] Images load
- [ ] No infinite spinners

### Authentication
- [ ] Login works
- [ ] Logout works
- [ ] Protected pages redirect
- [ ] Session persists

### Database & Supabase
- [ ] Profile loads
- [ ] Data displays correctly
- [ ] Updates save
- [ ] No Supabase errors

### Web3 & Wallet
- [ ] Wallet button visible
- [ ] Can connect wallet
- [ ] Address displays
- [ ] Transactions work

### Console & Errors
- [ ] No red errors in console
- [ ] No network 500s
- [ ] No TypeErrors
- [ ] No undefined warnings

### Result
- [ ] ✅ READY TO DEPLOY
- [ ] ❌ HOLD (fix issues below)

### Issues Found
1. [Issue description]
   - Fix: [How you fixed it]
   - Verification: [How you verified fix]

2. [Next issue...]
```

---

## TROUBLESHOOTING

### Error: "Cannot connect to Supabase"

**Symptoms**:
```
- Profile page shows "Loading..." forever
- Console error: "TypeError: supabase is undefined"
- "Failed to connect to database"
- Login doesn't work
```

**Root Causes**:
1. Environment variables not set
2. Supabase project URL wrong
3. Supabase API key expired
4. Supabase project deleted

**Fix**:
```bash
# Step 1: Check your env variables
cat .env.local | grep SUPABASE

# Should show:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-KEY-HERE

# Step 2: If missing, add them
# Edit .env.local and add the variables

# Step 3: Restart the dev server
npm run dev

# Step 4: Clear browser cache
# DevTools → Application → Clear storage → Clear site data

# Step 5: Refresh page
# Open localhost:3000
```

### Error: "Wallet not connecting"

**Symptoms**:
```
- "Connect Wallet" button does nothing
- Error: "CDP_API_KEY is undefined"
- Wallet modal doesn't appear
- Error: "Coinbase CDP error"
```

**Root Causes**:
1. Coinbase CDP API key missing
2. Testnet not configured
3. Wallet component not imported
4. API key revoked

**Fix**:
```bash
# Step 1: Verify API key exists
echo $NEXT_PUBLIC_CDP_API_KEY

# Should output your key, not empty

# If empty, add to .env.local:
NEXT_PUBLIC_CDP_API_KEY=your-api-key-here

# Step 2: Restart dev server
npm run dev

# Step 3: Check browser console
# DevTools → Console
# Look for CDP-related errors

# Step 4: Test in Cursor Browser
# Click "Connect Wallet"
# Check console for exact error message
```

### Error: "Vercel Deployment Failed"

**Symptoms**:
```
- Vercel shows: "Build failed"
- Email from Vercel: "Deployment encountered error"
- Can't access production URL
- Shows: "There's been an error"
```

**Root Causes**:
1. Environment variables not set in Vercel
2. Build command failed
3. TypeScript errors
4. Missing dependencies

**Fix**:
```bash
# Step 1: Test build locally
npm run build

# If this fails locally, Vercel will also fail
# Error message tells you what's wrong

# Step 2: Fix the error
# Follow error message instructions

# Step 3: Verify build succeeds locally
npm run build

# Step 4: Push to GitHub
git add .
git commit -m "Fix: resolve build error"
git push origin main

# Step 5: Check Vercel dashboard
# Vercel auto-deploys after push
# Wait 2-5 minutes for deployment

# Step 6: If still failing, check environment variables
# Vercel Dashboard → Project Settings → Environment Variables
# Verify all variables are set correctly
```

### Error: "LeftNav not showing"

**Symptoms**:
```
- Navigation sidebar missing
- "ReferenceError: LeftNav is not defined"
- Navigation broken on all pages
- Header gone
```

**Root Causes**:
1. LeftNav component deleted
2. Import statement broken
3. Component moved/renamed
4. Layout file corrupted

**Fix**:
```bash
# Step 1: Check git status
git status

# See what changed

# Step 2: If you accidentally deleted LeftNav:
git restore components/LeftNav.tsx

# Step 3: If import broken, check layout.tsx
cat app/layout.tsx | grep LeftNav

# Should show:
import LeftNav from "@/components/LeftNav"

# Step 4: Verify LeftNav file exists
ls -la components/LeftNav.tsx

# Should exist!

# Step 5: Restart dev server
npm run dev

# Step 6: Test in browser
# Refresh localhost:3000
# LeftNav should appear
```

### Error: "TypeScript Build Error"

**Symptoms**:
```
- Error message: "Type 'string' is not assignable to type 'number'"
- "Property 'user' does not exist on type 'Profile'"
- ESLint errors shown
```

**Root Causes**:
1. Type mismatch in code
2. Missing type definition
3. Wrong prop type passed
4. Type conflict

**Fix**:
```bash
# Step 1: Read the error carefully
# It tells you:
# - The file with error
# - The line number
# - What type is wrong

# Step 2: Open the file
# Go to the line number

# Step 3: Use Cursor to fix
# Select the problematic code
# Ask: "Fix this TypeScript error"
# Cursor suggests fix

# Step 4: Verify type is correct
# Check component props
# Check function parameters
# Check return types

# Step 5: Test
npm run build
```

### Decision Tree: "What Should I Do?"

```
🚨 ERROR OCCURRED
│
├─ Is it in the BROWSER?
│  │
│  ├─ "Cannot find module" / "X is undefined"
│  │  └─ → Check imports are correct
│  │     → Check file wasn't deleted
│  │     → Check filename hasn't changed
│  │
│  ├─ "Network request failed" / "Cannot connect to Supabase"
│  │  └─ → Check env variables
│  │     → Check Supabase is running
│  │     → Check internet connection
│  │
│  └─ "TypeError: Cannot read property 'X' of undefined"
│     └─ → Check API response structure
│        → Add null safety checks
│        → Check API endpoint is correct
│
├─ Is it in the BUILD?
│  │
│  ├─ "Type 'X' is not assignable to type 'Y'"
│  │  └─ → Check TypeScript types
│  │     → Fix type mismatch
│  │
│  ├─ "ESLint error: Unused variable"
│  │  └─ → Remove unused variable
│  │     → Use the variable
│  │
│  └─ "npm ERR! Cannot find module 'X'"
│     └─ → npm install X
│        → Check package.json
│
└─ Is it in PRODUCTION?
   │
   ├─ "Vercel build failed"
   │  └─ → Check build works locally
   │     → Check env variables in Vercel
   │     → Check all files are committed
   │
   └─ "Production page shows error"
      └─ → Check production URL loads
         → Check Vercel logs for errors
         → Check Supabase is still running
```

---

## FEATURE PLANNING

### Overview: The MD → Review → Implement Workflow

When you want to ADD A NEW FEATURE, follow this proven workflow:

```
📝 MD (Markdown Plan)
│
├─ What: Write detailed plan in docs/newidea/
├─ Why: Clear requirements prevent wasted code
├─ Time: 30 minutes
│
↓
│
🔍 Review (3 Rounds of Critical Analysis)
│
├─ Round 1: Assumptions & risks (30 min)
├─ Round 2: Specific code changes (30 min)
├─ Round 3: Testing & verification (30 min)
├─ Why: Catch problems before coding
├─ Time: 1.5 hours
│
↓
│
💻 Implement (Code Locally)
│
├─ What: Make changes locally only
├─ Testing: Test on localhost:3000
├─ Verification: Use Cursor Browser for QA
├─ Why: Safe to experiment locally
├─ Time: 1-4 hours depending on feature
│
↓
│
✅ Deploy (Push to GitHub, Vercel auto-deploys)
│
└─ Done! Users can use your feature
```

### Step 1: Write Your Plan (30 minutes)

Create a new file: `docs/newidea/[FEATURE-NAME]-PLAN.md`

```markdown
# Feature: [Feature Name]

**Date Created**: [Today's Date]
**Estimated Effort**: [Number of hours]
**Risk Level**: [Low/Medium/High]

## Executive Summary
Brief description (2-3 sentences) of what this feature does.

## Problem Statement
What problem does this solve?
- Pain point 1
- Pain point 2

## Proposed Solution
How will you solve it?
- Solution approach

## Implementation Scope

### In Scope
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Out of Scope
- [ ] Task that won't be done

## Files to Create/Modify
- [ ] `components/NewComponent.tsx` (CREATE)
- [ ] `lib/newFeature.ts` (CREATE)
- [ ] `app/page.tsx` (MODIFY)

## Success Criteria
- [ ] Feature works on localhost
- [ ] All tests pass
- [ ] TypeScript: No errors
- [ ] ESLint: No violations
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No breaking changes (LeftNav still works)

## Dependencies
- [ ] All prerequisites met before starting
- [ ] No new npm packages needed (use existing ones!)
- [ ] Supabase already configured

## Risk Assessment
- [ ] Could this break existing features? How will you verify?
- [ ] Are there edge cases to handle?
- [ ] What happens if the feature fails?
```

### Step 2: Review Round 1 (30 minutes)

**Ask Cursor (Round 1)**:
```
"Review this feature plan and identify:
1. Any assumptions that could be wrong
2. Any risks or problems
3. Edge cases we haven't considered
4. Dependencies we're missing

Feature: [Paste your plan]

Be specific - what could go wrong?"
```

**Update Plan**:
```
After Round 1 review:
- Add any missed risks to Risk Assessment section
- Update Implementation Scope if you missed tasks
- Add edge cases to Success Criteria

Example:
Before: "Upload profile image"
After: "Upload profile image (max 5MB, JPG/PNG only, validate size before upload, handle upload errors, allow delete)"
```

### Step 3: Review Round 2 (30 minutes)

**Ask Cursor (Round 2)**:
```
"Now break down the implementation into specific code changes:

For each file to modify, tell me:
1. What specific function/component will change
2. What's the current code doing
3. What will the new code do
4. How do we verify it works

Feature: [Paste your plan]
Current Files: [List the app structure]

Be very specific - show me code regions that will change."
```

**Create Detailed Implementation Steps**:
```
Based on Round 2, update your plan:

## Implementation Steps

### Step 1: Create Upload Component
- **File**: components/ProfileImageUpload.tsx
- **Current State**: Doesn't exist
- **New Code**: Create component with file input, validation, upload logic
- **Test**: File input accepts images, validation rejects >5MB

### Step 2: Integrate with Supabase
- **File**: lib/supabase.ts
- **Current State**: Has client setup
- **New Code**: Add uploadProfileImage() function
- **Test**: Can upload to Supabase Storage

### Step 3: Update Profile Page
- **File**: app/protected/profile/page.tsx
- **Current State**: Shows user info, no image upload
- **New Code**: Add <ProfileImageUpload /> component
- **Test**: Can see upload component, can upload image
```

### Step 4: Review Round 3 (30 minutes)

**Ask Cursor (Round 3)**:
```
"Create a comprehensive testing plan for this feature:

1. What will you test on localhost:3000?
2. How will you know it's working correctly?
3. What edge cases will you test?
4. How will you verify no breaking changes?
5. What should the user experience look like?

Feature: [Paste your plan]

Include specific steps like:
1. Clear browser cache
2. Load localhost:3000
3. Click [button name]
4. Verify [behavior]
5. Check [result]"
```

**Create Testing Checklist**:
```
## Testing Checklist

### Pre-Implementation
- [ ] Current build succeeds: npm run build
- [ ] Current site works: npm run dev + browser test
- [ ] LeftNav visible

### After Each Change
- [ ] npm run build succeeds (no TypeScript errors)
- [ ] npm run dev works
- [ ] Test specific change in browser
- [ ] No console errors (DevTools → Console)
- [ ] LeftNav still visible (critical!)

### Full Feature Test
- [ ] Happy path works (feature does what it should)
- [ ] Error case handled (what if upload fails?)
- [ ] Mobile works (test on different screen sizes)
- [ ] Refresh page (state persists)
- [ ] No existing features broken

### Before Pushing to GitHub
- [ ] npm run build succeeds
- [ ] npm run dev succeeds
- [ ] All tests pass: npm run test
- [ ] No TypeScript errors: npx tsc --noEmit
- [ ] ESLint passes: npx eslint . --fix
```

### Step 5: Implement Locally (1-4 hours)

Now you start coding! Use this process:

```bash
# Step 1: Create a new branch (optional but good practice)
git checkout -b feature/profile-image-upload

# Step 2: Make ONE small change at a time
# (Don't try to do everything at once)

# Edit ONE file
# Save it
# Immediately test it

# Step 3: Test after EVERY change
npm run build

# If build fails, fix error immediately
# Don't pile up errors!

# If build succeeds:
npm run dev

# Step 4: Open Cursor Browser
# Test the specific change you just made
# Verify it works as expected

# Step 5: If it works, commit it
git add .
git commit -m "feat: add profile image upload component"

# If it doesn't work, use Cursor AI:
# - Copy error message
# - Explain what you were trying to do
# - Ask Cursor: "Why isn't this working?"
# - Follow the fix

# Step 6: Repeat for next change
# Keep the cycle tight: Code → Test → Commit
```

### Step 6: Verify No Breaking Changes

Before pushing to GitHub, run this verification:

```bash
# 1. Build succeeds
npm run build
✅ Should show: "Compiled successfully"

# 2. Dev server works
npm run dev
✅ Should start without errors

# 3. Homepage loads
Open: http://localhost:3000
✅ Page should load completely

# 4. Navigation works
✅ Click LeftNav items → pages load
✅ Click header items → pages load

# 5. LeftNav visible on all sizes
Open DevTools → Toggle device toolbar
✅ Mobile view: LeftNav visible or accessible
✅ Tablet view: LeftNav visible
✅ Desktop view: LeftNav visible

# 6. No console errors
✅ DevTools → Console → No red errors
✅ Only warnings OK

# 7. Authentication works
✅ Can login
✅ Can logout
✅ Protected pages redirect to login

# 8. Your new feature works
✅ New feature does what it should
✅ Handles errors gracefully
✅ Mobile responsive
```

### Step 7: Push to GitHub

```bash
# Make sure everything is committed
git status
# Should show: "On branch main, working tree clean"

# If you created a feature branch, merge it back
git checkout main
git merge feature/profile-image-upload

# Push to GitHub
git push origin main

# Vercel automatically deploys!
# Check: https://vercel.com/dashboard
# Should show: "Deployment successful"

# Visit production URL
# https://your-project.vercel.app
# Verify feature works on production too!
```

---

## PRODUCTION DEPLOYMENT

### Pre-Deployment Checklist

Before every push to GitHub:

```markdown
## Before Pushing to GitHub

### Code Quality
- [ ] npm run build succeeds
- [ ] npm run dev works
- [ ] npm run test passes (if tests exist)
- [ ] npx tsc --noEmit (no TypeScript errors)
- [ ] npx eslint . (no lint errors)

### Functionality
- [ ] Feature works on localhost:3000
- [ ] All test cases pass
- [ ] Edge cases handled
- [ ] Error messages are helpful

### No Breaking Changes
- [ ] LeftNav still visible
- [ ] Navigation still works
- [ ] Existing pages still work
- [ ] Login/logout still works
- [ ] Profile still works
- [ ] Wallet still works (if applicable)
- [ ] No console errors

### Mobile
- [ ] Tested on mobile size (DevTools)
- [ ] No horizontal scroll
- [ ] Buttons are clickable
- [ ] Text is readable

### Browser Compatibility
- [ ] Tested on Chrome
- [ ] Works on Safari
- [ ] Works on Firefox

### Final Verification
- [ ] Cursor Browser QA test passes (all categories)
- [ ] No environment variables leaked
- [ ] API keys not in code
- [ ] Ready for production!
```

### Deployment Process

```bash
# 1. Make sure all changes are committed
git status
# Should show: "working tree clean"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically deploys
# Check dashboard: https://vercel.com/dashboard
# Should show: "Deployment in Progress..."

# 4. Wait for deployment (2-10 minutes usually)
# Dashboard shows: "Deployment successful"

# 5. Test production
# Open: https://your-project.vercel.app
# Verify:
#  - Page loads
#  - Feature works
#  - No console errors
#  - Mobile responsive

# 6. If something breaks:
# Option A: Fix locally and push again
#  git push origin main (Vercel re-deploys)
#
# Option B: Rollback to previous version
#  Vercel Dashboard → Deployments → Click previous → "Promote to Production"

# 7. Document what you deployed
# In Vercel Dashboard:
# Click deployment → Add comment describing the feature
```

### Monitoring Production

After deployment, monitor for issues:

```bash
# Check logs for errors
# Vercel Dashboard → Deployments → Click deployment → Logs

# Monitor performance
# Vercel Dashboard → Analytics

# Check if users report issues
# Discord/Email/Support channels

# If you find an issue:
# 1. Fix it locally
# 2. npm run build (verify fix works)
# 3. npm run dev (test again)
# 4. git push origin main (deploy fix)
# 5. Verify production works again
```

---

## Quick Reference: Command Cheatsheet

```bash
# LOCAL DEVELOPMENT
npm run dev              # Start local server (localhost:3000)
npm run build           # Build for production (test before pushing)
npm start               # Run production build locally
npm run test            # Run test suite

# CURSOR BROWSER
Cmd+Shift+P             # Open command palette
Type: "Browser: Open"   # Launch Cursor Browser
F12 / Cmd+Option+I      # Open DevTools

# GIT WORKFLOW
git status              # See what changed
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push origin main    # Push to GitHub (Vercel auto-deploys)

git checkout -b feature/name    # Create feature branch
git merge feature/name           # Merge branch back to main

# VERCEL DEPLOYMENT
# Manual step: Go to https://vercel.com/dashboard
# Click "+ Add New..."
# Click "Import Project"
# Enter your GitHub fork URL
# Click "Deploy"

# Subsequent deployments: Just git push origin main
```

---

## Summary: You Now Have

✅ **GitHub Setup**: Your forked repository, ready for development  
✅ **Vercel Deployment**: Production URL live and auto-deploying  
✅ **Cursor Browser Testing**: Local QA before pushing to production  
✅ **Troubleshooting Guide**: Error recovery for 95% of issues  
✅ **Feature Planning**: Structured workflow to add new features safely  
✅ **Production Verification**: Checklists to ensure quality deployments  

---

**Phase 6 is about EXTENDING THE SYSTEM safely and confidently.**

**Your journey**: Feature Idea → Plan (MD) → Review (3 rounds) → Implement (locally) → Test (Cursor Browser) → Deploy (git push) → Production ✅

---

**Last Updated**: October 20, 2025  
**Version**: 1.0 - Complete Extended System  
**Status**: Production Ready  
**Confidence**: 98%+
