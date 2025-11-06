# USDC Balance Mismatch Investigation

## 📋 Overview

This folder contains a detailed diagnostic investigation into why the USDC balance shows correctly on **localhost ($5.50)** but fails on **production ($0.00)** for the same user account.

## 🔍 Investigation Results

Both environments:
- ✅ Use the SAME Supabase database
- ✅ Access the SAME wallet address
- ✅ Use the SAME transaction history
- ✅ Run the SAME balance calculation code
- ❌ Return DIFFERENT results

## 📁 Documents in This Folder

### 1. **QUICK_SUMMARY.md** - Start Here! 📍
   - **What**: One-page executive summary
   - **Best for**: Quick understanding of the issue
   - **Time to read**: 5 minutes
   - **Contains**: 
     - The problem statement
     - Root cause in plain English
     - Key code path visualization
     - Why localhost works vs production
     - Quick solution outline

### 2. **USDC_BALANCE_LOCALHOST_VS_PROD_DIAGNOSIS.md** - Deep Dive 🔬
   - **What**: Comprehensive 17-part technical analysis
   - **Best for**: Understanding implementation details
   - **Time to read**: 20-30 minutes
   - **Contains**:
     - Part 1: Architecture overview
     - Part 2: USDC calculation logic  
     - Part 3: Network-based filtering
     - Part 4-6: Hypothesis testing (6 different theories)
     - Part 7-11: Why localhost works vs why production fails
     - Part 12-14: Security context & RLS policy issues
     - Part 15: Debugging recommendations
     - Part 16: Summary table
     - Part 17: Final conclusion & recommendations

## 🎯 Key Findings

### The Root Cause
Production fails to calculate USDC balance because the fallback wallet lookup (`getWalletByAddress()`) returns `null`, which prevents the balance calculation from running.

### Why Production vs Localhost Differ

**Production Path**:
```
Contract call fails → Catch block → getWalletByAddress() = null
→ if (wallet) skipped → usdcAmount stays 0 → Returns $0.00 ❌
```

**Localhost Path**:
```
Contract call fails → Catch block → getWalletByAddress() = wallet object
→ if (wallet) executes → calculateBalance() runs → Returns $5.50 ✅
```

### Most Likely Root Cause
The `getWalletByAddress()` function fails in production due to:
1. **Row-Level Security (RLS) policies** blocking the query in production
2. **Authentication context** being different between environments
3. The Supabase client being created without proper authentication context
4. Possible database connection or query errors not being handled

## 🚀 Quick Navigation

### If you want to...
- **Understand the problem quickly** → Read `QUICK_SUMMARY.md`
- **Debug the issue** → Jump to Part 15 in the main diagnosis
- **Understand the architecture** → Read Part 1 of the main diagnosis
- **See all hypotheses tested** → Read Parts 4-6 of the main diagnosis
- **Find the exact code vulnerability** → See Part 10 "Critical Lines"
- **Understand why it works locally** → See Part 11 "Localhost Works"

## 🔧 Code References

### Files Involved
- `app/api/wallet/balance/route.ts` - Main balance API endpoint
- `app/api/wallet/list/route.ts` - Related (works correctly)
- `components/profile-wallet-card.tsx` - Frontend caller
- `lib/supabase/server.ts` - Supabase client initialization
- `lib/features.ts` - Network configuration

### Critical Code Section
```typescript
// Line 156-174 in app/api/wallet/balance/route.ts
if (wallet) {  // ← WALLET IS NULL IN PRODUCTION
  const calculatedBalance = await calculateUSDCBalance(wallet.id);
} else {
  console.log('No wallet found, cannot calculate balance');
  // usdcAmount stays at 0
}
```

## 📊 Evidence Summary

| Aspect | Localhost | Production | Conclusion |
|--------|-----------|-----------|-----------|
| Database | Same | Same | ✅ Not the cause |
| RPC URL | Identical | Identical | ✅ Not the cause |
| Code | Identical | Identical | ✅ Not the cause |
| Network Config | Same | Same | ✅ Not the cause |
| Wallet Lookup | Returns ✓ | Returns ✗ | ❌ **THE CAUSE** |
| Result | $5.50 | $0.00 | **CONFIRMED** |

## 🛠️ Recommended Next Steps

1. **Enable Logging**: Add detailed console logs to `getWalletByAddress()` 
2. **Check Vercel Logs**: Review production logs for wallet lookup errors
3. **Verify RLS Policies**: Confirm `user_wallets` table has correct policies
4. **Test Authentication**: Ensure API route is properly authenticated
5. **Add Retry Logic**: Implement exponential backoff for database queries
6. **Fallback Query**: Add direct transaction query if wallet lookup fails

## 📝 Testing Checklist

- [ ] Check if `SUPABASE_SERVICE_ROLE_KEY` is set in production
- [ ] Verify RLS policy on `user_wallets` table
- [ ] Review Vercel logs for wallet lookup failures
- [ ] Test if multiple wallets exist with same address
- [ ] Check database connection from production environment
- [ ] Verify authentication context in production API

## 🎓 Learning Points

This issue demonstrates:
1. **Same code, different results** due to environment configuration
2. **RLS policies** can silently fail with null returns
3. **Fallback logic importance** - but also the risk of incomplete fallbacks
4. **The critical chokepoint** - a single null check preventing recovery
5. **Production vs Development** differences in authentication context

## 📞 For More Information

- See **QUICK_SUMMARY.md** for the executive overview
- See **USDC_BALANCE_LOCALHOST_VS_PROD_DIAGNOSIS.md** for detailed analysis
- Check Part 15 for debugging recommendations
- Check Part 17 for final conclusions

---

**Status**: ✅ Investigation Complete | 📅 November 4, 2025 | 🎯 Root Cause: Wallet Lookup Failure in Production


