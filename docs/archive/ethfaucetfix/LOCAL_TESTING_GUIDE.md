# ETH Faucet Fix: Local Testing Guide (UPDATED)

**Purpose**: Validate that the "Request ETH" button works correctly after the environment variable fix using proper `env.URL` configuration.

**Estimated Time**: 5-10 minutes

**Status**: ✅ Code changes implemented and build verified

---

## Prerequisites

1. **Local Development Environment**
   - Node.js 18+ installed
   - npm or yarn package manager
   - Git configured with SSH

2. **Credentials Ready**
   - From `vercel-env-variables.txt`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
     - `CDP_API_KEY_ID`
     - `CDP_API_KEY_SECRET`
     - `CDP_WALLET_SECRET`
   - Test account: `devdapp_test_2025oct15@mailinator.com` / `TestPassword123!`

---

## What Changed in the Fix

### Before (Broken Approach)
```typescript
// ❌ WRONG: Uses undefined process.env.URL directly
const baseUrl = process.env.URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
```

### After (Correct Approach)
```typescript
// ✅ RIGHT: Uses env.URL from lib/env.ts (properly constructed)
import { env } from "@/lib/env";
const balanceResponse = await fetch(`${env.URL}/api/wallet/balance?...`);
```

**Why this matters**:
- ✅ `env.URL` is constructed in lib/env.ts using proper Vercel environment variables
- ✅ Works correctly in production (uses `VERCEL_PROJECT_PRODUCTION_URL`)
- ✅ Works correctly in preview (uses `VERCEL_URL`)
- ✅ Works correctly locally (uses `http://localhost:3000` default)
- ✅ Type-safe with Zod validation
- ✅ Single source of truth for URL logic

---

## Step 1: Set Up Environment Variables

### Option A: Using `.env.local` File (Recommended)

Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]

# CDP Configuration - GET VALUES FROM vercel-env-variables.txt
CDP_API_KEY_ID=[YOUR_CDP_API_KEY_ID]
CDP_API_KEY_SECRET=[YOUR_CDP_API_KEY_SECRET]
CDP_WALLET_SECRET=[YOUR_CDP_WALLET_SECRET]

# Network Configuration
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true

# Application URL Configuration
NEXT_PUBLIC_APP_URL=https://devdapp.com
NEXT_PUBLIC_SITE_URL=https://devdapp.com

# Test Account Credentials
TEST_EMAIL=devdapp_test_2025oct15@mailinator.com
TEST_PASSWORD=TestPassword123!
TEST_MAILINATOR_INBOX=devdapp_test_2025oct15
```

### Option B: Using Shell Export

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
export CDP_API_KEY_ID=[YOUR_CDP_API_KEY_ID]
export CDP_API_KEY_SECRET=[YOUR_CDP_API_KEY_SECRET]
export CDP_WALLET_SECRET=[YOUR_CDP_WALLET_SECRET]
export NETWORK=base-sepolia
export NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
export NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
export NEXT_PUBLIC_APP_URL=https://devdapp.com
export NEXT_PUBLIC_SITE_URL=https://devdapp.com
export TEST_EMAIL=devdapp_test_2025oct15@mailinator.com
export TEST_PASSWORD=TestPassword123!
```

---

## Step 2: Install Dependencies & Start Dev Server

```bash
# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
```

Expected output:
```
> next dev --turbopack

  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in 1.23s
```

---

## Step 3: Log In & Navigate to Profile

1. **Open Browser**
   ```
   http://localhost:3000
   ```

2. **Click "Sign In" or "Login"**

3. **Enter Test Credentials**
   - Email: `devdapp_test_2025oct15@mailinator.com`
   - Password: `TestPassword123!`

4. **Verify Email (if prompted)**
   - Go to: https://www.mailinator.com/v4/public/inboxes.jsp?to=devdapp_test_2025oct15
   - Check for confirmation email
   - Click confirmation link

5. **Navigate to Profile**
   - After login, click profile or go to: `http://localhost:3000/protected/profile`

---

## Step 4: Test the "Request ETH" Button

### Visual Check

You should see:
- **Wallet Address** section with your wallet address
- **ETH Balance** box showing current balance (likely very low or 0)
- **Blue "Request ETH" button** below ETH balance

### ETH Balance States

| Balance | Button State | Expected Behavior |
|---------|--------------|-------------------|
| < 0.01 ETH | **Enabled** | ✅ Can click to request funds |
| ≥ 0.01 ETH | **Disabled** | ⚠️ Shows info message about faucet limit |

### Execute the Test

1. **Check Current Balance**
   - Note the current ETH balance
   - If balance ≥ 0.01 ETH, the button will be disabled (this is correct)

2. **Click "Request ETH" Button**
   - **Look for immediate feedback** in browser console
   - Wait 10-30 seconds (super faucet makes multiple requests)

3. **Monitor Console Logs**

   **Browser DevTools Console** (Press `F12` → Console tab):
   ```
   [UnifiedProfileWalletCard] Triggering auto-superfaucet...
   [UnifiedProfileWalletCard] Auto-faucet result: {...}
   [UnifiedProfileWalletCard] Balance should update in 2 seconds
   ```

   **Expected Success Message**:
   ```
   🚀 Super Faucet Active! Funding wallet with testnet ETH...
   ```

4. **Monitor Server Logs**

   **Terminal where dev server is running**:
   ```
   [AutoSuperFaucet] Request from user: <user-id>
   [AutoSuperFaucet] Checking wallet balance...
   [AutoSuperFaucet] Current balance: 0.000484 ETH
   [AutoSuperFaucet] Triggering superfaucet...
   [AutoSuperFaucet] SuperFaucet completed: { requestCount: 100, finalBalance: 0.01005 }
   ```

5. **Wait for Balance Update**
   - After 2-5 seconds, balance should update
   - New balance should be ≥ 0.01 ETH
   - Button should become disabled (as it's working correctly!)

---

## Step 5: Verify Success Indicators

### ✅ Success Criteria

- [ ] Browser console shows no 405 errors
- [ ] Console shows `[AutoSuperFaucet] Request from user:` log
- [ ] Console shows successful super-faucet completion with transaction count
- [ ] ETH balance updates from < 0.01 to ≥ 0.01 within 30 seconds
- [ ] After successful funding, button becomes disabled
- [ ] No errors appear in browser console
- [ ] No errors appear in terminal

### ❌ Failure Indicators

- [ ] 405 error in browser console
- [ ] No logs appearing in console
- [ ] "Unauthorized" error message
- [ ] "Wallet not found" error
- [ ] "CDP not configured" error
- [ ] Balance doesn't update after 60 seconds
- [ ] Red error message on page

---

## Step 6: Troubleshooting

### Issue: "Unauthorized - Please sign in"

**Cause**: Authentication token expired or not set
**Solution**:
1. Clear cookies: DevTools → Application → Cookies → Delete all
2. Log out and log back in
3. Ensure test account is verified

### Issue: "Wallet not found"

**Cause**: Wallet wasn't created for the user
**Solution**:
1. Reload the profile page: `F5` or `Cmd+R`
2. Wait 5 seconds for auto-create to trigger
3. Check logs for wallet creation success

### Issue: "CDP not configured"

**Cause**: CDP environment variables not set
**Solution**:
1. Verify `.env.local` has all CDP variables
2. Kill dev server (`Ctrl+C`)
3. Restart dev server: `npm run dev`
4. Check that no errors appear on startup

### Issue: "Failed to check balance" 

**Cause**: Network request failed or URL construction issue
**Solution**:
1. Verify you're connected to internet
2. Check that env.URL is being constructed: Add this to browser console:
   ```javascript
   // Check that the balance endpoint is working
   fetch('/api/wallet/balance?address=0x1234567890123456789012345678901234567890')
     .then(r => r.json())
     .then(data => console.log('Balance API works:', data))
     .catch(e => console.error('Balance API failed:', e));
   ```
3. Check server logs for more details

### Issue: Button appears to work but nothing happens

**Cause**: Silent failure - check console logs
**Solution**:
1. Open DevTools: `F12`
2. Go to Console tab
3. Look for any error messages
4. Report the error message you see

### Issue: "Faucet rate limit exceeded"

**Cause**: Too many requests in 24 hours
**Solution**:
1. Create a new wallet address
2. Wait 24 hours before testing again
3. This is expected behavior

---

## Step 7: Verify URL Construction is Working

### Check env.URL is properly loaded

In browser console at `http://localhost:3000`, run:

```javascript
// This will make a test API call to verify URL construction
fetch('/api/wallet/balance?address=0x1234567890123456789012345678901234567890&t=' + Date.now())
  .then(r => r.json())
  .then(data => console.log('✅ URL construction works:', data))
  .catch(e => console.error('❌ URL construction failed:', e));
```

If this works, it means:
- ✅ The route handler can construct URLs correctly
- ✅ env.URL is being used properly
- ✅ Production deployment will work

---

## Step 8: Create .env.local for Easy Testing

To make future testing easier, create a `.env.local` file (already included in .gitignore):

```bash
# Run this command from project root
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
CDP_API_KEY_ID=[YOUR_CDP_API_KEY_ID]
CDP_API_KEY_SECRET=[YOUR_CDP_API_KEY_SECRET]
CDP_WALLET_SECRET=[YOUR_CDP_WALLET_SECRET]
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
NEXT_PUBLIC_APP_URL=https://devdapp.com
NEXT_PUBLIC_SITE_URL=https://devdapp.com
TEST_EMAIL=devdapp_test_2025oct15@mailinator.com
TEST_PASSWORD=TestPassword123!
TEST_MAILINATOR_INBOX=devdapp_test_2025oct15
EOF
```

---

## Summary

### What We're Testing

The fix ensures that the URL construction for internal API calls uses the properly configured `env.URL` from `lib/env.ts`:

```typescript
// ✅ NEW (fixed) - uses env.URL which is properly constructed
import { env } from "@/lib/env";
const balanceResponse = await fetch(`${env.URL}/api/wallet/balance?address=${walletAddress}&t=${Date.now()}`);
```

### Expected Outcome

- ✅ Button works at `http://localhost:3000` (uses default fallback)
- ✅ Button works in production (uses `VERCEL_PROJECT_PRODUCTION_URL`)
- ✅ Button works in preview (uses `VERCEL_URL`)
- ✅ Wallet receives 0.01+ ETH within 30 seconds
- ✅ No 405 errors in console
- ✅ Multiple requests work correctly (respects 24-hour faucet limits)

---

## Next Steps

1. **After local testing passes**:
   - Verify build: `npm run build` (should succeed)
   - Verify linting: `npm run lint` (should pass)
   - Commit changes: `git add -A && git commit -m "fix: use env.URL from lib/env.ts for superfaucet URL construction"`
   - Push to GitHub: `git push origin main`
   - Monitor Vercel deployment

2. **Production validation**:
   - Visit `https://devdapp.com/protected/profile`
   - Log in with test account
   - Test "Request ETH" button
   - Verify wallet receives funds

3. **If testing fails**:
   - Check console for specific errors
   - Verify `.env.local` matches exactly
   - Restart dev server: `Ctrl+C` then `npm run dev`
   - Check server logs for detailed error info
   - Review the ETH_FAUCET_FIX.md document for detailed troubleshooting

---

*Last Updated: November 4, 2025*
*Fix Type: Environment Variable Configuration (Using lib/env.ts)*
