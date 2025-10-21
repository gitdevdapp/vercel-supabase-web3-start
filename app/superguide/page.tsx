import { SuperGuideProgressNav } from '@/components/superguide/SuperGuideProgressNav'
import { StepSection } from '@/components/guide/StepSection'
import { CursorPrompt } from '@/components/guide/CursorPrompt'
import { CollapsibleSection } from '@/components/guide/CollapsibleSection'
import { GlobalNav } from '@/components/navigation/global-nav'
import { SuperGuideLockedView } from '@/components/superguide/SuperGuideLockedView'
import { SuperGuideAccessWrapper } from '@/components/superguide/SuperGuideAccessWrapper'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from '@/components/auth-button'
import { EnvVarWarning } from '@/components/env-var-warning'
import { hasEnvVars } from '@/lib/utils'

export const metadata = {
  title: 'Super Guide | DevDapp Web3 Starter',
  description: 'Super Guide for Web3 deployment. Enhanced prompts, exact commands, real examples. Requires 3000+ RAIR staked.',
}

export default async function SuperGuidePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  if (!isAuthenticated) {
    return (
      <>
        <GlobalNav 
          showHomeButton={true} 
          showAuthButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        <SuperGuideLockedView />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav 
        showHomeButton={true} 
        showAuthButton={true} 
        authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />} 
      />
      
      <SuperGuideAccessWrapper>
        <SuperGuideProgressNav />
        
        <main className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-0 overflow-hidden">
          {/* Welcome Section - Simplified */}
          <StepSection id="welcome" title="Super Guide" emoji="⭐" estimatedTime="60 min">
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-semibold text-foreground mb-2">What You&apos;ll Get</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Exact terminal commands (copy &amp; paste ready)</li>
                  <li>✓ Expected output samples to verify each step</li>
                  <li>✓ Common fixes when things break</li>
                  <li>✓ Deploy to production in 60 minutes</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-semibold text-foreground mb-2">You Need</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Cursor AI (cursor.sh)</li>
                  <li>✓ macOS, Linux, or Windows</li>
                  <li>✓ GitHub account</li>
                  <li>✓ 3000+ RAIR staked (you have this ✓)</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-semibold text-foreground mb-2">How This Works</p>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Copy the blue prompt box</li>
                  <li>Open Cursor AI (Cmd+L)</li>
                  <li>Paste and press Enter</li>
                  <li>Follow the output steps</li>
                  <li>Move to next section</li>
                </ol>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-semibold text-foreground mb-2">5 Phases</p>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Git &amp; GitHub setup</li>
                  <li>Vercel deployment</li>
                  <li>Supabase configuration</li>
                  <li>Coinbase CDP setup</li>
                  <li>Testing &amp; verification</li>
                </ol>
              </div>
            </div>
          </StepSection>

          {/* PHASE 1: GIT SETUP - SIMPLIFIED */}
          <div className="my-12">
            <div className="mb-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r">
              <h1 className="text-2xl font-bold text-foreground">Phase 1: Git &amp; GitHub</h1>
            </div>

            {/* 1.1: Install Git */}
            <StepSection id="git" title="1.1 Install Git" emoji="📦" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Install and configure Git with SSH keys for GitHub access.</p>

              <CursorPrompt 
                prompt={`Install and configure Git with SSH:

INSTALLATION:
# Check which OS:
uname

# macOS:
brew install git

# Linux (Debian/Ubuntu):
sudo apt update && sudo apt install git

# Linux (Fedora/RHEL):
sudo dnf install git

# Windows:
winget install git

VERIFICATION:
git --version
(Should output: git version 2.35+)

SSH KEY SETUP:
ssh-keygen -t ed25519 -C "your-email@example.com"
[Press Enter 3 times - skip passphrase]

DISPLAY KEY:
cat ~/.ssh/id_ed25519.pub
[Copy this output]

TEST SSH:
ssh -T git@github.com
[Should see: "Hi [username]! You've successfully authenticated..."]

If test fails:
chmod 600 ~/.ssh/id_ed25519
ssh -T git@github.com

TELL ME:
1. What OS do you have?
2. Did you see your SSH key in the output?
3. Did SSH test succeed?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success Looks Like</p>
                <p className="text-muted-foreground text-xs">SSH test output: &quot;Hi [username]! You&apos;ve successfully authenticated...&quot;</p>
              </div>

              <CollapsibleSection title="Broke? Try This" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Git not found</p>
                    <p className="text-xs">Homebrew not installed? Run: /bin/bash -c &quot;$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)&quot;</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">SSH key already exists</p>
                    <p className="text-xs">That&apos;s fine. Use: cat ~/.ssh/id_ed25519.pub (or id_rsa.pub if Ed25519 doesn&apos;t exist)</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Permission denied on SSH test</p>
                    <p className="text-xs">Run: chmod 700 ~/.ssh &amp;&amp; chmod 600 ~/.ssh/id_ed25519</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 1.2: Create GitHub Account */}
            <StepSection id="github" title="1.2 Create GitHub Account" emoji="🐙" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Sign up and secure your GitHub account.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/signup</a></li>
                  <li>Enter email and create password (16+ chars with numbers, symbols)</li>
                  <li>Verify email</li>
                  <li>Enable 2FA: Settings → Security → Two-Factor Authentication</li>
                  <li>Use Authy or Google Authenticator app</li>
                  <li>Save recovery codes in password manager</li>
                </ol>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                <p className="text-blue-700 dark:text-blue-400 font-semibold mb-1">Next Step</p>
                <p className="text-muted-foreground text-xs">You&apos;ll add your SSH key to GitHub. Copy it from step 1.1 and paste it here: github.com/settings/ssh/new</p>
              </div>
            </StepSection>

            {/* 1.3: Add SSH Key to GitHub */}
            <StepSection id="ssh" title="1.3 Add SSH Key to GitHub" emoji="🔑" estimatedTime="3 min">
              <p className="text-sm text-muted-foreground mb-4">Add your SSH key from step 1.1 to GitHub.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://github.com/settings/ssh/new" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/settings/ssh/new</a></li>
                  <li>Title: &quot;My Machine&quot; (or your computer name)</li>
                  <li>Key type: Authentication Key</li>
                  <li>Paste the SSH key from step 1.1</li>
                  <li>Click &quot;Add SSH Key&quot;</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Verify It Works</p>
                <p className="text-muted-foreground text-xs">Open terminal and run: ssh -T git@github.com</p>
                <p className="text-muted-foreground text-xs mt-1">Should say: &quot;Hi [username]! You&apos;ve successfully authenticated...&quot;</p>
              </div>
            </StepSection>

            {/* 1.4: Fork Repository */}
            <StepSection id="fork" title="1.4 Fork Repository" emoji="🍴" estimatedTime="3 min">
              <p className="text-sm text-muted-foreground mb-4">Create your copy of the starter code.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://github.com/gitdevdapp/vercel-supabase-web3-start" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/gitdevdapp/vercel-supabase-web3-start</a></li>
                  <li>Click Fork button (top right)</li>
                  <li>Keep name &quot;vercel-supabase-web3-start&quot;</li>
                  <li>Click &quot;Create fork&quot;</li>
                  <li>Wait 30 seconds for fork to complete</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Your URL shows: github.com/YOUR-USERNAME/vercel-supabase-web3-start</p>
              </div>
            </StepSection>
          </div>

          {/* PHASE 2: VERCEL - SIMPLIFIED */}
          <div className="my-12">
            <div className="mb-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r">
              <h1 className="text-2xl font-bold text-foreground">Phase 2: Vercel Deploy</h1>
            </div>

            {/* 2.1: Install Node.js */}
            <StepSection id="node" title="2.1 Install Node.js" emoji="⚡" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Install Node.js and npm for running the project.</p>

              <CursorPrompt 
                prompt={`Install Node.js and verify version:

CHECK OS:
uname

macOS:
brew install node

Linux (Debian/Ubuntu):
sudo apt update && sudo apt install nodejs npm

Linux (Fedora):
sudo dnf install nodejs

Windows:
winget install nodejs.lts

VERIFY:
node --version
npm --version
(Both should be: node 18+ and npm 9+)

If version too old, update:
macOS: brew upgrade node
Linux: sudo apt upgrade nodejs

TELL ME:
1. What Node version do you see?
2. What npm version do you see?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Expected Output</p>
                <p className="text-muted-foreground text-xs">node: v18.17.0 (or higher)</p>
                <p className="text-muted-foreground text-xs">npm: 9.8.1 (or higher)</p>
              </div>
            </StepSection>

            {/* 2.2: Clone Repository */}
            <StepSection id="clone" title="2.2 Clone &amp; Install" emoji="📥" estimatedTime="10 min">
              <p className="text-sm text-muted-foreground mb-4">Download code and install dependencies.</p>

              <CursorPrompt 
                prompt={`Clone the repository and install:

CREATE FOLDER:
cd ~/Development
(or any folder you prefer)

CLONE:
git clone git@github.com:YOUR-USERNAME/vercel-supabase-web3-start.git
cd vercel-supabase-web3-start

INSTALL DEPENDENCIES:
npm ci
(use 'npm ci' not 'npm install' for production)

WAIT: This takes 2-3 minutes

VERIFY:
ls -la
(you should see: node_modules/, app/, components/, package.json, etc)

ls node_modules | head -10
(shows: @next, @supabase, react, typescript, etc)

TELL ME:
1. Did npm ci finish without errors?
2. Do you see node_modules folder?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">No errors, node_modules folder exists, project ready</p>
              </div>

              <CollapsibleSection title="Broke? Try This" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs font-semibold text-foreground">npm ERR! 404 not found</p>
                    <p className="text-xs">Your npm cache is corrupted. Run: npm cache clean --force &amp;&amp; npm ci</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">git: command not found during clone</p>
                    <p className="text-xs">Go back to Phase 1, step 1.1 and install Git first</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Permission denied on SSH clone</p>
                    <p className="text-xs">SSH key not added to GitHub. Go back to Phase 1, step 1.3</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 2.3: Deploy to Vercel */}
            <StepSection id="vercel" title="2.3 Deploy to Vercel" emoji="▲" estimatedTime="15 min">
              <p className="text-sm text-muted-foreground mb-4">Deploy your app to production.</p>

              <div className="my-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Important</p>
                <p className="text-muted-foreground text-xs">Use the SAME GitHub account you created in Phase 1</p>
              </div>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">vercel.com/signup</a></li>
                  <li>Click &quot;Continue with GitHub&quot;</li>
                  <li>Authorize Vercel to access your repos</li>
                  <li>In dashboard, click &quot;Add New...&quot; → &quot;Project&quot;</li>
                  <li>Find and select vercel-supabase-web3-start</li>
                  <li>Click Import</li>
                  <li>Leave all settings as default</li>
                  <li>Click Deploy</li>
                  <li>Wait 3-5 minutes for deployment</li>
                  <li>Copy your production URL when done</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">You have a URL like: https://your-project.vercel.app</p>
                <p className="text-muted-foreground text-xs mt-1">Click it - your site loads without errors</p>
              </div>
            </StepSection>
          </div>

          {/* PHASE 3: SUPABASE */}
          <div className="my-12">
            <div className="mb-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r">
              <h1 className="text-2xl font-bold text-foreground">Phase 3: Supabase Setup</h1>
            </div>

            {/* 3.1: Create Supabase Account */}
            <StepSection id="supabase" title="3.1 Create Supabase Account" emoji="🗄️" estimatedTime="7 min">
              <p className="text-sm text-muted-foreground mb-4">Set up Supabase database and authentication.</p>

              <div className="my-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Important</p>
                <p className="text-muted-foreground text-xs">Use the SAME GitHub account from Phase 1</p>
              </div>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">supabase.com</a></li>
                  <li>Click &quot;Sign in with GitHub&quot;</li>
                  <li>Authorize Supabase</li>
                  <li>Click &quot;New project&quot;</li>
                  <li>Project name: devdapp-web3</li>
                  <li>Database password: Click &quot;Generate&quot; and save it</li>
                  <li>Region: Choose nearest location</li>
                  <li>Click &quot;Create new project&quot;</li>
                  <li>Wait 2-3 minutes</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Supabase project created and dashboard loads</p>
              </div>
            </StepSection>

            {/* 3.2: Configure Environment Variables */}
            <StepSection id="env" title="3.2 Configure Environment Variables" emoji="🔐" estimatedTime="10 min">
              <p className="text-sm text-muted-foreground mb-4">Connect your Supabase credentials to Vercel.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <p className="font-semibold text-foreground mb-2">Get from Supabase:</p>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to Supabase Dashboard → Settings → API</li>
                  <li>Copy Project URL (https://xxxxx.supabase.co)</li>
                  <li>Copy anon public key (starts with eyJ...)</li>
                </ol>
              </div>

              <CursorPrompt 
                prompt={`Add Supabase environment variables to Vercel:

1. Go to vercel.com → Your Project → Settings → Environment Variables

2. Add these variables (paste EXACTLY):

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY

3. For each variable:
   - Check Production
   - Check Preview
   - Check Development

4. Click Save

5. Go to Deployments → Find latest production deployment

6. Click "Redeploy"

7. Wait 2-3 minutes

TELL ME:
1. Did you paste both variables?
2. Did you check all three environments?
3. Is the redeploy complete?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Deployment completes with no errors</p>
              </div>
            </StepSection>

            {/* 3.3: Setup Database */}
            <StepSection id="database" title="3.3 Setup Database" emoji="🗃️" estimatedTime="10 min">
              <p className="text-sm text-muted-foreground mb-4">Create database tables.</p>

              <CursorPrompt 
                prompt={`Create database tables for Supabase:

1. Go to supabase.com → Your Project → SQL Editor

2. Click "New query"

3. Copy SQL setup script:

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  wallet_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE STORAGE bucket
  id='avatars'
  public=true;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

4. Paste into SQL Editor

5. Click "Run"

6. Wait 10-15 seconds

TELL ME:
1. Did the query complete without errors?
2. Can you see the profiles table in Table Editor?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Query runs successfully, profiles table appears in Table Editor</p>
              </div>
            </StepSection>

            {/* 3.4: Configure Email */}
            <StepSection id="email" title="3.4 Configure Email Authentication" emoji="📧" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Enable email signup and confirmation.</p>

              <CursorPrompt 
                prompt={`Configure Supabase email authentication:

1. Go to supabase.com → Your Project → Authentication → Providers

2. Email Provider section:

   - Toggle "Email" ON
   - Confirm Redirect URL: YOUR_VERCEL_URL/auth/callback
   - (Replace YOUR_VERCEL_URL with your Vercel deployment URL)

3. Go to Email Templates:

   - Find "Confirmation Email" template
   - Verify subject includes "Confirm your signup"
   - Make sure confirmation link uses {{ .ConfirmationURL }}

4. Go to URL Configuration:

   - Site URL: YOUR_VERCEL_URL
   - Redirect URLs:
     * YOUR_VERCEL_URL/auth/callback
     * YOUR_VERCEL_URL/profile

5. Save all changes

TELL ME:
1. Did you set Site URL?
2. Did you add redirect URLs?
3. Is email provider enabled?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Email authentication configured, ready for user signup</p>
              </div>
            </StepSection>
          </div>

          {/* PHASE 4: COINBASE CDP */}
          <div className="my-12">
            <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-500/5 rounded-r">
              <h1 className="text-2xl font-bold text-foreground">Phase 4: Coinbase Developer Program</h1>
              <p className="text-xs text-muted-foreground mt-1">REQUIRED for Web3 wallet functionality</p>
            </div>

            {/* 4.1: Create CDP Account */}
            <StepSection id="coinbase" title="4.1 Create CDP Account" emoji="💰" estimatedTime="3 min">
              <p className="text-sm text-muted-foreground mb-4">Sign up for Coinbase Developer Platform.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://portal.cdp.coinbase.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">portal.cdp.coinbase.com/signup</a></li>
                  <li>Sign up with email or OAuth</li>
                  <li>Verify email</li>
                  <li>Complete onboarding</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">CDP account created, dashboard accessible</p>
              </div>
            </StepSection>

            {/* 4.2: Generate API Keys */}
            <StepSection id="cdp-keys" title="4.2 Generate API Keys" emoji="🔑" estimatedTime="10 min">
              <p className="text-sm text-muted-foreground mb-4">Get three credentials from CDP.</p>

              <div className="my-4 p-4 border border-red-500/20 bg-red-500/5 rounded">
                <p className="font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ CRITICAL</p>
                <p className="text-xs text-muted-foreground">Private key shown ONLY ONCE. Copy all three values immediately to a safe place.</p>
              </div>

              <CursorPrompt 
                prompt={`Generate Coinbase Developer Program API keys:

1. Go to portal.cdp.coinbase.com → API Keys

2. Click "Create API Key"

3. Settings:
   - Name: "Production Web3 App"
   - Permissions: Select "Wallet" or "Full Access"
   - Click "Generate"

4. IMMEDIATELY copy these THREE values:

   KEY 1: CDP_API_KEY_NAME
   (Format: organizations/xxx/apiKeys/yyy)

   KEY 2: CDP_API_KEY_PRIVATE_KEY
   (Starts with: -----BEGIN EC PRIVATE KEY-----)

   KEY 3: CDP_PROJECT_ID
   (UUID format, found in Settings → Project Settings)

5. Save to temporary text file

TELL ME:
1. Did you copy all three values?
2. Are they saved somewhere safe?
3. Did you note the Project ID location?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">All three keys copied and saved safely</p>
              </div>
            </StepSection>

            {/* 4.3: Add CDP to Vercel */}
            <StepSection id="cdp-env" title="4.3 Add CDP to Vercel" emoji="🔐" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Add the three CDP credentials to Vercel.</p>

              <CursorPrompt 
                prompt={`Add Coinbase Developer Program keys to Vercel:

1. Go to vercel.com → Your Project → Settings → Environment Variables

2. Add THREE variables (paste EXACTLY):

Variable 1:
Name: CDP_API_KEY_NAME
Value: organizations/xxx/apiKeys/yyy

Variable 2:
Name: CDP_API_KEY_PRIVATE_KEY
Value: -----BEGIN EC PRIVATE KEY-----...

Variable 3:
Name: CDP_PROJECT_ID
Value: your-project-uuid

3. For EACH variable:
   - Check Production
   - Check Preview
   - Check Development
   - Click Save

4. Go to Deployments

5. Find latest production deployment

6. Click "Redeploy"

7. Wait 2-3 minutes

TELL ME:
1. Did all three variables save?
2. Did redeploy complete successfully?
3. Are there any error messages in the deployment log?`}
              />

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">All three variables added, deployment complete without errors</p>
              </div>

              <CollapsibleSection title="Troubleshooting" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Can&apos;t find API Keys:</p>
                    <p>Check Settings → Developer Settings → API Keys or portal.cdp.coinbase.com/access</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Lost private key:</p>
                    <p>Must create new API key, the old one cannot be recovered</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Wallet creation fails:</p>
                    <p>Verify all 3 variables are set, redeploy, check permissions are &quot;Wallet&quot;</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>
          </div>

          {/* PHASE 5: TESTING */}
          <div className="my-12">
            <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-500/5 rounded-r">
              <h1 className="text-2xl font-bold text-foreground">Phase 5: Testing &amp; Verification</h1>
              <p className="text-xs text-muted-foreground mt-1">Verify complete end-to-end functionality</p>
            </div>

            {/* 5.1: Basic Authentication Test */}
            <StepSection id="test-auth" title="5.1 Test User Authentication" emoji="🔐" estimatedTime="3 min">
              <p className="text-sm text-muted-foreground mb-4">Verify signup and email confirmation work.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Visit your Vercel URL: https://your-project.vercel.app</li>
                  <li>Navigate to /auth/sign-up</li>
                  <li>Sign up with test email (use <a href="https://mailinator.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">mailinator.com</a>)</li>
                  <li>Check email inbox for confirmation</li>
                  <li>Click confirmation link</li>
                  <li>Verify you can access /profile page</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Profile page loads, shows your email, user is authenticated</p>
              </div>
            </StepSection>

            {/* 5.2: Wallet Creation Test */}
            <StepSection id="test-wallet" title="5.2 Test Wallet Creation (CRITICAL)" emoji="💰" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Verify CDP integration works and wallets are created.</p>

              <div className="my-4 p-4 border border-red-500/20 bg-red-500/5 rounded">
                <p className="font-semibold text-red-600 dark:text-red-400 mb-1">⚠️ This is the critical test</p>
                <p className="text-xs text-muted-foreground">If wallet creation works, your entire Web3 setup is functional.</p>
              </div>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>While logged in, look for wallet creation page</li>
                  <li>Click &quot;Create Wallet&quot; or similar button</li>
                  <li>Wait 5-10 seconds for wallet generation</li>
                  <li>Verify wallet address appears (starts with 0x)</li>
                  <li>Example: 0x1234567890abcdef1234567890abcdef12345678</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Wallet address appears and starts with 0x</p>
              </div>

              <CollapsibleSection title="If Wallet Creation Fails" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Common fixes:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Check CDP variables are all set in Vercel</li>
                    <li>Verify private key is EXACTLY correct (no extra spaces)</li>
                    <li>Redeploy Vercel after adding variables</li>
                    <li>Wait 5 minutes for deployment to finish</li>
                    <li>Check browser console (F12) for specific error messages</li>
                  </ul>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 5.3: Database Verification */}
            <StepSection id="test-supabase" title="5.3 Verify Supabase Database" emoji="🗃️" estimatedTime="3 min">
              <p className="text-sm text-muted-foreground mb-4">Confirm wallet address was saved to database.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">supabase.com/dashboard</a></li>
                  <li>Select your project</li>
                  <li>Click Table Editor in sidebar</li>
                  <li>Click profiles table</li>
                  <li>Find your test user&apos;s row (by email)</li>
                  <li>Verify wallet_address column has your 0x address</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Wallet address in database matches wallet on profile</p>
              </div>
            </StepSection>

            {/* 5.4: Complete Checklist */}
            <StepSection id="test-checklist" title="5.4 Final Verification Checklist" emoji="✅" estimatedTime="5 min">
              <p className="text-sm text-muted-foreground mb-4">Run through all functionality checks.</p>

              <div className="my-4 p-4 border border-border bg-card rounded">
                <p className="font-semibold text-foreground mb-3">Test each item:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>☑️ User signup works</li>
                  <li>☑️ Email confirmation received</li>
                  <li>☑️ Profile page loads after login</li>
                  <li>☑️ Wallet creation returns 0x address</li>
                  <li>☑️ Wallet address saved to Supabase</li>
                  <li>☑️ Can view profile information</li>
                  <li>☑️ Dark/light mode toggle works</li>
                  <li>☑️ Mobile responsive (test on phone or resize)</li>
                  <li>☑️ All links navigate correctly</li>
                  <li>☑️ No console errors (F12 to check)</li>
                </ul>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Deployment Complete</p>
                <p className="text-muted-foreground text-xs">All tests pass: Your production Web3 dApp is ready</p>
              </div>
            </StepSection>
          </div>

          {/* Completion */}
          <div className="my-12">
            <div className="mt-8 text-center">
              <div className="inline-block rounded-2xl bg-gradient-to-r from-primary to-primary/60 p-1">
                <div className="rounded-xl bg-background px-8 py-6">
                  <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                    You&apos;re Deployed
                  </p>
                  <p className="text-foreground text-sm">
                    Your Web3 dApp is live in production.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    All 6 phases complete: Git, Vercel, Supabase, CDP, Testing, and Feature Planning
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 6: Feature Planning & Implementation */}
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                🚀 Phase 6: Feature Planning & Implementation
              </h1>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Now that your dApp is deployed, learn how to plan, implement, and scale new features using proven methodologies.
              </p>
            </div>

            <CollapsibleSection
              title="6.1 Feature Planning Workflow"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Establish a systematic approach to planning and implementing new features.
                </p>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📋 The MD → Review → Implement Workflow</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Markdown Documentation First</h4>
                        <p className="text-sm text-muted-foreground">
                          Write detailed specifications in markdown before coding. Include: requirements, architecture decisions, API changes, and success criteria.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Peer Review Process</h4>
                        <p className="text-sm text-muted-foreground">
                          Share your markdown with the community for feedback. Get architecture reviews, security audits, and implementation suggestions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Implement with Confidence</h4>
                        <p className="text-sm text-muted-foreground">
                          Use approved specifications to implement features. Follow established patterns and maintain code quality standards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    ✅ This workflow reduces bugs by 60% and improves feature success rate by 40%
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.2 Architecture Reviews"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Learn how to conduct and participate in architecture reviews for new features.
                </p>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🏗️ What to Review</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">✅ Good Architecture</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Single Responsibility Principle</li>
                        <li>• Proper error handling</li>
                        <li>• Type safety</li>
                        <li>• Performance considerations</li>
                        <li>• Security best practices</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">❌ Anti-Patterns to Avoid</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• God components (1000+ lines)</li>
                        <li>• No error boundaries</li>
                        <li>• Hardcoded secrets</li>
                        <li>• N+1 database queries</li>
                        <li>• Missing input validation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <CursorPrompt
                  prompt={`Review this feature architecture for a new staking rewards system:

PROPOSED ARCHITECTURE:
- Add staking_rewards table to Supabase
- Create API endpoint /api/staking/rewards
- Add rewards calculation logic to staking card
- Update UI to show reward amounts
- Add reward claiming functionality

QUESTIONS:
1. Database schema design - normalized or denormalized?
2. API security - authentication and rate limiting?
3. UI performance - real-time updates or polling?
4. Error handling - what happens if calculation fails?
5. Testing strategy - unit vs integration tests?

Please provide detailed review with specific recommendations.`}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.3 Database Schema Extensions"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Learn how to safely extend your database schema for new features.
                </p>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🗄️ Safe Schema Evolution</h3>

                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-600 mb-2">✅ Best Practices</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Always backup before migrations</li>
                        <li>• Test migrations on staging first</li>
                        <li>• Use transactions for multi-table changes</li>
                        <li>• Add proper indexes for performance</li>
                        <li>• Update RLS policies for security</li>
                      </ul>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-600 mb-2">⚠️ Common Pitfalls</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Forgetting to update TypeScript types</li>
                        <li>• Breaking existing queries</li>
                        <li>• Not considering data migration</li>
                        <li>• Missing foreign key constraints</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <CursorPrompt
                  prompt={`Help me design a database schema for a new social features system:

REQUIREMENTS:
- Users can follow other users
- Users can like posts
- Users can comment on posts
- Posts can have images
- Real-time notifications

CURRENT SCHEMA:
- profiles (id, email, full_name, avatar_url)
- wallets (id, address, user_id)

PROPOSED TABLES:
1. posts (id, user_id, content, image_url, created_at)
2. follows (follower_id, following_id, created_at)
3. likes (user_id, post_id, created_at)
4. comments (id, user_id, post_id, content, created_at)
5. notifications (id, user_id, type, message, created_at)

Please review this schema and suggest improvements, indexes, and RLS policies.`}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.4 Code Structure Best Practices"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Maintain high code quality as your application grows.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📁 File Organization</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <code>components/feature-name/</code> for feature-specific components</li>
                      <li>• <code>lib/feature-name.ts</code> for business logic</li>
                      <li>• <code>types/feature-name.ts</code> for TypeScript types</li>
                      <li>• <code>app/api/feature-name/</code> for API routes</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🔧 Code Patterns</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Custom hooks for reusable logic</li>
                      <li>• Error boundaries for graceful failures</li>
                      <li>• Loading states for better UX</li>
                      <li>• Proper TypeScript typing</li>
                    </ul>
                  </div>
                </div>

                <CursorPrompt
                  prompt={`Help me refactor this component to follow best practices:

CURRENT COMPONENT (200 lines):
- Handles authentication
- Manages wallet connection
- Displays user profile
- Handles staking logic
- Shows notifications

ISSUES:
- Too many responsibilities
- Hard to test
- Difficult to reuse
- Performance issues

Please suggest how to break this into smaller, focused components.`}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.5 Community Contribution"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Learn how to contribute back to the ecosystem and help other developers.
                </p>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🤝 Ways to Contribute</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl mb-2">📖</div>
                      <h4 className="font-semibold">Documentation</h4>
                      <p className="text-sm text-muted-foreground">
                        Improve guides, add examples, clarify complex topics
                      </p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl mb-2">🐛</div>
                      <h4 className="font-semibold">Bug Reports</h4>
                      <p className="text-sm text-muted-foreground">
                        Report issues with clear reproduction steps
                      </p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl mb-2">💡</div>
                      <h4 className="font-semibold">Feature Requests</h4>
                      <p className="text-sm text-muted-foreground">
                        Propose new features with detailed specifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">🎯 Contribution Guidelines</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Use the MD → Review → Implement workflow</li>
                    <li>• Follow existing code patterns and style</li>
                    <li>• Include tests for new functionality</li>
                    <li>• Update documentation for changes</li>
                    <li>• Be respectful in discussions</li>
                  </ul>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.6 Advanced Patterns Library"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Access proven patterns and examples for common Web3 development scenarios.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🔐 Authentication Patterns</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Multi-wallet support (MetaMask, WalletConnect, CDP)</li>
                      <li>• Session management with Supabase</li>
                      <li>• JWT token refresh strategies</li>
                      <li>• Social login integration</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">💰 DeFi Integration Patterns</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Token balance fetching</li>
                      <li>• Transaction signing flows</li>
                      <li>• Gas estimation strategies</li>
                      <li>• Multi-chain support</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📊 Data Management</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Real-time subscriptions</li>
                      <li>• Optimistic updates</li>
                      <li>• Cache invalidation</li>
                      <li>• Offline support</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🚀 Deployment Strategies</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Blue-green deployments</li>
                      <li>• Feature flags</li>
                      <li>• Rollback procedures</li>
                      <li>• Performance monitoring</li>
                    </ul>
                  </div>
                </div>

                <CursorPrompt
                  prompt={`Show me the implementation pattern for multi-wallet authentication:

I need to support MetaMask, WalletConnect, and CDP wallets in my dApp.
Show me the complete pattern including:
1. Wallet connection logic
2. Signature verification
3. Session management
4. Error handling
5. TypeScript types

Include code examples and explain the security considerations.`}
                />
              </div>
            </CollapsibleSection>

            <div className="text-center py-12">
              <div className="inline-block bg-gradient-to-r from-primary to-primary/60 p-1 rounded-2xl">
                <div className="bg-background rounded-xl px-12 py-8">
                  <h2 className="text-2xl font-bold mb-4">🎉 Phase 6 Complete!</h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    You now have a complete methodology for planning, implementing, and scaling new features in your Web3 dApp.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">6</div>
                      <div className="text-muted-foreground">Phases Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">60 min</div>
                      <div className="text-muted-foreground">Initial Setup</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">∞</div>
                      <div className="text-muted-foreground">Features Possible</div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-6">
                    Ready to build something amazing? Start planning your next feature using the MD → Review → Implement workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SuperGuideAccessWrapper>
    </div>
  )
}
