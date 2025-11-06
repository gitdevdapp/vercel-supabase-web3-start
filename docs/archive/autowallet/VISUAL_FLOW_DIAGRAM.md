# AutoWallet Visual Flow Diagrams

## Current State: Auto-Wallet Creation Flow (WITH CDP)

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW USER SIGNUP FLOW                          │
└─────────────────────────────────────────────────────────────────┘

[1] User Signup
    ├─ Email: test@mailinator.com
    ├─ Password: ••••••••
    └─ Action: Click "Sign up with Email"
              ↓
        [Supabase Auth]
        Creates user in auth.users
              ↓
        Redirect → /auth/sign-up-success
              ↓

[2] Email Confirmation
    ├─ Mailinator receives email
    ├─ User clicks confirmation link
    │  (using token_hash parameter)
    └─ Action: Confirm Email
              ↓
        [Supabase Auth]
        Marks email_confirmed = true
              ↓
        Redirect → /protected/profile
              ↓

[3] Profile Page Load (ASYNC)
    ├─ Authentication check ✅
    ├─ Load profile data ✅
    └─ **Load wallet** ← THIS IS WHERE IT BREAKS
              ↓
        [ProfileWalletCard Component]
        Calls loadWallet()
              ↓
        Check user_wallets table
              ↓
        wallet === null ?
        ├─ NO → Show wallet address & balance
        └─ YES → Trigger auto-create ← CURRENTLY FAILS HERE ❌

[4] Auto-Wallet Creation (IF CONFIGURED)
    ├─ POST /api/wallet/auto-create
    ├─ [Authentication Check] ✅
    ├─ [Wallet Exists Check] ✅
    └─ [Generate via CDP] ❌ CDP NOT CONFIGURED
              ↓
        IF CDP CONFIGURED:
        ├─ CDP generates wallet
        ├─ Save to database
        ├─ Log operation
        └─ Return wallet address & ID
              ↓
        [ProfileWalletCard]
        useEffect triggers auto-fund
              ↓

[5] Auto-Wallet Funding (IF WALLET CREATED)
    ├─ POST /api/wallet/auto-superfaucet
    ├─ [Check balance]
    │  ├─ Balance >= 0.01 ETH → Skip (already funded)
    │  └─ Balance < 0.01 ETH → Continue
    ├─ [Verify ownership] ✅
    └─ [Trigger superfaucet]
              ↓
        POST /api/wallet/super-faucet
        ├─ Call external faucet service
        ├─ Wait for transaction
        └─ Return balance
              ↓
        [UI STATE]
        "💰 Funding your wallet..."
              ↓
        [After 3 second refresh]
        Show balance in wallet card
              ↓

[6] User Ready to Transact ✅
    ├─ Wallet address visible
    ├─ Balance: ~0.05 ETH
    ├─ Network: Base Sepolia
    └─ User can send/receive funds
```

---

## What's Broken: Silent Failure Mode

```
EXPECTED BEHAVIOR (WITH CDP):
    Account Created → Email Confirmed → Profile Loads
    → Auto-Create → [UI: "Setting up wallet..."]
    → Wallet Ready → Auto-Fund → [UI: "Funding wallet..."]
    → User Sees Balance ✅

ACTUAL BEHAVIOR (WITHOUT CDP):
    Account Created → Email Confirmed → Profile Loads
    → Auto-Create Attempts → API Returns 503
    → User Sees "No Wallet Yet" (CONFUSING!)
    → Error Only in Browser Console ⚠️
    → User Manual Fallback Available (but confusing) ⚠️

PROBLEM: User has no idea what went wrong!
```

---

## Component State Machine

```
┌─────────────────────────────────────────┐
│   ProfileWalletCard State Machine       │
└─────────────────────────────────────────┘

           Initial State
                 │
                 ↓
        [isLoading = true]
     Load wallet from database
                 │
    ┌────────────┴────────────┐
    ↓                         ↓
wallet != null          wallet == null
    │                         │
    ↓                         ↓
[isLoading=false]    [autoCreateWalletTriggered=false]
Show balance         & [isLoading=false]
    │                         │
    │                         ↓
    │              [isAutoCreating=true]
    │           Show "🎉 Setting up wallet..."
    │                    (Loader spinning)
    │                         │
    │              ┌──────────┴──────────┐
    │              ↓                     ↓
    │         Success              FAIL (503 error)
    │         (wallet              [isAutoCreating=false]
    │          created)            [autoCreateError set]
    │              │               Show "No Wallet Yet"
    │              ↓               + Manual create button
    │      [isAutoCreating=false]
    │      [isAutoFunding=true]
    │      Show "💰 Funding..."
    │      (Loader spinning)
    │              │
    │              ↓
    │      Superfaucet complete
    │      [isAutoFunding=false]
    │              │
    └──────────────┘
                 │
                 ↓
        [Ready State]
    ┌──────────────────────┐
    │ Wallet Address       │
    │ ETH Balance: 0.05    │
    │ USDC Balance: 0.00   │
    │                      │
    │ Buttons:             │
    │ - Request Funds      │
    │ - Super Faucet       │
    │ - Send Funds         │
    │ - History            │
    └──────────────────────┘
```

---

## Error Flow Diagram

```
AUTO-CREATE FLOW WITH ERROR HANDLING

    POST /api/wallet/auto-create
            │
            ├─→ [Auth Check]
            │   ├─ ✅ User authenticated
            │   └─ ❌ Not authenticated → Return 401
            │
            ├─→ [Wallet Exists Check]
            │   ├─ ✅ Wallet found → Return existing (idempotent)
            │   └─ ✅ No wallet → Continue
            │
            ├─→ [CDP Wallet Generation]
            │   ├─ ❌ CDP NOT CONFIGURED ← WE ARE HERE
            │   │   └─ Return 503 "CDP may not be configured"
            │   │
            │   ├─ ✅ CDP generates wallet
            │   └─ ❌ CDP error → Return 503 "CDP generation failed"
            │
            ├─→ [Database Save]
            │   ├─ ✅ Wallet saved
            │   └─ ❌ DB error → Return 500
            │
            └─→ [Return Success]
                └─ 201 Created with wallet address

USER SEES:
    - If CDP not configured: "No Wallet Yet" (silent failure)
    - If working: "🎉 Setting up wallet..." → balance shown
```

---

## UI State Timeline

```
Timeline of User Experience

T+0s: User loads /protected/profile
      ├─ [Loading spinner visible]
      └─ Page rendering

T+1s: Profile loads, wallet card appears
      ├─ Shows "No Wallet Yet" message
      └─ useEffect detects wallet === null

T+1.5s: Auto-create API called
        └─ POST /api/wallet/auto-create

T+2s: API returns 503 error (CDP not configured)
      ├─ ERROR logged to console
      └─ Component state: isAutoCreating = false

T+2.5s: User still sees "No Wallet Yet"
        ├─ ❌ NO ERROR MESSAGE VISIBLE TO USER
        ├─ ⚠️ Confusing state
        └─ User might think feature is broken
             (even though they don't know about CDP)

EXPECTED BEHAVIOR:
T+2s: API returns 503
T+2.5s: User sees error message:
        "Unable to auto-generate wallet. 
         Please create one manually."
```

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│            Frontend Layer                        │
├─────────────────────────────────────────────────┤
│  ProfileWalletCard Component                    │
│  ├─ State: wallet, isAutoCreating, isFunding    │
│  ├─ Effects: loadWallet, autoCreate, autoFund   │
│  └─ UI: Shows "No Wallet", "Setting up...", etc │
└─────────────────────────────────────────────────┘
                       │ HTTP Requests
                       ↓
┌─────────────────────────────────────────────────┐
│            Backend API Layer                    │
├─────────────────────────────────────────────────┤
│  POST /api/wallet/auto-create                   │
│  ├─ Auth check (Supabase)                       │
│  ├─ Wallet exists check (DB query)              │
│  ├─ CDP wallet generation ← 🔴 FAILING HERE    │
│  ├─ Database persist                           │
│  └─ Audit logging (RPC)                        │
├─────────────────────────────────────────────────┤
│  POST /api/wallet/auto-superfaucet              │
│  ├─ Auth check                                  │
│  ├─ Balance check                               │
│  ├─ Ownership verification                      │
│  └─ Super faucet delegation                    │
└─────────────────────────────────────────────────┘
                       │
                       ├─→ Supabase (Auth, DB, RPC)
                       └─→ CDP API ← 🔴 NOT CONFIGURED
                       └─→ Superfaucet Service
```

---

## What Needs to Be Fixed

```
PRIORITY 1 - CRITICAL (Blocks Functionality)
┌──────────────────────────────────────┐
│ 1. Configure CDP Credentials         │
│    COINBASE_API_KEY=...              │
│    COINBASE_PRIVATE_KEY=...          │
│                                      │
│ Impact: Auto-wallet creation        │
│ Status: 🔴 BLOCKER                  │
└──────────────────────────────────────┘

PRIORITY 2 - HIGH (Poor UX)
┌──────────────────────────────────────┐
│ 2. Add User Error Messages           │
│    Show: "Auto-create failed..."     │
│    Guide: "Please create manually"   │
│                                      │
│ Impact: User experience              │
│ Status: 🟠 POOR                     │
└──────────────────────────────────────┘

PRIORITY 3 - MEDIUM (Incomplete)
┌──────────────────────────────────────┐
│ 3. Fix PKCE Email Confirmation       │
│    Fix flow state persistence        │
│    Document workaround               │
│                                      │
│ Impact: Email confirmation flow      │
│ Status: 🟡 PARTIAL                  │
└──────────────────────────────────────┘

PRIORITY 4 - LOW (Nice to Have)
┌──────────────────────────────────────┐
│ 4. Add Unit Tests                    │
│ 5. Add Monitoring                    │
│ 6. Make Config Flexible              │
│                                      │
│ Impact: Quality, maintainability     │
│ Status: 🔵 FUTURE                   │
└──────────────────────────────────────┘
```

---

## How to Enable AutoWallet

```
STEP 1: Get CDP Credentials
   → Go to https://portal.cdp.coinbase.com/
   → Create API key pair
   → Copy API Key ID and Private Key

STEP 2: Configure Environment Variables
   → Create/edit .env.local (or .env)
   
   COINBASE_API_KEY=your-api-key-id
   COINBASE_PRIVATE_KEY=your-private-key

STEP 3: Restart Dev Server
   $ npm run dev
   (or pkill -f "next dev" && npm run dev)

STEP 4: Test
   → Create new mailinator account
   → Observe auto-wallet creation
   → Check basescan for funded wallet

STEP 5: Verify
   $ Browser Console should show:
   [AutoCreateWallet] Success: {wallet_address: '0x...', ...}
```

---

## Test Results Summary

```
┌──────────────────────────────────────────────────┐
│         E2E TEST RESULTS (Nov 3, 2025)           │
├──────────────────────────────────────────────────┤
│ Step 1: Account Signup              ✅ PASS      │
│ Step 2: Email Confirmation          ✅ PASS      │
│ Step 3: Profile Load               ✅ PASS      │
│ Step 4: Wallet Card Render         ✅ PASS      │
│ Step 5: Auto-Create Trigger        ✅ PASS      │
│ Step 6: CDP Wallet Generation      ❌ FAIL      │
│         (503 - Not Configured)                  │
│ Step 7: Auto-Fund Wallet           ⏭️  SKIPPED  │
│         (Blocked by Step 6)                     │
│ Step 8: Basescan Verification      ⏭️  SKIPPED  │
│         (No wallet to verify)                   │
├──────────────────────────────────────────────────┤
│ OVERALL RESULT:  🔴 BLOCKED (CDP Not Configured)│
└──────────────────────────────────────────────────┘

Pass Rate: 5/9 (56%) before blocker
Critical Blocker: CDP Credentials
Time to Fix: ~5 minutes (get + set credentials)
```

---

**Created**: November 3, 2025  
**For**: AutoWallet Feature Review  
**Status**: Reference Diagram for Implementation Review
