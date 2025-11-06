# Profile Reorganization Test Plan - Full Functionality Verification

**Date:** October 28, 2025  
**Test Scope:** Complete validation of profile-reorg.md implementation  
**Test Account:** test@test.com / test123  
**Test Environment:** localhost:3000  

---

## 📋 CRITICAL REVIEW OF PROFILE-REORG.MD

### ✅ Plan Safety Assessment

**Verdict:** ✅ **SAFE FOR IMPLEMENTATION**

#### Verification Points

1. **No Vercel Breaking Changes Identified:**
   - ✅ All API endpoints remain UNCHANGED
   - ✅ No database schema modifications required
   - ✅ No environment variable additions
   - ✅ No new dependencies needed
   - ✅ Pure CSS Grid layout reversal only
   - ✅ Component state consolidation (no breaking changes)

2. **Functionality Preservation Matrix (32 Features):**
   - ✅ 31 features remain unchanged
   - ⚠️ 1 feature marked for verification (ERC721 deployment TXs in history)
   - ❌ 0 features will be lost

3. **Component Files Involved:**
   ```
   BEFORE (5 cards):
   - app/protected/profile/page.tsx ← Grid layout [400px_1fr]
   - components/simple-profile-form.tsx ← LEFT column
   - components/profile-wallet-card.tsx ← RIGHT column  
   - components/profile/SuperFaucetButton.tsx ← STANDALONE CARD
   - components/profile/DeployerFundingButton.tsx ← STANDALONE CARD
   - components/profile/NFTCreationCard.tsx ← RIGHT column
   - components/staking/StakingCardWrapper.tsx ← RIGHT column
   - components/profile/CollapsibleGuideAccess.tsx ← TOP banner

   AFTER (4 cards):
   - app/protected/profile/page.tsx ← Grid layout [1fr_400px]
   - components/simple-profile-form.tsx ← RIGHT column (MOVED)
   - components/profile-wallet-card.tsx ← RIGHT column + FAUCET INTEGRATED
   - components/profile/NFTCreationCard.tsx ← LEFT column + DEPLOYER INTEGRATED
   - components/staking/StakingCardWrapper.tsx ← LEFT column
   - components/profile/CollapsibleGuideAccess.tsx ← TOP banner (UNCHANGED)
   - components/profile/SuperFaucetButton.tsx ← DELETE (logic moved)
   - components/profile/DeployerFundingButton.tsx ← DELETE (logic moved)
   ```

4. **Critical API Endpoints - All VERIFIED as UNCHANGED:**
   - `/api/wallet/super-faucet` - POST (faucet requests)
   - `/api/wallet/fund-deployer` - POST (deployer funding)
   - `/api/wallet/transactions` - GET (transaction history)
   - `/api/contract/deploy` - POST (ERC721 deployment)
   - `/api/wallet/balance` - GET (balance queries)
   - `/api/wallet/list` - GET (wallet list)
   - `/api/wallet/fund` - POST (wallet funding)
   - `/api/wallet/transfer` - POST (send funds)

5. **State Management Changes - SAFE:**
   - ProfileWalletCard will gain: `isSuperFaucetRequesting`, `superFaucetResult`, `showSuperFaucet` states
   - NFTCreationCard will gain: `isFundingDeployer`, `showFundDeployer` states
   - No state conflicts or prop type mismatches

6. **Risk Level Assessment:**
   - **Layout Risk:** 🟢 LOW (CSS Grid reversal, responsive unchanged)
   - **Faucet Integration Risk:** 🟡 MEDIUM (state copy-paste, needs careful testing)
   - **Deployer Integration Risk:** 🟡 MEDIUM (state copy-paste, needs careful testing)
   - **Transaction History Risk:** 🟢 LOW (no backend changes needed for UI)
   - **Build Risk:** 🟢 LOW (no new imports, no circular dependencies)
   - **Overall Risk:** 🟡 **LOW-MEDIUM** (purely UI consolidation)

---

## 🎯 COMPREHENSIVE TEST PLAN

### Phase 1: Pre-Testing Setup

#### 1.1 Environment Preparation
```bash
[ ] Kill all local processes:
    - pkill -f "next dev"
    - pkill -f "node"
    - sleep 2

[ ] Clear caches:
    - rm -rf .next
    - rm -rf node_modules/.cache

[ ] Start fresh development server:
    - npm run dev
    
[ ] Wait for build completion and open http://localhost:3000
```

#### 1.2 Test Account Authentication
```
Email: test@test.com
Password: test123
Expected: Login successful, redirected to /protected/profile
```

---

### Phase 2: Layout & Card Count Verification

#### 2.1 Desktop Layout (1920x1080)
```
[ ] Navigate to /protected/profile
[ ] Resize browser to 1920x1080
[ ] Verify EXACTLY 4 cards visible:
    
    EXPECTED LAYOUT:
    ┌──────────────────────────────────────────────────┐
    │ COLLAPSIBLE GUIDE ACCESS (banner top)            │
    └──────────────────────────────────────────────────┘
    ┌─────────────────────┬──────────────────────────────┐
    │ LEFT COLUMN         │ RIGHT COLUMN                 │
    ├─────────────────────┼──────────────────────────────┤
    │ 1. RAIR Staking     │ 2. Profile Form              │
    │    Card             │    (edit profile, avatar)   │
    │                     │                              │
    ├─────────────────────┼──────────────────────────────┤
    │ 4. ERC721 Deployer  │ 3. My Wallet Card            │
    │    Card             │    (balance, buttons)       │
    │                     │    [integrated faucet]      │
    │                     │    [integrated deployer]    │
    │                     │                              │
    └─────────────────────┴──────────────────────────────┘

[ ] Verify card count: 4 (excluding banner)
[ ] Verify left column width: ~50% (1fr)
[ ] Verify right column width: ~400px
[ ] Verify no horizontal scrolling
[ ] Verify spacing between cards: consistent (6 units)
[ ] Verify cards NOT overlapping
[ ] Verify all text legible
```

#### 2.2 Mobile Layout (375x667)
```
[ ] Resize to 375x667 (mobile)
[ ] Verify responsive stacking:
    [ ] Banner at top
    [ ] Profile Form below
    [ ] Staking Card below
    [ ] My Wallet Card below
    [ ] ERC721 Card below
    (all full-width, stacked vertically)
    
[ ] Verify no horizontal scrolling
[ ] Verify touch targets >= 44px
[ ] Verify text readable without zoom
```

---

### Phase 3: Profile Form Testing

#### 3.1 Profile Picture Upload
```
[ ] Click on avatar in Profile Form card
[ ] Image uploader dialog appears
[ ] Select a test image (PNG/JPG, < 5MB):
    - Use any local image or create a test one
    
[ ] Verify upload completes without errors
[ ] Verify new image displays in avatar area
[ ] Verify profile picture updates in database
[ ] Reload page and verify avatar persists
[ ] Test replacing with another image:
    - Repeat upload with different image
    - Verify new image displays
    
SUCCESS CRITERIA:
✓ Avatar displays correctly
✓ Multiple uploads work
✓ Image persists after page reload
✓ No console errors
```

#### 3.2 About Me Text Editing
```
[ ] Click "Edit Profile" in Profile Form
[ ] Edit "About Me" field:
    - Clear current text
    - Enter: "Test account for profile verification"
    
[ ] Verify character counter displays
[ ] Test 1000 character limit:
    - Paste very long text (> 1000 chars)
    - Should show error: "About me must be less than 1000 characters"
    
[ ] Click "Save Changes"
[ ] Verify success message appears
[ ] Wait for page reload
[ ] Verify new "About Me" text persists
[ ] Click "Edit Profile" again and verify text is there

SUCCESS CRITERIA:
✓ Text editable
✓ Character limit enforced
✓ Save works
✓ Changes persist
✓ No console errors
```

#### 3.3 Cancel/Discard Changes
```
[ ] Click "Edit Profile"
[ ] Make some changes:
    - Change About Me text
    - Change profile picture
    
[ ] Click "Cancel"
[ ] Verify form reverts to previous values
[ ] Verify no changes saved

SUCCESS CRITERIA:
✓ Cancel works
✓ Changes not saved
✓ Form reverts to original state
```

---

### Phase 4: My Wallet Card Testing

#### 4.1 Wallet Creation
```
[ ] If wallet doesn't exist:
    [ ] Card shows "No Wallet Yet" message
    [ ] Enter wallet name: "Test Wallet"
    [ ] Click "Create Wallet"
    [ ] Verify success message
    [ ] Verify wallet info displays:
        - Wallet address (0x...)
        - ETH balance (should be ~0)
        - USDC balance (should be ~0)

[ ] If wallet already exists:
    [ ] Verify wallet info displays correctly
    [ ] Verify all balances > 0 (or = 0 if fresh)
    [ ] Verify "Connected to Base Sepolia Testnet" indicator
```

#### 4.2 Copy Address Button
```
[ ] Click "Copy" button next to wallet address
[ ] Verify success message: "Address copied to clipboard!"
[ ] Manually paste (Cmd+V) to verify address in clipboard
[ ] Verify address matches wallet address displayed

SUCCESS CRITERIA:
✓ Copy button functional
✓ Address in clipboard
✓ Success message appears
```

#### 4.3 Action Buttons Presence
```
Verify ALL THREE buttons are present and clickable:

[ ] "Request Testnet Funds" button (Droplet icon)
    - Should toggle faucet section
    
[ ] "Send Funds" button (Send icon)
    - Should toggle send section
    
[ ] "Transaction History" button (History icon)
    - Should toggle transaction history section

SUCCESS CRITERIA:
✓ All 3 buttons visible
✓ All 3 buttons clickable
✓ Each button toggles correct section
```

---

### Phase 5: Superfaucet Integration Testing (CRITICAL)

#### 5.1 Faucet Section Display
```
[ ] Click "Request Testnet Funds" button
[ ] Verify faucet section expands showing:
    [ ] "Request Testnet Funds" header
    [ ] Current balance display (e.g., "0.123456 ETH")
    [ ] ETH button (0.001)
    [ ] USDC button (1.0)
    [ ] "Request ETH" action button
    [ ] Info box explaining faucet
    
[ ] Verify "Send Funds" and "History" sections close
[ ] Click button again to collapse section
```

#### 5.2 Superfaucet Request - ETH
```
[ ] Click "Request Testnet Funds"
[ ] Verify balance display shows current ETH balance
[ ] ETH button should be selected by default
[ ] Click "Request ETH" button
[ ] Verify loading state: "Requesting..."
[ ] Wait for request to complete
[ ] Verify success message appears:
    - "✅ Successfully received X ETH!"
    - Shows transaction hash (first 10 chars)
    
[ ] Verify result details display:
    [ ] Request count (should be > 0)
    [ ] "Before" balance shown
    [ ] "After" balance shown  
    [ ] Total amount received
    
[ ] Verify transaction links appear:
    - "TX 1 → View on BaseScan" (clickable link)
    - Link opens BaseScan in new tab

SUCCESS CRITERIA:
✓ Request completes successfully
✓ Balance updates
✓ Result details display correctly
✓ Explorer links work
✓ NO console errors
```

#### 5.3 Superfaucet Request - USDC (Alternate Token)
```
[ ] Click "Request Testnet Funds"
[ ] Click USDC button
[ ] Verify USDC button is now selected
[ ] Click "Request USDC" button
[ ] Verify same flow as ETH:
    [ ] Loading state
    [ ] Success message
    [ ] Result details
    [ ] Transaction link

SUCCESS CRITERIA:
✓ Token selection works
✓ USDC request completes
✓ Balance updates for USDC
```

#### 5.4 Multiple Faucet Requests (CRITICAL - REPEATED FAUCETING)
```
[ ] Click "Request Testnet Funds"
[ ] Click "Request ETH"
[ ] Wait for completion and success message
[ ] Verify result shows 1 request

[ ] IMMEDIATELY click "Request ETH" again
[ ] Verify second request completes WITHOUT delay
[ ] Verify result shows new transaction hash
[ ] Verify balance increased further

[ ] Repeat ONE more time (3rd request)
[ ] Verify all 3 requests visible in explorer links

SUCCESS CRITERIA:
✓ Can click multiple times rapidly
✓ No rate limiting prevents requests
✓ Each request has unique TX hash
✓ Balance accumulates
✓ No "already requested" errors
```

#### 5.5 Faucet Error Handling
```
[ ] (Optional) Test with invalid wallet
[ ] Verify error message displays
[ ] Verify button is re-enabled
[ ] Verify can retry

SUCCESS CRITERIA:
✓ Errors display clearly
✓ Can recover and retry
```

---

### Phase 6: Transaction History Testing

#### 6.1 History Section Display
```
[ ] Click "Transaction History" button
[ ] Verify history section expands
[ ] Verify "Send Funds" and "Request Testnet Funds" sections close
[ ] Verify transaction list displays

[ ] If no transactions exist:
    [ ] Shows "No transactions yet" or similar message
    
[ ] If transactions exist:
    [ ] Verify headers: Date | Amount | Type | Status | Action
    [ ] Verify at least 1 transaction displays
    [ ] Each transaction should show:
        - Date/time
        - Amount
        - Token type (ETH/USDC)
        - Operation type badge (Fund/Send/etc)
        - View on Explorer link
```

#### 6.2 Faucet Transaction in History
```
AFTER completing superfaucet request:

[ ] Click "Transaction History"
[ ] Verify new faucet transaction appears:
    [ ] Shows recent date/time
    [ ] Shows amount (e.g., 0.001 ETH)
    [ ] Shows operation type: "Fund" (or similar)
    [ ] Shows "Confirmed" or "Success" status
    [ ] Has "View on Explorer" link that works
    
SUCCESS CRITERIA:
✓ Faucet TX appears in history
✓ Correct amount shown
✓ Correct operation type
✓ Link to BaseScan works
```

#### 6.3 Send Transaction in History (Optional)
```
IF you have enough balance:

[ ] Click "Send Funds" button
[ ] Fill in:
    - Recipient: (any valid 0x address or self)
    - Amount: 0.0001
    - Token: USDC
    
[ ] Click "Send USDC"
[ ] Wait for completion
[ ] Click "Transaction History"
[ ] Verify new SEND transaction appears with:
    [ ] Recent timestamp
    [ ] Correct amount (0.0001)
    [ ] Operation type: "Send"
    [ ] Status: "Confirmed"
```

#### 6.4 Transaction Links Work
```
[ ] For each transaction in history:
    [ ] Click "View on Explorer"
    [ ] Verify BaseScan opens in new tab
    [ ] Verify TX hash matches
    [ ] Verify transaction details visible on BaseScan
```

---

### Phase 7: Deployer Funding Integration Testing (CRITICAL)

#### 7.1 Deployer Button Location and Visibility

**IMPORTANT: Determine where Fund Deployer button is located:**
- Option A: Integrated into My Wallet Card (lower section)
- Option B: Integrated into ERC721 Deployment Card (top section)

```
[ ] Check My Wallet Card bottom section for:
    - "Fund ERC721 Deployer (Optional)" button
    
[ ] Check ERC721 Card top section for:
    - "Fund Universal Deployer" or similar button
    
[ ] Verify button is present in ONE of these locations
[ ] Verify button is clickable and not disabled
```

#### 7.2 Deployer Funding Request

```
[ ] Click "Fund Universal Deployer" or "Fund ERC721 Deployer" button
[ ] Verify section/details expand showing:
    [ ] "Fund Deployer" or "Funding" section header
    [ ] Current deployer wallet address (0x...)
    [ ] Amount to fund (usually 0.01 ETH)
    [ ] Action button: "Fund Universal Deployer"
    
[ ] Click the fund button
[ ] Verify loading state: "Funding Universal Deployer..."
[ ] Wait for completion
[ ] Verify success message appears:
    - "✅ Successfully funded deployer..."
    - Shows transaction hash
    
[ ] Verify funding result details:
    [ ] Deployer address shown (shortened)
    [ ] Amount (0.01 ETH) shown
    [ ] Transaction link to BaseScan
    
[ ] Click BaseScan link and verify transaction
```

#### 7.3 Deployer Info Condensation

```
Verify info is condensed (not overly verbose):

Option A (if in Wallet Card):
[ ] Should show: "All users share one secure wallet. Funding optional."
[ ] Should NOT show: 6 verbose info boxes
[ ] Should be readable in < 10 seconds

Option B (if in NFT Card):
[ ] Should show: Summary line about shared deployer
[ ] Should NOT show: "Universal Deployer Architecture" box with 4 bullet points
[ ] Technical details should be minimal (1-2 sentences)
[ ] Security info should be preserved (important for users)
```

SUCCESS CRITERIA:
✓ Fund button works
✓ Request completes
✓ Success message appears
✓ Info is condensed (not verbose)
✓ Transaction link works on BaseScan
```

---

### Phase 8: ERC721 Deployment Card Testing

#### 8.1 Deployment Card Display
```
[ ] Verify ERC721 Deployment Card is visible
[ ] Verify card title: "Deploy ERC721 Collections" or similar
[ ] Verify form fields present:
    [ ] Collection Name (text input)
    [ ] Collection Symbol (text input)
    [ ] Collection Size (number input, default 10000)
    [ ] Collection Price (number input, default 0)
    
[ ] Verify info boxes display:
    [ ] Shared deployer explanation (condensed)
    [ ] Security information
    [ ] "How It Works" steps
    [ ] Fund deployer button (if not already clicked)
    
[ ] Verify Deploy button is prominent and clickable
```

#### 8.2 Deployment Form Validation
```
[ ] Try to deploy with empty fields
[ ] Verify error: "Collection Name is required"
[ ] Verify button doesn't submit

[ ] Enter Collection Name: "Test NFT"
[ ] Verify error clears
[ ] Try to deploy with missing symbol
[ ] Verify error: "Collection Symbol is required"

[ ] Enter Symbol: "TST"
[ ] Try symbol > 10 characters
[ ] Verify error: "Symbol must be 10 characters or less"

[ ] Set size to 0 or negative
[ ] Verify error about size

[ ] Set price to negative
[ ] Verify error: "Collection Price cannot be negative"
```

#### 8.3 Deployment Submission (OPTIONAL - uses gas)
```
IF you want to test actual deployment:

[ ] Fill form with valid data:
    - Name: "Test Collection"
    - Symbol: "TST"
    - Size: 100
    - Price: 0.001
    
[ ] Click "Deploy Collection"
[ ] Verify loading: "Deploying..."
[ ] Wait for completion (30-60 seconds)
[ ] Verify success message appears
[ ] Verify result shows:
    [ ] Contract address
    [ ] Transaction hash
    [ ] "View on BaseScan" link
    [ ] Contract details (name, symbol, size, price, network)
    
[ ] Click BaseScan link and verify contract page
```

#### 8.4 Deployment Results Display
```
After successful deployment:

[ ] Verify results box shows:
    [ ] ✓ "Collection deployed successfully!"
    [ ] Contract Address (0x...)
    [ ] Transaction details
    [ ] Explorer link to view contract
    [ ] Contract metadata (name, symbol, maxSupply, etc.)
    
[ ] Form should auto-reset after 2 seconds
[ ] Can deploy another collection immediately
```

---

### Phase 9: Transaction History Verification (ERC721 TX)

#### 9.1 Deployment Transaction in History
```
AFTER deploying ERC721 (Phase 8.3):

[ ] Click "Transaction History" in Wallet Card
[ ] Verify new ERC721 deployment TX appears:
    [ ] Shows recent timestamp
    [ ] Shows operation type: "Deploy" or "Contract Deployment"
    [ ] Shows status: "Confirmed"
    [ ] Shows contract interaction (if available)
    [ ] Has explorer link to view TX
    
SUCCESS CRITERIA:
✓ Deployment TX appears in history
✓ Correct operation type badge
✓ Explorer link works
✓ TX details match deployment
```

---

### Phase 10: Vercel Build Verification

#### 10.1 Build without Errors
```bash
[ ] Run: npm run build
[ ] Verify build completes WITHOUT errors
[ ] Check output for:
    ✓ No TypeScript errors
    ✓ No import errors
    ✓ No circular dependency warnings
    ✓ Build size reasonable (no unexpected bloat)
    ✓ All routes built successfully
```

#### 10.2 Build Output Analysis
```
After build completes, verify:

[ ] .next folder exists and has:
    - /static/ directory
    - /server/ directory  
    - standalone/ (if applicable)

[ ] No console errors
[ ] No warnings about missing dependencies
[ ] All API routes included
```

#### 10.3 Verify No Breaking Changes
```
[ ] Check build logs for references to:
    ✓ SuperFaucetButton - should still build (not deleted yet)
    ✓ DeployerFundingButton - should still build (not deleted yet)
    ✓ ProfileWalletCard - should build with new state
    ✓ NFTCreationCard - should build with new deployer state
    
[ ] No errors about missing components
[ ] No errors about prop type mismatches
```

---

## 📊 TEST RESULTS SUMMARY

After completing all phases, fill in the results:

### Phase Completion Status
```
Phase 1 - Setup:                   [ ] PASS  [ ] FAIL
Phase 2 - Layout:                  [ ] PASS  [ ] FAIL
Phase 3 - Profile Form:            [ ] PASS  [ ] FAIL
Phase 4 - Wallet Card:             [ ] PASS  [ ] FAIL
Phase 5 - Superfaucet:             [ ] PASS  [ ] FAIL
Phase 6 - Transaction History:     [ ] PASS  [ ] FAIL
Phase 7 - Deployer Funding:        [ ] PASS  [ ] FAIL
Phase 8 - ERC721 Deployment:       [ ] PASS  [ ] FAIL
Phase 9 - ERC721 TX History:       [ ] PASS  [ ] FAIL
Phase 10 - Build Verification:     [ ] PASS  [ ] FAIL
```

### Functionality Verification Matrix

| Feature | Before | After | Status | Verified |
|---------|--------|-------|--------|----------|
| Profile Edit | ✅ Card | ✅ Right Col | Moved | [ ] |
| Profile Avatar Upload | ✅ Works | ✅ Works | Preserved | [ ] |
| Profile About Me | ✅ Works | ✅ Works | Preserved | [ ] |
| Wallet Creation | ✅ Card | ✅ My Wallet | Preserved | [ ] |
| Wallet Address Copy | ✅ Works | ✅ Works | Preserved | [ ] |
| View Balances | ✅ Works | ✅ Works | Preserved | [ ] |
| Send Funds | ✅ Card | ✅ My Wallet | Preserved | [ ] |
| **Super Faucet Button** | ✅ Card | ✅ My Wallet | **Integrated** | [ ] |
| Super Faucet Repeats | ✅ Works | ✅ Works | Preserved | [ ] |
| **Fund Deployer** | ✅ Card | ✅ NFT/Wallet | **Integrated** | [ ] |
| **Deploy ERC721** | ✅ Card | ✅ Left Col | Moved | [ ] |
| ERC721 Form | ✅ Works | ✅ Works | Preserved | [ ] |
| Deployment Submit | ✅ Works | ✅ Works | Preserved | [ ] |
| **Transaction History** | ✅ Works | ✅ Works | Preserved | [ ] |
| Faucet TXs in History | ✅ Works | ✅ Works | Preserved | [ ] |
| Deployment TXs in History | ❓ Untested | ✅ Should Work | **Verify** | [ ] |
| RAIR Staking | ✅ Card | ✅ Left Col | Moved | [ ] |
| Guide Access | ✅ Banner | ✅ Banner | Preserved | [ ] |

### Critical Observations

```
Layout Changes:
- Grid reversed from [400px_1fr] to [1fr_400px]: [ ] Confirmed
- Exactly 4 cards visible: [ ] Confirmed
- Left column: Staking + ERC721: [ ] Confirmed
- Right column: Profile + Wallet: [ ] Confirmed
- No horizontal scrolling: [ ] Confirmed
- Mobile responsive still works: [ ] Confirmed

Functionality Preservation:
- All buttons clickable: [ ] Confirmed
- All forms submittable: [ ] Confirmed
- All API calls work: [ ] Confirmed
- No console errors: [ ] Confirmed
- Transaction history updates: [ ] Confirmed
- Profile picture uploads: [ ] Confirmed

Vercel Safety:
- Build completes without errors: [ ] Confirmed
- No new dependencies added: [ ] Confirmed
- No environment variable changes: [ ] Confirmed
- No database schema changes needed: [ ] Confirmed
```

---

## 🚀 FINAL VERDICT

**After all testing completes, determine:**

```
✅ SAFE TO DEPLOY IF:
1. All 10 phases completed with PASS
2. All 32 features verified as working
3. npm run build completes successfully
4. No console errors after full user flow
5. Profile picture uploads and displays
6. Super faucet requests multiple times successfully
7. Fund deployer button works
8. ERC721 deployment possible (or form validates correctly)
9. Transaction history shows all transaction types
10. Mobile responsive still works

⚠️ NEEDS INVESTIGATION IF:
- Any phase shows FAIL
- Any critical functionality broken
- Build errors present
- Console errors during testing
- Faucet requests fail
- Profile pictures don't upload

🔴 DO NOT DEPLOY IF:
- Vercel build fails
- Critical functionality lost
- API endpoints broken
- Database errors occur
- Multiple features non-functional
```

---

**Test Plan Created:** October 28, 2025  
**Next Step:** Execute phases 1-10 systematically and record results  
**Target:** Zero test failures before production deployment
