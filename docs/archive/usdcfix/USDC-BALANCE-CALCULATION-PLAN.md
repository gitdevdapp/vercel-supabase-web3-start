# USDC Balance Calculation Plan

## Executive Summary

**Problem**: USDC balance shows $0.00 despite successful onchain transactions (e.g., [TX: 0x629e67145fcda0e9b142efb13e78ca95ca73bdf3834a4c8c184e29329ec6f708](https://sepolia.basescan.org/tx/0x629e67145fcda0e9b142efb13e78ca95ca73bdf3834a4c8c184e29329ec6f708))

**Root Cause**: Direct contract balance queries (`balanceOf()`) are failing silently despite transactions being confirmed

**Solution**: Calculate USDC balance from transaction history + store computed balances

## Current State Analysis

### ✅ What's Working
- USDC transactions are successfully recorded in database
- Transaction history shows correct USDC funding events
- Onchain transactions are confirmed (BaseScan shows "Success")

### ❌ What's Broken
- `contract.balanceOf(walletAddress)` returns 0 despite real USDC holdings
- Balance fetching fails silently (catches errors, defaults to 0)
- No balance calculation fallback mechanism

## Simple Solution: Balance Calculation from History

### Core Strategy
Instead of relying on direct contract calls, calculate USDC balance by:
1. **Query transaction history** for USDC operations
2. **Sum up all inflows and outflows** 
3. **Store computed balance** in database
4. **Use computed balance** as primary source, contract call as validation

### Implementation Plan

#### 1. Enhanced Balance Calculation Function
```typescript
// New function in lib/profile.ts or lib/wallet.ts
async function calculateUSDCBalance(walletId: string): Promise<number> {
  // Query all USDC transactions for this wallet
  const { data: transactions } = await supabase
    .rpc('get_wallet_transactions', { p_wallet_id: walletId })
    .eq('token_type', 'usdc');
  
  let balance = 0;
  for (const tx of transactions || []) {
    if (tx.operation_type === 'fund' && tx.status === 'success') {
      balance += tx.amount; // Add incoming USDC
    }
    // Add other operations as needed (send, receive, etc.)
  }
  
  return balance;
}
```

#### 2. Database Balance Storage
```sql
-- Add balance cache table (optional enhancement)
CREATE TABLE wallet_balances (
  wallet_id UUID PRIMARY KEY REFERENCES user_wallets(id),
  usdc_balance DECIMAL(18,6) DEFAULT 0,
  eth_balance DECIMAL(18,18) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_transaction_id UUID REFERENCES wallet_operations(id)
);
```

#### 3. API Enhancement: Dual-Source Balance Fetching
```typescript
// app/api/wallet/balance/route.ts enhancement
export async function GET(request: NextRequest) {
  // ... existing validation ...
  
  let usdcAmount = 0;
  
  // Method 1: Try contract call (fast path)
  try {
    const contractBalance = await usdcContract.balanceOf(address);
    usdcAmount = Number(contractBalance) / 1000000;
  } catch (error) {
    console.warn('[Balance API] Contract call failed, using transaction history');
  }
  
  // Method 2: Fallback to transaction history calculation
  if (usdcAmount === 0) {
    try {
      // Get wallet ID from database
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('wallet_address', address)
        .single();
        
      if (wallet) {
        usdcAmount = await calculateUSDCBalance(wallet.id);
        console.log(`[Balance API] Calculated USDC balance from history: ${usdcAmount}`);
      }
    } catch (error) {
      console.error('[Balance API] Failed to calculate balance from history:', error);
    }
  }
  
  // ... rest of function ...
}
```

#### 4. Balance Update Trigger
```typescript
// After successful USDC funding in app/api/wallet/fund/route.ts
if (isSuccessful) {
  // Update cached balance
  await supabase.rpc('update_wallet_balance', {
    p_wallet_id: wallet.id,
    p_token_type: 'usdc',
    p_amount: 1.0, // Add to existing balance
    p_operation: 'add'
  });
  
  // Log successful funding (existing)
  await supabase.rpc('log_wallet_operation', { ... });
}
```

#### 5. Frontend Enhancement: Balance Validation
```typescript
// components/profile-wallet-card.tsx
const loadWallet = async () => {
  // ... existing code ...
  
  // After loading balances, validate against transaction history
  if (walletData.balances.usdc === 0) {
    try {
      const historyResponse = await fetch(`/api/wallet/balance-calculated?walletId=${walletData.id}`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.usdc > 0) {
          console.log('[Balance Validation] Using calculated balance:', historyData.usdc);
          setWallet(prev => ({
            ...prev,
            balances: { ...prev.balances, usdc: historyData.usdc }
          }));
        }
      }
    } catch (error) {
      console.warn('[Balance Validation] Failed to get calculated balance:', error);
    }
  }
};
```

## Implementation Steps

### Phase 1: Core Balance Calculation (High Priority)
1. **Create balance calculation function** in `lib/wallet.ts`
2. **Add fallback logic** to `/api/wallet/balance` route
3. **Test with existing wallet** that has confirmed USDC transactions

### Phase 2: Balance Storage (Medium Priority)
1. **Add balance cache table** (optional)
2. **Implement balance update triggers** after funding operations
3. **Add balance validation** in frontend

### Phase 3: Monitoring & Optimization (Low Priority)
1. **Add balance discrepancy alerts** when contract vs calculated differ
2. **Performance optimization** for large transaction histories
3. **Balance reconciliation jobs** for existing data

## Expected Results

### Immediate Outcome
- USDC balance shows **$3.00** for wallet with 3 confirmed transactions
- No new database schema changes required
- Works with existing Supabase infrastructure

### Long-term Benefits
- Reliable balance display even during RPC outages
- Faster balance queries (database vs blockchain calls)
- Better user experience with instant balance updates

## Files to Modify

1. `lib/wallet.ts` - Add `calculateUSDCBalance()` function
2. `app/api/wallet/balance/route.ts` - Add fallback calculation logic
3. `components/profile-wallet-card.tsx` - Add balance validation
4. `app/api/wallet/fund/route.ts` - Add balance update triggers (optional)

## Testing Plan

### Test Case 1: Existing Problem Wallet
- Wallet: `0x96f8FDfe2f2244D71D2F4cddbbD0f9A9e59cBe44`
- Expected: USDC balance shows **$3.00** (3 × 1.0 USDC)
- Method: Query `/api/wallet/balance?address=0x96f8FDfe2f2244D71D2F4cddbbD0f9A9e59cBe44`

### Test Case 2: New USDC Funding
- Request 1 USDC funding
- Verify balance updates immediately
- Confirm transaction history + balance consistency

### Test Case 3: Balance Persistence
- Refresh page multiple times
- Verify balance remains consistent
- Test across different browsers/sessions

## Risk Assessment

### Low Risk
- No database schema changes required
- Fallback approach doesn't break existing functionality
- Can be easily disabled if contract calls start working

### Mitigation
- Comprehensive logging for balance discrepancies
- Clear separation between contract vs calculated balances
- Easy rollback to contract-only approach

---

## Summary

**Simple Plan**: Calculate USDC balance from transaction history when direct contract queries fail. This provides reliable balance display using existing data, with no new database migrations needed.

**Expected Result**: USDC balance will correctly display the sum of all successful funding transactions, showing **$3.00** for the test wallet with 3 confirmed USDC transfers.

**Timeline**: 2-4 hours implementation, immediate results visible.

---

**Date**: November 4, 2025  
**Status**: Ready for implementation
