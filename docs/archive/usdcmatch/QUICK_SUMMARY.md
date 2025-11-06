# USDC Balance Discrepancy - Quick Summary

## Issue
- **Localhost**: Shows $5.50 USDC ✅
- **Production**: Shows $0.00 USDC ❌
- **Same account, same wallet, same database**

## Root Cause
The production environment fails to calculate USDC balance because:

1. **Contract call to blockchain fails** (RPC timeout or network error)
2. **Code enters fallback logic** (catch block at line 175 in `app/api/wallet/balance/route.ts`)
3. **`getWalletByAddress()` returns NULL** instead of finding the wallet
4. **Balance calculation is skipped** because wallet object is null
5. **Returns $0.00** (default value)

### Why Does `getWalletByAddress()` Return NULL in Production?

Most likely causes:
- **Row-Level Security (RLS) Policy** blocks the query (authentication context issue)
- **Database connection failure**
- **Wallet record not found** 
- **Multiple wallets with same address** (`.single()` expects exactly 1 row)

## Key Code Path

```
Balance API (app/api/wallet/balance/route.ts:138)
  ├─ if (network === "base-sepolia") {
  │   ├─ try { contract.balanceOf() }
  │   └─ catch { getWalletByAddress() ← RETURNS NULL IN PROD
  │       └─ if (wallet) { calculateBalance() } ← SKIPPED
  │   }
  └─ return usdcAmount (stays 0)
```

## The Chokepoint

```typescript
// Line 156-174 in balance/route.ts
if (wallet) {  // ← WALLET IS NULL IN PRODUCTION
  const calculatedBalance = await calculateUSDCBalance(wallet.id);
  // ... update usdcAmount ...
} else {
  console.log('No wallet found, cannot calculate balance');
  // usdcAmount stays at 0
}
```

## Why Localhost Works

1. Uses `.env.local` which may have different authentication context
2. Database queries might use service role key instead of anon key
3. RLS policies might not be enforced the same way
4. `getWalletByAddress()` returns wallet successfully
5. Balance calculation runs and returns 5.5 correctly

## Evidence

**Same Code**: Both use `app/api/wallet/balance/route.ts`
**Same Database**: Both use same Supabase project
**Same RPC**: Both use `https://sepolia.base.org`
**Same Network Var**: Both should have `NETWORK=base-sepolia`
**Different Result**: Only difference is wallet lookup fails in production

## Solution

1. **Immediate Fix**: Add error handling and logging to wallet lookup
2. **Fallback**: Query transactions directly by address instead of wallet ID
3. **Retry Logic**: Implement retry with exponential backoff
4. **Long-term**: Refactor to not depend on wallet object for balance calculation

## Related Files

- **Main Issue**: `app/api/wallet/balance/route.ts` (lines 24-227)
- **Related**: `app/api/wallet/list/route.ts` (has similar but working logic)
- **Calculation**: `lib/supabase/server.ts` (Supabase client initialization)
- **RLS Policies**: `scripts/database/` (database setup files)

## Testing

To verify:
1. ✅ Check Vercel logs for wallet lookup errors
2. ✅ Verify RLS policies on `user_wallets` table
3. ✅ Test if `SUPABASE_SERVICE_ROLE_KEY` is configured in production
4. ✅ Add console logs to see exactly where it fails

---

**Detailed Analysis**: See `USDC_BALANCE_LOCALHOST_VS_PROD_DIAGNOSIS.md`


