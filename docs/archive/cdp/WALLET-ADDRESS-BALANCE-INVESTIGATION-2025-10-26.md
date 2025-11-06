# 🔍 Wallet Address & Balance Investigation
## Live Testing Findings - October 26, 2025

**Status:** 🟡 **CRITICAL DISCOVERY - TWO DIFFERENT BALANCES FOR SAME WALLET**

---

## Executive Summary

While testing the deployment flow on a fresh `test@test.com` account, I discovered a **critical discrepancy**: 
- The same wallet address (`0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf`) shows **TWO DIFFERENT BALANCES**
- "My Wallet" section: **0.0000 ETH** ❌
- "Testnet Funds" section: **0.049500 ETH** ✅
- The pre-flight balance check passes with 0.0495 ETH
- Yet deployment fails with **"missing revert data (action='estimateGas')"**

This is **NOT** a zero balance issue (as suggested in TOP-5-PLAUSIBLE-FIXES.md Fix #1). The real issue is more nuanced.

---

## Test Setup

**User Account:** test@test.com  
**Wallet Address:** `0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf`  
**Network:** Base Sepolia Testnet  
**Server URL:** localhost:3002  
**Timestamp:** 2025-10-26 ~14:30 UTC

---

## Critical Findings

### 1. **Three Different Balance Displays**

#### Display #1: "My Wallet" Card (ProfileWalletCard.tsx)
```
ETH Balance: 0.0000 ETH
USDC Balance: 0.00 USDC
Source: /api/wallet/list endpoint
```

#### Display #2: "Testnet Funds" Card (SuperFaucetButton.tsx)
```
Current Balance: 0.049500 ETH
Source: /api/wallet/balance endpoint
```

#### Display #3: Server Pre-Flight Check (app/api/contract/deploy/route.ts)
```
💰 Pre-flight balance check: {
  address: '0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf',
  balance: '0.0495',
  balanceWei: '49500000000000000',
  isZero: false,
  minimumRequired: '0.003 ETH'
}
✅ Balance check passed: 0.0495 ETH available
```

### 2. **The Actual Problem - Not Just Balance**

Even though:
- ✅ The wallet address is correct: `0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf`
- ✅ The balance exists: 0.0495 ETH (shown in Testnet Funds and server logs)
- ✅ The balance check passes: "Balance check passed: 0.0495 ETH available"

The deployment **STILL FAILS** with:
```
❌ Failed to send transaction: Error: missing revert data (action="estimateGas", ...)
```

### 3. **Full Error Trace from Server Logs**

```
🏭 Deploying contract with params: {
  name: 'Test NFT',
  symbol: 'TEST',
  maxSupply: '10000',
  mintPrice: '0',
  network: 'base-sepolia',
  walletAddress: '0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf'
}

✅ Created ethers signer: 0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf

💰 Pre-flight balance check: {
  address: '0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf',
  balance: '0.0495',
  balanceWei: '49500000000000000',
  isZero: false,
  minimumRequired: '0.003 ETH'
}
✅ Balance check passed: 0.0495 ETH available

🏭 Deploying contract with params: {
  name: 'Test NFT',
  symbol: 'TEST',
  maxSupply: '10000',
  mintPrice: '0'
}

🔄 CDP signing transaction via CdpEthersSigner: {
  to: undefined,
  data: '0x608060405234801562000010575f80fd5b50604051620016...',
  value: undefined
}

💰 Account balance check: {
  address: '0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf',
  balance: '0.0495',
  balanceWei: '49500000000000000',
  isZero: false
}

❌ Failed to send transaction: Error: missing revert data 
(action="estimateGas", data=null, reason=null, ...)
```

---

## Root Cause Analysis

### Why the Two Different Balances?

**ProfileWalletCard.tsx (showing 0.0000 ETH):**
```typescript
// Uses /api/wallet/list endpoint
const response = await fetch('/api/wallet/list');
const firstWallet = data.wallets[0];
eth: firstWallet.balances?.eth || 0,
```

**SuperFaucetButton.tsx (showing 0.049500 ETH):**
```typescript
// Uses /api/wallet/balance endpoint
const response = await fetch(`/api/wallet/balance?address=${walletAddress}`);
const data = await response.json();
setCurrentBalance(data.eth); 
```

**Both endpoints query the same RPC**, but they might be called at different times or have caching issues.

### Why "missing revert data" Despite Having Balance?

The "missing revert data" error during `estimateGas` typically means:
1. ✅ The transaction structure is valid
2. ✅ The account has funds
3. ❌ **Something about the transaction WILL cause it to revert**

The RPC node simulation fails, but the error details are null/empty.

**Possible causes:**
- CDP SDK is sending transaction in wrong format
- The `to` field or `data` field is being set incorrectly
- The account doesn't actually have signing authority 
- There's a mismatch between the ethers signer and the CDP account
- The network-scoped account is not properly initialized

---

## Code Analysis

### 1. NFTCreationCard - Gets Wallet from /api/wallet/list

```typescript
// Line 84-90
const walletResponse = await fetch('/api/wallet/list');
const walletData = await walletResponse.json();
const wallet = walletData.wallets?.[0];

// Shows as 0.0000 ETH in UI but API returns 0.049500
```

### 2. api/wallet/list - Returns First Wallet

```typescript
// Line 70-104
const walletsWithBalances = await Promise.all(
  wallets.map(async (wallet) => {
    const provider = new ethers.JsonRpcProvider(
      'https://sepolia.base.org'
    );
    
    // Gets ETH balance from blockchain
    const ethBalanceWei = await provider.getBalance(wallet.wallet_address);
    ethAmount = Number(ethBalanceWei) / 1000000000000000000;
    
    // Should return 0.0495 but UI shows 0.0000
    // POSSIBLE BUG: The balance array might be cached or stale
  })
);
```

### 3. api/wallet/balance - Gets Balance Correctly

```typescript
// Line 44-48
const provider = new ethers.JsonRpcProvider(
  'https://sepolia.base.org'
);

const ethBalanceWei = await provider.getBalance(validatedaddress);
ethAmount = Number(ethBalanceWei) / 1000000000000000000;
// Returns 0.0495 correctly
```

### 4. app/api/contract/deploy - Pre-Flight Check Works

```typescript
// Line 240-257
const provider = new ethers.JsonRpcProvider(
  'https://sepolia.base.org'
);

const accountAddress = await signer.getAddress();
const balanceWei = await provider.getBalance(accountAddress);
const balanceEth = ethers.formatEther(balanceWei);

// ✅ Shows 0.0495 ETH - CORRECT
console.log('💰 Pre-flight balance check:', {
  balance: balanceEth,
  balanceWei: balanceWei.toString(),
});

// ✅ Balance check PASSES
if (balanceWei < minimumRequired) {
  throw new Error('Insufficient balance...');
}
```

### 5. But Then... CDP.sendTransaction Fails

```typescript
// Line 288
const contract = await factory.deploy(name, symbol, maxSupply, mintPrice);

// ^ This calls ethers which calls CDP signer
// ^ CDP signer tries to estimateGas
// ^ Fails with "missing revert data"
```

---

## The Real Issue: Two Hypotheses

### Hypothesis A: CDP Signer Not Properly Connected to Network
The CDP account is created but not properly scoped to the network before signing. The ethers signer can READ the balance (because it uses the provider), but when CDP tries to SIGN/BROADCAST, it's not properly initialized.

**Evidence:**
- Balance check uses `provider.getBalance()` ← Works ✅
- Deployment uses CDP signer ← Fails ❌

### Hypothesis B: Transaction Parameters Being Built Incorrectly
The transaction object being passed to CDP has incorrect `to`, `data`, or other fields that will cause a revert on-chain, but the error details are suppressed.

**Evidence:**
- Log shows: `"to: undefined"` - Should this be `null`?
- Log shows: `"value: undefined"` - Should this be `0` or `"0"`?

---

## Specific UI Discrepancy - Why Show 0.0000?

The "My Wallet" section shows `0.0000 ETH` even though blockchain has `0.0495 ETH`.

**Possible reasons:**
1. **Stale cache** - `/api/wallet/list` is cached and not updated
2. **Different RPC call** - The wallet/list endpoint is using a cached/different provider
3. **Wallet not properly indexed** - The database record for the wallet isn't reflecting the blockchain state
4. **Race condition** - Wallet was just funded but UI hasn't refreshed

**This is misleading to users** - they see 0.0000 ETH and think they need to fund, when actually they have 0.0495 ETH.

---

## Recommended Fixes (In Order of Priority)

### Fix #1: Consolidate Balance Display ⭐⭐⭐
Use `/api/wallet/balance` consistently across all components instead of mixing `/api/wallet/list` and `/api/wallet/balance`.

**File:** `components/profile-wallet-card.tsx`
```typescript
// Change from:
const response = await fetch('/api/wallet/list');
const firstWallet = data.wallets[0];
eth: firstWallet.balances?.eth || 0,

// To:
const response = await fetch(`/api/wallet/balance?address=${wallet.wallet_address}`);
eth: data.eth,
```

### Fix #2: Investigate CDP Signer Format ⭐⭐
Check that the transaction object being sent to CDP has correct field types:
- `to` should be `null` (not `undefined`) for contract creation
- `data` should be valid hex string (not undefined)
- `value` should be `"0"` (string, not undefined)

**File:** `lib/cdp-ethers-adapter.ts`
Check the transaction object construction before sending to CDP.

### Fix #3: Clear Caching or Force Refresh ⭐⭐
Ensure `/api/wallet/list` always gets fresh balance data from the RPC, not cached data.

**File:** `app/api/wallet/list/route.ts`
Add no-cache headers if this endpoint is being cached.

### Fix #4: Verify Network Scoping ⭐
Confirm that `networkScopedAccount` is being properly initialized and used for signing.

**File:** `lib/cdp-ethers-adapter.ts`
Log the network-scoped account details before attempting any transactions.

---

## Real-World Impact

**Current User Experience:**
```
1. User sees "My Wallet" → 0.0000 ETH ← WRONG
2. User sees "Testnet Funds" → 0.049500 ETH ← CORRECT
3. User attempts deployment with sufficient funds
4. Deployment fails with cryptic "missing revert data" error
5. User is confused and frustrated 😞
```

**What should happen:**
```
1. User sees consistent balance everywhere
2. Deployment succeeds because balance is sufficient AND account is properly configured
3. User gets contract address back
4. User sees success message 🎉
```

---

## Testing Procedure to Verify Fix

1. **Clear all balances** - Fund a fresh wallet with exactly 0.05 ETH
2. **Check all three displays**:
   - My Wallet card
   - Testnet Funds card  
   - Server pre-flight check
3. **All three should show 0.05 ETH** (or very close due to gas used)
4. **Deploy contract** - Should succeed on first try
5. **Verify on Basescan** - Contract should be visible

---

## Wallet Address Canonical Record

| Field | Value |
|-------|-------|
| **Address** | `0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf` |
| **Network** | Base Sepolia |
| **RPC Balance** | 0.0495 ETH (confirmed multiple times) |
| **UI Balance (My Wallet)** | 0.0000 ETH (incorrect) |
| **UI Balance (Testnet Funds)** | 0.049500 ETH (correct) |
| **Server Pre-Flight** | 0.0495 ETH (correct) |
| **User** | test@test.com |
| **Status** | Has testnet funds but deployment fails |

---

## Conclusion

**This is NOT the wallet balance issue described in Fix #1.** The wallet has sufficient funds (0.0495 ETH > 0.003 ETH required).

The problem is:
1. **UI inconsistency** - Different components show different balances for the same wallet
2. **CDP integration issue** - Insufficient funds pass the pre-flight check but CDP signing/estimation still fails
3. **Poor error messaging** - "missing revert data" doesn't tell the user what's actually wrong

The next debugging step should focus on:
- Why CDP's `estimateGas` is failing when balance is sufficient
- Whether the transaction parameters are being constructed correctly
- Whether the network-scoped account is actually authorized to sign

---

**Next Steps:**
1. ✅ Consolidate balance display endpoints
2. ⏳ Verify CDP transaction format
3. ⏳ Test with newly verified account
4. ⏳ Check CDP SDK version compatibility

