# USDC Faucet Limits Documentation

## Overview

This directory documents the analysis of USDC faucet limits in the DevDapp application, specifically addressing whether limits are global (API key based) or per-wallet.

## Key Findings

**The USDC faucet limit is GLOBAL** - based on the CDP API key shared across the entire application. All users compete for the same daily quota per token/network combination.

### Evidence

1. **CDP Error Message**: "Project's faucet limit reached for this token and network"
2. **Shared Credentials**: All faucet requests use the same CDP API key
3. **Code Architecture**: Single `getCdpClient()` function shared across endpoints
4. **Error Handling**: Both fund and super-faucet endpoints handle `faucet_limit_exceeded` errors

## Files

### [USDC_FAUCET_LIMIT_ANALYSIS.md](USDC_FAUCET_LIMIT_ANALYSIS.md)
- Complete technical analysis of faucet limits
- Evidence from CDP errors and code architecture
- Impact analysis and recommendations
- Alternative solutions for scaling

## Current Error Message

When users hit the limit, they see:
> "Global Limit for Coinbase Faucet is 10 USDC per 24 hours - Follow our Guide to Deploy your own CDP Keys"

## Technical Details

- **Scope**: Project-level (all application users)
- **Basis**: CDP API key credentials
- **Reset**: Approximately 24 hours
- **Separation**: Separate limits for USDC vs ETH, different networks
- **Error Code**: `faucet_limit_exceeded` (HTTP 429)

## Business Implications

- **Fairness**: First-come, first-served among all users
- **Scalability**: May limit growth as user base increases
- **Cost**: May need multiple CDP accounts or paid services
- **UX**: Clear error messages help manage expectations

## Future Scaling Options

1. **Multiple CDP API Keys** - Distribute load across multiple accounts
2. **Paid Faucet Services** - Remove limits for premium users
3. **External Faucets** - Third-party services with different quotas
4. **User Rate Limiting** - Fair distribution before hitting CDP limits
