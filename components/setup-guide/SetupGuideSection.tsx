"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Database, Cloud, Shield, CheckCircle, AlertCircle, Server, Key, Mail, HardDrive, Code, Rocket, ChevronDown, ChevronUp } from "lucide-react";

export function SetupGuideSection() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const migrationScript = `-- Complete setup script from scripts/master/Complete-setup-V6.sql
-- Execute this entire script in your Supabase SQL Editor

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.wallet_type AS ENUM ('evm', 'solana', 'bitcoin');

-- Create profiles table with Row Level Security
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role app_role default 'user'::app_role,

  constraint username_length check (char_length(username) >= 3)
);

-- Create wallets table for multi-chain wallet management
CREATE TABLE public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_address text not null,
  wallet_type wallet_type default 'evm'::wallet_type,
  chain_id integer,
  network_name text,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, wallet_address, chain_id)
);

-- Create contracts table for NFT deployment tracking
CREATE TABLE public.contracts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contract_address text not null,
  contract_name text,
  contract_symbol text,
  chain_id integer not null,
  network_name text,
  transaction_hash text,
  deployment_status text default 'pending',
  contract_type text default 'erc721',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(contract_address, chain_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own wallets." ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets." ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets." ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets." ON public.wallets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contracts." ON public.contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts." ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts." ON public.contracts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX wallets_user_id_idx ON public.wallets(user_id);
CREATE INDEX wallets_address_idx ON public.wallets(wallet_address);
CREATE INDEX contracts_user_id_idx ON public.contracts(user_id);
CREATE INDEX contracts_address_idx ON public.contracts(contract_address);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_wallets
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_contracts
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

  const environmentVariables = `# Supabase Database Access
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-jwt
SUPABASE_SERVICE_ROLE_KEY=your-service-role-jwt

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-deployed-app.vercel.app

# Coinbase Developer Platform (CDP) - Wallet Management
CDP_API_KEY_ID=your-cdp-api-key-identifier
CDP_API_KEY_SECRET=your-cdp-api-key-secret
CDP_WALLET_SECRET=your-cdp-wallet-secret

# Deployer Wallet - Smart Contract Deployment
DEPLOYER_PRIVATE_KEY=0xyour-64-character-hex-private-key
NEXT_PUBLIC_DEPLOYER_ADDRESS=0xyour-40-character-wallet-address`;

  const emailTemplate = `<h2>🎉 Welcome to Your App!</h2>
<p>Thanks for signing up! Click the button below to confirm your email and start using Your App:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
    ✅ Confirm Email & Start Using Your App
  </a>
</div>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
  <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">🚀 What you'll get access to:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
    <li>🏦 Create and manage crypto wallets</li>
    <li>💰 Send and receive USDC transfers</li>
    <li>🔗 Connect to multiple blockchain networks</li>
    <li>📊 Track your portfolio and transactions</li>
    <li>🛡️ Enterprise-grade security</li>
  </ul>
</div>

<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <strong>Backup Link:</strong> If the button doesn't work, copy and paste this link:
</p>
<p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/protected/profile
</p>

<div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
  <p style="margin: 0; font-size: 14px;">
    <strong>⏰ Important:</strong> This link will expire in 24 hours for security.
  </p>
</div>

<p style="margin-top: 20px; font-size: 13px; color: #666;">
  If you didn't create an account, you can safely ignore this email.
</p>

<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888;">
  <p>Your App • <a href="https://yourdomain.com" style="color: #0070f3;">yourdomain.com</a></p>
</div>`;

  const redirectUrls = `# Production Domain URLs (replace yourdomain.com with your actual domain)
https://yourdomain.com/auth/confirm
https://yourdomain.com/auth/callback
https://yourdomain.com/protected/profile
https://yourdomain.com/auth/login
https://yourdomain.com/auth/sign-up
https://yourdomain.com/auth/forgot-password
https://yourdomain.com/auth/error

# Development URLs (keep for local development)
http://localhost:3000/auth/callback
http://localhost:3000/protected/profile

# Vercel Preview URLs (optional, for staging deployments)
https://vercel-supabase-web3.vercel.app/auth/callback
https://vercel-supabase-web3.vercel.app/protected/profile`;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            🚀 Complete Web3 dApp Setup Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Follow this comprehensive guide to deploy your production-ready EVM Web3 application
            with enterprise-grade security, wallet management, and NFT deployment capabilities.
          </p>
        </div>

        {/* Critical Setup Requirements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">⚡ Critical Setup Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>Supabase Account</CardTitle>
                <CardDescription>PostgreSQL database with Row Level Security</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create Account
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Cloud className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Vercel Account</CardTitle>
                <CardDescription>Deployment and hosting platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create Account
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <CardTitle>Coinbase Developer Platform</CardTitle>
                <CardDescription>Wallet management and smart contract deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://portal.cdp.coinbase.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create Account
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Database Setup */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              🗄️ Supabase Database Setup
            </CardTitle>
            <CardDescription>
              Create new Supabase project and execute the complete migration script
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Project Configuration:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Project name: Your application identifier</li>
                  <li>Strong database password</li>
                  <li>Region: Closest to target users</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Execute Database Migration:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(migrationScript, 'migration')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedStates.migration ? 'Copied!' : 'Copy Script'}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    <code>{migrationScript}</code>
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Configuration */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-6 h-6" />
              🔑 Critical Environment Configuration
            </CardTitle>
            <CardDescription>All required environment variables for deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Supabase Configuration */}
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('supabase')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Supabase Configuration</CardTitle>
                    {expandedSections.supabase ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.supabase && (
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Database and authentication variables</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(environmentVariables, 'supabase-env')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copiedStates['supabase-env'] ? 'Copied!' : 'Copy Variables'}
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{environmentVariables}</code>
                      </pre>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <strong>Security Requirements:</strong> CDP_API_KEY_SECRET and DEPLOYER_PRIVATE_KEY must never be committed to version control.
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* CDP Configuration */}
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('cdp')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Coinbase Developer Platform Setup</CardTitle>
                    {expandedSections.cdp ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.cdp && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">API Keys Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">Create CDP account and generate API key with Read/Write permissions</p>
                          <Button asChild size="sm">
                            <a href="https://portal.cdp.coinbase.com" target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              CDP Portal
                            </a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Deployer Wallet</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">Create dedicated wallet for NFT contract deployment</p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Target network: Base (or preferred EVM)</li>
                            <li>• Fund with sufficient ETH for gas</li>
                            <li>• Securely store private key</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Deployment Configuration */}
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('deployment')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Vercel Deployment</CardTitle>
                    {expandedSections.deployment ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.deployment && (
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Vercel environment variable configuration</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(environmentVariables, 'vercel-env')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copiedStates['vercel-env'] ? 'Copied!' : 'Copy Variables'}
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm">
                        <code>{environmentVariables}</code>
                      </pre>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <strong>Production Security:</strong> Set sensitive keys for Production environment only. Enable 2FA on Vercel account.
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Security Configuration */}
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('security')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Security Best Practices</CardTitle>
                    {expandedSections.security ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.security && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium">Key Management:</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Regular CDP API key rotation</li>
                          <li>• Separate dev/prod environments</li>
                          <li>• Hardware security modules</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium">Operational Security:</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Test contracts on testnets first</li>
                          <li>• Minimal funds in deployer wallets</li>
                          <li>• 2FA on all service accounts</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Setup */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              📧 Authentication Configuration
            </CardTitle>
            <CardDescription>Email-based authentication with secure confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Email Template Configuration:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(emailTemplate, 'email-template')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedStates['email-template'] ? 'Copied!' : 'Copy Template'}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    <code>{emailTemplate}</code>
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Redirect URLs Configuration:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(redirectUrls, 'redirect-urls')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedStates['redirect-urls'] ? 'Copied!' : 'Copy URLs'}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    <code>{redirectUrls}</code>
                  </pre>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Result:</strong> Secure email-based authentication with automatic user profile creation and wallet management capabilities.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Setup */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-6 h-6" />
              🪣 Supabase Storage Configuration
            </CardTitle>
            <CardDescription>Secure file storage for user profile images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Storage Bucket Setup:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Bucket name: <code>profile-images</code></li>
                    <li>• Access: Private (not public)</li>
                    <li>• File size limit: 5MB maximum</li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <Button asChild>
                    <a href="https://supabase.com/dashboard/project/_/storage/buckets" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Storage Console
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Validation */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              ✅ System Validation Requirements
            </CardTitle>
            <CardDescription>Core functionality verification checklist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Authentication Flow:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Email signup → confirmation → profile access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">User profiles: Create, edit, save data</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Web3 Integration:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">EVM network connectivity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">CDP wallet management</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Expected System State:</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Fully operational Web3 dApp with authenticated users, wallet management, and EVM network connectivity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-6 h-6" />
              🏗️ Architecture Overview
            </CardTitle>
            <CardDescription>What you get with this complete Web3 dApp setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold">🔐 Authentication System</h4>
                <p className="text-sm text-muted-foreground">Email signup/login with secure confirmation</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">👤 User Profiles</h4>
                <p className="text-sm text-muted-foreground">Rich profiles with automatic database creation</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">💼 Wallet Management</h4>
                <p className="text-sm text-muted-foreground">Coinbase Developer Platform integration</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🪙 NFT Deployment</h4>
                <p className="text-sm text-muted-foreground">ERC721 smart contracts on any EVM network</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🌐 Multi-Chain EVM</h4>
                <p className="text-sm text-muted-foreground">Base, Avalanche, Ethereum, Polygon, and more</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🛡️ Enterprise Security</h4>
                <p className="text-sm text-muted-foreground">Row-level security and input validation</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Technical Stack:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <Badge variant="outline">Next.js 15</Badge>
                <Badge variant="outline">React 19</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Supabase</Badge>
                <Badge variant="outline">Coinbase CDP</Badge>
                <Badge variant="outline">Ethers.js</Badge>
                <Badge variant="outline">Vercel</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment CTA */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-8">
              <Rocket className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">🚀 Ready to Deploy?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your complete Web3 dApp is ready for production deployment with enterprise-grade security and wallet management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                    <Server className="w-5 h-5 mr-2" />
                    Deploy to Vercel
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://devdapp.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Learn More at devdapp.com
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

