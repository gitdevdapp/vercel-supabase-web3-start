"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Cloud,
  Database,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Zap,
  Target
} from "lucide-react";

const phases = [
  {
    id: 1,
    title: "Git & GitHub Setup",
    time: "6 min",
    icon: GitBranch,
    description: "SSH keys, repository fork, and GitHub authentication",
    outcomes: ["SSH keys configured", "Repository forked", "GitHub access verified"]
  },
  {
    id: 2,
    title: "Local Environment & Vercel Deploy",
    time: "15 min",
    icon: Cloud,
    description: "Node.js install, code clone, and production deployment",
    outcomes: ["Dependencies installed", "Vercel deployment complete", "Live URL obtained"]
  },
  {
    id: 3,
    title: "Supabase Database Setup",
    time: "12 min",
    icon: Database,
    description: "Database creation, authentication, and security policies",
    outcomes: ["Database tables created", "Email auth configured", "RLS policies enabled"]
  },
  {
    id: 4,
    title: "Coinbase CDP Wallet Setup",
    time: "18 min",
    icon: Shield,
    description: "API keys, wallet creation, and smart contract deployment",
    outcomes: ["CDP account configured", "Deployer wallet funded", "ERC721 contract deployed"]
  },
  {
    id: 5,
    title: "Testing & Verification",
    time: "5 min",
    icon: CheckCircle,
    description: "End-to-end testing and system validation",
    outcomes: ["Authentication tested", "Wallet creation verified", "Database records confirmed"]
  }
];

export function SimplifiedHomepageSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Production Web3 dApp in 60 Minutes
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Build & Deploy Your
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent block">
              Web3 Application
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Complete step-by-step guide to create a production-ready decentralized application
            with enterprise-grade security, wallet management, and NFT deployment capabilities.
          </p>

          {/* Primary CTA to SuperGuide */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" asChild className="px-8">
              <a href="https://devdapp.com/superguide" className="inline-flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Start Complete Setup Guide
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <a href="https://devdapp.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Learn More at devdapp.com
              </a>
            </Button>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">5-Step Setup Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each phase builds on the previous one. Complete all 5 phases to have a fully operational Web3 dApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {phases.map((phase) => {
              const IconComponent = phase.icon;
              return (
                <Card key={phase.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {phase.time}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">You'll accomplish:</h4>
                      <ul className="space-y-1">
                        {phase.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* What You Get */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Production-Ready Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your completed dApp includes everything needed for a professional Web3 application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Row-level security, input validation, and secure authentication flows.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Database className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Database & Auth</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  PostgreSQL database with user profiles, wallet management, and contracts tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Cloud className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Global Hosting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deployed on Vercel with worldwide CDN, automatic scaling, and 99.9% uptime.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Web3 Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coinbase CDP wallets, ERC721 NFT deployment, and multi-chain EVM support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SuperGuide CTA */}
        <div className="text-center">
          <Card className="inline-block bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to Start Building?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                The <strong>Super Guide</strong> provides detailed, step-by-step instructions with exact commands,
                troubleshooting tips, and success verification for each phase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="px-8">
                  <a href="https://devdapp.com/superguide" className="inline-flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Open Complete Super Guide
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://devdapp.com/superguide#welcome" className="inline-flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Start with Prerequisites
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                ⚠️ <strong>Important:</strong> The Super Guide is the canonical setup source with all technical details and commands.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
