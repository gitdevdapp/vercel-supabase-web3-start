'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CodeBlock } from './guide/CodeBlock'

export function DeploymentGuideSection() {
  return (
    <section className="w-full py-20 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Deploy in 60 Minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Production-ready Web3 dApp deployment. Just replace environment variables and run one SQL script.
          </p>
        </div>

        {/* What You Need */}
        <div className="mb-16 bg-card rounded-2xl p-8 border border-border shadow-lg">
          <h3 className="text-2xl font-bold mb-6">
            What You Need
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold mb-1">Supabase Account (Free)</h4>
                  <p className="text-sm text-muted-foreground">Database & Authentication</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold mb-1">Vercel Account (Free)</h4>
                  <p className="text-sm text-muted-foreground">Hosting Platform</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold mb-1">CDP Account (Optional)</h4>
                  <p className="text-sm text-muted-foreground">For Web3 Wallet Features</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold mb-1">60 Minutes</h4>
                  <p className="text-sm text-muted-foreground">First deployment time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Clone & Install */}
        <div className="mb-12 bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-2xl font-bold">Clone & Install</h3>
            <span className="text-sm text-muted-foreground ml-auto">5 minutes</span>
          </div>
          <CodeBlock
            code={`# Clone the starter template
git clone https://github.com/gitdevdapp/vercel-supabase-web3-start.git
cd vercel-supabase-web3-start

# Install dependencies
npm install`}
            language="bash"
            title="Terminal"
          />
        </div>

        {/* Step 2: Supabase Setup */}
        <div className="mb-12 bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-2xl font-bold">Set Up Supabase</h3>
            <span className="text-sm text-muted-foreground ml-auto">15 minutes</span>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>2.1</span>
                <span>Create Supabase Project</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Go to <Link href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">supabase.com/dashboard</Link></li>
                <li>Click &quot;New project&quot;</li>
                <li>Enter project name, generate password, select region</li>
                <li>Wait 2-3 minutes for initialization</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>2.2</span>
                <span>Get Your Credentials</span>
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                In Supabase: <strong>Settings → API</strong>
              </p>
              <CodeBlock
                code={`NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIs...`}
                language="bash"
                title="Copy these 2 values"
              />
              <p className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium">
                These are the only credentials you need to get started.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>2.3 Run Database Setup Script</span>
              </h4>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  This is the ONLY database setup you need to do - one copy/paste!
                </p>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4 mb-4">
                <li>In Supabase dashboard, click <strong>SQL Editor</strong></li>
                <li>Click <strong>&quot;+ New query&quot;</strong> (NOT saved snippets)</li>
                <li>Open <code className="bg-secondary px-2 py-1 rounded">scripts/database/MASTER-SUPABASE-SETUP.sql</code> from the repository</li>
                <li>Copy the <strong>ENTIRE file</strong> (Cmd/Ctrl+A, Cmd/Ctrl+C)</li>
                <li>Paste into the SQL editor</li>
                <li>Click <strong>&quot;Run&quot;</strong> or press Cmd/Ctrl+Enter</li>
              </ol>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                  Expected Output:
                </p>
                <code className="text-xs block text-green-800 dark:text-green-200">
                  DATABASE SETUP COMPLETED SUCCESSFULLY
                </code>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">This creates:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>User profiles table with automatic creation</li>
                  <li>Row Level Security (RLS) policies</li>
                  <li>Profile image storage</li>
                  <li>CDP wallet system (optional, ready when you need it)</li>
                  <li>All triggers, functions, and indexes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Deploy to Vercel */}
        <div className="mb-12 bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-2xl font-bold">Deploy to Vercel</h3>
            <span className="text-sm text-muted-foreground ml-auto">10 minutes</span>
          </div>

          <div className="space-y-6">
            {/* Vercel Screenshot */}
            <div className="border border-border rounded-lg overflow-hidden bg-secondary/20">
              <Image
                src="/images/vercel-start.png"
                alt="Vercel Deployment Screen"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <span>3.1</span>
                <span>Framework Selection</span>
              </h4>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Framework Preset: <strong>Next.js</strong> (auto-detected)
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Vercel will automatically detect Next.js as the framework.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <span>3.2</span>
                <span>Environment Variables</span>
              </h4>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Tip: Paste your entire .env file
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Vercel allows you to paste your entire <code className="bg-blue-200 dark:bg-blue-900 px-1 rounded">.env.local</code> file to populate all fields at once.
                </p>
              </div>
              <CodeBlock
                code={`NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Optional: Add later for Web3 wallet features
# CDP_API_KEY_ID=your-key-here
# CDP_API_KEY_SECRET=your-secret-here
# NEXT_PUBLIC_ENABLE_CDP_WALLETS=true`}
                language="bash"
                title="Environment Variables"
              />
              <p className="text-sm text-muted-foreground">
                Add these variables for <strong>Production</strong>, <strong>Preview</strong>, and <strong>Development</strong> environments.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <span>3.3</span>
                <span>Deploy</span>
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Click <strong>&quot;Deploy&quot;</strong> and wait 2-3 minutes
              </p>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Build completed. Your site is now live.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Update for Production */}
        <div className="mb-12 bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-2xl font-bold">Update for Production</h3>
            <span className="text-sm text-muted-foreground ml-auto">5 minutes</span>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              In Supabase dashboard: <strong>Authentication → Settings</strong>
            </p>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Update Site URL:</h4>
              <CodeBlock
                code="https://your-app.vercel.app"
                language="text"
                title="Site URL"
              />
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Add Production Redirect URLs:</h4>
              <CodeBlock
                code={`https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/auth/confirm
https://your-app.vercel.app/protected/profile
https://your-app.vercel.app/`}
                language="text"
                title="Redirect URLs"
              />
            </div>
          </div>
        </div>

        {/* Success Indicator */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Deployment Complete</h3>
          <p className="text-lg mb-6 opacity-90">
            Your Web3 template is live with authentication, user profiles, and multi-chain pages ready to customize.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs/DEPLOYMENT.md"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Full Deployment Guide
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h4 className="font-semibold mb-2">60 Minute Setup</h4>
            <p className="text-sm text-muted-foreground">
              From clone to production in under an hour. No complex configuration needed.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h4 className="font-semibold mb-2">Secure Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Email verification, automatic profiles, and Row Level Security included.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h4 className="font-semibold mb-2">Multi-Chain Pages</h4>
            <p className="text-sm text-muted-foreground">
              Pre-built pages for 6+ blockchains. Optional Web3 wallet integration.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

