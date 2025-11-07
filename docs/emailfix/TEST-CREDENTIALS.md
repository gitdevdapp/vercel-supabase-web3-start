# Email Confirmation Test Credentials

## Production Testing Account (koshirai.com)

**Created:** November 6, 2025  
**Status:** Account created, email sent, domain configuration issue identified

### Account Details
- **Email:** testuser123456789@mailinator.com
- **Password:** testpassword123
- **Mailinator Inbox:** https://www.mailinator.com/v4/public/inboxes.jsp?to=testuser123456789

### Supabase Project
- **Project ID:** vatseyhqszmsnlvommxu
- **URL:** https://vatseyhqszmsnlvommxu.supabase.co

### Issue Summary
- ✅ Account creation: **SUCCESS**
- ✅ Email delivery: **SUCCESS**
- ❌ Email confirmation: **FAILED** (domain mismatch)
- **Root Cause:** Confirmation links point to koshirai.com instead of configured domain

### Next Steps
1. Fix Supabase auth configuration for correct domain
2. Test confirmation flow on koshirai.com
3. Verify user authentication and profile creation

### Quick Test Commands
```bash
# Check if account exists in Supabase
curl -H "apikey: YOUR_ANON_KEY" \
  "https://vatseyhqszmsnlvommxu.supabase.co/rest/v1/auth/users?email=testuser123456789@mailinator.com"
```

