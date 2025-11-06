# Initial Authentication and Production Deployment Guide

## 📖 Overview

This guide explains how to properly deploy your Next.js + Supabase + Web3 app to Vercel production and fix email authentication issues.

## 🚨 Critical Issue Fixed

**The Problem**: Email authentication links redirect to `localhost:3000` instead of your production domain.

**The Root Cause**: You uploaded your `.env.local` file directly to Vercel instead of configuring environment variables properly.

## 📋 Quick Start

If you're seeing email auth redirect to localhost, follow these steps:

### 1. Configure Vercel Environment Variables
Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://vatseyhqszmsnlvommxu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=https://your-production-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret
```

### 2. Configure Supabase Redirect URLs
Go to Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://your-production-domain.vercel.app
```

**Redirect URLs:**
```
https://your-production-domain.vercel.app/auth/callback
https://your-production-domain.vercel.app/auth/confirm
https://your-production-domain.vercel.app/protected/profile
```

### 3. Redeploy
```bash
git commit -m "Trigger production redeploy"
git push origin main
```

## 📚 Complete Documentation

### [Production Deployment and Email Auth Fix](PRODUCTION_DEPLOYMENT_AND_EMAIL_AUTH_FIX.md)
Complete guide explaining:
- Why uploading `.env.local` breaks production
- How Vercel deployments work
- Step-by-step email authentication fix
- Environment variable configuration

### [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
Quick checklist for:
- Pre-deployment verification
- Environment variable setup
- Post-deployment testing
- Emergency rollback procedures

### [Troubleshooting Guide](TROUBLESHOOTING.md)
Solutions for common issues:
- Email auth redirect problems
- Environment variable issues
- Supabase connection failures
- Wallet feature problems

## 🔍 Current Status

### ✅ What's Working
- Local development with proper authentication
- Vercel build process (after recent fixes)
- Supabase database connectivity

### ❌ Current Issues
- Email authentication redirects to localhost in production
- Environment variables not properly configured in Vercel

## 🚀 Next Steps

1. **Follow the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** to fix email auth
2. **Test authentication flows** in production
3. **Verify wallet functionality** works
4. **Monitor deployment logs** for any remaining issues

## 💡 Key Takeaways

1. **Never upload `.env.local`** to Vercel - use their Environment Variables UI
2. **Configure Supabase URLs** for production domains, not localhost
3. **Test authentication** in production after every deployment
4. **Monitor logs** in both Vercel and Supabase dashboards

## 📞 Need Help?

If you encounter issues:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review your Vercel environment variables
3. Verify Supabase URL configuration
4. Check deployment logs for errors

---

**Remember**: Production deployment requires different configuration than local development. This guide shows you exactly how to make it work!
