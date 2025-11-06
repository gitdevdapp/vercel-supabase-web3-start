# Troubleshooting Production Deployment Issues

## 🔍 Quick Diagnosis

### Check Vercel Deployment Status
1. Go to https://vercel.com/dashboard
2. Select your project
3. Check the latest deployment status
4. Click "View Logs" if it failed

### Test Environment Variables
```bash
# Create a test API route to check env vars
curl https://your-domain.vercel.app/api/test-supabase
```

## 🚨 Common Issues and Fixes

### Issue 1: "Email Auth Still Goes to Localhost"

**Symptoms:**
- Email verification links redirect to `http://localhost:3000`
- Users can't complete authentication in production

**Root Cause:**
Supabase redirect URLs are configured for localhost instead of production domain.

**Fix:**
1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Change Site URL** to: `https://your-production-domain.vercel.app`
3. **Add redirect URLs**:
   ```
   https://your-production-domain.vercel.app/auth/callback
   https://your-production-domain.vercel.app/auth/confirm
   https://your-production-domain.vercel.app/protected/profile
   ```
4. **Redeploy** by pushing a small change to trigger new build

---

### Issue 2: "Environment Variables Not Working"

**Symptoms:**
- Build succeeds but runtime errors about undefined variables
- `NEXT_PUBLIC_SUPABASE_URL is not defined`

**Root Cause:**
You uploaded `.env.local` file instead of using Vercel UI.

**Fix:**
1. **Remove the uploaded `.env.local`** from your Vercel project
2. **Go to Vercel Dashboard** → **Settings** → **Environment Variables**
3. **Add variables manually** in the UI
4. **Redeploy** to pick up new environment variables

---

### Issue 3: "Supabase Connection Fails"

**Symptoms:**
- API calls fail with connection errors
- Authentication doesn't work

**Fix:**
1. **Verify SUPABASE_URL** in Vercel env vars:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vatseyhqszmsnlvommxu.supabase.co
   ```
2. **Check your anon key** is correct
3. **Test connection**:
   ```bash
   curl https://vatseyhqszmsnlvommxu.supabase.co/rest/v1/
   ```

---

### Issue 4: "Build Succeeds But Auth Still Broken"

**Symptoms:**
- Vercel build completes successfully
- But email auth still doesn't work properly

**Fix:**
1. **Check NEXTAUTH_URL** in Vercel:
   ```
   NEXTAUTH_URL=https://your-production-domain.vercel.app
   ```
2. **Verify domain matches exactly** (no trailing slash, correct protocol)
3. **Test the auth callback URL** directly:
   ```
   https://your-production-domain.vercel.app/auth/callback
   ```

---

### Issue 5: "Wallet Features Not Working"

**Symptoms:**
- Basic auth works, but wallet creation fails
- API errors about CDP configuration

**Fix:**
1. **Add CDP environment variables** in Vercel:
   ```
   CDP_API_KEY_ID=your_key_id
   CDP_API_KEY_SECRET=your_secret
   CDP_WALLET_SECRET=your_wallet_secret
   NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
   NETWORK=base-sepolia
   ```
2. **Redeploy** after adding variables

---

## 🧪 Testing Commands

### Test Supabase Connection
```bash
curl https://your-domain.vercel.app/api/test-supabase
```

### Test Auth Callback
```bash
curl https://your-domain.vercel.app/auth/callback
```

### Test Wallet API
```bash
curl https://your-domain.vercel.app/api/wallet/list
```

### Check Environment Variables
```bash
# Add this to a test API route temporarily
console.log({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

## 📊 Monitoring

### Vercel Dashboard
- Check deployment status
- View build logs
- Monitor function logs

### Supabase Dashboard
- Check authentication logs
- Monitor API usage
- View error logs

## 🚑 Emergency Procedures

### If Production is Completely Broken
1. **Check Vercel deployment** status and logs
2. **Verify environment variables** are set correctly
3. **Test basic API connectivity**
4. **Check Supabase dashboard** for errors

### Quick Rollback
```bash
# Find the last working commit
git log --oneline -10

# Revert to previous version
git revert HEAD~1
git push origin main
```

### Domain Issues
If your custom domain isn't working:
1. **Check DNS settings** in your domain provider
2. **Verify Vercel domain configuration**
3. **Wait for DNS propagation** (can take up to 24 hours)

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Auth**: https://next-auth.js.org

## 💡 Pro Tips

1. **Always test in production** after deployment
2. **Use Vercel's environment variable UI**, never upload files
3. **Check logs immediately** if deployment fails
4. **Test authentication flows** manually in production
5. **Monitor error rates** in both Vercel and Supabase dashboards
