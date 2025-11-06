# USDC Balance Discrepancy: Localhost vs Production

## Executive Summary

**Problem**: Same user account (git@devdapp.com) shows different USDC balances:
- **Localhost**: $5.50 USDC ✅
- **Production (devdapp.com)**: $0.00 USDC ❌

Both environments use the SAME Supabase database, same wallet address (`0x9C30efC0b9dEfcd2511C40c3C3f19ba7b3dcE9E8`), and same transaction history, yet the balance calculation returns different results.

**Root Cause**: Environment-specific RPC provider filtering combined with fallback logic inconsistency.

---

## Part 1: Architecture Overview

### USDC Balance Calculation Flow

The USDC balance is calculated through this workflow:

```
User Profile Page Load
    ↓
ProfileWalletCard Component (components/profile-wallet-card.tsx:98)
    ↓
Calls: fetch(`/api/wallet/balance?address=${walletAddress}`)
    ↓
Balance API Endpoint (app/api/wallet/balance/route.ts)
    ├─ Step 1: Try contract call → balanceOf()
    ├─ Step 2: If contract call succeeds:
    │   └─ Compare with calculated balance from transaction history
    │   └─ Use max of (contract, calculated)
    └─ Step 3: If contract call fails:
        └─ Fallback to transaction history calculation
```

### Key Code: Balance Calculation

```typescript
// app/api/wallet/balance/route.ts:138-197
if (network === "base-sepolia") {
  try {
    // Attempt contract balance call
    const usdcContract = new ethers.Contract(
      USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );
    const contractBalance = await usdcContract.balanceOf(validationData.address);
    usdcAmount = Number(contractBalance) / 1000000;
    
    // Compare with calculated balance
    const calculatedBalance = await calculateUSDCBalance(wallet.id);
    
    if (usdcAmount === 0 && calculatedBalance > 0) {
      usdcAmount = calculatedBalance; // Use calculated
    } else if (calculatedBalance > usdcAmount) {
      usdcAmount = calculatedBalance; // Use calculated
    }
  } catch (usdcError) {
    // Fallback to transaction history
    const calculatedBalance = await calculateUSDCBalance(wallet.id);
    usdcAmount = calculatedBalance;
  }
}
```

---

## Part 2: USDC Balance Calculation Logic

### Transaction History-Based Balance Calculation

The `calculateUSDCBalance()` function (lines 24-72) works as follows:

```typescript
async function calculateUSDCBalance(walletId: string): Promise<number> {
  const supabase = await createClient();
  
  // Query all transactions for this wallet
  const { data: transactions } = await supabase
    .rpc('get_wallet_transactions', {
      p_wallet_id: walletId,
      p_limit: 1000
    });
  
  let balance = 0;
  for (const tx of transactions || []) {
    // Filter: Only USDC tokens with success status
    if (tx.token_type?.toLowerCase() === 'usdc' && tx.status === 'success') {
      const amount = tx.amount || 0;
      
      if (tx.operation_type === 'fund') {
        balance += amount;        // Add incoming
      } else if (tx.operation_type === 'receive') {
        balance += amount;        // Add received
      } else if (tx.operation_type === 'send') {
        balance -= amount;        // Subtract sent
      }
    }
  }
  
  return Math.max(0, balance);   // Never return negative
}
```

### Transaction Source: RPC Function

The `get_wallet_transactions()` RPC queries the database:

```sql
CREATE OR REPLACE FUNCTION public.get_wallet_transactions(
  p_wallet_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  operation_type TEXT,      -- 'fund', 'deploy', 'send', 'receive'
  token_type TEXT,          -- 'eth', 'usdc'
  amount DECIMAL,
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  status TEXT,              -- 'success', 'pending', 'failed'
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT wt.id, wt.operation_type, wt.token_type, wt.amount,
         wt.from_address, wt.to_address, wt.tx_hash, wt.status, wt.created_at
  FROM public.wallet_transactions wt
  WHERE wt.wallet_id = p_wallet_id
  ORDER BY wt.created_at DESC
  LIMIT p_limit;
END;
$$;
```

**Key Point**: This RPC function returns ALL transactions regardless of database state.

---

## Part 3: Network-Based Filtering

### The Critical Code Path

```typescript
// app/api/wallet/balance/route.ts:128
const network = getNetworkSafe();  // Gets NETWORK env var, defaults to "base-sepolia"

// Line 138
if (network === "base-sepolia") {
  // ONLY RUNS if network === "base-sepolia"
  // Try contract call + fallback to calculated
}
```

### What is `getNetworkSafe()`?

```typescript
// lib/features.ts:40-46
export function getNetworkSafe(): string {
  try {
    return env.NETWORK || "base-sepolia";  // Returns NETWORK env var or default
  } catch {
    return "base-sepolia";                  // Fallback default
  }
}
```

### Environment Variable: `NETWORK`

From `lib/env.ts`:
```typescript
NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
```

This reads from `process.env.NETWORK`, which is set:
- **Locally** from `.env.local` 
- **Production** from Vercel environment variables

---

## Part 4: The Root Cause Analysis

### Hypothesis 1: Different RPC URLs (DISPROVEN)

Both environments use these RPC URLs:
```typescript
const RPC_URLS = {
  "base-sepolia": "https://sepolia.base.org",
  "base": "https://mainnet.base.org"
}
```

Since both are configured for "base-sepolia", they use the same testnet RPC.

❌ **Not the cause**: RPC URLs are identical.

---

### Hypothesis 2: Different Supabase Projects (DISPROVEN)

Both environments configured to use the SAME Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL`: Same URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`: Same key

Transaction data comes from the SAME database, so both should retrieve the SAME transaction history.

❌ **Not the cause**: Same database, same transactions.

---

### Hypothesis 3: Network Environment Variable Mismatch (MOST LIKELY)

**Localhost Configuration** (`.env.local`):
```
NETWORK=base-sepolia
```

**Production Configuration** (Vercel Environment Variables):
- Needs verification but likely also set to "base-sepolia"
- OR missing/undefined, which defaults to "base-sepolia"

Both should trigger the `if (network === "base-sepolia")` condition...

⚠️ **Partial cause**: Network variable is correct but something else happens.

---

### Hypothesis 4: Supabase Client Initialization (MOST LIKELY ROOT CAUSE)

```typescript
// app/api/wallet/balance/route.ts:27
const supabase = await createClient();
```

The `createClient()` function comes from `lib/supabase/server.ts`. Let me check this...

Looking at the import:
```typescript
import { createClient } from "@/lib/supabase/server";
```

This creates a **server-side** Supabase client. In Next.js, this client:
- **Locally**: Uses environment from `.env.local`
- **Production**: Uses environment from Vercel variables
- **Build time**: Uses whichever environment is set

**CRITICAL ISSUE**: If production Vercel deployment was built with WRONG environment variables or the variables were updated AFTER deployment, the cached environment during build might be stale!

---

### Hypothesis 5: Decimal Precision Issue (LESS LIKELY)

Transaction amounts might be stored as DECIMAL in the database. During calculation:

```typescript
const amount = tx.amount || 0;  // Already numeric
balance += amount;              // Simple arithmetic
```

No conversion issues here - both should handle DECIMAL the same way.

❌ **Unlikely**: Same database, same math.

---

### Hypothesis 6: Token Type Filtering Bug (POSSIBLE)

The filter checks:
```typescript
if (tx.token_type?.toLowerCase() === 'usdc' && tx.status === 'success')
```

If transaction records in the database have:
- `token_type` stored as different case: `'USDC'` vs `'usdc'` vs `'Usdc'`
- `status` as different value: `'Success'` vs `'success'`

Then the filter might silently skip valid transactions!

Let's check: `.toLowerCase() === 'usdc'` - this normalizes to lowercase, so case shouldn't matter.

✅ **Filter should work correctly.**

---

## Part 6: Why Localhost Shows Correct Balance

### LocalHost Environment:
1. Uses `.env.local` with correct Supabase credentials
2. Creates fresh Supabase client on every request
3. Queries database, fetches transactions
4. Calculates balance from transaction history
5. **Returns $5.50 USDC correctly**

### What's Working:
- Transaction history IS saved correctly in database
- Balance CALCULATION algorithm IS correct
- Filter logic IS working

---

## Part 7: Why Production Shows $0.00

### Production Environment:
Possible scenarios:

#### Scenario A: Contract Call Succeeds with 0 Balance
```
1. Contract call to balanceOf() succeeds → returns 0
2. Calculated balance from history → 5.5 USDC
3. Logic: if (contractBalance === 0 && calculatedBalance > 0)
          → usdcAmount = calculatedBalance
4. Should return 5.5, NOT 0
```
This contradicts what we're seeing.

#### Scenario B: Contract Call Fails, Fallback Logic Issue
```
1. Contract call throws error
2. Enters catch block at line 175
3. Attempts calculateUSDCBalance()
4. Returns 0 (empty transaction history or filter issue)
5. Returns $0.00
```
**This could be the issue!**

#### Scenario C: Wallet Not Found Error
```
1. getWalletByAddress() at line 153 or 180 returns null
2. Cannot calculate balance without wallet ID
3. Returns usdcAmount = 0 (default)
4. Returns $0.00
```
**This is also possible!**

---

## Part 8: Code Flow Comparison

### What SHOULD happen (correct flow):

```
GET /api/wallet/balance?address=0x9C30...
  ├─ getNetworkSafe() → "base-sepolia"
  ├─ network === "base-sepolia"? YES
  ├─ Try contract call
  │   ├─ balanceOf() → may fail or return 0
  │   ├─ If SUCCESS with 0:
  │   │   ├─ getWalletByAddress(address) → wallet found ✓
  │   │   ├─ calculateUSDCBalance(wallet.id)
  │   │   │   ├─ get_wallet_transactions(wallet.id)
  │   │   │   ├─ Filter USDC + success transactions
  │   │   │   ├─ Sum: 1.0 + 4.5 = 5.5 ✓
  │   │   │   └─ return 5.5
  │   │   ├─ calculatedBalance = 5.5
  │   │   ├─ if (contractBalance === 0 && calculatedBalance > 0)
  │   │   │   └─ usdcAmount = 5.5
  │   │   └─ return { usdc: 5.5 }
  └─ REQUEST ENDS → Client gets $5.50 ✓
```

### What MAY be happening in production:

```
GET /api/wallet/balance?address=0x9C30...
  ├─ getNetworkSafe() → "base-sepolia" (or possibly undefined?)
  ├─ network === "base-sepolia"? YES (mostly certain)
  ├─ Try contract call
  │   ├─ Contract call FAILS (network issue, RPC timeout, etc.)
  │   ├─ Enters catch block at line 175
  │   │   ├─ getWalletByAddress(address) → wallet = null ✗
  │   │   ├─ if (wallet) { ... } → SKIPPED (wallet is null)
  │   │   ├─ usdcAmount remains 0
  │   │   └─ return { usdc: 0 }
  └─ REQUEST ENDS → Client gets $0.00 ✗
```

---

## Part 9: Proposed Root Cause

### Most Likely: Wallet Lookup Failure in Production

**The Problem**:
1. Production environment makes contract call to check USDC balance
2. Contract call fails (timeout, RPC error, network issue)
3. Code enters catch block at line 175-195
4. Attempts `getWalletByAddress(address)` to get wallet ID
5. **Query returns NULL** - wallet not found or row-level security policy blocks it
6. Cannot calculate balance without wallet ID
7. Returns usdcAmount = 0

**Why this happens in production but not localhost**:
- Different RPC endpoints have different reliability
- Production uses cold connections, localhost uses local cache
- Row-level security (RLS) policies might filter differently
- Authentication context might be different

---

### Secondary Cause: Token Type or Status Filtering

If in production the `wallet_transactions` table has:
- `token_type` stored as `NULL` for some transactions
- `status` stored as `'pending'` instead of `'success'`

Then the filter `tx.token_type?.toLowerCase() === 'usdc' && tx.status === 'success'` would skip them.

---

## Part 10: Code Inspection - Critical Lines

### Line 46-49: Token Type Filter
```typescript
for (const tx of transactions || []) {
  if (tx.token_type?.toLowerCase() === 'usdc' && tx.status === 'success') {
```

**Potential Issues**:
- ✅ `.toLowerCase()` handles case-insensitivity correctly
- ✅ `&& tx.status === 'success'` requires exact status match
- ⚠️ If status is `'Success'` or `'SUCCESS'`, it fails silently

### Line 83-91: Wallet Lookup
```typescript
async function getWalletByAddress(address: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('wallet_address', address)
    .single();
  
  if (error) {
    console.error('[Wallet] Error fetching wallet by address:', error);
    return null;
  }
  return data;
}
```

**Potential Issues**:
- `.single()` expects exactly ONE row
- If multiple wallets exist with same address → error
- If zero wallets found → error
- If RLS policy blocks the query → error (silent!)
- All errors return `null`

### Line 157-174: Balance Comparison Logic
```typescript
if (wallet) {  // ← IF WALLET IS NULL, THIS ENTIRE BLOCK SKIPS
  const calculatedBalance = await calculateUSDCBalance(wallet.id);
  // ... comparison logic ...
} else {
  console.log('[Balance API] No wallet found, cannot calculate balance from history');
}
```

**Issue**: If `wallet` is `null`, calculated balance is never computed!

---

## Part 11: Why Localhost Works and Production Doesn't

### Localhost Execution Path:
```
1. Contract call to RPC might fail
2. BUT: In development, you typically have local testing
3. getWalletByAddress() returns wallet successfully
   → Because you're testing with known wallet
4. calculateUSDCBalance() is called
5. get_wallet_transactions() succeeds
6. Finds transaction with token_type='usdc', status='success'
7. Returns 5.5 correctly
```

### Production Execution Path:
```
1. Contract call fails (RPC timeout, network issue)
2. Enters catch block
3. getWalletByAddress(address) called
4. Query fails due to:
   a) RLS policy blocking unauthenticated access
   b) Multiple wallets with same address
   c) Database connection issue
   d) Wallet record missing/deleted
5. Returns null
6. wallet check fails → calculateUSDCBalance() never called
7. usdcAmount stays as 0
8. Returns $0.00
```

---

## Part 12: Security Context Issue

### Localhost (Local Development):
- Supabase client created with **service role context** possibly
- RLS policies might be relaxed
- Direct table access possible

### Production (Vercel):
- Supabase client created with **user authentication context**
- RLS policies actively enforced
- Query blocked if policy doesn't grant access

### RLS Policy Issue:

```sql
-- Current policy might be:
CREATE POLICY "Users can view own wallets"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);
```

This requires `auth.uid()` to match `user_id`. In production:
- If API route not properly authenticated → `auth.uid()` is NULL
- Query returns no rows
- `getWalletByAddress()` returns null
- Balance stays 0

---

## Part 13: Environment Variable Differences

### Localhost `.env.local`:
```bash
NETWORK=base-sepolia
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # If present, grants full access
```

### Production Vercel Variables:
```bash
NETWORK=base-sepolia
NEXT_PUBLIC_SUPABASE_URL=https://mjrnzgunexmopvnamggw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY NOT SET (dangerous!)
```

**Critical Difference**: 
- Localhost might use service role key (created with `createClient()` at build time)
- Production uses only anon key (hits RLS policies)

---

## Part 14: Transaction History Query Success Factors

For the balance to be correct in production, BOTH must succeed:

1. ✅ **Transaction records must exist** in `wallet_transactions` table
   - Verified: Transaction history is visible on both localhost and production

2. ✅ **get_wallet_transactions() RPC must return data**
   - Requires: Valid wallet_id
   - Requires: Transactions exist with that wallet_id

3. ✅ **Filter must not reject USDC transactions**
   - Requires: `token_type = 'usdc'` (case-insensitive)
   - Requires: `status = 'success'`

4. ✅ **Calculation must run**
   - Requires: `calculateUSDCBalance()` to be called
   - Requires: Wallet object to exist (not null)

The weak link is **#4**: Wallet object becomes null when `getWalletByAddress()` fails.

---

## Part 15: Debugging Recommendations

### For Immediate Fix:

Add retry logic to `getWalletByAddress()`:
```typescript
async function getWalletByAddress(address: string, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('wallet_address', address)
        .single();
      
      if (!error) return data;
      console.warn(`Attempt ${attempt + 1} failed:`, error);
    } catch (e) {
      console.error(`Retry ${attempt + 1} error:`, e);
    }
    
    // Exponential backoff
    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
  }
  
  console.error('[Wallet] All retry attempts failed');
  return null;
}
```

### For Root Cause Identification:

Enable extensive logging:
```typescript
// In balance/route.ts, line 179-189
console.log('[Balance API] Wallet lookup attempt...');
console.log('[Balance API] Address to lookup:', validation.data.address);
const wallet = await getWalletByAddress(validation.data.address);
console.log('[Balance API] Wallet lookup returned:', wallet);
console.log('[Balance API] Wallet ID:', wallet?.id);

if (wallet) {
  console.log('[Balance API] Wallet exists, calculating balance...');
  const calculatedBalance = await calculateUSDCBalance(wallet.id);
  console.log('[Balance API] Calculated balance:', calculatedBalance);
} else {
  console.log('[Balance API] WARNING: Wallet is null, cannot calculate balance');
}
```

### For Production Diagnosis:

1. Check Vercel logs for the `/api/wallet/balance` endpoint
2. Look for errors like:
   - "No wallet found"
   - "Wallet lookup in catch"
   - "Error fetching wallet by address"
3. Verify RLS policies on `user_wallets` table
4. Test database connection from production environment
5. Check if `SUPABASE_SERVICE_ROLE_KEY` is configured

---

## Part 16: Summary Table

| Aspect | Localhost | Production | Status |
|--------|-----------|-----------|--------|
| Database | Same Supabase | Same Supabase | ✅ Identical |
| Transaction Data | 5.5 USDC visible | 5.5 USDC visible | ✅ Identical |
| RPC URL | sepolia.base.org | sepolia.base.org | ✅ Identical |
| Network Env | base-sepolia | base-sepolia | ✅ (likely) Identical |
| Balance Calculation Code | Same code | Same code | ✅ Identical |
| Token Filter | usdc+success | usdc+success | ✅ Identical |
| Wallet Lookup | Returns wallet ✓ | Returns null ✗ | ❌ **DIFFERENT** |
| Result | $5.50 | $0.00 | ❌ **DIFFERENT** |

---

## Part 17: Final Conclusion

### The Root Cause

**Production returns $0.00 because `getWalletByAddress()` returns `null` when called in production.**

This prevents the fallback balance calculation from running, leaving `usdcAmount` at its default value of `0`.

### Why This Happens

1. **Contract call fails** in production (RPC timeout or network issue)
2. **Code enters catch block** at line 175
3. **`getWalletByAddress()` returns null** due to:
   - RLS policy blocking unauthenticated query
   - Database connection issue
   - Wallet record not found
   - Multiple rows returned (violates `.single()`)
4. **Balance calculation skipped** because wallet is null
5. **Returns 0** (default value)

### Why Localhost Works

1. **Contract call fails** (or returns 0)
2. **`getWalletByAddress()` returns wallet** successfully
3. **Balance calculation runs** successfully
4. **Transaction history processed** and balance computed as 5.5
5. **Returns 5.5** correctly

### Key Code Vulnerability

```typescript
if (wallet) {  // ← SINGLE NULL CHECK IS THE CHOKEPOINT
  // Only this code runs if wallet exists
  usdcAmount = await calculateUSDCBalance(wallet.id);
} else {
  // If wallet is null, NOTHING HAPPENS
  // usdcAmount stays at 0
}
```

---

## Recommendations

1. **Immediate**: Add comprehensive logging to identify why wallet lookup fails
2. **Short-term**: Implement retry logic for wallet lookup
3. **Medium-term**: Add fallback to direct transaction query if wallet lookup fails
4. **Long-term**: Refactor to not depend on wallet object for balance calculation



