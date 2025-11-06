# USDC Faucet Limit Analysis
**Error Message**: "Global Limit for Coinbase Faucet is 10 USDC per 24 hours - Follow our Guide to Deploy your own CDP Keys"
**Date**: November 4, 2025
**Issue**: Understanding whether USDC faucet limits are global (API key based) or per-wallet

---

## Executive Summary

The USDC faucet limits are **project-level limits** based on the CDP API key, not individual wallet limits. This means **all users of the application share the same faucet quota**.

### Key Findings
- **Scope**: Global across all application users
- **Basis**: CDP API key credentials
- **Reset Period**: Approximately 24 hours (based on super-faucet error handling)
- **Impact**: When limit is reached, no users can request USDC until reset

---

## Technical Analysis

### CDP Error Message Evidence

The actual CDP error from server logs:

```
APIError: Project's faucet limit reached for this token and network. Please try again later.
    at async POST (app/api/wallet/fund/route.ts:94:33)
{
  statusCode: 429,
  errorType: 'faucet_limit_exceeded',
  errorMessage: "Project's faucet limit reached for this token and network. Please try again later.",
  correlationId: '99957243caa51e9b-IAD',
  errorLink: 'https://docs.cdp.coinbase.com/api-reference/v2/errors#faucet-limit-exceeded'
}
```

**Key Phrase**: "Project's faucet limit reached"
- Uses "Project's" (possessive) indicating the limit belongs to the project/API key
- Not "Wallet's" or "Address's" limit

### Code Architecture Evidence

**Shared CDP Client**:
```typescript
// All faucet requests use the same CDP credentials
function getCdpClient(): CdpClient {
  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID!,      // ← SHARED ACROSS APP
    apiKeySecret: env.CDP_API_KEY_SECRET!, // ← SHARED ACROSS APP
    walletSecret: env.CDP_WALLET_SECRET!,   // ← SHARED ACROSS APP
  });
}
```

**Same Client Used Everywhere**:
- `/api/wallet/fund` → USDC faucet requests
- `/api/wallet/super-faucet` → ETH faucet requests
- All requests share the same API key quota

### Rate Limit Handling in Code

**Super Faucet Endpoint** shows 24-hour reset pattern:
```typescript
if (error.message.includes("rate limit") || error.message.includes("faucet_limit_exceeded")) {
  return NextResponse.json(
    { error: "Faucet rate limit exceeded. Please try again in 24 hours." },
    { status: 429 }
  );
}
```

**Fund Endpoint** (our USDC endpoint):
```typescript
if (error.message.includes("rate limit") || error.message.includes("faucet limit reached")) {
  return NextResponse.json(
    { error: "Faucet limit exceeded. Please wait before requesting more USDC." },
    { status: 429 }
  );
}
```

### Impact Analysis

#### For Users
- **Problem**: When any user hits the limit, all users are affected
- **Fairness**: First-come, first-served basis
- **Workaround**: Users can try different wallets or wait for reset

#### For Application
- **Shared Quota**: All users compete for the same CDP allowance
- **Scalability**: Limits growth potential
- **Cost**: May need multiple CDP accounts for higher limits

---

## CDP Faucet Limits Documentation

Based on the CDP error link and code patterns, the limits appear to be:

### Limit Characteristics
- **Scope**: Per API key (project-level)
- **Token-Specific**: Separate limits for USDC vs ETH
- **Network-Specific**: Separate limits per network (base-sepolia vs base-mainnet)
- **Reset Period**: Approximately 24 hours
- **Error Type**: `faucet_limit_exceeded`

### Usage Patterns Observed
- **USDC Requests**: Limited per project per day
- **ETH Requests**: Also limited (super-faucet uses multiple small requests)
- **Combined Usage**: Both USDC and ETH requests count against project quota

---

## Alternative Solutions Considered

### Option 1: Multiple CDP API Keys
- **Pros**: Higher total limits, distribute load
- **Cons**: Higher cost, complex key management
- **Implementation**: Load balance across multiple API keys

### Option 2: User-Paid Faucet
- **Pros**: Unlimited usage for paying users
- **Cons**: Changes business model, user friction
- **Implementation**: Integrate with paid faucet services

### Option 3: Rate Limiting per User
- **Pros**: Fair distribution among users
- **Cons**: Still limited by CDP quotas
- **Implementation**: Application-level rate limiting before CDP calls

### Option 4: External Faucet Services
- **Pros**: Different quota pools
- **Cons**: Dependency on third parties
- **Implementation**: Fallback to services like https://faucet.quicknode.com/

---

## Current Status

### Error Message Strategy
The current error message provides specific guidance:

> "Global Limit for Coinbase Faucet is 10 USDC per 24 hours - Follow our Guide to Deploy your own CDP Keys"

**Why this message works**:
- Provides specific limit information (10 USDC per 24 hours)
- Directs users to the solution (deploy their own CDP keys)
- References the guide for implementation steps
- Encourages self-sufficiency rather than waiting

### Monitoring Recommendations
- Track CDP error rates
- Monitor usage patterns
- Alert when approaching limits
- Consider usage analytics

---

## Implementation Impact

### Code Changes Made
1. **API Error Handling**: Added "faucet limit reached" detection
2. **User Messages**: Improved error messages for better UX
3. **Status Codes**: Return 429 (Too Many Requests) for limits

### Files Modified
- `app/api/wallet/fund/route.ts` - Added faucet limit error handling
- `components/profile-wallet-card.tsx` - Added user-friendly error display

---

## Future Considerations

### Scalability
- **Current**: Single CDP API key limits all users
- **Future**: May need multiple keys or paid services as user base grows

### User Experience
- **Current**: Generic limit reached message
- **Future**: Could show estimated reset time or usage statistics

### Business Impact
- **Current**: Free faucet with shared limits
- **Future**: May need to consider paid tiers or external services

---

## Conclusion

**The USDC faucet limit is GLOBAL** - based on the CDP API key shared across the entire application. All users compete for the same daily quota.

**This is expected behavior** for testnet faucets and not a bug in the application code. The error handling improvements provide better user experience when limits are reached.

**Recommendation**: Monitor usage and consider scaling strategies (multiple API keys, paid services) as the application grows.

---

**References**:
- CDP Error: `faucet_limit_exceeded`
- CDP Documentation: https://docs.cdp.coinbase.com/api-reference/v2/errors#faucet-limit-exceeded
- Error Message: "Project's faucet limit reached for this token and network"
