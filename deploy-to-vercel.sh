#!/bin/bash

# Deploy CDP Wallets to Production Vercel
# This script deploys the cleaned, production-ready codebase to Vercel
# and sets all required environment variables for devdapp.com
#
# IMPORTANT: This script reads credentials from vercel-env-variables.txt
# Make sure that file exists in the project root before running.

set -e  # Exit on error

echo "🚀 Deploying DevDapp to Production Vercel"
echo "=========================================="
echo ""
echo "📅 Deployment Date: $(date)"
echo "🌍 Domain: devdapp.com"
echo "🔗 Git: $(git log --oneline -1)"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if vercel-env-variables.txt exists
if [ ! -f "vercel-env-variables.txt" ]; then
    echo "❌ vercel-env-variables.txt not found in project root"
    echo "   This file should contain all production credentials"
    exit 1
fi

# Source environment variables from vercel-env-variables.txt
# This file is in .gitignore for security
source vercel-env-variables.txt 2>/dev/null || {
    echo "⚠️  Could not source vercel-env-variables.txt"
    echo "   Make sure the file exists and contains valid shell syntax"
}

# Check if logged in to Vercel
if ! vercel whoami 2>/dev/null; then
    echo "📋 Step 0: Vercel Authentication Required"
    echo "=============================================="
    echo "Please log in to Vercel with:"
    echo "  vercel login"
    echo ""
    vercel login
fi

echo "📋 Step 1: Setting environment variables in Vercel..."
echo ""

# Function to set env var in Vercel from environment
set_env_var() {
    local key=$1
    local var_name=${2:-$key}  # Variable name in environment, defaults to key
    
    # Get value from environment variable
    local value="${!var_name}"
    
    if [ -z "$value" ]; then
        echo "  ⚠️  Skipping $key (no value found for $var_name)"
        return
    fi
    
    echo "  Setting $key..."
    # Try to remove first (in case it exists), then add
    vercel env rm "$key" production --yes 2>/dev/null || true
    echo "$value" | vercel env add "$key" production --yes 2>/dev/null || \
    echo "  ⚠️  Could not set $key (may already exist)"
}

# Supabase Configuration
echo ""
echo "📦 Supabase Configuration..."
set_env_var "NEXT_PUBLIC_SUPABASE_URL"
set_env_var "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
set_env_var "SUPABASE_SERVICE_ROLE_KEY"

# CDP Configuration
echo ""
echo "🔐 CDP Configuration..."
set_env_var "CDP_API_KEY_ID"
set_env_var "CDP_API_KEY_SECRET"
set_env_var "CDP_WALLET_SECRET"

# Application URLs
echo ""
echo "🌐 Application URLs..."
set_env_var "NEXT_PUBLIC_APP_URL"
set_env_var "NEXT_PUBLIC_SITE_URL"

# Network & Feature Flags
echo ""
echo "⚙️  Network & Features..."
set_env_var "NETWORK"
set_env_var "NEXT_PUBLIC_WALLET_NETWORK"
set_env_var "NEXT_PUBLIC_ENABLE_CDP_WALLETS"
set_env_var "NEXT_PUBLIC_ENABLE_AI_CHAT"
set_env_var "NEXT_PUBLIC_ENABLE_WEB3_AUTH"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "=============================================="
echo "📦 Step 2: Verifying build..."
echo "=============================================="
echo ""

# Run local build verification
npm run build || {
    echo "❌ Build failed. Check errors above."
    exit 1
}

echo ""
echo "=============================================="
echo "🚀 Step 3: Deploying to Production..."
echo "=============================================="
echo ""

# Deploy to production
vercel --prod --confirm

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🧪 Post-Deployment Verification:"
echo ""
echo "1. Check deployment status:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Test your deployment:"
echo "   https://devdapp.com"
echo ""
echo "3. Login and test ERC721 deployment:"
echo "   https://devdapp.com/auth/login"
echo "   Then navigate to: https://devdapp.com/protected/profile"
echo ""
echo "4. Verify environment variables:"
echo "   vercel env list --prod"
echo ""
echo "5. View deployment logs:"
echo "   vercel logs --follow"
echo ""
echo "📊 Key Features to Test:"
echo "   ✓ User authentication (Supabase)"
echo "   ✓ Wallet creation (CDP)"
echo "   ✓ ERC721 deployment (Profile page)"
echo "   ✓ Wallet funding (base-sepolia testnet)"
echo ""

