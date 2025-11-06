# CDP Credential Configuration Diagnosis - November 3, 2025

## Executive Summary
**Status**: 🔴 CRITICAL - Auto-wallet creation is FAILING due to incorrect CDP client initialization in `/app/api/wallet/auto-create/route.ts`

**Root Cause**: The auto-create endpoint uses WRONG environment variable names and DOES NOT pass credentials to the CdpClient constructor.

**Impact**: New users cannot create wallets automatically, blocking the entire first-time user experience.

---

## Problem Analysis

### Issue 1: WRONG Environment Variable Names in auto-create/route.ts

**File**: `app/api/wallet/auto-create/route.ts` (lines 16-21)

```typescript
// ❌ BROKEN - Uses WRONG variable names
function getCdpClient(): CdpClient {
  return new CdpClient({
    apiKeyName: process.env.COINBASE_API_KEY,        // ❌ WRONG
    privateKey: process.env.COINBASE_PRIVATE_KEY,    // ❌ WRONG
  });
}
```

**What it should be**:
```typescript
// ✅ CORRECT - Uses proper CDP environment variables
function getCdpClient(): CdpClient {
  return new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID!,           // ✅ CORRECT
    apiKeySecret: process.env.CDP_API_KEY_SECRET!,   // ✅ CORRECT
    walletSecret: process.env.CDP_WALLET_SECRET!,    // ✅ CORRECT (required)
  });
}
```

### Issue 2: Inconsistent Implementation Across Codebase

**CORRECT Pattern** (used in other endpoints):
- ✅ `app/api/wallet/super-faucet/route.ts` (lines 20-24)
- ✅ `__tests__/integration/erc721-deployment.e2e.test.ts` (lines 131-135)
- ✅ Multiple other wallet endpoints

**BROKEN Pattern** (only in auto-create):
- ❌ `app/api/wallet/auto-create/route.ts` (lines 16-21)

### Issue 3: Available Credentials in vercel-env-variables.txt

```
CDP_API_KEY_ID=[YOUR_CDP_API_KEY_ID]
CDP_API_KEY_SECRET=[YOUR_CDP_API_KEY_SECRET]
CDP_WALLET_SECRET=[YOUR_CDP_WALLET_SECRET]
```

✅ These credentials ARE properly configured in Vercel and vercel-env-variables.txt

---

## Error Trace from E2E Test

From `/docs/autowallet/E2E_TEST_SUMMARY.md`:

```
Browser Console Error:
[AutoCreateWallet] Error: {error: Failed to generate wallet. CDP may not be configured., success: false}

HTTP Response: 503 Service Unavailable
Message: "Failed to generate wallet. CDP may not be configured."
```

**Why this happens**:
1. `getCdpClient()` tries to read `process.env.COINBASE_API_KEY` → undefined
2. `getCdpClient()` tries to read `process.env.COINBASE_PRIVATE_KEY` → undefined  
3. CdpClient is initialized with undefined values
4. CDP SDK fails to authenticate, returns 503 error

---

## Solution

### Step 1: Update auto-create/route.ts

Change lines 16-21 from:
```typescript
function getCdpClient(): CdpClient {
  return new CdpClient({
    apiKeyName: process.env.COINBASE_API_KEY,
    privateKey: process.env.COINBASE_PRIVATE_KEY,
  });
}
```

To:
```typescript
import { env } from "@/lib/env";

function getCdpClient(): CdpClient {
  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    walletSecret: env.CDP_WALLET_SECRET!,
  });
}
```

### Step 2: Create .env.local with correct credentials

Copy from `vercel-env-variables.txt`:
```
CDP_API_KEY_ID=[YOUR_CDP_API_KEY_ID]
CDP_API_KEY_SECRET=[YOUR_CDP_API_KEY_SECRET]
CDP_WALLET_SECRET=[YOUR_CDP_WALLET_SECRET]
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
```

---

## Why This Fix Works

### The Root Cause Chain

1. **Environment Variables Named Wrong**
   - Code looks for: `COINBASE_API_KEY`, `COINBASE_PRIVATE_KEY`
   - But system has: `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, `CDP_WALLET_SECRET`

2. **CDP SDK Parameters Named Differently**
   - Old code used: `apiKeyName`, `privateKey` (non-standard)
   - CDP SDK expects: `apiKeyId`, `apiKeySecret`, `walletSecret` (standard)

3. **Result**: Uninitialized credentials → Failed authentication → 503 error

### After Fix

1. ✅ Use correct env variable names from `lib/env.ts`
2. ✅ Pass all three required credentials to CdpClient
3. ✅ CDP SDK authenticates properly
4. ✅ Wallet creation succeeds
5. ✅ Auto-funding triggers
6. ✅ New users get wallets automatically

---

## Verification Checklist

- [ ] Update `app/api/wallet/auto-create/route.ts` with correct credentials
- [ ] Create/update `.env.local` with CDP credentials
- [ ] Restart dev server: `npm run dev`
- [ ] Test with new mailinator email
- [ ] Verify: Browser console shows success message
- [ ] Verify: Wallet address appears in UI
- [ ] Verify: Basescan shows funded wallet

---

## Files Affected

| File | Status | Fix |
|------|--------|-----|
| `app/api/wallet/auto-create/route.ts` | 🔴 BROKEN | Update getCdpClient() |
| `.env.local` | ⚠️ MISSING | Create with credentials |
| `lib/env.ts` | ✅ OK | No changes needed |
| `app/api/wallet/super-faucet/route.ts` | ✅ OK | Already correct |

---

## Historical Context

**Previous Fix** (October 3, 2025):
- Other wallet endpoints were fixed to use correct pattern
- auto-create/route.ts was likely created after that fix and used old pattern
- This endpoint was never updated to match the corrected pattern

**Current Status**:
- 5+ other endpoints use correct pattern
- Only auto-create/route.ts is broken
- Fix is simple: align with existing correct pattern



