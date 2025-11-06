# 🧪 Testing Guide - Manual Wallet Creation Fix

**Date**: November 3, 2025  
**Test Account**: wallettest_nov3_dev@mailinator.com  
**Environment**: localhost (http://localhost:3000)

---

## Pre-Testing Checklist

Before running tests, verify:

- [ ] Code has been pulled/updated
- [ ] `npm install` completed (if needed)
- [ ] Environment variables configured (`.env.local`)
- [ ] Dev server can start (`npm run dev`)
- [ ] Test account credentials available
- [ ] Browser developer tools accessible
- [ ] No other users logged in

---

## Quick Test (5 minutes)

This is the fastest way to verify the fix works.

### Step 1: Start Dev Server

```bash
cd /Users/garrettair/Documents/vercel-supabase-web3
npm run dev
```

Expected output:
```
> next dev
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  ✓ Ready in 2.5s
```

### Step 2: Open Browser

Navigate to: `http://localhost:3000`

Expected: Homepage loads

### Step 3: Login

1. Click "Sign In" or "Auth" button
2. Select email/password login
3. Enter credentials:
   - **Email**: `wallettest_nov3_dev@mailinator.com`
   - **Password**: (Use your test password)
4. Click "Sign In"

Expected: 
- ✅ Successful login
- ✅ Redirected to profile page
- ✅ See "My Wallet" section

### Step 4: Test Manual Wallet Creation

1. On profile page, find "My Wallet" section
2. If no wallet exists, see: "No Wallet Yet"
3. Enter wallet name: **"Test Wallet"**
4. Click **"Create Wallet"** button

Expected:
- ✅ Loading spinner appears
- ✅ Button text changes to "Creating..."
- ✅ After 2-3 seconds: Success message appears
- ✅ Message: `Wallet "Test Wallet" created successfully!`
- ✅ Wallet details now visible

### Step 5: Verify in Browser Console

1. Open Developer Tools: `F12` or `Cmd+Option+I`
2. Go to "Console" tab
3. Look for messages like:

```
[ManualWallet] CDP Client initialized with correct credentials
[ManualWallet] No address provided, generating wallet via CDP...
[ManualWallet] Wallet generated successfully: 0x...
[ManualWallet] Creating wallet entry: ...
[ManualWallet] Wallet operation logged successfully
```

Expected: ✅ All messages present, no errors

---

## Detailed Test Scenarios

### Scenario 1: Fresh User - Auto Create Then Manual Create

**Purpose**: Test complete wallet creation flow

**Prerequisites**: User with NO existing wallet

**Steps**:

1. Login with fresh test account (no wallet yet)
2. Profile page loads
3. See: "🎉 Setting up your wallet... We're creating a testnet wallet for you"
4. Wait 5-10 seconds for auto-wallet to complete
5. See: Wallet address displayed in "My Wallet" section
6. See: "💰 Funding your wallet..." message
7. Wait 30-60 seconds for auto-superfaucet

**Expected Results**:
- ✅ Auto-wallet created
- ✅ Wallet funded automatically
- ✅ ETH balance shows: ~0.0001 ETH (or similar)
- ✅ No errors in console

---

### Scenario 2: Create Additional Manual Wallet

**Purpose**: Test manual wallet creation via button (THE FIX)

**Prerequisites**: User with existing wallet

**Setup**:
1. Already logged in with wallet
2. See wallet details displayed

**Steps**:

1. Scroll down to find "Create Wallet" section (if visible)
2. OR click wallet-related button in profile
3. Enter wallet name: **"My Second Wallet"**
4. Click **"Create Wallet"** button
5. Observe loading state
6. Wait for completion

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Button disabled during creation
- ✅ Success message shows
- ✅ NEW wallet address displayed
- ✅ Two wallets visible (old + new)
- ✅ Console shows `[ManualWallet]` logs
- ✅ No errors

---

### Scenario 3: Verify Wallet in Supabase

**Purpose**: Confirm wallet stored correctly in database

**Prerequisites**: Just created a wallet

**Steps**:

1. Open Supabase dashboard
2. Navigate to `user_wallets` table
3. Find your user's record
4. Verify fields:
   - `wallet_address`: Valid 0x... format
   - `wallet_name`: "Test Wallet" (or your name)
   - `user_id`: Matches logged-in user
   - `network`: "base-sepolia"

**Expected Results**:
- ✅ Wallet appears in table
- ✅ All fields populated correctly
- ✅ `created_at` timestamp recent
- ✅ `wallet_address` is valid Ethereum address

---

### Scenario 4: Fund the Created Wallet

**Purpose**: Verify wallet is functional

**Prerequisites**: Have a created wallet displayed

**Steps**:

1. Click "Request Testnet Funds" button
2. Select token: **ETH**
3. Click "Request ETH" button
4. Observe loading
5. Wait for completion (30-60 seconds)

**Expected Results**:
- ✅ Loading spinner shows
- ✅ Success message appears
- ✅ Transaction hash shown
- ✅ ETH balance increases
- ✅ Explorer link provided
- ✅ No errors in console

---

### Scenario 5: Test Error Handling - CDP Failure

**Purpose**: Verify graceful error handling

**Prerequisites**: Test account, dev server running

**Steps**:

1. Temporarily disable CDP credentials:
   - Rename `.env.local` to `.env.local.bak`
   - Create empty `.env.local`
2. Restart dev server
3. Login and try to create wallet
4. Observe error handling

**Expected Results**:
- ✅ Error message appears: "Failed to generate wallet..."
- ✅ Error shown in UI
- ✅ No console errors (expected 503)
- ✅ User can retry after fixing credentials

**Cleanup**:
```bash
mv .env.local.bak .env.local
npm run dev
```

---

### Scenario 6: Test Backward Compatibility (With Address)

**Purpose**: Verify old functionality still works

**Prerequisites**: You can manually provide a wallet address

**Manual API Call** (using curl or Postman):

```bash
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Manual Address Wallet",
    "type": "custom",
    "address": "0x1234567890123456789012345678901234567890"
  }'
```

**Expected Response**:
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "name": "Manual Address Wallet",
  "wallet_id": "...",
  "type": "custom",
  "network": "base-sepolia"
}
```

**Expected Results**:
- ✅ Wallet created with provided address
- ✅ No CDP generation attempted
- ✅ Backward compatible ✅

---

## Advanced Test Cases

### Test: Concurrent Wallet Creation

**Purpose**: Verify no race conditions

**Steps**:

1. Have developer tools open (Network tab)
2. Click "Create Wallet" button
3. IMMEDIATELY click it again
4. Observe requests

**Expected Results**:
- ✅ First request succeeds
- ✅ Second request might fail (expected) OR
- ✅ Both requests handled gracefully
- ✅ No database corruption

---

### Test: Network Error Recovery

**Purpose**: Test resilience

**Steps**:

1. Open Network tab in DevTools
2. Go to Profile page
3. Right-click "Create Wallet" request → Throttle (Slow 3G)
4. Click "Create Wallet"
5. Observe slow response handling

**Expected Results**:
- ✅ Longer loading time but still works
- ✅ Success message eventually appears
- ✅ No timeout errors

---

### Test: Session Expiration

**Purpose**: Verify authentication checks

**Steps**:

1. Login successfully
2. Clear cookies/session
3. Try to create wallet via API
4. Observe error

**Expected Results**:
- ✅ Returns 401 "Unauthorized"
- ✅ User asked to login again
- ✅ No data leakage

---

## Verification Checklist

After running tests, verify:

### Frontend (Browser)
- [ ] No console errors
- [ ] No console warnings (except expected)
- [ ] Success messages clear and helpful
- [ ] Loading states work properly
- [ ] Error messages display correctly

### Backend (Server Logs)
- [ ] `[ManualWallet]` logs appear
- [ ] No 500 errors
- [ ] CDP calls succeed
- [ ] Database operations succeed
- [ ] Wallet addresses generated correctly

### Database (Supabase)
- [ ] Wallets appear in `user_wallets` table
- [ ] User_id matches logged-in user
- [ ] Wallet addresses are valid
- [ ] Created timestamps are current
- [ ] No duplicate entries

### Blockchain (Block Explorer)
- [ ] Wallet addresses are valid Ethereum addresses
- [ ] Wallets can receive test tokens
- [ ] Transactions succeed

---

## Common Issues & Solutions

### Issue: "Wallet address is required" Still Appears

**Cause**: Code changes not loaded

**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Clear browser cache

---

### Issue: CDP Error - "Failed to generate wallet"

**Cause**: CDP credentials not configured

**Solution**:
1. Verify `.env.local` has:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
   - `CDP_WALLET_SECRET`
2. Restart dev server
3. Check CDP dashboard for rate limits

---

### Issue: "Failed to save wallet to database"

**Cause**: Database connection or RLS policy issue

**Solution**:
1. Verify Supabase connection
2. Check RLS policies on `user_wallets` table
3. Ensure user is authenticated
4. Check server logs for detailed error

---

### Issue: Wallet Created But Not Visible

**Cause**: Page cache or not refreshed

**Solution**:
1. Refresh page: `F5` or `Cmd+R`
2. Check Supabase directly
3. Verify user_id matches

---

### Issue: Console Shows Errors But UI Works

**Cause**: Non-critical logging errors (expected)

**Solution**:
1. If `[ManualWallet]` logs show success → It's working
2. If only warning logs → Safe to ignore
3. If error logs → Check details

---

## Test Results Template

Use this template to document your test results:

```markdown
## Test Results - November 3, 2025

**Tester**: [Your Name]  
**Date**: [Date]  
**Environment**: localhost  
**Test Account**: wallettest_nov3_dev@mailinator.com

### Quick Test
- [ ] Server started successfully
- [ ] Logged in successfully
- [ ] Wallet creation succeeded
- [ ] Success message displayed
- [ ] Console logs look correct

### Detailed Tests

#### Scenario 1: Fresh User Auto Create
- [ ] Auto-wallet created
- [ ] Auto-funding triggered
- [ ] Balance shows correctly

#### Scenario 2: Manual Create
- [ ] Button clickable
- [ ] Loading state works
- [ ] Success message shows
- [ ] Wallet appears in UI

#### Scenario 3: Supabase Verification
- [ ] Wallet in database
- [ ] Fields populated correctly
- [ ] User ID matches

#### Scenario 4: Fund Wallet
- [ ] Fund request succeeds
- [ ] Balance updates
- [ ] Transaction hash shown

### Issues Found
- [ ] No issues
- [ ] Minor issues (describe):
- [ ] Major issues (describe):

### Notes
[Add any observations]

### Status
✅ All tests passed / ⚠️ Some issues / ❌ Critical issues
```

---

## Performance Testing

### Load Time Test

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Filter by `/api/wallet/create`
5. Check response time

**Expected**: < 2 seconds for CDP + DB combined

---

### Resource Usage

1. Open DevTools Performance tab
2. Create a wallet
3. Record performance
4. Check for:
   - No memory leaks
   - No excessive CPU usage
   - Smooth animations

---

## Sign-Off Checklist

- [x] Code implemented
- [x] No linting errors
- [ ] Tested on localhost
- [ ] Manual wallet created successfully
- [ ] Verified in Supabase
- [ ] Wallet funded successfully
- [ ] Browser console clean
- [ ] Server logs show success
- [ ] Backward compatibility verified
- [ ] Error handling verified
- [x] Ready for production

---

## Next Steps

After successful testing:

1. ✅ Complete all test cases
2. ✅ Document any issues found
3. ✅ Fix issues if needed
4. ✅ Re-test if changes made
5. ✅ Get sign-off from team
6. ✅ Deploy to production

---

**Test Environment**: localhost  
**Test Date**: November 3, 2025  
**Status**: Ready to test


