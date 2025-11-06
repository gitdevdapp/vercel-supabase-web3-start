# Setup CDP Development Environment

## Quick Setup (5 minutes)

### Step 1: Create `.env.local` File

Create a new file named `.env.local` in the project root directory with the following content:

```
# Supabase Configuration - GET VALUES FROM vercel-env-variables.txt
NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_URL]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]

# CDP (Coinbase Developer Platform) Configuration - REQUIRED FOR AUTO-WALLET CREATION
# GET THESE VALUES FROM vercel-env-variables.txt
CDP_API_KEY_ID=[YOUR_CDP_API_KEY_ID]
CDP_API_KEY_SECRET=[YOUR_CDP_API_KEY_SECRET]
CDP_WALLET_SECRET=[YOUR_CDP_WALLET_SECRET]

# Network Configuration
NETWORK=base-sepolia
NEXT_PUBLIC_WALLET_NETWORK=base-sepolia

# Application URL Configuration
NEXT_PUBLIC_APP_URL=https://devdapp.com
NEXT_PUBLIC_SITE_URL=https://devdapp.com

# Feature Flags
NEXT_PUBLIC_ENABLE_CDP_WALLETS=true

# Contract Verification (Optional - for Etherscan/BaseScan)
# GET THIS VALUE FROM vercel-env-variables.txt
ETHERSCAN_API_KEY=[YOUR_ETHERSCAN_API_KEY]
```

### Step 2: Verify File Location

Confirm `.env.local` is in the project root:

```bash
ls -la | grep env.local
# Should output: -rw-r--r--  ... .env.local
```

### Step 3: Restart Development Server

Stop the current dev server and restart it:

```bash
# Kill existing process
npm run dev  # or Ctrl+C if running

# Start fresh
npm run dev
```

You should see:
```
✓ Ready in 2.5s
```

### Step 4: Verify CDP Configuration

Check that environment variables are loaded:

```bash
# Browser Dev Tools Console (F12)
# Navigate to: http://localhost:3000/api/test-supabase

# Or check with a direct API call
curl http://localhost:3000/api/wallet/auto-create \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## Verification Checklist

### ✅ Configuration Verified

- [ ] `.env.local` file created in project root
- [ ] All CDP credentials copied exactly (no typos)
- [ ] Development server restarted
- [ ] Browser shows no red errors in console

### ✅ Testing Auto-Wallet Creation

1. Navigate to: `http://localhost:3000/auth/sign-up`
2. Create a new test account:
   - Email: `test-<timestamp>@mailinator.com` (e.g., `test-nov3-123456@mailinator.com`)
   - Password: Any secure password
3. Confirm email (check mailinator.com)
4. Navigate to `/protected/profile`
5. Expected outcome: Wallet auto-creates automatically

### ✅ Expected Console Output

When wallet creation succeeds:

```javascript
[AutoCreateWallet] Triggering auto-wallet creation
[AutoCreateWallet] Initiating auto-wallet creation
[AutoCreateWallet] Success: {
  wallet_address: "0x...",
  wallet_id: "...",
  wallet_name: "Auto-Wallet-...",
  created: true,
  success: true
}
```

---

## Troubleshooting

### Issue: "Failed to generate wallet. CDP may not be configured."

**Cause**: Environment variables not loaded

**Solution**:
1. Verify `.env.local` exists: `cat .env.local`
2. Restart server: `npm run dev`
3. Check console for errors

### Issue: 401 Unauthorized Error

**Cause**: Invalid CDP credentials

**Solution**:
1. Copy credentials again from `vercel-env-variables.txt`
2. Check for typos or missing characters
3. Restart server

### Issue: Server won't start after adding `.env.local`

**Cause**: Syntax error in env file

**Solution**:
1. Check `.env.local` for valid format
2. No spaces around `=` in variable assignments
3. No quotes around string values

---

## File References

| File | Purpose | Contains |
|------|---------|----------|
| `.env.local` | **Your local copy** | All secrets and credentials |
| `vercel-env-variables.txt` | **Master reference** | Official credentials |
| `.env` | **Git tracked** | Public defaults only |
| `.env.example` | **Documentation** | Example structure |

## Security Notes

⚠️ **IMPORTANT**:
- `.env.local` is in `.gitignore` - it will NOT be committed
- Never commit actual credentials to git
- Secrets in `.env.local` are only for local development
- Production uses Vercel environment variables

---

## What Changed in the Code

The auto-wallet creation endpoint (`app/api/wallet/auto-create/route.ts`) was updated to:

1. **Import env validation**: `import { env } from "@/lib/env"`
2. **Use correct credential names**:
   - `env.CDP_API_KEY_ID` (was `process.env.COINBASE_API_KEY`)
   - `env.CDP_API_KEY_SECRET` (was `process.env.COINBASE_PRIVATE_KEY`)
   - `env.CDP_WALLET_SECRET` (was missing entirely)
3. **Pass credentials to CdpClient**: All three credentials now passed explicitly

This aligns the auto-create endpoint with other wallet endpoints that were already using the correct pattern.

---

## Next Steps

After setup, you can:

1. **Test Auto-Wallet Creation**: Follow verification steps above
2. **Test Auto-Funding**: Wallet should auto-fund with testnet ETH
3. **View on Basescan**: Check transaction on https://sepolia.basescan.org
4. **Explore Features**: Create custom wallets, send funds, etc.

For issues, check `/docs/autowallet/CDP_CREDENTIAL_DIAGNOSIS.md` for detailed diagnostic information.



