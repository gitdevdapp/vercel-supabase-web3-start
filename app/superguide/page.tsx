import { SuperGuideProgressNav } from '@/components/superguide/SuperGuideProgressNav'
import { StepSection } from '@/components/guide/StepSection'
import { ExpandableCodeBlock } from '@/components/guide/ExpandableCodeBlock'
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
        
        <main className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-3 sm:px-4 lg:px-6 overflow-visible">
          {/* Welcome Section - V7 STREAMLINED */}
          <StepSection id="welcome" title="Welcome & Quick Start" emoji="⭐" estimatedTime="">
            <div className="w-full max-w-5xl mx-auto space-y-6">
              
              {/* Main Welcome Card - Streamlined V7 */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="space-y-4">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    You're about to build a production-grade Web3 dApp and deploy it live, completely free. This dApp can scale to millions of concurrent users without needing refactoring. The entire process takes about 60 minutes.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">Here's the breakdown:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Setup & account creation (15 min): You create accounts and download Cursor</li>
                      <li>• Automated deployment (45 min): Cursor AI automates the repetitive work</li>
                      <li>• Verify it works (5 min): Quick checklist to confirm everything runs</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">What you'll have at the end:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>✓ Live dApp running on production servers</li>
                      <li>✓ Database with user authentication</li>
                      <li>✓ Web3 wallet integration</li>
                      <li>✓ Ready for 1 million+ concurrent users</li>
                      <li>✓ No refactoring needed as you scale</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="my-4 h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full" />

              {/* Prerequisites - Simplified */}
              <div className="space-y-4">
                <p className="font-semibold text-foreground text-lg">What You Need:</p>
                
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span>☑️</span>
                    <span><strong className="text-foreground">Cursor AI IDE</strong> (free)</span>
                    <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" 
                       className="ml-auto text-primary hover:underline text-xs whitespace-nowrap flex-shrink-0">
                      Download →
                    </a>
                  </li>
                  <li className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span>☑️</span>
                    <span><strong className="text-foreground">Computer</strong> (Mac preferred)</span>
                  </li>
                </ul>
              </div>

              <div className="my-4 h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full" />

              {/* Account Creation - CRITICAL: All Accounts Setup Here */}
              <div className="space-y-3">
                <p className="font-semibold text-foreground text-lg">📋 Create Your Accounts (Complete All 5 Steps):</p>
                <p className="text-xs text-muted-foreground">You must complete all account creation before moving to Phase 1. Later phases will log into these accounts.</p>
                
                {/* Cursor Workflow Banner - EXPLICIT */}
                <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 my-4">
                  <p className="text-sm font-semibold text-foreground mb-2">💡 About Cursor in This Guide</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Later in this guide, you'll copy commands and paste them into <strong>Cursor IDE's built-in terminal</strong> (not your system terminal). Cursor's AI agent will then execute them automatically if "Run Everything" is enabled. We'll make this very clear at each step.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {/* Step 1: GitHub - Grid layout to prevent wrapping */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-border items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Step 1: GitHub</p>
                      <p className="text-xs text-muted-foreground">Your master login for all services</p>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-[#161B22] hover:bg-[#0d1117] text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">
                        <span>Create Account</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>

                  {/* Step 2: Vercel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-border items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Step 2: Vercel</p>
                      <p className="text-xs text-muted-foreground">Use your GitHub account (click "Continue with GitHub")</p>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">
                        <span>Create Account</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>

                  {/* Step 3: Supabase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-border items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Step 3: Supabase</p>
                      <p className="text-xs text-muted-foreground">Use your GitHub account (click "Continue with GitHub")</p>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <a href="https://supabase.com/auth/sign-up" target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-[#3ECF8E] hover:bg-[#24B47E] text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">
                        <span>Create Account</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>

                  {/* Step 4: Coinbase CDP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-border items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Step 4: Coinbase CDP</p>
                      <p className="text-xs text-muted-foreground">Email must match your GitHub email</p>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <a href="https://www.coinbase.com/developer-platform/signup" target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052FF] hover:bg-[#0047E0] text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">
                        <span>Create Account</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>

                  {/* Step 5: Cursor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Step 5: Login to Cursor & Create Account</p>
                      <p className="text-xs text-muted-foreground">You already have Cursor downloaded. Now login or create your account.</p>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">
                        <span>Open Cursor</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cursor Browser Setup */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-3">⚙️ Enable Cursor Browser & "Run Everything" Setting</h3>
                <p className="text-xs text-muted-foreground mb-4">This guide uses Cursor's AI agent to automate terminal commands. You need to enable two things:</p>
                
                <div className="space-y-4">
                  {/* Part 1: Browser Install */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Part 1: Install Cursor Browser (1 min)</p>
                    <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                      <li>Open Cursor IDE</li>
                      <li>Press <code className="bg-muted px-2 py-0.5 rounded text-xs">Cmd+Shift+P</code> (Mac) or <code className="bg-muted px-2 py-0.5 rounded text-xs">Ctrl+Shift+P</code> (Windows/Linux)</li>
                      <li>Type: <code className="bg-muted px-2 py-0.5 rounded text-xs">&gt; cursor browser install</code></li>
                      <li>Wait for download (1-2 min)</li>
                    </ol>
                  </div>

                  {/* Part 2: Run Everything Setting */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Part 2: Enable "Run Everything" Setting (1 min)</p>
                    <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                      <li>In Cursor, go to <strong>Settings</strong> (Cmd+, on Mac)</li>
                      <li>Search for "<strong>Run Everything</strong>"</li>
                      <li>Enable the toggle: <strong>"Always run commands without asking"</strong></li>
                      <li><strong>Restart Cursor</strong> to apply</li>
                    </ol>
                  </div>

                  {/* Why This Matters */}
                  <div className="bg-muted/30 rounded p-3 mt-4">
                    <p className="text-xs font-medium text-foreground mb-1">Why "Run Everything" Matters:</p>
                    <p className="text-xs text-muted-foreground">
                      When you paste commands into Cursor's terminal later, Cursor AI will execute them automatically without asking for confirmation. This keeps the workflow fast (60 min instead of 90+). Without this, you'll be manually running each command.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </StepSection>

          {/* PHASE 1: GIT SETUP - SIMPLIFIED */}
          <div className="my-6">
            <div className="mb-6 pb-4 border-b border-border">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Phase 1: Git &amp; GitHub Setup
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">⏱️ 6 minutes</span> • <span className="font-semibold">Manual terminal work</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This phase gives you hands-on experience with Git and GitHub. You'll generate SSH keys and verify connectivity. This is foundational—Phases 2-4 depend on it.
                </p>
              </div>
            </div>

            {/* 1.1: Install Git */}
            <StepSection id="git" title="1.1 Install Git" emoji="📦" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Install and configure Git with SSH keys for GitHub access.</p>

              <ExpandableCodeBlock
                code={`# INSTALL GIT & SETUP SSH
# Detect OS and install:
uname -s | grep -E "Darwin|Linux" && echo "macOS/Linux" || echo "Windows"

# macOS: brew install git
# Linux: sudo apt update && sudo apt install git
# Windows: winget install git
# Then verify: git --version

# GENERATE SSH KEY (if needed):
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter 3 times (no passphrase)

# DISPLAY YOUR PUBLIC KEY:
cat ~/.ssh/id_ed25519.pub
# Copy this entire output

# TEST SSH CONNECTION:
ssh -T git@github.com
# Expected: "Hi [username]! You've successfully authenticated..."

# If test fails, fix permissions:
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh
ssh -T git@github.com`}
                previewLength={300}
              />
              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Git installed and configured on your computer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>SSH key generated and tested</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Verified SSH connection: "Hi [username]! You've successfully authenticated..."</span>
                  </li>
                </ul>
              </div>

              <CollapsibleSection title="Troubleshooting" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Git not found</p>
                    <p className="text-xs">Install Homebrew first (macOS): /bin/bash -c &quot;$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)&quot;</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">SSH key already exists</p>
                    <p className="text-xs">That's fine. Use: cat ~/.ssh/id_ed25519.pub or cat ~/.ssh/id_rsa.pub</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Permission denied on SSH test</p>
                    <p className="text-xs">Fix: chmod 700 ~/.ssh &amp;&amp; chmod 600 ~/.ssh/id_ed25519</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 1.2: Add SSH Key to GitHub - RENUMBERED (was 1.3) */}
            <StepSection id="ssh" title="1.2 Add SSH Key to GitHub" emoji="🔑" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">
                If you don&apos;t have a GitHub account yet, create one in the Welcome section above, Step 1.
              </p>
              <p className="text-sm text-muted-foreground mb-3">Add your SSH key from step 1.1 to GitHub.</p>

              <div className="my-3 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://github.com/settings/ssh/new" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/settings/ssh/new</a></li>
                  <li>Title: &quot;My Machine&quot;</li>
                  <li>Key type: Authentication Key</li>
                  <li>Paste SSH key from step 1.1</li>
                  <li>Click &quot;Add SSH Key&quot;</li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>SSH key added to your GitHub account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>SSH authentication verified: ssh -T git@github.com shows success</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 1.3: Fork Repository - RENUMBERED (was 1.4) */}
            <StepSection id="fork" title="1.3 Fork Repository" emoji="🍴" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Create your copy of the starter code.</p>

              <div className="my-3 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://github.com/gitdevdapp/vercel-supabase-web3-start" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/gitdevdapp/vercel-supabase-web3-start</a></li>
                  <li>Click Fork (top right)</li>
                  <li>Keep name &quot;vercel-supabase-web3-start&quot;</li>
                  <li>Click &quot;Create fork&quot;</li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Repository forked to your GitHub account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Your fork URL: github.com/YOUR-USERNAME/vercel-supabase-web3-start</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 2: Local environment setup</span>
                  </li>
                </ul>
              </div>
            </StepSection>
          </div>

          {/* PHASE 2: VERCEL - SIMPLIFIED */}
          <div className="my-6">
            <div className="mb-6 pb-4 border-b border-border">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Phase 2: Local Environment &amp; Vercel Deploy
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">⏱️ 15 minutes</span> • <span className="font-semibold">Terminal commands + browser setup</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Install dependencies locally, then deploy your app to Vercel. Vercel automates hosting and makes your app accessible worldwide instantly.
                </p>
              </div>
            </div>

            {/* 2.1: Install Node.js */}
            <StepSection id="nodejs" title="2.1 Install Node.js" emoji="⚡" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Install Node.js and npm for running the project.</p>

              <ExpandableCodeBlock
                code={`# CHECK OS:
uname -s

# macOS:
brew install node

# Linux (Debian/Ubuntu):
sudo apt update && sudo apt install nodejs npm

# Linux (Fedora):
sudo dnf install nodejs

# Windows:
winget install nodejs.lts

# VERIFY VERSIONS (node 18+, npm 9+):
node --version
npm --version

# If old, update:
# macOS: brew upgrade node
# Linux: sudo apt upgrade nodejs`}
                previewLength={250}
              />
              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Node.js installed (version 18 or higher)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>npm installed (version 9 or higher)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready to install project dependencies</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 2.2: Clone & Install */}
            <StepSection id="install" title="2.2 Clone &amp; Install" emoji="📥" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Download code and install dependencies.</p>

              <ExpandableCodeBlock code={`# CREATE FOLDER & CLONE:
cd ~/Development
git clone git@github.com:YOUR-USERNAME/vercel-supabase-web3-start.git
cd vercel-supabase-web3-start

# INSTALL DEPENDENCIES:
npm ci

# Wait 2-3 minutes for completion

# VERIFY:
ls -la
ls node_modules | head -5

# Should show: node_modules/, app/, components/, package.json, etc
# And modules: @next, @supabase, react, typescript, etc`}
                previewLength={250}
              />

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Repository cloned to your local machine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>npm dependencies installed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 2.3: Vercel deployment</span>
                  </li>
                </ul>
              </div>

              <CollapsibleSection title="Troubleshooting" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs font-semibold text-foreground">npm ERR! 404 not found</p>
                    <p className="text-xs">Run: npm cache clean --force &amp;&amp; npm ci</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">git: command not found</p>
                    <p className="text-xs">Go back to Phase 1, step 1.1 and install Git</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Permission denied on SSH clone</p>
                    <p className="text-xs">SSH key not added to GitHub. Go back to Phase 1, step 1.3</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 2.3: Login to Vercel & Deploy */}
            <StepSection id="deploy" title="2.3 Login to Vercel &amp; Deploy" emoji="▲" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Log into your Vercel account (created in Welcome section) and deploy your app to production.</p>

              <div className="my-3 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">vercel.com/signup</a></li>
                  <li>Click &quot;Continue with GitHub&quot;</li>
                  <li>Authorize Vercel</li>
                  <li>Click &quot;Add New...&quot; → &quot;Project&quot;</li>
                  <li>Find and select vercel-supabase-web3-start</li>
                  <li>Click Import</li>
                  <li>Leave settings as default, click Deploy</li>
                  <li>Wait 3-5 minutes</li>
                  <li>Copy your production URL when complete</li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Vercel account created and linked to GitHub</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Project deployed to production (URL like https://your-project.vercel.app)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 3: Supabase database setup</span>
                  </li>
                </ul>
              </div>
            </StepSection>
          </div>

          {/* PHASE 3: SUPABASE */}
          <div className="my-6">
            <div className="mb-6 pb-4 border-b border-border">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Phase 3: Supabase Database Setup
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">⏱️ 12 minutes</span> • <span className="font-semibold">Browser setup + SQL configuration</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your app to Supabase for database, authentication, and file storage. Your app and Vercel will communicate with Supabase automatically.
                </p>
              </div>
            </div>

            {/* 3.1: Login to Supabase */}
            <StepSection id="supabase-account" title="3.1 Login to Supabase &amp; Create Project" emoji="🗄️" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Log into your Supabase account (created in Welcome section) and set up your database project.</p>

              <div className="my-3 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">supabase.com</a></li>
                  <li>Click &quot;Sign in with GitHub&quot;</li>
                  <li>Authorize Supabase</li>
                  <li>Click &quot;New project&quot;</li>
                  <li>Name: devdapp-web3</li>
                  <li>Password: Click Generate and save it</li>
                  <li>Region: Nearest to you</li>
                  <li>Click &quot;Create new project&quot; and wait 2-3 minutes</li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Supabase project created and configured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Supabase dashboard accessible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 3.2: Environment variable configuration</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 3.2: Configure Environment Variables */}
            <StepSection id="env-vars" title="3.2 Configure Environment Variables" emoji="🔐" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Connect your Supabase credentials to Vercel.</p>

              <ExpandableCodeBlock code={`# GET CREDENTIALS FROM SUPABASE:
# 1. Go to Supabase Dashboard → Settings → API
# 2. Copy Project URL (https://xxxxx.supabase.co)
# 3. Copy anon public key (starts with eyJ...)

# ADD TO VERCEL:
# 1. Go to vercel.com → Your Project → Settings → Environment Variables
# 2. Add NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
# 3. Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_ANON_KEY
# 4. For each, check: Production, Preview, Development
# 5. Click Save

# REDEPLOY:
# 1. Go to Deployments → Latest production deployment
# 2. Click "Redeploy"
# 3. Wait 2-3 minutes

# VERIFY in Vercel: Environment shows both variables added`}
                previewLength={280}
              />

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Supabase credentials copied (URL and anon key)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Environment variables added to Vercel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Project redeployed with database credentials</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 3.3: Setup Database */}
            <StepSection id="database" title="3.3 Setup Database" emoji="🗃️" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Create database tables.</p>

              <ExpandableCodeBlock code={`# GO TO SUPABASE SQL EDITOR:
# 1. supabase.com → Your Project → SQL Editor
# 2. Click "New query"
# 3. Copy and paste this SQL:

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  wallet_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE STORAGE BUCKET id='avatars' public=true;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

# 4. Click Run
# 5. Wait 10-15 seconds for completion`}
                previewLength={280}
              />

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Profiles table created with all required columns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Row Level Security (RLS) enabled on profiles table</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 3.4: Email authentication setup</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 3.4: Configure Email */}
            <StepSection id="email-auth" title="3.4 Configure Email Authentication" emoji="📧" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Enable email signup and confirmation.</p>

              <ExpandableCodeBlock code={`# CONFIGURE EMAIL PROVIDER:
# 1. supabase.com → Your Project → Authentication → Providers
# 2. Toggle Email ON
# 3. Set Confirm Redirect URL: YOUR_VERCEL_URL/auth/callback
# 4. Go to Email Templates, verify confirmation link uses {{ .ConfirmationURL }}

# CONFIGURE URL SETTINGS:
# 1. Go to Authentication → URL Configuration
# 2. Site URL: YOUR_VERCEL_URL (your Vercel deployment URL)
# 3. Redirect URLs:
#    - YOUR_VERCEL_URL/auth/callback
#    - YOUR_VERCEL_URL/profile
# 4. Save all changes

# VERIFY:
# In Email Templates section, confirm email provider is enabled
# In URL Configuration, Site URL and redirect URLs are set`}
                previewLength={280}
              />

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Email provider enabled in Supabase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Redirect URLs configured (auth/callback, profile)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 4: Coinbase CDP wallet integration</span>
                  </li>
                </ul>
              </div>
            </StepSection>
          </div>

          {/* PHASE 4: COINBASE CDP */}
          <div className="my-6">
            <div className="mb-6 pb-4 border-b border-border">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Phase 4: Coinbase Developer Platform (CDP) Setup
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">⏱️ 18 minutes</span> • <span className="font-semibold">Browser setup + API key generation</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create Web3 wallet functionality via Coinbase CDP. Your app will securely create wallets for users. This is REQUIRED for Web3 features.
                </p>
              </div>
            </div>

            {/* 4.1: Login to Coinbase CDP */}
            <StepSection id="cdp-account" title="4.1 Login to Coinbase CDP" emoji="💰" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Log into your Coinbase CDP account (created in Welcome section) and prepare for API key generation.</p>

              <div className="my-3 p-4 border border-border bg-card rounded">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://portal.cdp.coinbase.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">portal.cdp.coinbase.com/signup</a></li>
                  <li>Sign up with email or OAuth</li>
                  <li>Verify email</li>
                  <li>Complete onboarding steps</li>
                </ol>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">Account created, dashboard accessible</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>CDP account created</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Email verified and dashboard accessible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ready for Phase 4.2: API key generation</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 4.2: Generate API Keys */}
            <StepSection id="cdp-keys" title="4.2 Generate API Keys" emoji="🔑" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Get three credentials from CDP dashboard. This is CRITICAL - private key shown only once.</p>

              <div className="my-3 p-4 border border-green-500/20 bg-green-500/5 rounded">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-2">⚠️ CRITICAL: Private key appears ONLY ONCE</p>
                <p className="text-xs text-muted-foreground">Copy all three values immediately: API Key Name, Private Key (one-time!), and Project ID</p>
              </div>

              <ExpandableCodeBlock code={`# GO TO CDP API KEYS:
# 1. portal.cdp.coinbase.com → API Keys
# 2. Click "Create API Key"
# 3. Name: "Production Web3 App"
# 4. Permissions: "Wallet" or "Full Access"
# 5. Click "Generate"

# YOU WILL SEE THREE VALUES - COPY ALL THREE IMMEDIATELY:

# VALUE 1: CDP_API_KEY_NAME
# Format: organizations/xxx/apiKeys/yyy
# Copy this entire string

# VALUE 2: CDP_API_KEY_PRIVATE_KEY (ONE-TIME ONLY!)
# Format: -----BEGIN EC PRIVATE KEY-----...
# Do not close this page. If you lose it, must regenerate.

# VALUE 3: CDP_PROJECT_ID
# Go to Settings → Project Settings
# Copy the Project ID (UUID format)

# SAVE ALL THREE to a secure text file
# Do not commit to GitHub or share`}
                previewLength={300}
              />

              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-foreground text-base mb-3">✓ Success: What You've Accomplished</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>CDP_API_KEY_NAME copied (organizations/xxx/apiKeys/yyy)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>CDP_API_KEY_PRIVATE_KEY copied (one-time secret saved safely)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>CDP_PROJECT_ID copied and ready for Vercel</span>
                  </li>
                </ul>
              </div>
            </StepSection>

            {/* 4.3: Add CDP to Vercel */}
            <StepSection id="cdp-test" title="4.3 Add CDP to Vercel" emoji="🔐" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Add the three CDP credentials to Vercel environment variables.</p>

              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">🔑 Why We Need a Deployer Wallet</p>
                <p className="text-sm text-muted-foreground mb-3">
                  When you paste these CDP credentials into Cursor, Cursor's AI agent will automatically generate a <strong>deployer wallet</strong> using the CDP SDK. This wallet is needed to deploy your ERC721 smart contract to the blockchain.
                </p>
                <p className="text-sm text-muted-foreground">
                  Cursor will display the deployer wallet's private key in the terminal output. <strong>You must save this private key</strong> and add it to Vercel as <code className="text-xs bg-black/20 px-1 rounded">ERC721_DEPLOYER_PRIVATE_KEY</code> so the deployed app can access it.
                </p>
              </div>

              <ExpandableCodeBlock code={`# GO TO VERCEL ENVIRONMENT SETTINGS:
# 1. vercel.com → Your Project → Settings → Environment Variables
# 2. Scroll down to "Environment Variables" section

# ADD THREE CDP VARIABLES (paste EXACTLY as shown):

# VARIABLE 1:
# Name: CDP_API_KEY_NAME
# Value: organizations/xxx/apiKeys/yyy
# Check: Production, Preview, Development

# VARIABLE 2:
# Name: CDP_API_KEY_PRIVATE_KEY
# Value: -----BEGIN EC PRIVATE KEY-----...
# Check: Production, Preview, Development

# VARIABLE 3:
# Name: CDP_PROJECT_ID
# Value: your-project-uuid-here
# Check: Production, Preview, Development

# AFTER ADDING ALL THREE:
# 1. Go to Deployments tab
# 2. Find latest production deployment
# 3. Click "Redeploy"
# 4. Wait 2-3 minutes for deployment to complete

# THE DEPLOYMENT WILL GENERATE A DEPLOYER WALLET
# This happens in the background during the redeploy

# VERIFY: All three variables saved in all three environments`}
                previewLength={300}
              />

              <div className="mt-6 p-4 border border-border bg-card rounded">
                <p className="font-semibold text-foreground mb-3">⚙️ What Happens During Redeploy</p>
                <ol className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>1. Cursor runs the deploy:</strong> When you redeploy, Cursor's API route will initialize</li>
                  <li><strong>2. Wallet generated:</strong> CDP creates a new deployer wallet from your credentials</li>
                  <li><strong>3. Private key shown:</strong> The wallet's private key appears in server logs</li>
                  <li><strong>4. Ready for ERC721:</strong> The wallet is now ready to deploy ERC721 contracts</li>
                </ol>
              </div>

              <div className="mt-6 p-4 border-l-4 border-orange-500 bg-orange-500/10 rounded-r">
                <p className="font-semibold text-orange-700 dark:text-orange-400 mb-2">📋 Next Step: Find & Save the Deployer Private Key</p>
                <p className="text-sm text-muted-foreground mb-3">
                  After redeploy completes, you need to find the deployer wallet's private key from the Vercel deployment logs or Cursor terminal output.
                </p>
                <p className="text-sm text-muted-foreground mb-2 font-semibold">Option A: From Vercel Logs</p>
                <ol className="space-y-1 text-xs text-muted-foreground ml-4 mb-3">
                  <li>1. Go to vercel.com → Your Project → Deployments</li>
                  <li>2. Click on the latest deployment</li>
                  <li>3. Go to "Functions" tab</li>
                  <li>4. Look for logs showing the wallet address and private key</li>
                </ol>
                <p className="text-sm text-muted-foreground mb-2 font-semibold">Option B: From Cursor Terminal (if running locally)</p>
                <ol className="space-y-1 text-xs text-muted-foreground ml-4">
                  <li>1. Look in Cursor terminal output after "Deploy ERC721" step</li>
                  <li>2. Search for text like "Deployer wallet:" or "Private key:"</li>
                  <li>3. Save the entire private key (including dashes if present)</li>
                </ol>
              </div>

              <div className="mt-6 p-4 border border-border bg-card rounded">
                <p className="font-semibold text-foreground mb-3">🔐 Add Deployer Private Key to Vercel</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Once you have the deployer private key, add it to Vercel:
                </p>
                <ExpandableCodeBlock code={`# In Vercel → Settings → Environment Variables
# Add ONE MORE variable:

# VARIABLE 4:
# Name: ERC721_DEPLOYER_PRIVATE_KEY
# Value: (paste the full private key here)
# Check: Production, Preview, Development

# THEN REDEPLOY AGAIN
# This time the ERC721 deployment will succeed because it has the deployer wallet key`}
                  previewLength={250}
                />
              </div>

              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Success</p>
                <p className="text-muted-foreground text-xs">All variables added (including deployer key), redeploy complete, ERC721 ready for Phase 5 testing</p>
              </div>

              <CollapsibleSection title="Troubleshooting" variant="advanced" defaultOpen={false}>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Can't find API Keys in CDP:</p>
                    <p>Go to portal.cdp.coinbase.com/access or Settings → Developer Settings → API Keys. Copy all three values.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Lost deployer private key:</p>
                    <p>Unfortunately, the key is only shown once during wallet generation. Check Vercel deployment logs. If lost, you'll need to regenerate in Phase 5.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Wallet creation fails after redeploy:</p>
                    <p>Verify all 4 environment variables are set correctly in Vercel. Check F12 console for specific error messages. Common issue: mismatched or incomplete private key.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Deployment fails with "Wallet not found":</p>
                    <p>The ERC721_DEPLOYER_PRIVATE_KEY variable may be missing or incorrect. Verify it was added to Vercel and redeploy.</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 4.4: Setup Ethers.js */}
            <StepSection id="ethers-setup" title="4.4 Setup Ethers.js" emoji="📚" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Ensure ethers.js is installed and configured for contract deployment.</p>
              
              <ExpandableCodeBlock code={`# Verify ethers.js is installed
npm list ethers

# If not installed, add it
npm install ethers

# The SDK handles wallet initialization from your deployed app's environment variables`}
                previewLength={200}
              />
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">ℹ️ About Ethers.js</p>
                <p className="text-muted-foreground text-xs">ethers.js is already configured in your template. It will use the CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY from your environment variables to manage wallet transactions.</p>
              </div>
            </StepSection>

            {/* 4.5: Fund Wallet on Testnet */}
            <StepSection id="fund-wallet" title="4.5 Fund Wallet on Testnet" emoji="💵" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Your deployer wallet needs testnet ETH to deploy contracts. Use a faucet to fund it.</p>
              
              <ExpandableCodeBlock code={`# GET YOUR DEPLOYER WALLET ADDRESS
# After redeploy completes (from section 4.3), you'll have a wallet address like:
# 0x1234567890abcdef...

# FUND FROM BASE SEPOLIA FAUCET
# 1. Go to https://www.coinbase.com/faucets (use your CDP account)
# 2. Paste your deployer wallet address
# 3. Request testnet ETH
# 4. Wait a few minutes for transaction to confirm

# ALTERNATIVE: Use Alchemy Faucet
# https://www.alchemy.com/faucets/base-sepolia`}
                previewLength={250}
              />
              
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ How Much ETH?</p>
                <p className="text-muted-foreground text-xs">Each contract deployment costs ~0.005-0.01 ETH in gas. Request at least 0.05 ETH to be safe.</p>
              </div>
            </StepSection>

            {/* 4.6: Deploy ERC721 Contract */}
            <StepSection id="deploy-contract" title="4.6 Deploy ERC721 Contract" emoji="🚀" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Deploy your first ERC721 NFT collection to Base Sepolia testnet.</p>
              
              <ExpandableCodeBlock code={`# From your deployed app (at your Vercel URL)
# 1. Go to your app's /protected/profile page
# 2. Sign in with your test account
# 3. Scroll to "Create NFT Collection" section
# 4. Fill in:
#    - Collection Name: e.g., "My First NFTs"
#    - Collection Symbol: e.g., "MFT"
#    - Max Supply: 10000
#    - Mint Price: 0 (free for testing)
# 5. Click "Deploy NFT Collection"
# 6. Wait 15-30 seconds for blockchain confirmation

# VERIFY SUCCESS
# - You'll see the contract address displayed
# - Check on BaseScan: https://sepolia.basescan.org/
# - Search for your contract address`}
                previewLength={300}
              />
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">🔐 Behind the Scenes</p>
                <p className="text-muted-foreground text-xs">When you click "Deploy", your browser sends the request to your Vercel app's API. The server uses ethers.js with the deployer wallet private key (from environment variables) to sign and broadcast the deployment transaction to Base Sepolia.</p>
              </div>

              <CollapsibleSection title="Troubleshooting Deployment" variant="advanced" defaultOpen={false}>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Deployment fails with "Insufficient funds":</p>
                    <p>Your deployer wallet doesn't have enough testnet ETH. Request more from the faucet and try again.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Contract address not displaying:</p>
                    <p>Check your browser console (F12) for error messages. Common issue: missing ERC721_DEPLOYER_PRIVATE_KEY environment variable.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">BaseScan shows failed transaction:</p>
                    <p>Check the error message in BaseScan. Usually indicates insufficient gas or parameter validation failure. Verify your collection parameters are valid.</p>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>
          </div>

          {/* PHASE 5: TESTING */}
          <div className="my-6">
            <div className="mb-3 p-4 border-l-4 border-green-500 bg-green-500/5 rounded-r">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Phase 5: Testing &amp; Verification</h1>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-500/20 px-2 py-1 rounded">
                  ✅ MANUAL TESTING - 5 min
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You run manual verification tests to confirm everything works end-to-end.
              </p>
            </div>

            {/* 5.1: Basic Authentication Test */}
            <StepSection id="test-auth" title="5.1 Test User Authentication" emoji="🔐" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Verify signup and email confirmation work end-to-end.</p>

              <ExpandableCodeBlock
                code={`# TEST USER AUTHENTICATION FLOW
# This script generates a unique test email for signup testing

EMAIL=$(date +%s)@mailinator.com
PASSWORD="Test123456!"

echo "=== User Authentication Test ==="
echo ""
echo "Test Email: $EMAIL"
echo "Test Password: $PASSWORD"
echo ""
echo "Manual Steps:"
echo "1. Visit your Vercel URL: https://your-project.vercel.app"
echo "2. Click 'Sign Up' link"
echo "3. Enter email: $EMAIL"
echo "4. Enter password: $PASSWORD"
echo "5. Click 'Sign Up' button"
echo "6. Go to mailinator.com"
echo "7. Enter email: $EMAIL"
echo "8. Find confirmation email from your app"
echo "9. Click confirmation link"
echo "10. You should be redirected to login page"
echo "11. Login with the credentials above"
echo "12. Verify you see /profile page"
echo ""
echo "✓ Success when:"
echo "   - Profile page loads after login"
echo "   - Email address is displayed"
echo "   - No console errors (press F12 to check)"`}
                language="bash"
                successCriteria="Profile page loads and displays your test email address"
              />

              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-sm">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Pro Tip</p>
                <p className="text-muted-foreground text-xs">Use mailinator.com for instant test email accounts - no signup required</p>
              </div>
            </StepSection>

            {/* 5.2: Wallet Creation Test */}
            <StepSection id="test-wallet" title="5.2 Test ERC721 Deployment" emoji="💰" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Verify CDP integration works and wallets are created successfully.</p>

              <div className="my-3 p-4 border border-green-500/20 bg-green-500/5 rounded">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ This test verifies your complete Web3 setup</p>
                <p className="text-xs text-muted-foreground">If wallet creation works, your entire Web3 setup is functional. If it fails, check the troubleshooting section below.</p>
              </div>

              <ExpandableCodeBlock
                code={`# TEST ERC721 DEPLOYMENT
# Verify the ERC721 contract deployment was successful

echo "=== Wallet Creation Test ==="
echo ""
echo "Prerequisites:"
echo "  ✓ You must be logged in at your Vercel URL"
echo "  ✓ You must have created a test user account (from 5.1)"
echo "  ✓ Browser DevTools ready (F12)"
echo ""
echo "Steps:"
echo "1. Navigate to your Vercel app: https://your-project.vercel.app"
echo "2. Log in with your test account"
echo "3. Click 'Create Wallet' button (or equivalent)"
echo "4. Open browser DevTools: Press F12"
echo "5. Go to Console tab"
echo "6. Wait 5-10 seconds for wallet generation"
echo ""
echo "✓ Success indicators:"
echo "   - Wallet address appears on page (starts with 0x)"
echo "   - Example format: 0x1234567890abcdef1234567890abcdef12345678"
echo "   - Total length: 42 characters (0x + 40 hex chars)"
echo "   - No errors in console (Console tab is clean)"
echo ""
echo "❌ Failure indicators:"
echo "   - Red error messages in console"
echo "   - Network error"
echo "   - Wallet address is blank or invalid"
echo ""
echo "⏱️  Timeout (takes >30 seconds):"
echo "   - Check network tab for failed requests"
echo "   - Verify CDP_API_KEY_NAME is set in Vercel"
echo "   - Verify CDP_API_KEY_PRIVATE_KEY is set in Vercel"
echo "   - Verify CDP_PROJECT_ID is set in Vercel"`}
                language="bash"
                requiresBrowser={true}
                successCriteria="Wallet address appears (0x...) with 42 characters total, no console errors"
              />

              <CollapsibleSection title="Troubleshooting Wallet Creation" variant="advanced" defaultOpen={false}>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Error: "Invalid API Key"</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                      <li>Go to Vercel dashboard → Settings → Environment Variables</li>
                      <li>Verify CDP_API_KEY_NAME exactly matches from Coinbase</li>
                      <li>Verify no extra spaces before/after</li>
                      <li>Click "Redeploy" on latest deployment</li>
                      <li>Wait 3-5 minutes for deployment to complete</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Error: "Network error" or "timeout"</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                      <li>Check your internet connection</li>
                      <li>Verify CDP_API_KEY_PRIVATE_KEY is set in Vercel</li>
                      <li>Go to Vercel → Deployments → Find latest</li>
                      <li>Check deployment logs for errors</li>
                      <li>Try wallet creation again after 5 minutes</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Private Key Lost/Incorrect</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                      <li>Go to Coinbase portal.cdp.coinbase.com</li>
                      <li>Navigate to API Keys</li>
                      <li>Delete the old API key</li>
                      <li>Click "Create API Key" to generate a new one</li>
                      <li>Copy all 3 values again (Name, Private Key, Project ID)</li>
                      <li>Update all 3 in Vercel Environment Variables</li>
                      <li>Redeploy</li>
                    </ul>
                  </div>
                </div>
              </CollapsibleSection>
            </StepSection>

            {/* 5.3: Database Verification */}
            <StepSection id="test-supabase" title="5.3 Verify Supabase Database" emoji="🗃️" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Confirm wallet address was saved to the database correctly.</p>

              <ExpandableCodeBlock
                code={`# VERIFY SUPABASE DATABASE RECORDS
# Check if wallet was saved after creation (from 5.2)

echo "=== Supabase Database Verification ==="
echo ""
echo "Prerequisites:"
echo "  ✓ You created at least one wallet (from 5.2)"
echo "  ✓ You can access Supabase dashboard"
echo ""
echo "Steps:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Log in with GitHub credentials"
echo "3. Select your project"
echo "4. Click 'Table Editor' (left sidebar, under SQL Editor)"
echo "5. Click 'profiles' table"
echo "6. Look for your test user row (search by email)"
echo ""
echo "✓ Success when you see:"
echo "   - email column: [your test email]"
echo "   - wallet_address column: 0x... (42 chars)"
echo "   - created_at column: [timestamp]"
echo "   - updated_at column: [recent timestamp]"
echo ""
echo "Data should match:"
echo "   - Wallet address from 5.2"
echo "   - Email address from 5.1"
echo "   - Created time should be recent"
echo ""
echo "❌ If wallet_address is NULL or missing:"
echo "   - Check browser console (F12) for errors during wallet creation"
echo "   - Verify API call to /api/wallet/create succeeded"
echo "   - Check Vercel deployment logs for errors"`}
                language="bash"
                successCriteria="Wallet address and email both visible in profiles table with recent timestamps"
              />
            </StepSection>

            {/* 5.4: Complete Checklist */}
            <StepSection id="test-checklist" title="5.4 Final Verification Checklist" emoji="✅" estimatedTime="">
              <p className="text-sm text-muted-foreground mb-3">Run through all functionality checks before considering deployment complete.</p>

              <ExpandableCodeBlock
                code={`# FINAL PRODUCTION VERIFICATION CHECKLIST
# Run through all items before deploying to production

echo "=== FINAL PRODUCTION VERIFICATION CHECKLIST ==="
echo ""
echo "Phase 1: Authentication & User System"
echo "  ☐ User signup works at /auth/sign-up"
echo "  ☐ Email confirmation received and works"
echo "  ☐ Can log in after email confirmation"
echo "  ☐ Profile page loads at /protected/profile"
echo "  ☐ Profile shows correct email address"
echo "  ☐ Logout button works and clears session"
echo ""
echo "Phase 2: Wallet & Web3"
echo "  ☐ Wallet creation button exists on profile"
echo "  ☐ Wallet creation succeeds (returns 0x address)"
echo "  ☐ Wallet address saved to database"
echo "  ☐ Wallet address displayed after creation"
echo "  ☐ No console errors during wallet creation (F12)"
echo ""
echo "Phase 3: UI/UX & Responsiveness"
echo "  ☐ Dark/light mode toggle works"
echo "  ☐ Theme preference persists on page reload"
echo "  ☐ Mobile responsive (test at 375px width)"
echo "  ☐ Tablet responsive (test at 768px width)"
echo "  ☐ All links work (navigation functional)"
echo "  ☐ Form inputs accessible on mobile"
echo ""
echo "Phase 4: Environment & Deployment"
echo "  ☐ NEXT_PUBLIC_SUPABASE_URL set in Vercel"
echo "  ☐ NEXT_PUBLIC_SUPABASE_ANON_KEY set in Vercel"
echo "  ☐ CDP_API_KEY_NAME set in Vercel"
echo "  ☐ CDP_API_KEY_PRIVATE_KEY set in Vercel"
echo "  ☐ CDP_PROJECT_ID set in Vercel"
echo "  ☐ All environment variables in Production environment"
echo "  ☐ Latest deployment shows 'Ready' status"
echo ""
echo "Phase 5: Browser & Console Health"
echo "  ☐ Open DevTools: Press F12"
echo "  ☐ Go to Console tab"
echo "  ☐ No red error messages"
echo "  ☐ No yellow warning messages (minor warnings ok)"
echo "  ☐ Go to Network tab"
echo "  ☐ All API calls return 200/201 status (no 500 errors)"
echo ""
echo "Phase 6: Database Health"
echo "  ☐ Go to Supabase dashboard"
echo "  ☐ Click 'profiles' table"
echo "  ☐ Your test user is visible"
echo "  ☐ wallet_address is populated (not null)"
echo "  ☐ created_at timestamp is correct"
echo ""
echo "=== READY FOR PRODUCTION ==="
echo "If all items checked, your Web3 dApp is production-ready!"`}
                language="bash"
                successCriteria="All checkboxes pass - your Web3 dApp is production-ready"
              />
            </StepSection>
          </div>

          {/* Completion */}
          <div className="my-6">
            <div className="mt-6 text-center">
              <div className="inline-block rounded-2xl bg-gradient-to-r from-primary to-primary/60 p-1">
                <div className="rounded-xl bg-background px-8 py-6">
                  <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                    You&apos;re Deployed
                  </p>
                  <p className="text-foreground text-sm">
                    Your Web3 dApp is live in production.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    All 5 phases complete: Git, Vercel, Supabase, CDP, and Testing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 6: Feature Planning & Implementation */}
          <div className="space-y-6">
            <div className="text-center mb-8">
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
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Establish a systematic approach to planning and implementing new features.
                </p>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">📋 The MD → Review → Implement Workflow</h3>

                  <div className="space-y-3">
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

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
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
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Learn how to conduct and participate in architecture reviews for new features.
                </p>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">🏗️ What to Review</h3>

                  <div className="grid md:grid-cols-2 gap-4">
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

                <ExpandableCodeBlock
                  code={`Review this feature architecture for a new staking rewards system:

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
                language="bash"
                previewLength={250}
              />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.3 Database Schema Extensions"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Learn how to safely extend your database schema for new features.
                </p>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">🗄️ Safe Schema Evolution</h3>

                  <div className="space-y-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-600 mb-2">✅ Best Practices</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Always backup before migrations</li>
                        <li>• Test migrations on staging first</li>
                        <li>• Use transactions for multi-table changes</li>
                        <li>• Add proper indexes for performance</li>
                        <li>• Update RLS policies for security</li>
                      </ul>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
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

                <ExpandableCodeBlock
                  code={`Help me design a database schema for a new social features system:

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
                language="bash"
                previewLength={250}
              />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.4 Code Structure Best Practices"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Maintain high code quality as your application grows.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">📁 File Organization</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <code>components/feature-name/</code> for feature-specific components</li>
                      <li>• <code>lib/feature-name.ts</code> for business logic</li>
                      <li>• <code>types/feature-name.ts</code> for TypeScript types</li>
                      <li>• <code>app/api/feature-name/</code> for API routes</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">🔧 Code Patterns</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Custom hooks for reusable logic</li>
                      <li>• Error boundaries for graceful failures</li>
                      <li>• Loading states for better UX</li>
                      <li>• Proper TypeScript typing</li>
                    </ul>
                  </div>
                </div>

                <ExpandableCodeBlock
                  code={`Help me refactor this component to follow best practices:

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
                language="bash"
                previewLength={250}
              />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="6.5 Community Contribution"
              variant="info"
              defaultOpen={false}
            >
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Learn how to contribute back to the ecosystem and help other developers.
                </p>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">🤝 Ways to Contribute</h3>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl mb-2">📖</div>
                      <h4 className="font-semibold">Documentation</h4>
                      <p className="text-sm text-muted-foreground">
                        Improve guides, add examples, clarify complex topics
                      </p>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl mb-2">🐛</div>
                      <h4 className="font-semibold">Bug Reports</h4>
                      <p className="text-sm text-muted-foreground">
                        Report issues with clear reproduction steps
                      </p>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl mb-2">💡</div>
                      <h4 className="font-semibold">Feature Requests</h4>
                      <p className="text-sm text-muted-foreground">
                        Propose new features with detailed specifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
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
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Access proven patterns and examples for common Web3 development scenarios.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">🔐 Authentication Patterns</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Multi-wallet support (MetaMask, WalletConnect, CDP)</li>
                      <li>• Session management with Supabase</li>
                      <li>• JWT token refresh strategies</li>
                      <li>• Social login integration</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">💰 DeFi Integration Patterns</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Token balance fetching</li>
                      <li>• Transaction signing flows</li>
                      <li>• Gas estimation strategies</li>
                      <li>• Multi-chain support</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">📊 Data Management</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Real-time subscriptions</li>
                      <li>• Optimistic updates</li>
                      <li>• Cache invalidation</li>
                      <li>• Offline support</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">🚀 Deployment Strategies</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Blue-green deployments</li>
                      <li>• Feature flags</li>
                      <li>• Rollback procedures</li>
                      <li>• Performance monitoring</li>
                    </ul>
                  </div>
                </div>

                <ExpandableCodeBlock
                  code={`Show me the implementation pattern for multi-wallet authentication:

I need to support MetaMask, WalletConnect, and CDP wallets in my dApp.
Show me the complete pattern including:
1. Wallet connection logic
2. Signature verification
3. Session management
4. Error handling
5. TypeScript types

Include code examples and explain the security considerations.`}
                language="bash"
                previewLength={250}
              />
              </div>
            </CollapsibleSection>

            <div className="text-center py-8">
              <div className="inline-block bg-gradient-to-r from-primary to-primary/60 p-1 rounded-2xl">
                <div className="bg-background rounded-xl px-12 py-6">
                  <h2 className="text-2xl font-bold mb-3">🎉 Phase 6 Complete!</h2>
                  <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
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

                  <p className="text-xs text-muted-foreground mt-4">
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
