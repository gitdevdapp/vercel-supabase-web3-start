# WALLETALIVE Testing Accounts

**Date**: November 3, 2025
**Purpose**: Testing accounts created for walletaliveV6/V7 verification
**Service**: Mailinator (temporary email service)

---

## Current Testing Accounts

### Primary Test Account (V6 Development)
**Email**: `wallettest_nov3_dev@mailinator.com`
**Password**: `TestPassword123!`
**Status**: ✅ Active (used for V6 testing and verification)
**Created**: November 3, 2025
**Purpose**: Main development testing account for walletaliveV6 implementation

### Alternative Test Accounts
**Email**: `wallettest_nov3_v6@mailinator.com`
**Password**: `TestPassword123!` (assumed standard)
**Status**: ✅ Created (mentioned in critical code review)
**Created**: November 3, 2025
**Purpose**: Alternative testing account for V6 verification

**Email**: `wallettest_nov3_v7_2333@mailinator.com`
**Password**: `TestPassword123!`
**Status**: ✅ RESOLVED (WALLETALIVEV8 fix implemented)
**Created**: November 3, 2025
**Purpose**: WALLETALIVEV8 wallet card rendering investigation - auto-creation works, display now fixed
**Wallets**: 2 auto-created wallets visible on profile page

**Email**: `testuser@mailinator.com`
**Password**: `TestPassword123!` (assumed standard)
**Status**: ✅ Created (mentioned in testing summary)
**Created**: November 3, 2025
**Purpose**: Generic test user account

---

## Account Access Instructions

### Mailinator Access
1. Visit: https://www.mailinator.com/
2. Enter the email address (without @mailinator.com)
3. Access inbox to view confirmation emails

### Testing Flow
1. Create account with one of the emails above
2. Check Mailinator inbox for confirmation email
3. Click confirmation link
4. Navigate to `/protected/profile`
5. Observe auto-wallet creation or test manual creation
6. Verify console logs and database entries

---

## Email Confirmation Status

### wallettest_nov3_dev@mailinator.com
- **Supabase Confirmation**: ⏳ May need re-confirmation
- **Last Used**: November 3, 2025 (V6 testing)
- **Console Logs Expected**:
  - `[V6AutoFill]` - Auto-fill working
  - `[V6Retry]` - Client retry attempts
  - `[AutoWallet]` - Auto-creation operations

### Other Accounts
- **Status**: Available for testing
- **Confirmation**: May require email verification
- **Database**: Check `user_wallets` table after creation

---

## Testing Checklist

### For Each Account:
- [ ] Email confirmation completed
- [ ] Profile page accessible (`/protected/profile`)
- [ ] Auto-wallet creation triggered
- [ ] Console logs verified (see prefixes above)
- [ ] Database wallet record created
- [ ] Wallet name format correct (`Auto-Generated Wallet` or `Wallet-YYYY-MM-DD-XXXXX`)

### Verification Commands:
```sql
-- Check wallet creation
SELECT * FROM user_wallets
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%mailinator.com'
)
ORDER BY created_at DESC;
```

---

## Security Notes

- **Temporary Accounts**: These are disposable testing accounts
- **No Production Data**: Only used for development testing
- **Mailinator Service**: Emails expire automatically
- **Database Cleanup**: Remove test data after verification

---

**Testing Accounts Document**
**Date**: November 3, 2025
**Status**: ✅ Current testing credentials documented

