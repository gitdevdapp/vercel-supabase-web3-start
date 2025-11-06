import { ProgressNav } from '@/components/guide/ProgressNav'
import { StepSection } from '@/components/guide/StepSection'
import { ExpandableCodeBlock } from '@/components/guide/ExpandableCodeBlock'
import { CollapsibleSection } from '@/components/guide/CollapsibleSection'
import { GlobalNav } from '@/components/navigation/global-nav'
import { GuideLockedView } from '@/components/guide/GuideLockedView'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from '@/components/auth-button'
import { EnvVarWarning } from '@/components/env-var-warning'
import { hasEnvVars } from '@/lib/utils'

export const metadata = {
  title: 'Complete Setup Guide | DevDapp Web3 Starter',
  description: 'Deploy a complete multi-chain Web3 dApp in under 60 minutes using Cursor AI. Copy-paste prompts, no coding required.',
}

export default async function GuidePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  // Show locked view for non-authenticated users
  if (!isAuthenticated) {
    return (
      <>
        <GlobalNav 
          showHomeButton={true} 
          showAuthButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        <GuideLockedView />
      </>
    )
  }

  // Show full guide for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <GlobalNav 
        showHomeButton={true} 
        showAuthButton={true} 
        authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />} 
      />
      <ProgressNav />
      
      <main className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-0 overflow-hidden">
        {/* Welcome Section */}
        <StepSection id="welcome" title="Getting Started" emoji="👋" estimatedTime="2 min">
          <div className="space-y-6">
            <p className="text-lg">
              Deploy a production-ready Web3 dApp in 60 minutes using Cursor AI. Copy prompts, approve commands, done.
            </p>

            {/* Prerequisites */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">Prerequisites</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>☑️ <strong>Cursor AI</strong> - <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Download here</a></li>
                <li>☑️ <strong>Mac</strong> (preferred OS)</li>
                <li>☑️ <strong>GitHub Account</strong> - Your master login for all services</li>
              </ul>
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded text-sm">
                <strong className="text-foreground">🔑 Critical:</strong> <span className="text-muted-foreground">Use the same GitHub account for Vercel and Supabase.</span>
              </div>
            </div>

            {/* 5 Phases Overview */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">5 Phases to Complete</h3>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li><strong>Phase 1: GitHub</strong> - Setup account and fork repository</li>
                <li><strong>Phase 2: Vercel</strong> - Deploy application to production</li>
                <li><strong>Phase 3: Supabase</strong> - Configure database and authentication</li>
                <li><strong>Phase 4: Coinbase Developer Program</strong> - Enable Web3 wallets (REQUIRED)</li>
                <li><strong>Phase 5: Test</strong> - Verify everything works end-to-end</li>
              </ol>
            </div>

            {/* How to Use This Guide */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">How to Use This Guide</h3>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Copy the Cursor AI prompt (blue box)</li>
                <li>Open Cursor AI (<kbd className="px-2 py-1 bg-muted rounded">Cmd+L</kbd>)</li>
                <li>Paste and press <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd></li>
                <li>Approve commands when asked</li>
                <li>Move to next step</li>
              </ol>
            </div>

          </div>
        </StepSection>

        {/* ========== PHASE 1: GITHUB ========== */}
        <div className="my-12">
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Phase 1: GitHub Setup</h1>
            <p className="text-muted-foreground">Configure GitHub as your master login and fork the repository</p>
          </div>

          {/* Step 1.1: Install Git */}
          <StepSection id="git" title="1.1 Install Git" emoji="📦" estimatedTime="5 min">
            <p className="mb-4">Install and configure Git on your machine.</p>

          <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
                <strong>⚠️ Before copying:</strong> Replace <code>&quot;YourName&quot;</code> with your actual name and <code>&quot;your.email@example.com&quot;</code> with your real email address.
            </p>
          </div>

          <ExpandableCodeBlock
            code={`Install Git for me and ensure my Git credentials have read write access on this machine. Set my Git username to "YourName" and email to "your.email@example.com". Then verify Git is working correctly.`}
            language="bash"
            previewLength={300}
          />

            <CollapsibleSection title="What This Does" variant="info" defaultOpen={false}>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Detects your OS (Mac/Windows/Linux)</li>
                <li>Installs Git using appropriate method</li>
                <li>Configures Git credentials</li>
                <li>Verifies installation</li>
            </ul>
            </CollapsibleSection>
        </StepSection>

          {/* Step 1.2: Create GitHub Account */}
          <StepSection id="github" title="1.2 Create GitHub Account" emoji="🐙" estimatedTime="5 min">
            <p className="mb-4">Create your GitHub account - this will be your master login.</p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-2">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Visit <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://github.com/signup</a></li>
              <li>Create account with your email</li>
              <li>Verify your email</li>
                <li>Keep this account - you&apos;ll use it for Vercel and Supabase</li>
            </ol>
          </div>
          </StepSection>

          {/* Step 1.3: Setup SSH Keys */}
          <StepSection id="ssh" title="1.3 Setup SSH Keys" emoji="🔑" estimatedTime="5 min">
            <p className="mb-4">Configure secure SSH authentication for GitHub.</p>

          <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
                <strong>⚠️ Before copying:</strong> Replace <code>&quot;your.email@example.com&quot;</code> with your actual email address.
            </p>
          </div>

          <ExpandableCodeBlock
            code={`Generate an SSH key for my GitHub account using my email "your.email@example.com", add it to the SSH agent, copy the public key to my clipboard, and give me instructions on how to add it to GitHub. Then test the SSH connection to GitHub.`}
            language="bash"
            previewLength={300}
          />

            <div className="mt-4 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground text-sm mb-2">After Cursor generates the key:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>SSH key is copied to clipboard</li>
                <li>Go to <a href="https://github.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/settings/keys</a></li>
              <li>Click &quot;New SSH key&quot;</li>
                <li>Paste and click &quot;Add SSH key&quot;</li>
                <li>Tell Cursor &quot;done&quot; to test connection</li>
            </ol>
          </div>
        </StepSection>

          {/* Step 1.4: Fork Repository */}
          <StepSection id="fork" title="1.4 Fork the Repository" emoji="🍴" estimatedTime="3 min">
            <p className="mb-4">Create your own copy of the codebase to customize and deploy.</p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>Visit <a href="https://github.com/gitdevdapp/vercel-supabase-web3-start" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/gitdevdapp/vercel-supabase-web3-start</a></li>
                <li>Sign in to GitHub</li>
                <li>Click <strong>&quot;Fork&quot;</strong> (top right)</li>
                  <li>Click <strong>&quot;Create fork&quot;</strong></li>
                <li>Wait 10-20 seconds</li>
            </ol>
          </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
            <p className="text-sm text-muted-foreground">
                URL shows <code>github.com/YOUR-USERNAME/vercel-supabase-web3-start</code>
            </p>
          </div>
        </StepSection>
        </div>

        {/* ========== PHASE 2: VERCEL ========== */}
        <div className="my-12">
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Phase 2: Vercel Deployment</h1>
            <p className="text-muted-foreground">Deploy your application to production</p>
          </div>

          {/* Step 2.1: Install Node.js */}
          <StepSection id="node" title="2.1 Install Node.js" emoji="⚡" estimatedTime="3 min">
            <p className="mb-4">Install Node.js and npm to run the application.</p>

            <ExpandableCodeBlock
              code={`Install the latest LTS version of Node.js and npm on my system. Then verify both are installed correctly and show me the versions.`}
              language="bash"
              previewLength={300}
            />

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Node 18+ and npm 9+ installed
              </p>
            </div>
          </StepSection>

          {/* Step 2.2: Clone Repository */}
          <StepSection id="clone" title="2.2 Clone Repository" emoji="📥" estimatedTime="5 min">
            <p className="mb-4">Download the code to your computer.</p>

          <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
                <strong>⚠️ Before copying:</strong> Replace <code>YOUR-USERNAME</code> with your GitHub username.
            </p>
          </div>

          <ExpandableCodeBlock
            code={`Clone the GitHub repository from https://github.com/YOUR-USERNAME/vercel-supabase-web3-start.git into my Documents folder. Then navigate into the project directory, install all npm dependencies, and open the project in Cursor.`}
            language="bash"
            previewLength={300}
          />

        </StepSection>

          {/* Step 2.3: Create Vercel Account */}
          <StepSection id="vercel" title="2.3 Create Vercel Account & Deploy" emoji="▲" estimatedTime="10 min">
          <div className="my-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
              <p className="font-semibold text-foreground mb-2">🔑 Critical: Use Same GitHub Account</p>
              <p className="text-sm text-muted-foreground">
                Sign up for Vercel using the SAME GitHub account from Phase 1.
              </p>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>Visit <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">vercel.com/signup</a></li>
                <li>Click <strong>&quot;Continue with GitHub&quot;</strong></li>
                <li>Authorize Vercel</li>
                <li>Click <strong>&quot;Add New...&quot;</strong> → <strong>&quot;Project&quot;</strong></li>
                <li>Find <code>vercel-supabase-web3-start</code></li>
                <li>Click <strong>&quot;Import&quot;</strong></li>
                <li>Click <strong>&quot;Deploy&quot;</strong> (keep all defaults)</li>
                <li>Wait 2-3 minutes</li>
                <li>Copy your production URL</li>
            </ol>
          </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Site loads at <code>https://your-app.vercel.app</code>
              </p>
            </div>

            <CollapsibleSection title="Deploy via CLI (Alternative)" variant="advanced" defaultOpen={false}>
              <ExpandableCodeBlock
                code={`Install the Vercel CLI globally, authenticate with my Vercel account, then deploy this project to Vercel production. Accept all default settings and show me the deployment URL when finished.`}
                language="bash"
                previewLength={300}
              />
            </CollapsibleSection>
        </StepSection>

          {/* Step 2.4: Custom Domain (Optional) */}
          <CollapsibleSection title="2.4 Custom Domain (Optional)" variant="optional" defaultOpen={false}>
            <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Your app works with the free <code>.vercel.app</code> domain. Add a custom domain later if needed.
              </p>

              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Quick Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Vercel Dashboard → Your Project → Settings → Domains</li>
                  <li>Enter your domain and click Add</li>
                  <li>Add DNS records at your domain provider:
                    <div className="bg-muted p-3 rounded text-xs space-y-1 font-mono mt-2">
                      <div><strong>A Record:</strong> @ → 76.76.21.21</div>
                      <div><strong>CNAME:</strong> www → cname.vercel-dns.com</div>
              </div>
                  </li>
                  <li>Wait 5-30 minutes for DNS propagation</li>
                </ol>
                  </div>
                </div>
              </CollapsibleSection>
                  </div>

        {/* ========== PHASE 3: SUPABASE ========== */}
        <div className="my-12">
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Phase 3: Supabase Setup</h1>
            <p className="text-muted-foreground">Configure database and authentication</p>
              </div>

          {/* Step 3.1: Create Supabase Account */}
          <StepSection id="supabase" title="3.1 Create Supabase Account" emoji="🗄️" estimatedTime="7 min">
          <div className="my-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
              <p className="font-semibold text-foreground mb-2">🔑 Critical: Use Same GitHub Account</p>
            <p className="text-sm text-muted-foreground">
                Sign up for Supabase using the SAME GitHub account from Phase 1.
            </p>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">supabase.com</a></li>
                <li>Click <strong>&quot;Sign in with GitHub&quot;</strong></li>
                <li>Authorize Supabase</li>
                <li>Click <strong>&quot;New project&quot;</strong></li>
                <li>Project name: <code>devdapp-web3</code></li>
                <li>Database password: Click &quot;Generate&quot; and save it</li>
                <li>Region: Choose nearest location</li>
              <li>Click <strong>&quot;Create new project&quot;</strong></li>
                <li>Wait 2-3 minutes</li>
                <li>Go to <strong>Settings</strong> → <strong>API</strong></li>
            </ol>
          </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
            <p className="text-sm text-muted-foreground">
                Settings → API shows Project URL and anon key
            </p>
          </div>
        </StepSection>

          {/* Step 3.2: Configure Environment Variables */}
          <StepSection id="env" title="3.2 Configure Environment Variables" emoji="🔐" estimatedTime="10 min">
            <p className="mb-4">Connect your Supabase credentials to Vercel.</p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Get Supabase Credentials:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Supabase Dashboard → Settings → API</li>
                <li>Copy <strong>Project URL</strong> (https://xxxxx.supabase.co)</li>
                <li>Copy <strong>anon public</strong> key (starts with eyJ...)</li>
            </ol>
          </div>

          <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
              <p className="font-semibold text-foreground mb-3">Add to Vercel:</p>

          <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
                <strong>⚠️ Before copying:</strong> Replace <code>YOUR_SUPABASE_URL</code> and <code>YOUR_ANON_KEY</code> with your values from Supabase dashboard.
            </p>
          </div>
            
            <ExpandableCodeBlock
              code={`Help me set up environment variables for Vercel. Create a .env.local file with:

NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="YOUR_ANON_KEY"

Then upload to Vercel using CLI for all environments (production, preview, development) and trigger a new deployment.`}
              language="bash"
              previewLength={300}
            />

          </div>

            <CollapsibleSection title="Manual Dashboard Method" variant="advanced" defaultOpen={false}>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                <li>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> (paste Project URL, check all envs)</li>
                <li>Add <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY</code> (paste anon key, check all envs)</li>
                <li>Go to Deployments → Redeploy latest production</li>
                <li>Wait 2-3 minutes</li>
            </ol>
            </CollapsibleSection>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Deployment completes with no errors
              </p>
            </div>
          </StepSection>

          {/* Step 3.3: Setup Database */}
          <StepSection id="database" title="3.3 Setup Database" emoji="🗃️" estimatedTime="10 min">
            <p className="mb-4">Create database tables for user profiles and authentication.</p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Supabase Dashboard → SQL Editor</li>
                <li>Click <strong>&quot;New query&quot;</strong></li>
                <li>Use Cursor to copy SQL script (prompt below)</li>
                <li>Paste into editor</li>
                <li>Click <strong>&quot;Run&quot;</strong></li>
                <li>Wait 10-15 seconds</li>
            </ol>
          </div>

            <ExpandableCodeBlock
              code={`Read the SQL setup script from docs/profile/SETUP-SCRIPT.sql, copy it to my clipboard, and confirm it was copied.`}
              language="bash"
              previewLength={300}
            />

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
            <p className="text-sm text-muted-foreground">
                Results show &quot;🎉 SETUP COMPLETE!&quot;
              </p>
          </div>

            <CollapsibleSection title="What This SQL Does" variant="info" defaultOpen={false}>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Creates <code>profiles</code> table</li>
                <li>Sets up storage bucket for images</li>
                <li>Configures Row Level Security (RLS)</li>
                <li>Adds automatic triggers</li>
                <li>Creates indexes for performance</li>
              </ul>
            </CollapsibleSection>
        </StepSection>

          {/* Step 3.4: Configure Email */}
          <StepSection id="email" title="3.4 Configure Email Authentication" emoji="📧" estimatedTime="5 min">
            <p className="mb-4">Enable email signup and confirmation.</p>

          <ExpandableCodeBlock
            code={`Give me step-by-step instructions to configure email authentication in Supabase. Set the Site URL to my Vercel deployment URL "YOUR_VERCEL_URL", add necessary redirect URLs for auth callback and confirmation, and update the email confirmation template.`}
            language="bash"
            previewLength={300}
          />

          <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
                <strong>⚠️ Replace</strong> <code>YOUR_VERCEL_URL</code> with your Vercel URL (e.g., https://my-app.vercel.app)
            </p>
          </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
            <p className="text-sm text-muted-foreground">
                Site URL and redirect URLs configured in Supabase
            </p>
          </div>
        </StepSection>
        </div>

        {/* ========== PHASE 4: COINBASE DEVELOPER PROGRAM ========== */}
        <div className="my-12">
          <div className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 rounded-r-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Phase 4: Coinbase Developer Program</h1>
            <p className="text-muted-foreground mb-3">Enable Web3 wallet creation and transactions</p>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="font-bold text-red-600 dark:text-red-400 mb-2">⚠️ REQUIRED - This Phase is Essential</p>
            <p className="text-sm text-muted-foreground">
                Coinbase Developer Program enables the core Web3 functionality. Without this, users cannot create wallets, generate 0x addresses, or send transactions. This is NOT optional for a functional Web3 dApp.
            </p>
            </div>
          </div>

          {/* Step 4.1: Create CDP Account */}
          <StepSection id="coinbase" title="4.1 Create CDP Account" emoji="💰" estimatedTime="3 min">
          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Visit <a href="https://portal.cdp.coinbase.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">portal.cdp.coinbase.com/signup</a></li>
                <li>Sign up with email or OAuth</li>
                <li>Verify email</li>
                <li>Complete onboarding</li>
            </ol>
          </div>
          </StepSection>

          {/* Step 4.2: Generate API Keys */}
          <StepSection id="cdp-keys" title="4.2 Generate API Keys" emoji="🔑" estimatedTime="10 min">
            <p className="mb-4">You need 3 credentials from CDP.</p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>CDP Dashboard → API Keys</li>
                <li>Click <strong>&quot;Create API Key&quot;</strong></li>
                <li>Name: &quot;Production Web3 App&quot;</li>
                <li>Permissions: Select &quot;Wallet&quot; or &quot;Full Access&quot;</li>
                <li>Click <strong>&quot;Generate&quot;</strong></li>
                <li>Copy all 3 values NOW (private key shown only once)</li>
            </ol>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">3 Required Values:</p>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <p className="font-semibold">1. CDP_API_KEY_NAME</p>
                  <p className="text-xs text-muted-foreground">Format: organizations/xxx/apiKeys/yyy</p>
          </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-semibold">2. CDP_API_KEY_PRIVATE_KEY</p>
                  <p className="text-xs text-muted-foreground">Starts with: -----BEGIN EC PRIVATE KEY-----</p>
              </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-semibold">3. CDP_PROJECT_ID</p>
                  <p className="text-xs text-muted-foreground">Find in: Settings → Project Settings</p>
              </div>
              </div>
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs">
                <strong className="text-red-600 dark:text-red-400">⚠️ CRITICAL:</strong> Private key shown ONLY ONCE. Copy immediately!
              </div>
            </div>

            <CollapsibleSection title="Detailed Key Explanations" variant="info" defaultOpen={false}>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground">API Key Name:</p>
                  <p className="text-xs text-muted-foreground">Identifies which key you&apos;re using</p>
            </div>
                <div>
                  <p className="font-semibold text-foreground">Private Key:</p>
                  <p className="text-xs text-muted-foreground">Authenticates requests, proves ownership</p>
          </div>
                <div>
                  <p className="font-semibold text-foreground">Project ID:</p>
                  <p className="text-xs text-muted-foreground">Associates wallets with your project for billing</p>
                </div>
              </div>
            </CollapsibleSection>
          </StepSection>

          {/* Step 4.3: Add CDP to Vercel */}
          <StepSection id="cdp-env" title="4.3 Add CDP to Vercel" emoji="🔐" estimatedTime="5 min">
            <p className="mb-4">Add the 3 CDP credentials to Vercel environment variables.</p>

            <div className="bg-muted p-3 rounded text-xs font-mono space-y-1 mb-4">
              <div><strong>CDP_API_KEY_NAME</strong>=organizations/xxx/apiKeys/yyy</div>
              <div><strong>CDP_API_KEY_PRIVATE_KEY</strong>=-----BEGIN EC PRIVATE KEY-----...</div>
              <div><strong>CDP_PROJECT_ID</strong>=your-project-uuid</div>
            </div>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                <li>Add each variable (check all 3 environments)</li>
                <li>Deployments → Redeploy latest production</li>
                <li>Wait 2-3 minutes</li>
              </ol>
            </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                All 3 CDP variables added, deployment complete
              </p>
          </div>

            <CollapsibleSection title="Troubleshooting" variant="advanced" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                  <strong className="text-foreground">Can&apos;t find API Keys:</strong>
                  <p className="text-xs">Check Settings → Developer Settings → API Keys</p>
              </div>
              <div>
                  <strong className="text-foreground">Lost private key:</strong>
                  <p className="text-xs">Must create new API key (cannot recover)</p>
              </div>
              <div>
                  <strong className="text-foreground">Wallet creation fails:</strong>
                  <p className="text-xs">Verify all 3 vars set, redeploy, check permissions</p>
              </div>
            </div>
          </CollapsibleSection>
          </StepSection>
        </div>

        {/* ========== PHASE 5: TESTING ========== */}
        <div className="my-12">
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-l-4 border-green-500 rounded-r-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Phase 5: Testing & Verification</h1>
            <p className="text-muted-foreground">Verify complete end-to-end functionality including Web3 wallet creation</p>
          </div>

          {/* Step 5.1: Basic Authentication Test */}
          <StepSection id="test-auth" title="5.1 Test User Authentication" emoji="🔐" estimatedTime="3 min">
            <p className="mb-4">Verify signup, email confirmation, and profile access work.</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Visit your Vercel URL</li>
                <li>Navigate to <code>/auth/sign-up</code></li>
                <li>Sign up with test email (use <a href="https://mailinator.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">mailinator.com</a>)</li>
                <li>Check email inbox for confirmation</li>
                <li>Click confirmation link</li>
                <li>Verify redirect to profile page</li>
              </ol>
            </div>

          <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
            <p className="text-sm text-muted-foreground">
                Profile page loads, shows user email
            </p>
          </div>
        </StepSection>

          {/* Step 5.2: Wallet Creation Test - CRITICAL */}
          <StepSection id="test-wallet" title="5.2 Test Wallet Creation (CRITICAL)" emoji="💰" estimatedTime="5 min">
            <div className="my-6 p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
              <p className="font-semibold text-foreground mb-2">⚠️ Critical Test - Proves CDP Integration Works</p>
            <p className="text-sm text-muted-foreground">
                This test verifies that your Coinbase Developer Program integration is working correctly and users can create Web3 wallets.
            </p>
          </div>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>While logged in, navigate to wallet creation page</li>
                <li>Click &quot;Create Wallet&quot; button</li>
                <li>Wait for wallet generation (5-10 seconds)</li>
                <li>Verify wallet address appears (starts with <code>0x</code>)</li>
                <li>Copy the wallet address</li>
            </ol>
          </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Wallet created successfully, shows 0x address (e.g., 0x1234...5678)
              </p>
            </div>
        </StepSection>

          {/* Step 5.3: Supabase Verification - CRITICAL */}
          <StepSection id="test-supabase" title="5.3 Verify Supabase Contains Wallet Address (CRITICAL)" emoji="🗃️" estimatedTime="3 min">
            <div className="my-6 p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
              <p className="font-semibold text-foreground mb-2">⚠️ Critical Test - Proves Database Integration Works</p>
              <p className="text-sm text-muted-foreground">
                This test confirms that wallet addresses are being saved to your Supabase database correctly.
              </p>
            </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Click <strong>Table Editor</strong> in sidebar</li>
                <li>Click <code>profiles</code> table</li>
                <li>Find your user&apos;s row (by email)</li>
                <li>Verify <code>wallet_address</code> field contains the 0x address</li>
              </ol>
          </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
            <p className="text-sm text-muted-foreground">
                User profile row shows wallet_address field with your 0x address
            </p>
          </div>
        </StepSection>

          {/* Step 5.4: Send Transaction Test - CRITICAL */}
          <StepSection id="test-transaction" title="5.4 Test Send Transaction (CRITICAL)" emoji="💸" estimatedTime="5 min">
            <div className="my-6 p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
              <p className="font-semibold text-foreground mb-2">⚠️ Critical Test - Proves Full Web3 Functionality</p>
              <p className="text-sm text-muted-foreground">
                This test confirms that users can actually send transactions from their created wallets.
              </p>
            </div>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                <li>Navigate to wallet/transaction page</li>
                <li>Enter a test transaction (use testnet if available)</li>
                <li>Click &quot;Send Transaction&quot;</li>
                <li>Wait for confirmation</li>
                <li>Verify transaction hash received</li>
              </ol>
            </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Transaction completes, transaction hash displayed
              </p>
            </div>

            <CollapsibleSection title="If Transaction Fails" variant="advanced" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Common Issues:</strong></p>
                <ul className="list-disc list-inside ml-4 text-xs">
                  <li>Check CDP environment variables are set correctly</li>
                  <li>Verify Vercel was redeployed after adding CDP vars</li>
                  <li>Check CDP dashboard for error logs</li>
                  <li>Verify API key has &quot;Wallet&quot; permissions</li>
                  <li>Check browser console for error messages</li>
                </ul>
            </div>
            </CollapsibleSection>
          </StepSection>

          {/* Step 5.5: Additional Tests */}
          <StepSection id="test-additional" title="5.5 Additional Tests" emoji="✅" estimatedTime="3 min">
            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Complete Testing Checklist:</p>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>☑️ User signup and email confirmation</li>
                <li>☑️ Profile page loads and editable</li>
                <li>☑️ Wallet creation returns 0x address</li>
                <li>☑️ Supabase contains wallet address</li>
                <li>☑️ Transaction can be sent</li>
                <li>☑️ Blockchain pages load (<code>/avalanche</code>, <code>/flow</code>, <code>/tezos</code>, etc.)</li>
                <li>☑️ Dark/light mode toggle works</li>
                <li>☑️ Mobile responsive (test on phone or resize browser)</li>
                <li>☑️ Image upload works (profile picture)</li>
              </ul>
            </div>

            <div className="my-6 p-4 bg-muted border border-border rounded-lg">
              <p className="font-semibold text-foreground mb-2">If Something Doesn&apos;t Work:</p>
              <p className="text-sm text-muted-foreground">
                Ask Cursor: <code>&quot;The [specific feature] isn&apos;t working. Help me troubleshoot by checking the relevant configuration and logs.&quot;</code>
              </p>
            </div>
          </StepSection>
          </div>

        {/* ========== PHASE 6: PLANNING & IMPLEMENTATION ========== */}
        <div className="my-12">
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 rounded-r-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Phase 6: Planning & Feature Implementation</h1>
            <p className="text-muted-foreground mb-3">Learn how to safely plan, analyze, and implement new features using the Phase 6 methodology</p>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">📚 Prerequisites</p>
              <p className="text-sm text-muted-foreground">
                You should complete Phases 1-5 first. Phase 6 teaches you how to build additional features safely after your dApp is deployed.
              </p>
            </div>
          </div>

          {/* Phase 6 Overview */}
          <StepSection id="phase6-overview" title="Phase 6 Overview" emoji="🚀" estimatedTime="5 min">
            <p className="mb-4">Phase 6 is a complete methodology for planning, analyzing, and safely implementing any feature in your dApp.</p>
            
            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">The 3 Stages of Phase 6</p>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li><strong>Stage 1: Plan</strong> - Write detailed feature plan (30 min)</li>
                <li><strong>Stage 2: Analyze</strong> - Critical analysis in 3 rounds (90 min)</li>
                <li><strong>Stage 3: Implement</strong> - Code safely and deploy (1-3 hours)</li>
              </ol>
            </div>

            <div className="my-6 p-4 bg-blue-500/5 border border-blue-500/30 rounded-lg">
              <p className="font-semibold text-foreground text-sm mb-2">Why Phase 6 Works</p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Catches bugs in planning phase (not production)</li>
                <li>Prevents breaking changes through careful analysis</li>
                <li>Enables fast deployment with confidence</li>
                <li>Creates documentation for team and future reference</li>
              </ul>
            </div>
          </StepSection>

          {/* Stage 1: Planning */}
          <StepSection id="phase6-stage1" title="Stage 1: Plan Your Feature (30 minutes)" emoji="📝" estimatedTime="30 min">
            <p className="mb-4">Document your feature idea before coding anything. This clarifies requirements and prevents mistakes.</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Create Planning Document</p>
              <p className="text-sm text-muted-foreground mb-3">Create file: <code>docs/newidea/YOUR-FEATURE-NAME-PLAN.md</code></p>
              <p className="text-sm text-muted-foreground mb-3">Include these sections:</p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li><strong>Executive Summary</strong> - What and why (2-3 sentences)</li>
                <li><strong>Problem Statement</strong> - What problem does this solve?</li>
                <li><strong>Proposed Solution</strong> - How will you solve it?</li>
                <li><strong>Implementation Scope</strong> - What&apos;s in/out of scope</li>
                <li><strong>Detailed Steps</strong> - Step-by-step implementation</li>
                <li><strong>Dependencies</strong> - What else is needed?</li>
                <li><strong>Success Criteria</strong> - How will you know it works?</li>
                <li><strong>Risk Assessment</strong> - What could go wrong?</li>
                <li><strong>Deployment Plan</strong> - How to release safely</li>
              </ul>
            </div>

            <CollapsibleSection title="Example: Profile Image Upload Feature" variant="info" defaultOpen={false}>
              <div className="space-y-3 text-sm">
                <div className="bg-muted p-3 rounded">
                  <p className="font-semibold mb-2">Feature: User Profile Image Upload</p>
                  <p className="text-xs text-muted-foreground">Users can upload JPG/PNG/WebP images up to 5MB that display on their profile page and in the header.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Problem</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>Users can&apos;t personalize their profiles</li>
                    <li>No visual differentiation between users</li>
                    <li>Profile page feels empty</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Solution</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>Create upload component with file validation</li>
                    <li>Store images in Supabase Storage</li>
                    <li>Display in profile and header</li>
                  </ul>
                </div>
              </div>
            </CollapsibleSection>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                All plan sections complete, objectives clear, and you can explain the feature to someone else
                </p>
              </div>
          </StepSection>

          {/* Stage 2: Analysis */}
          <StepSection id="phase6-stage2" title="Stage 2: Critical Analysis (90 minutes)" emoji="🔍" estimatedTime="90 min">
            <p className="mb-4">Review your plan 3 times from different angles to catch problems before coding.</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">3 Analysis Rounds</p>
              <ol className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <strong className="text-foreground">Round 1 (30 min): Edge Cases</strong>
                  <p className="text-xs">What could go wrong? What edge cases aren&apos;t handled? Create file: <code>docs/newidea/FEATURE-NAME-ANALYSIS-R1.md</code></p>
                </li>
                <li>
                  <strong className="text-foreground">Round 2 (30 min): Dependencies</strong>
                  <p className="text-xs">What systems does this touch? Are all dependencies identified? Create file: <code>docs/newidea/FEATURE-NAME-ANALYSIS-R2.md</code></p>
                </li>
                <li>
                  <strong className="text-foreground">Round 3 (30 min): Performance & Security</strong>
                  <p className="text-xs">Does this scale? Is it secure? Create file: <code>docs/newidea/FEATURE-NAME-ANALYSIS-R3.md</code></p>
                </li>
              </ol>
            </div>

            <CollapsibleSection title="Example Analysis Questions" variant="advanced" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground text-xs mb-1">Round 1: Edge Cases</p>
                  <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                    <li>What happens if file upload fails midway?</li>
                    <li>What if user uploads a corrupted file?</li>
                    <li>What if user runs out of storage quota?</li>
                  </ul>
          </div>
                <div>
                  <p className="font-semibold text-foreground text-xs mb-1">Round 2: Dependencies</p>
                  <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                    <li>What database changes are needed?</li>
                    <li>What API endpoints are needed?</li>
                    <li>What Supabase Storage bucket configuration?</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-xs mb-1">Round 3: Performance & Security</p>
                  <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                    <li>Is the 5MB file size limit enforced on server?</li>
                    <li>Could this be used for abuse (spam uploads)?</li>
                    <li>What happens when user deletes their account?</li>
                  </ul>
                </div>
              </div>
            </CollapsibleSection>

            <ExpandableCodeBlock
              code={`Analyze this feature plan focusing on [CHOOSE: edge cases / dependencies / performance & security]. List 10-15 specific questions and identify any issues or gaps in the plan.`}
              language="bash"
              previewLength={300}
            />

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                All 3 analysis rounds complete, issues identified and documented, plan updated with findings
              </p>
            </div>
          </StepSection>

          {/* Stage 3: Implementation */}
          <StepSection id="phase6-stage3" title="Stage 3: Safe Implementation (1-3 hours)" emoji="💻" estimatedTime="3 hours">
            <p className="mb-4">Implement your feature locally first, test thoroughly, then deploy to production.</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Implementation Workflow</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>Create feature branch: <code>git checkout -b feature/feature-name</code></li>
                <li>Implement feature step-by-step following your plan</li>
                <li>Test locally: <code>npm run dev</code></li>
                <li>Clean up processes (critical step!)</li>
                <li>Verify build: <code>npm run build</code></li>
                <li>Commit to main: <code>git add . && git commit -m &quot;feat: ...&quot;</code></li>
                <li>Push to main: <code>git push origin main</code></li>
                <li>Monitor Vercel build</li>
                <li>Verify in production</li>
              </ol>
            </div>

            {/* CRITICAL: Process Cleanup with pkill */}
            <div className="my-6 p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
              <p className="font-semibold text-foreground mb-3">🔴 CRITICAL: Clean Up Localhost Before Build</p>
              <p className="text-sm text-muted-foreground mb-3">Kill any running Next.js processes to ensure a clean build test:</p>

            <div className="space-y-4">
                {/* macOS / Linux */}
              <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Mac / Linux / WSL:</p>
                  <ExpandableCodeBlock
                    code={`Kill all Next.js dev server and postcss processes on my machine. Run: pkill -f "next dev" || true; pkill -f "postcss" || true; sleep 2; ps aux | grep next`}
                    language="bash"
                    previewLength={300}
                  />
                </div>

                {/* Windows */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Windows (PowerShell):</p>
                  <ExpandableCodeBlock
                    code={`Kill all Next.js dev server processes on Windows. Run: Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*next*" } | Stop-Process -Force`}
                    language="bash"
                    previewLength={300}
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">⚠️ Why This Matters</p>
                  <p className="text-xs text-muted-foreground">
                    If you don&apos;t kill the dev server before testing, old processes might interfere with your build test. This ensures a clean slate for verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Build Verification */}
            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">After Cleanup: Verify Build</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>
                  <strong className="text-foreground">Run build:</strong>
                  <code className="block bg-muted p-2 rounded text-xs mt-1">npm run build</code>
                  <span className="text-xs">Expected: &quot;Compiled successfully&quot; with 0 errors</span>
                </li>
                <li>
                  <strong className="text-foreground">Check linting:</strong>
                  <code className="block bg-muted p-2 rounded text-xs mt-1">npm run lint</code>
                  <span className="text-xs">Expected: No errors found</span>
                </li>
                <li>
                  <strong className="text-foreground">Check TypeScript:</strong>
                  <code className="block bg-muted p-2 rounded text-xs mt-1">npx tsc --noEmit</code>
                  <span className="text-xs">Expected: No output (no errors)</span>
                </li>
              </ol>
            </div>

            {/* Commit & Push */}
            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Commit to Main</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>Kill old processes: <code>pkill -f &quot;next dev&quot; || true</code></li>
                <li>Add changes: <code>git add .</code></li>
                <li>Commit: <code>git commit -m &quot;feat: Add feature name - description&quot;</code></li>
                <li>Push: <code>git push origin main</code></li>
                <li>Verify: <code>git log --oneline -n 1</code></li>
              </ol>
            </div>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Build succeeds locally, no TypeScript/ESLint errors, feature works on localhost, commit pushed to main
              </p>
            </div>
          </StepSection>

          {/* Production Verification */}
          <StepSection id="phase6-production" title="Production Verification" emoji="🌍" estimatedTime="15 min">
            <p className="mb-4">After pushing to main, Vercel automatically builds and deploys. Verify everything works in production.</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Verification Steps</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                <li>
                  <strong className="text-foreground">Monitor Vercel Build</strong>
                  <p className="text-xs">Visit https://vercel.com → Find your project → Wait for build to complete (usually 3-5 minutes)</p>
                </li>
                <li>
                  <strong className="text-foreground">Test Feature</strong>
                  <p className="text-xs">Visit production URL and test your new feature thoroughly</p>
                </li>
                <li>
                  <strong className="text-foreground">Test Existing Features</strong>
                  <p className="text-xs">Make sure Phases 1-5 features still work (login, wallet, etc.)</p>
                </li>
                <li>
                  <strong className="text-foreground">Check Console</strong>
                  <p className="text-xs">Open browser DevTools (F12) → Console tab → Verify no red errors</p>
                </li>
              </ol>
            </div>

            <CollapsibleSection title="If Something Breaks in Production" variant="advanced" defaultOpen={false}>
              <div className="space-y-3 text-sm">
                <p className="text-foreground font-semibold">Quick Rollback:</p>
                <ExpandableCodeBlock
                  code={`Revert my last commit and push to main to rollback the deployment: git revert HEAD && git push origin main`}
                  language="bash"
                  previewLength={300}
                />
                <p className="text-muted-foreground text-xs mt-2">This will create a new commit that undoes your changes, and Vercel will automatically redeploy the reverted version.</p>
              </div>
            </CollapsibleSection>

            <div className="my-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">✅ Success Check:</p>
              <p className="text-sm text-muted-foreground">
                Feature works in production, existing features unaffected, no console errors
              </p>
            </div>
          </StepSection>

          {/* Documentation & Learnings */}
          <StepSection id="phase6-learnings" title="Document Your Learnings" emoji="📚" estimatedTime="15 min">
            <p className="mb-4">After successful deployment, document what you learned for the team and future reference.</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Create Implementation Log</p>
              <p className="text-sm text-muted-foreground mb-3">Create file: <code>docs/newidea/FEATURE-NAME-IMPLEMENTATION-LOG.md</code></p>
              <p className="text-sm text-muted-foreground mb-3">Include:</p>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li><strong>Summary</strong> - What was implemented</li>
                <li><strong>Timeline</strong> - How long each phase took</li>
                <li><strong>Issues Encountered</strong> - What went wrong and how you fixed it</li>
                <li><strong>Performance Metrics</strong> - Before/after measurements</li>
                <li><strong>Lessons Learned</strong> - What to do differently next time</li>
                <li><strong>Verification Checklist</strong> - All tests passed ✅</li>
                </ul>
              </div>

            <div className="my-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm font-semibold mb-2">💡 Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                Keep implementation logs in `docs/newidea/` for your team. They become invaluable reference material for implementing similar features in the future.
              </p>
            </div>
          </StepSection>

          {/* Phase 6 Checklist */}
          <StepSection id="phase6-checklist" title="Phase 6 Complete! 🎉" emoji="✅" estimatedTime="2 min">
            <p className="mb-4">You&apos;ve learned the complete Phase 6 workflow. Here&apos;s your checklist:</p>

            <div className="my-6 p-4 border border-border bg-card rounded-lg">
              <p className="font-semibold text-foreground mb-3">Phase 6 Mastery Checklist</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Created feature plan in `docs/newidea/` with all required sections</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Completed 3 rounds of critical analysis (edge cases, dependencies, performance)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Implemented feature step-by-step on feature branch</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Killed localhost processes with pkill before build verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Verified build: npm run build, npm run lint, npx tsc --noEmit all pass</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Committed to main with clear commit message</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Monitored Vercel build and verified production deployment</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Tested new feature and existing features work correctly</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>☑️</span>
                  <span>Created implementation log documenting learnings</span>
                </div>
              </div>
            </div>

            <div className="my-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
              <p className="font-semibold text-foreground mb-2">🚀 You&apos;re Ready for Any Feature!</p>
              <p className="text-sm text-muted-foreground mb-3">
                You now have the complete methodology to safely plan, analyze, and implement features in production. Use this process for every new feature to ensure:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Fewer bugs in production</li>
                <li>Zero breaking changes</li>
                <li>Fast, confident deployments</li>
                <li>Institutional knowledge in documentation</li>
                </ul>
            </div>

            <CollapsibleSection title="What's Next?" variant="info" defaultOpen={false}>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">1. Start Your Next Feature</p>
                  <p className="text-muted-foreground text-xs">Create a new plan in `docs/newidea/` and follow the Phase 6 process again</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">2. Build Features Faster</p>
                  <p className="text-muted-foreground text-xs">As you practice Phase 6, each cycle gets faster and smoother</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">3. Share Knowledge</p>
                  <p className="text-muted-foreground text-xs">Keep implementation logs as reference material for your team</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">4. Scale with Confidence</p>
                  <p className="text-muted-foreground text-xs">Use Phase 6 for every feature and build institutional quality</p>
                </div>
              </div>
            </CollapsibleSection>
          </StepSection>
        </div>

        {/* Completion */}
        <div className="my-12">
          <div className="mt-8 text-center">
            <div className="inline-block rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-1">
              <div className="rounded-xl bg-background px-8 py-6">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  All 6 Phases Complete! 🎉
                </p>
                <p className="text-xl font-black text-foreground">
                  Ready to Build Anything
                </p>
              </div>
            </div>
          </div>

          <CollapsibleSection title="The Complete Journey" variant="info" defaultOpen={false}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">✅</span>
                <span className="text-muted-foreground"><strong>Phase 1:</strong> Git &amp; GitHub Setup → Repository ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">✅</span>
                <span className="text-muted-foreground"><strong>Phase 2:</strong> Vercel Deployment → App live on web</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">✅</span>
                <span className="text-muted-foreground"><strong>Phase 3:</strong> Supabase Config → Database & auth ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">✅</span>
                <span className="text-muted-foreground"><strong>Phase 4:</strong> CDP Setup → Wallet functionality ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">✅</span>
                <span className="text-muted-foreground"><strong>Phase 5:</strong> Testing & Verification → All features verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-600">✅</span>
                <span className="text-muted-foreground"><strong>Phase 6:</strong> Feature Implementation → Build anything safely</span>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </main>
    </div>
  )
}