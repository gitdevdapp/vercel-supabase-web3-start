# Testing Guide - Profile V2

**Environment:** localhost:3000  
**Test Account:** test@test.com / password  
**Network:** Base Sepolia Testnet  
**Date:** October 28, 2025

---

## 🧪 Testing Overview

This guide provides comprehensive testing procedures for the Profile V2 system after Priority 1 implementation. All tests should be run on localhost with the test account.

### Test Environment Setup
```bash
# Start development server
npm run dev

# Access profile page
http://localhost:3000/protected/profile

# Login credentials
Email: test@test.com
Password: password
```

---

## 📋 Pre-Test Checklist

### ✅ Code Status
- [x] Priority 1 fixes implemented and tested
- [x] Server builds without errors
- [x] Database connections working
- [x] Blockchain integration active

### ✅ Test Data Available
- [x] Test wallet: `0xBa63F651527ae76110D674cF3Ec95D013aE9E208`
- [x] Test contract: `0xEDB6182064c102021b9B02291262f89cd5964200`
- [x] Supabase database populated
- [x] Base Sepolia testnet access

### ✅ Browser Requirements
- [x] Modern browser with JavaScript enabled
- [x] Network access for BaseScan links
- [x] Localhost:3000 accessible

---

## 🔄 Test Execution Flow

### Phase 1: Authentication & Profile Access (5 minutes)
**Goal:** Verify login and profile loading works correctly

1. **Navigate to Profile**
   - Go to `http://localhost:3000/protected/profile`
   - Verify redirect to login if not authenticated

2. **Login Process**
   - Enter: `test@test.com`
   - Enter: `password`
   - Click "Sign In"
   - Verify successful login and redirect

3. **Profile Loading**
   - Verify profile page loads completely
   - Check all components render (no blank sections)
   - Verify wallet card appears with balance

**Expected Results:**
- ✅ Profile loads in <3 seconds
- ✅ User info displays correctly (test@test.com)
- ✅ Wallet card shows with ETH balance >0
- ✅ All UI components functional

---

### Phase 2: Wallet Balance Verification (3 minutes)
**Goal:** Confirm real-time balance fetching works

1. **ETH Balance Check**
   - View ETH balance in wallet card
   - Verify format: `X.XXXX ETH`
   - Confirm balance > 0.005 (from previous tests)

2. **USDC Balance Check**
   - View USDC balance (shows 0.00 due to known issue)
   - Verify graceful error handling (no crashes)

3. **Wallet Address**
   - Check address: `0xBa63F651527ae76110D674cF3Ec95D013aE9E208`
   - Verify "Copy" button works

4. **Network Status**
   - Verify "Base Sepolia" network indicator
   - Check green status dot

**Expected Results:**
- ✅ ETH balance displays correctly from blockchain
- ✅ USDC shows 0.00 (known limitation, no crash)
- ✅ Address copying works
- ✅ Network status correct

---

### Phase 3: Transaction History Testing (5 minutes)
**Goal:** Verify Priority 1 transaction history fixes

1. **Transaction History Access**
   - Click "Transaction History" button in wallet card
   - Verify section expands
   - Check "Refresh" button available

2. **Existing Transactions**
   - Look for "Fund" transaction (+0.001 ETH)
   - Verify blue badge and TrendingUp icon
   - Check BaseScan link works

3. **Deploy Transaction**
   - Look for "Deploy" transaction
   - Verify purple badge
   - Check transaction hash format

4. **Transaction Details**
   - Click any transaction
   - Verify BaseScan opens in new tab
   - Check transaction hash in URL

**Expected Results:**
- ✅ Transaction history loads
- ✅ Fund transaction: Blue badge, proper icon
- ✅ Deploy transaction: Purple badge, valid hash
- ✅ BaseScan links functional

---

### Phase 4: Faucet Functionality Testing (10 minutes)
**Goal:** Test both faucet types and Priority 1 fixes

#### 4.1 Regular Faucet Test
1. **Access Regular Faucet**
   - Click "Request Testnet Funds"
   - Select "ETH (0.001)" option
   - Click "Request ETH" button

2. **Monitor Process**
   - Verify button shows "Requesting..."
   - Wait for success message
   - Check balance updates

3. **Verify Transaction**
   - Refresh transaction history
   - Look for new "Fund" transaction
   - Verify blue badge and correct amount

**Expected Results:**
- ✅ Faucet request succeeds
- ✅ Balance increases by 0.001 ETH
- ✅ New transaction appears with blue badge

#### 4.2 Super Faucet Test
1. **Access Super Faucet**
   - Click "Super Faucet" button
   - **CRITICAL CHECK:** Verify description shows "0.0001 ETH per 24 hours"
   - **DO NOT see:** "10 ETH, 1000 USDC"

2. **Execute Request**
   - Click "Request Super Faucet"
   - Button shows "Requesting Super Faucet..." (disabled)
   - Wait 30-60 seconds for completion

3. **Verify Success**
   - Check success message appears
   - Verify balance increased
   - Refresh transaction history

4. **Verify Priority 1 Fix**
   - **CRITICAL:** Look for super faucet transaction
   - **VERIFY:** Shows BLUE badge (not gray) ← THE KEY FIX
   - Verify TrendingUp icon present
   - Check amount >0

**Expected Results:**
- ✅ Description accurate (0.0001 ETH per 24h)
- ✅ Process completes successfully
- ✅ Balance increases
- ✅ **BLUE badge for super faucet transaction** (Priority 1 fix confirmed)

---

### Phase 5: Contract Deployment Testing (15 minutes)
**Goal:** Test full deployment flow and transaction logging

1. **Access Deployment Form**
   - Scroll to "NFT Creation Card"
   - Verify form fields present

2. **Fill Deployment Form**
   - Name: `TestNFT-Phase5`
   - Symbol: `T5`
   - Max Supply: `500`
   - Mint Price: `0.02`

3. **Execute Deployment**
   - Click "Deploy NFT Collection"
   - Button shows "Deploying Collection..." (disabled)
   - Wait 5-7 seconds for blockchain confirmation

4. **Verify Success**
   - Check success message appears
   - Note contract address
   - Verify BaseScan link works

5. **Verify Transaction Logging**
   - Refresh transaction history
   - Look for new "Deploy" transaction
   - Verify purple badge
   - Check transaction hash

**Expected Results:**
- ✅ Deployment succeeds
- ✅ Contract address generated
- ✅ BaseScan link functional
- ✅ Deploy transaction in history with purple badge

---

### Phase 6: Real-time Balance Updates (5 minutes)
**Goal:** Verify balance synchronization works

1. **Initial State**
   - Note current ETH balance
   - Keep transaction history visible

2. **Trigger Balance Change**
   - Request regular faucet (0.001 ETH)
   - Wait for completion

3. **Verify Updates**
   - Check wallet card balance updates
   - Refresh transaction history
   - Verify new transaction appears
   - Check timestamps are current

**Expected Results:**
- ✅ Balance updates immediately after transactions
- ✅ Transaction history refreshes correctly
- ✅ No stale cached values
- ✅ Timestamps accurate

---

### Phase 7: Cross-Browser Testing (Optional, 5 minutes)
**Goal:** Verify compatibility across browsers

1. **Test Browsers**
   - Chrome/Chromium (primary)
   - Firefox (secondary)
   - Safari (if available)

2. **Key Functionality**
   - Profile loading
   - Wallet balance display
   - Transaction history
   - Faucet operations
   - Contract deployment

**Expected Results:**
- ✅ Core functionality works across browsers
- ✅ UI renders consistently
- ✅ No browser-specific issues

---

## 📊 Test Results Summary

### Critical Priority 1 Verifications

#### ✅ Super Faucet UI Handler
- [ ] Super faucet transactions show BLUE badge (not gray)
- [ ] TrendingUp icon displays correctly
- [ ] Consistent with regular faucet styling

#### ✅ Super Faucet Description
- [ ] Shows "0.0001 ETH per 24 hours" accurately
- [ ] Does NOT show misleading "10 ETH, 1000 USDC"
- [ ] Clear about faucet limitations

#### ✅ Deployment Transaction Logging
- [ ] ERC721 deployments appear in transaction history
- [ ] Deploy transactions show purple badges
- [ ] Transaction hashes are valid and linked

### Functional Testing Results

#### ✅ Authentication & Profile
- [ ] Login works with test@test.com
- [ ] Profile page loads completely
- [ ] All components render properly

#### ✅ Wallet Management
- [ ] ETH balance displays from blockchain
- [ ] USDC shows 0.00 (known limitation, handled gracefully)
- [ ] Wallet address copying works
- [ ] Network status correct

#### ✅ Transaction History
- [ ] History loads and refreshes
- [ ] All transaction types display correctly
- [ ] BaseScan links functional
- [ ] Status indicators accurate

#### ✅ Faucet Operations
- [ ] Regular faucet works (0.001 ETH)
- [ ] Super faucet works (variable amount)
- [ ] Balance updates correctly
- [ ] Transaction logging accurate

#### ✅ Contract Deployment
- [ ] ERC721 deployment succeeds
- [ ] Contract addresses generated
- [ ] BaseScan integration works
- [ ] Transaction history updated

#### ✅ Real-time Updates
- [ ] Balance synchronization works
- [ ] Transaction history refreshes
- [ ] UI state updates correctly
- [ ] No caching issues

---

## 🚨 Error Handling Verification

### Expected Error Scenarios
1. **USDC Balance Failure** (Known Issue)
   - Should show 0.00 gracefully
   - No crashes or broken UI
   - ETH balance still works

2. **Network Timeouts**
   - Graceful fallbacks
   - User-friendly error messages
   - Retry mechanisms

3. **Invalid Transactions**
   - Proper error feedback
   - No data corruption
   - Transaction state recovery

### Error Recovery Testing
- [ ] Test with slow network
- [ ] Test with blockchain congestion
- [ ] Test with invalid wallet addresses
- [ ] Verify error boundaries work

---

## 📈 Performance Testing

### Response Time Benchmarks
- **Profile Load:** < 3 seconds
- **Balance Fetch:** < 1 second (ETH), < 2 seconds (USDC error)
- **Transaction History:** < 1 second
- **Faucet Request:** 2-3 seconds
- **Contract Deployment:** 5-7 seconds

### Memory & Resource Usage
- [ ] No memory leaks during testing
- [ ] Reasonable CPU usage
- [ ] Network requests optimized
- [ ] Bundle size appropriate

---

## 🐛 Bug Reporting Template

When reporting issues found during testing:

### Bug Report Format
```
**Test Phase:** [Phase number/name]
**Browser:** [Chrome/Firefox/etc]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Expected result]
4. [Actual result]

**Error Messages:** [Any console errors]
**Screenshots:** [If applicable]
**Environment:** localhost:3000, test@test.com
```

### Severity Levels
- **Critical:** System crashes, data loss, security issues
- **High:** Core functionality broken, blocking workflows
- **Medium:** Feature partially broken, workarounds available
- **Low:** Minor UI issues, cosmetic problems

---

## 🔧 Troubleshooting Common Issues

### Server Won't Start
```bash
# Kill existing processes
pkill -f "next dev"
rm -f .next/dev/lock

# Start fresh
npm run dev
```

### Transactions Not Appearing
- Check browser console for API errors
- Verify database connectivity
- Try refreshing transaction history
- Check network tab for failed requests

### Balance Not Updating
- Wait for blockchain confirmation (up to 30 seconds)
- Refresh the page
- Check Base Sepolia explorer for transaction status
- Verify wallet address is correct

### Contract Deployment Fails
- Ensure sufficient ETH balance (>0.005 ETH)
- Check Base Sepolia network status
- Verify form data is valid
- Check console for deployment errors

---

## 📋 Test Completion Checklist

### Pre-Test Setup
- [ ] Development server running on localhost:3000
- [ ] Test account accessible (test@test.com)
- [ ] Base Sepolia testnet operational
- [ ] Browser console open for debugging

### Core Functionality Tests
- [ ] Phase 1: Authentication & Profile Access
- [ ] Phase 2: Wallet Balance Verification
- [ ] Phase 3: Transaction History Testing
- [ ] Phase 4: Faucet Functionality Testing
- [ ] Phase 5: Contract Deployment Testing
- [ ] Phase 6: Real-time Balance Updates

### Priority 1 Verification
- [ ] Super faucet shows BLUE badge (not gray)
- [ ] Super faucet description accurate
- [ ] Deployments appear in transaction history

### Quality Assurance
- [ ] No JavaScript errors in console
- [ ] UI renders correctly on different screen sizes
- [ ] All links and buttons functional
- [ ] Performance acceptable

---

## 📊 Test Results Documentation

### Test Session Information
```
Date: [YYYY-MM-DD]
Tester: [Name]
Environment: localhost:3000
Browser: [Browser Version]
Network: [Connection Speed]

Overall Result: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
```

### Detailed Results
```
Phase 1: ✅ PASS - [Notes]
Phase 2: ✅ PASS - [Notes]
Phase 3: ✅ PASS - [Notes]
Phase 4: ✅ PASS - [Notes]
Phase 5: ✅ PASS - [Notes]
Phase 6: ✅ PASS - [Notes]
```

### Issues Found
```
1. [Issue description] - [Severity] - [Status]
2. [Issue description] - [Severity] - [Status]
```

### Recommendations
```
- [Any improvements or fixes needed]
- [Performance optimizations]
- [Additional test scenarios]
```

---

## 🔗 Related Documentation

### Current State
- **[README.md](README.md)** - Profile V2 overview
- **[PROFILE-OVERVIEW.md](PROFILE-OVERVIEW.md)** - System architecture
- **[TRANSACTION-HISTORY-STATE.md](TRANSACTION-HISTORY-STATE.md)** - Transaction details

### Issue Tracking
- **[KNOWN-ISSUES.md](KNOWN-ISSUES.md)** - Active issues and workarounds
- **[DATABASE-INTEGRATION.md](DATABASE-INTEGRATION.md)** - Database queries

### Future Planning
- **[PRIORITY-2-ROADMAP.md](PRIORITY-2-ROADMAP.md)** - Next phase features
- **[PRIORITY-3-ROADMAP.md](PRIORITY-3-ROADMAP.md)** - Advanced features

---

## 📝 Testing Notes

This testing guide covers the Profile V2 system after Priority 1 implementation. Focus on verifying the three critical fixes:

1. **Super faucet UI** - Blue badges instead of gray
2. **Super faucet description** - Accurate rate limits
3. **Deployment logging** - Transactions appear in history

**Test Environment:** Keep localhost:3000 running throughout testing
**Test Account:** Use test@test.com consistently
**Documentation:** Record all findings for issue tracking

**Last Updated:** October 28, 2025
