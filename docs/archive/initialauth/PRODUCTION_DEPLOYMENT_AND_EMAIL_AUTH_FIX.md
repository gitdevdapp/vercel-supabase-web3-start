# Production Deployment and Email Authentication Fix Guide

## 🚨 The Problem

You uploaded your `.env.local` file directly to Vercel using Command+Shift+. (show hidden files), but this **breaks production deployment** because:

1. **Environment variables are not properly configured** in Vercel
2. **Supabase redirect URLs point to localhost** instead of production
3. **Email authentication links redirect to localhost:3000**

## 📋 Understanding Vercel Production Deployment

### How Vercel Deployments Work

1. **Git Push Trigger**: When you push to `main`, Vercel automatically builds your app
2. **Environment Variables**: Vercel uses its own environment variable system, NOT your `.env.local`
3. **Build Process**: Vercel builds in a clean environment with only the variables you set in their UI
4. **Domain Assignment**: Vercel assigns your custom domain or provides a `*.vercel.app` domain

### ❌ What You Did Wrong

```bash
# DON'T DO THIS:
# 1. Upload .env.local file to Vercel via Command+Shift+.
# 2. This puts ALL your local variables into production
# 3. Supabase URLs still point to localhost
```

### ✅ What You Should Do

Use Vercel's Environment Variables UI to configure production values.

## 🔧 Step-by-Step Fix for Email Authentication

### Step 1: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `vercel-supabase-web3-start`
3. **Go to Settings** → **Environment Variables**

#### Required Environment Variables:

```bash
# Supabase Configuration (PRODUCTION VALUES)
NEXT_PUBLIC_SUPABASE_URL=https://vatseyhqszmsnlvommxu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Vercel/Auth Configuration
NEXTAUTH_URL=https://your-production-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_here

# Wallet/CDP Configuration (if using)
CDP_API_KEY_ID=your_cdp_key_id
CDP_API_KEY_SECRET=your_cdp_secret
CDP_WALLET_SECRET=your_wallet_secret

# Other required variables
NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

### Step 2: Get Your Production Supabase Keys

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: The one with URL `vatseyhqszmsnlvommxu.supabase.co`
3. **Go to Settings** → **API**
4. **Copy the following**:
   - **Project URL**: `https://vatseyhqszmsnlvommxu.supabase.co`
   - **anon/public key**: The publishable key
   - **service_role key**: The secret key (keep this safe!)

### Step 3: Configure Supabase Authentication Redirects

1. **In Supabase Dashboard** → **Authentication** → **URL Configuration**

#### Site URL:
```
https://your-production-domain.vercel.app
```

#### Redirect URLs (add these):
```
https://your-production-domain.vercel.app/auth/callback
https://your-production-domain.vercel.app/auth/confirm
https://your-production-domain.vercel.app/protected/profile
```

### Step 4: Update Vercel Environment Variables

1. **In Vercel Dashboard** → **Environment Variables**
2. **Add/Update these variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vatseyhqszmsnlvommxu.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Your anon key | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production |
| `NEXTAUTH_URL` | `https://your-production-domain.vercel.app` | Production |

### Step 5: Redeploy to Trigger New Build

```bash
# Push a small change to trigger deployment
echo "# Production deployment fix" >> README.md
git add README.md
git commit -m "Trigger production deployment with correct env vars"
git push origin main
```

## 🔍 Understanding Email Authentication Flow

### How Email Auth Works in This App

1. **User clicks "Sign Up"** → Form submits to `/auth/sign-up`
2. **Supabase sends email** → Link contains verification token
3. **User clicks email link** → Goes to Supabase auth endpoint
4. **Supabase redirects** → To the configured redirect URL
5. **App processes auth** → Sets session, redirects to protected page

### Why It Went to Localhost

```javascript
// The email link you received:
https://vatseyhqszmsnlvommxu.supabase.co/auth/v1/verify?token=pkce_22c0d465e5181f39f514c577667a1d49192bef463f781bc1b1b48e50&type=signup&redirect_to=http://localhost:3000

// The redirect_to parameter points to localhost because:
// 1. Your .env.local has NEXTAUTH_URL=http://localhost:3000
// 2. Supabase is configured to redirect to that URL
// 3. Even in production, Supabase uses the configured redirect URLs
```

## 🧪 Testing the Fix

### 1. Deploy and Wait
- Wait for Vercel deployment to complete
- Check the deployment URL (should be something like `your-project.vercel.app`)

### 2. Test Email Authentication
1. **Go to production URL**
2. **Try to sign up** with a test email
3. **Check your email** for the verification link
4. **Click the link** - it should now redirect to production, not localhost!

### 3. Verify Environment Variables
```bash
# In production, check if env vars are set correctly
curl https://your-production-domain.vercel.app/api/test-supabase
```

## 🚨 Common Issues and Solutions

### Issue 1: "Environment Variables Not Set"
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
**Solution**: Make sure you added them in Vercel UI, not uploaded .env.local

### Issue 2: "Invalid Redirect URL"
```
Error: Redirect URL not allowed
```
**Solution**: Add your production domain to Supabase's allowed redirect URLs

### Issue 3: "Authentication Callback Failed"
```
Error: Callback URL mismatch
```
**Solution**: Ensure NEXTAUTH_URL matches your production domain exactly

## 📝 Environment Variables Reference

### Required for Basic Auth:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-random-secret
```

### Optional (for Wallet Features):
```bash
CDP_API_KEY_ID=your-cdp-key
CDP_API_KEY_SECRET=your-cdp-secret
CDP_WALLET_SECRET=your-wallet-secret
NETWORK=base-sepolia
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
```

## 🔄 Next Steps After Fix

1. **Test all authentication flows** in production
2. **Verify wallet functionality** works
3. **Check that all API routes** respond correctly
4. **Monitor error logs** in Vercel dashboard

## 💡 Key Takeaways

1. **Never upload .env.local to Vercel** - use their Environment Variables UI
2. **Configure Supabase redirect URLs** for production domains
3. **Environment variables must be set in Vercel UI** for production builds
4. **Test authentication flows** in production after deployment
5. **Use production Supabase URLs**, not localhost URLs

## 🆘 If Still Having Issues

1. **Check Vercel deployment logs** for build errors
2. **Verify all environment variables** are set correctly in Vercel
3. **Test Supabase connection** with a simple API call
4. **Check Supabase authentication settings** match your production domain

---

**Remember**: Production deployment is different from local development. Always configure environment variables through Vercel's UI, never upload local files!
