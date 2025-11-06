# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://vatseyhqszmsnlvommxu.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` = Your anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your service role key
- [ ] `NEXTAUTH_URL` = `https://your-production-domain.vercel.app`
- [ ] `NEXTAUTH_SECRET` = Random secret string

### 2. Supabase Configuration
- [ ] **Site URL**: `https://your-production-domain.vercel.app`
- [ ] **Redirect URLs**:
  - `https://your-production-domain.vercel.app/auth/callback`
  - `https://your-production-domain.vercel.app/auth/confirm`
  - `https://your-production-domain.vercel.app/protected/profile`

### 3. Optional Features
- [ ] `CDP_API_KEY_ID` = Your CDP key ID
- [ ] `CDP_API_KEY_SECRET` = Your CDP secret
- [ ] `CDP_WALLET_SECRET` = Your wallet secret
- [ ] `NETWORK` = `base-sepolia`
- [ ] `NEXT_PUBLIC_ENABLE_CDP_WALLETS` = `true`

## 🚀 Deployment Steps

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Wait for Vercel build** to complete

3. **Test authentication**:
   - Go to production URL
   - Try sign up with test email
   - Check email for verification link
   - Verify it redirects to production (not localhost)

## 🔍 Verification Tests

### Test 1: Basic Auth Flow
```bash
# Visit: https://your-domain.vercel.app/auth/sign-up
# Sign up with test email
# Check email for link
# Verify redirect goes to production domain
```

### Test 2: Environment Variables
```bash
# Check if API routes work
curl https://your-domain.vercel.app/api/test-supabase
```

### Test 3: Wallet Features (if enabled)
```bash
# Test wallet creation
curl -X POST https://your-domain.vercel.app/api/wallet/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"test","type":"purchaser"}'
```

## 🚨 Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Auth redirects to localhost** | Email links go to `localhost:3000` | Check Supabase redirect URLs |
| **Environment variables missing** | Build errors about undefined vars | Set them in Vercel UI, not upload .env.local |
| **Supabase connection fails** | API calls return connection errors | Verify SUPABASE_URL and keys in Vercel |
| **Callback URL mismatch** | Auth flow fails after email click | Ensure NEXTAUTH_URL matches production domain |

## 📞 Emergency Rollback

If production breaks completely:

```bash
# Revert the problematic commit
git log --oneline -5  # Find the bad commit hash
git revert <bad-commit-hash>
git push origin main
```

Then redeploy and check Vercel dashboard for the rollback deployment.

---

**Remember**: Always test authentication flows in production after deployment!
