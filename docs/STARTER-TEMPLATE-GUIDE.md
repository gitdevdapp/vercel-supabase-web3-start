# 🚀 Web3 Starter Template - Complete Guide

**Deploy your production Web3 dApp in 60 minutes • Open Source • Free to Use**

---

## 🎯 What Is This?

This is an **open-source starter template** for building production-ready multi-chain Web3 applications with:

- ✅ **Enterprise Authentication** - Supabase email/password with confirmation
- ✅ **User Profiles** - Auto-created on signup with image uploads
- ✅ **PostgreSQL Database** - Row-level security built-in
- ✅ **Multi-Chain Support** - Flow, Apechain, Avalanche, Stacks, Tezos, ROOT
- ✅ **Web3 Wallets** - Optional Coinbase CDP integration
- ✅ **Production Ready** - Deploy to Vercel in 60 minutes
- ✅ **Modern Stack** - Next.js 15, TypeScript, TailwindCSS

**This is YOUR template** - clone it, customize it, deploy it. All branding and content is placeholder, meant to be replaced with your own.

---

## 📋 Prerequisites (5 minutes)

Before starting, create these **free** accounts:

- ✅ [GitHub](https://github.com) - Code repository
- ✅ [Vercel](https://vercel.com) - Hosting platform
- ✅ [Supabase](https://supabase.com) - Database & auth
- ⚠️ [Coinbase CDP](https://portal.cdp.coinbase.com) - Optional, for Web3 wallets

**Time needed:** 60 minutes of focused work

---

## 🚀 Part 1: Quick Deployment (60 minutes)

### Step 1: Clone Repository (5 min)

```bash
# Clone the repository
git clone https://github.com/gitdevdapp/vercel-supabase-web3-start.git
cd vercel-supabase-web3-start

# Install dependencies
npm install
```

**Expected output:** `✓ Installed 1165 packages`

---

### Step 2: Set Up Supabase (15 min)

#### 2.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in:
   - **Name:** `my-web3-app` (or your choice)
   - **Database Password:** Click **"Generate password"** → **SAVE THIS!**
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

#### 2.2 Get Your Credentials

**Navigate:** Settings → API

**Copy these 2 values:**
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIs...
```

✅ **Save these** - you'll need them in Step 3

---

### 🎯 CRITICAL STEP: Run SQL Script (5 min)

**This creates your entire database structure.**

#### 2.3 Run Database Setup

1. **Navigate in Supabase:** SQL Editor (left sidebar) → **"+ New query"**
2. **Open locally:** `scripts/database/MASTER-SUPABASE-SETUP.sql`
3. **Select all:** `Cmd+A` (Mac) or `Ctrl+A` (Windows)
4. **Copy:** `Cmd+C` or `Ctrl+C`
5. **Paste into Supabase SQL Editor:** `Cmd+V` or `Ctrl+V`
6. **Run:** Click **"Run"** button or press `Cmd+Enter` / `Ctrl+Enter`

**Expected output:**
```sql
🚀 DATABASE SETUP COMPLETED SUCCESSFULLY!

Setup Summary:
--------------
total_users: 0
total_profiles: 0
verified_users: 0
users_with_usernames: 0
```

✅ **If you see this = SUCCESS!**  
❌ **If errors:** Run it again (safe to run multiple times)

---

### Step 3: Configure Environment Variables (5 min)

#### 3.1 Create Local Environment File

```bash
cp env-example.txt .env.local
```

#### 3.2 Edit .env.local

Open `.env.local` in your code editor and add the 2 values from Step 2.2:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# CDP Wallets (OPTIONAL - skip for now)
# CDP_API_KEY_ID=
# CDP_API_KEY_SECRET=
# NEXT_PUBLIC_ENABLE_CDP_WALLETS=false
```

**That's it!** Just those 2 lines are required.

---

### Step 4: Test Locally (10 min)

#### 4.1 Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.2
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

#### 4.2 Test Authentication Flow

1. Open http://localhost:3000
2. Click **"Sign Up"** (top right)
3. Enter email + password
4. **Check your email** (arrives in ~30 seconds)
5. Click **"Confirm Email & Access Your Account"**
6. Should redirect to: http://localhost:3000/protected/profile

✅ **If you can see your profile page, IT WORKS!**

**Note:** Your profile was automatically created by the SQL script's triggers.

---

### Step 5: Deploy to Vercel (15 min)

#### 5.1 Push to GitHub

```bash
# Initialize git (if needed)
git add .
git commit -m "Initial commit: My Web3 dApp"

# Create new repo at: https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

#### 5.2 Deploy on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Framework Preset:** Next.js (auto-detected) ✅
5. Click **"Environment Variables"**

#### 5.3 Add Environment Variables to Vercel

**Use the "Paste .env" option** or add manually:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**Important:** Add to **Production**, **Preview**, AND **Development** environments

#### 5.4 Deploy

Click **"Deploy"** and wait 2-3 minutes...

**Expected output:**
```
✓ Build Completed in 8s
✓ Deployment Ready
```

🎉 **Your site is live!** Copy the URL (e.g., `https://your-app.vercel.app`)

---

### Step 6: Update Supabase for Production (5 min)

#### 6.1 Update Site URL

**Navigate in Supabase:** Authentication → URL Configuration

**Update Site URL to your Vercel URL:**
```
https://your-app.vercel.app
```

#### 6.2 Add Production Redirect URLs

**Add these URLs:**
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/auth/confirm
https://your-app.vercel.app/protected/profile
https://your-app.vercel.app/
```

**Click "Save"**

---

### Step 7: Test Production (5 min)

1. Visit your Vercel URL
2. Sign up with a **NEW email** (not the test one)
3. Check email for confirmation
4. Click confirmation link
5. Should see your profile page

✅ **If it works = YOU'RE DONE!** 🎉

---

## 🎨 Part 2: Customization Guide

Now that your app is deployed, make it yours!

### Essential Branding (30 minutes)

#### Logo & Visual Identity

- [ ] **Replace logo**
  - File: `components/ui/images/demo-logo.tsx`
  - Add your logo image to `/public/images/`
  - Update component to use your logo
  - Or keep text-based logo and customize colors

- [ ] **Update site title**
  - File: `app/layout.tsx`
  - Change `title` in metadata
  - Update `description` for SEO

- [ ] **Replace favicon**
  - File: `app/favicon.ico`
  - Use https://favicon.io/favicon-generator/

- [ ] **Customize color scheme**
  - File: `tailwind.config.ts`
  - Update primary/secondary colors
  - Adjust theme colors for light/dark mode

---

### Homepage Content (1 hour)

#### Hero Section
- [ ] **Update main headline**
  - File: `components/hero.tsx`
  - Customize value proposition
  - Update rotating blockchain names

- [ ] **Customize CTAs**
  - Update button text and links
  - Point to your guide/docs
  - Update GitHub repository URL

#### Features
- [ ] **Update feature descriptions**
  - File: `components/features-section.tsx`
  - Highlight YOUR unique features
  - Remove/add features as needed

#### Backed By Section
- [ ] **Replace or remove**
  - File: `components/backed-by-section.tsx`
  - Option 1: Remove section entirely
  - Option 2: Add your actual investors/partners
  - Option 3: Replace with "Supported Chains" section

---

### Authentication & Email (45 minutes)

#### Email Templates
- [ ] **Customize confirmation email**
  - Location: Supabase Dashboard → Authentication → Email Templates
  - Reference: `working-email-templates/supabase-confirm-signup-template.html`
  - Update branding, colors, and copy
  - Add your logo URL
  - **Test email delivery**

- [ ] **Customize password reset email**
  - Same location as above
  - Reference: `working-email-templates/supabase-password-reset-template.html`
  - Match branding to confirmation email

#### Redirect URLs
- [ ] **Update for your domain**
  - Location: Supabase → Authentication → URL Configuration
  - Site URL: `https://yourdomain.com`
  - Add all redirect URLs with your domain
  - Update Vercel environment variables if domain changed

---

### Blockchain Pages (2 hours)

Each blockchain page needs customization:

- [ ] **Flow** - `app/flow/page.tsx`
- [ ] **Apechain** - `app/apechain/page.tsx`
- [ ] **Avalanche** - `app/avalanche/page.tsx`
- [ ] **Stacks** - `app/stacks/page.tsx`
- [ ] **Tezos** - `app/tezos/page.tsx`
- [ ] **ROOT** - `app/root/page.tsx`

**For each page:**
- Update hero titles and descriptions
- Customize "Why Build on [Chain]" sections
- Update CTAs and external links
- Add chain-specific features you've built

---

### User Profile (30 minutes)

- [ ] **Customize profile fields**
  - File: `components/profile-form.tsx`
  - Add/remove fields based on needs
  - Update validation rules

- [ ] **Update profile page layout**
  - File: `app/protected/profile/page.tsx`
  - Customize what users can edit
  - Add additional sections

- [ ] **Profile image storage**
  - Verify Supabase Storage bucket setup
  - Customize image size limits
  - Update storage policies if needed

---

### Advanced Customization (3-5 hours)

#### Web3 Wallet Integration
- [ ] **Configure CDP API keys**
  - Get keys from https://portal.cdp.coinbase.com
  - Add to `.env.local` and Vercel:
    ```
    CDP_API_KEY_ID=your-key
    CDP_API_KEY_SECRET=your-secret
    NEXT_PUBLIC_ENABLE_CDP_WALLETS=true
    ```
  - Test wallet creation flow

- [ ] **Customize wallet UI**
  - Files: `components/wallet/`
  - Update wallet card designs
  - Customize transaction displays

#### Analytics & Monitoring
- [ ] **Add Vercel Analytics**
  - Install: `npm install @vercel/analytics`
  - Add to `app/layout.tsx`

- [ ] **Add error tracking** (optional)
  - Options: Sentry, LogRocket
  - Configure error boundaries

#### SEO Optimization
- [ ] **Update meta tags**
  - File: `app/layout.tsx`
  - Customize Open Graph images
  - Update Twitter card metadata

- [ ] **Add robots.txt**
  - Create `public/robots.txt`
  - Configure search engine indexing

- [ ] **Create sitemap**
  - Add `app/sitemap.ts`
  - List all public pages

#### Custom Domain
- [ ] **Configure in Vercel**
  - Settings → Domains
  - Add your custom domain
  - Configure DNS records

- [ ] **Update Supabase**
  - Change Site URL to custom domain
  - Update all redirect URLs
  - Test authentication flow

- [ ] **Update environment variables**
  - Add `NEXT_PUBLIC_APP_URL` with custom domain
  - Redeploy application

---

## 🧪 Testing After Customization

### Functionality Tests
- [ ] Sign up new account with real email
- [ ] Confirm email → Should redirect correctly
- [ ] Edit profile → Should save changes
- [ ] Upload profile image → Should work
- [ ] Test all blockchain pages → Should load
- [ ] Test wallet creation (if enabled)
- [ ] Test theme switcher (dark/light)
- [ ] Test mobile responsive design

### Visual Tests
- [ ] Check logo appears correctly (light + dark mode)
- [ ] Verify color scheme is consistent
- [ ] Check all CTAs point to correct URLs
- [ ] Verify email templates display properly
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

### SEO Tests
- [ ] Verify page titles
- [ ] Check meta descriptions
- [ ] Test Open Graph preview (LinkedIn, Twitter)
- [ ] Validate schema.org markup

---

## 🆘 Troubleshooting

### Build Failed on Vercel
→ Check environment variables are added to all 3 environments (Production, Preview, Development)

### Email Not Arriving
→ Check spam folder, wait 2 minutes, try different email provider (Gmail works best)

### Profile Not Created After Signup
→ Verify SQL script ran successfully in Step 2.3, check Supabase logs

### "Invalid API Key" Error
→ Double-check environment variable names are EXACT (including `NEXT_PUBLIC_` prefix)

### Dark Mode Not Working
→ Clear browser cache, check browser console for errors

### Wallet Creation Fails
→ Verify CDP API keys are correct and added to all Vercel environments

---

## 💡 Quick Customization Levels

Choose based on your timeline:

### Level 1: Basic (1 hour)
- Logo + site title
- Homepage hero text
- Email templates
- Deploy

### Level 2: Branded (3 hours)
- Everything in Level 1
- Color scheme
- All homepage sections
- Blockchain pages (basic updates)
- Custom domain

### Level 3: Complete (8+ hours)
- Everything in Level 2
- Full UI/UX customization
- Advanced features
- Analytics & monitoring
- SEO optimization
- Comprehensive testing

---

## 📚 Additional Resources

- **[Complete Deployment Guide](./DEPLOYMENT.md)** - Detailed technical documentation
- **[Verification Summary](./VERIFICATION-SUMMARY.md)** - Testing results and QA
- **[Supabase Docs](https://supabase.com/docs)** - Database & auth reference
- **[Vercel Docs](https://vercel.com/docs)** - Deployment platform guide
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation

---

## 🎯 Pro Tips

1. **Start Small** - Get Level 1 deployed first, then iterate
2. **Test Often** - Deploy to preview environments frequently
3. **Keep Backups** - Use Git branches for major changes
4. **Document Changes** - Keep notes on customizations
5. **User Feedback** - Launch early, gather feedback, improve

---

## 📊 What You Built

With this template, you have:

- ✅ **Enterprise-grade Authentication** - Secure email/password with confirmation
- ✅ **User Management** - Profiles, settings, image uploads
- ✅ **PostgreSQL Database** - Production-ready with RLS
- ✅ **Multi-Chain Support** - 6 blockchain ecosystems
- ✅ **Web3 Wallets** - Optional Coinbase CDP integration
- ✅ **Modern UI** - Responsive design with dark/light mode
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Global CDN** - Vercel edge network
- ✅ **Zero Cost to Start** - All services have free tiers

---

## 🙏 Contributing

Found a bug? Have a suggestion? Want to add a feature?

- **Issues:** https://github.com/gitdevdapp/vercel-supabase-web3-start/issues
- **Discussions:** https://github.com/gitdevdapp/vercel-supabase-web3-start/discussions

---

## 📄 License

This template is open source and free to use. See [LICENSE](../LICENSE) for details.

---

**Ready to build?** Clone the repo and follow Part 1 to deploy in 60 minutes! 🚀

**Questions?** Check the troubleshooting section or review the complete deployment guide.

**Built something cool?** We'd love to see it! Share in the discussions.

