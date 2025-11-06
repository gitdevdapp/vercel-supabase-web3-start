# Known Issues - Profile V2

**Status:** Current as of October 28, 2025  
**Priority 1:** ✅ Complete (3 issues resolved)  
**Impact Level:** Low to Medium (non-blocking)

---

## 🚨 Critical Issues

### 1. USDC Balance Fetching Failure
**Status:** 🟡 ACTIVE  
**Severity:** Medium  
**Impact:** USDC balance always shows 0.00  
**User Experience:** Confusing - balance display incomplete  

#### Error Details
```
Error: could not decode result data (value="0x", info={ "method": "balanceOf", "signature": "balanceOf(address)" }, code=BAD_DATA, version=6.15.0)
```

#### Affected APIs
- `GET /api/wallet/balance?address={address}`
- `GET /api/wallet/list`

#### Root Cause
- USDC contract not deployed on Base Sepolia testnet
- Contract call returns `0x` (empty data) instead of balance
- Error handling falls back to 0, but ETH balance works correctly

#### Current Workaround
- ETH balance displays correctly from blockchain
- USDC shows 0.00 (expected for testnet)
- No functional impact on core features

#### Fix Status
- **Short-term:** Deploy USDC contract to Base Sepolia
- **Long-term:** Add contract existence checks before calls
- **Timeline:** Priority 2 (1-2 weeks)

---

### 2. Database Function Parameter Mismatch
**Status:** 🟡 ACTIVE  
**Severity:** Low  
**Impact:** Contract metadata logging fails silently  
**User Experience:** Deployments work, but extra logging fails  

#### Error Details
```
Could not find the function public.log_contract_deployment(p_abi, p_contract_address, p_contract_name, p_contract_type, p_deployment_block, p_network, p_platform_api_used, p_tx_hash, p_user_id, p_wallet_id) in the schema cache
```

#### Affected API
- `POST /api/contract/deploy`

#### Root Cause
- Database function signature mismatch
- `log_contract_deployment` expects different parameter order/types
- Transaction logging works separately via `log_wallet_operation`

#### Current Workaround
- Deployments succeed completely
- Transaction history shows deploy operations
- Only metadata logging fails (non-critical)

#### Fix Status
- **Short-term:** Update function call parameters
- **Long-term:** Standardize all RPC function signatures
- **Timeline:** Priority 2 (1-2 weeks)

---

## ⚠️ Medium Priority Issues

### 3. Super Faucet Completion Status
**Status:** 🟡 PARTIALLY TESTED  
**Severity:** Medium  
**Impact:** Long wait times, unclear progress  
**User Experience:** Slow feedback during multi-request operations  

#### Issue Details
- Super faucet makes multiple sequential requests (by design)
- Each request takes 2-15 seconds (conservative spacing)
- No progress indicator during operation
- UI shows "Requesting Super Faucet..." for full duration

#### Current Behavior
```
User clicks "Super Faucet"
Button shows "Requesting Super Faucet..." (disabled)
After 30-60 seconds: Success message appears
Transaction appears in history with blue badge ✅
```

#### Planned Improvements
- Real-time progress updates
- Request count display (e.g., "2/10 requests")
- Estimated time remaining
- Cancellation option

#### Fix Status
- **Core Fix:** ✅ Complete (Priority 1 - blue badges work)
- **UX Enhancement:** 📋 Planned (Priority 3)
- **Timeline:** 1-2 months

---

### 4. Transaction Metadata Display Limitations
**Status:** 🟡 KNOWN LIMITATION  
**Severity:** Low  
**Impact:** Limited transaction details in UI  
**User Experience:** Missing context for some operations  

#### Missing Information
- **Contract addresses** not displayed for deployments
- **Gas costs** not tracked or shown
- **Collection metadata** (name, symbol, supply) not visible
- **Transaction fees** not calculated
- **Token quantities** for batch operations

#### Current Display Example
```
✅ Deploy
   TX: 0xe232...be14
   Just now
```
**Missing:** Contract address, gas cost, collection details

#### Planned Enhancements
- Contract address display in transaction details
- Gas cost tracking and display
- Collection metadata integration
- Enhanced transaction cards with more info

#### Fix Status
- **Priority 2:** Contract addresses + gas tracking
- **Priority 3:** Enhanced UI components
- **Timeline:** 1-2 weeks for basic display

---

## 🟢 Low Priority Issues

### 5. Mobile Responsiveness Edge Cases
**Status:** 🟡 MINOR  
**Severity:** Low  
**Impact:** Suboptimal experience on very small screens  
**User Experience:** Layout adjustments needed  

#### Issues Identified
- Transaction history text may wrap awkwardly on <320px screens
- Button spacing could be optimized for touch targets
- Form inputs may need mobile-specific adjustments

#### Current Status
- Desktop and tablet layouts work well
- Basic mobile support implemented
- No blocking issues, just UX refinements

#### Fix Status
- **Timeline:** Ongoing improvements
- **Priority:** Low (cosmetic)

---

### 6. API Response Time Variations
**Status:** 🟡 MINOR  
**Severity:** Low  
**Impact:** Inconsistent loading times  
**User Experience:** Variable wait times  

#### Performance Variations
- **Transaction History:** 400-700ms (database dependent)
- **Balance Updates:** 300-600ms (blockchain dependent)  
- **Contract Deployment:** 5-7s (blockchain confirmation)
- **USDC Balance:** Fails quickly (contract not deployed)

#### Current Optimization
- Efficient database queries with proper indexing
- Minimal data transfer
- Proper loading states
- Error boundaries

#### Fix Status
- **Short-term:** Add response time monitoring
- **Long-term:** Implement caching strategies
- **Timeline:** Ongoing performance monitoring

---

## 🔧 Technical Issues

### 7. Development Server Port Conflicts
**Status:** 🟡 DEVELOPMENT ONLY  
**Severity:** Low (Dev Only)  
**Impact:** Requires manual server restart  
**User Experience:** N/A (development issue)  

#### Issue Details
```
⚠ Port 3000 is in use by process 27355, using available port 3001 instead.
Unable to acquire lock at /Users/garrettair/Documents/vercel-supabase-web3/.next/dev/lock
```

#### Root Cause
- Multiple Next.js dev processes running
- Lock file prevents concurrent development
- Requires manual cleanup

#### Current Workaround
```bash
# Kill existing processes
pkill -f "next dev"
rm -f .next/dev/lock

# Start fresh
npm run dev
```

#### Fix Status
- **Development:** Manual process management
- **Production:** N/A (single process)
- **Timeline:** N/A (development workflow)

---

### 8. TypeScript Strict Mode Warnings
**Status:** 🟡 DEVELOPMENT ONLY  
**Severity:** Low (Dev Only)  
**Impact:** Development warnings  
**User Experience:** N/A (development issue)  

#### Warnings Seen
```
(node:70334) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized
```

#### Impact
- No functional issues
- Node.js deprecation warnings
- Development console noise

#### Fix Status
- **Timeline:** Update to modern URL API when convenient
- **Priority:** Very Low

---

## 📊 Issue Summary Table

| Issue | Status | Severity | Impact | Timeline | Priority |
|-------|--------|----------|--------|----------|----------|
| USDC Balance | Active | Medium | Balance display | 1-2 weeks | 2 |
| DB Function Mismatch | Active | Low | Metadata logging | 1-2 weeks | 2 |
| Super Faucet UX | Partial | Medium | Progress feedback | 1-2 months | 3 |
| Transaction Metadata | Known | Low | UI details | 1-2 weeks | 2 |
| Mobile Responsiveness | Minor | Low | Touch targets | Ongoing | 4 |
| API Performance | Minor | Low | Loading times | Ongoing | 4 |
| Dev Server Lock | Dev Only | Low | Development | N/A | N/A |
| TypeScript Warnings | Dev Only | Low | Console | Ongoing | 4 |

---

## ✅ Resolved Issues (Priority 1)

### 1. Super Faucet UI Handler ✅ RESOLVED
**Issue:** Gray badges instead of blue for super faucet  
**Fix:** Added `super_faucet` cases to styling functions  
**Status:** ✅ Complete - Blue badges working

### 2. Super Faucet Description ✅ RESOLVED  
**Issue:** Misleading "10 ETH, 1000 USDC" claim  
**Fix:** Updated to accurate "0.0001 ETH per 24 hours"  
**Status:** ✅ Complete - Honest descriptions

### 3. Deployment Transaction Logging ✅ RESOLVED
**Issue:** Deployments not appearing in transaction history  
**Fix:** Added `log_wallet_operation` call in deploy API  
**Status:** ✅ Complete - Deployments tracked

---

## 🔍 Issue Investigation Status

### Active Investigations
- **USDC Contract Deployment:** Researching Base Sepolia USDC contracts
- **Database Function Signatures:** Comparing current vs expected parameters
- **Super Faucet Progress:** Evaluating real-time update feasibility

### Completed Investigations
- **Transaction History Priority 1:** All issues identified and fixed
- **Profile Layout Architecture:** Component structure verified
- **API Response Formats:** Endpoints tested and working

---

## 🛠️ Troubleshooting Guide

### USDC Balance Issues
**Symptoms:** USDC always shows 0.00  
**Check:** Base Sepolia USDC contract deployment status  
**Workaround:** ETH balance works correctly  
**Fix:** Deploy USDC contract or add existence check

### Database Logging Failures
**Symptoms:** Deployments succeed but metadata logging fails  
**Check:** RPC function parameter signatures  
**Workaround:** Core functionality works (transactions logged separately)  
**Fix:** Update function call parameters

### Super Faucet Delays
**Symptoms:** Long wait times for completion  
**Check:** Network conditions and faucet rate limits  
**Workaround:** Process completes successfully  
**Fix:** Add progress indicators (Priority 3)

---

## 📈 Issue Resolution Timeline

### Week 1 (Current)
- ✅ Priority 1 fixes complete and tested
- 🔄 Investigate USDC contract options
- 🔄 Fix database function parameters

### Week 2-3 (Priority 2)
- ✅ Contract address display in transactions
- ✅ Gas cost tracking implementation
- ✅ Collection metadata storage/display
- ✅ Operation type standardization

### Month 2-3 (Priority 3)
- ✅ Enhanced transaction cards
- ✅ Contract interaction features
- ✅ Super faucet progress indicators
- ✅ Advanced filtering and search

---

## 📞 Support Information

### For Developers
- **Issue Tracking:** This document serves as the issue tracker
- **Priority Assessment:** Based on user impact and technical complexity
- **Resolution Timeline:** Updated with each priority completion

### For Users
- **Workarounds:** Documented for all active issues
- **Expected Behavior:** Clear descriptions of correct functionality
- **Timeline Communication:** Regular updates as fixes are implemented

---

## 🔗 Related Documentation

### Current State
- **[README.md](README.md)** - Overview of all Profile V2 docs
- **[PROFILE-OVERVIEW.md](PROFILE-OVERVIEW.md)** - Complete system overview
- **[TRANSACTION-HISTORY-STATE.md](TRANSACTION-HISTORY-STATE.md)** - Transaction system details

### Technical Details
- **[DATABASE-INTEGRATION.md](DATABASE-INTEGRATION.md)** - Schema and queries
- **[API-ENDPOINTS.md](API-ENDPOINTS.md)** - All API documentation
- **[UI-COMPONENTS.md](UI-COMPONENTS.md)** - Component architecture

### Future Planning
- **[PRIORITY-2-ROADMAP.md](PRIORITY-2-ROADMAP.md)** - Next phase features
- **[PRIORITY-3-ROADMAP.md](PRIORITY-3-ROADMAP.md)** - Advanced features
- **[MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)** - Production deployment

---

## 📝 Documentation Notes

This document tracks all known issues in the Profile V2 system. Issues are categorized by severity and impact, with clear resolution plans and timelines.

**Update Frequency:** Updated after each priority implementation and when new issues are discovered.

**Status:** Current and actively maintained

**Last Updated:** October 28, 2025
