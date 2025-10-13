'use client'

import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'

export function GuideLockedView() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-6">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Setup Guide Available at DevDapp.com
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            This repository contains the production-ready code. For step-by-step deployment instructions, visit DevDapp.com
          </p>

          {/* Main CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Get the Complete Guide</h2>
            
            <p className="text-muted-foreground mb-6">
              Access copy-paste commands, video tutorials, and detailed deployment instructions
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <a href="https://devdapp.com" target="_blank" rel="noopener noreferrer">
                  Visit DevDapp.com
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <a href="https://github.com/gitdevdapp/vercel-supabase-web3-start" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View Source Code
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What&apos;s on DevDapp.com</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step-by-Step Instructions</h3>
                  <p className="text-muted-foreground text-sm">
                    Copy-paste commands for each deployment step
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cursor AI Prompts</h3>
                  <p className="text-muted-foreground text-sm">
                    AI-powered setup - no coding required
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Video Tutorials</h3>
                  <p className="text-muted-foreground text-sm">
                    Visual walkthroughs for every step
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Deploy in 60 Minutes</h3>
                  <p className="text-muted-foreground text-sm">
                    From clone to production in under an hour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Reminder */}
        <div className="mb-12 bg-muted/50 border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">This Repository Contains</h2>
          
          <ul className="space-y-3 max-w-2xl mx-auto">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Full authentication system (login, signup, password reset)</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">User profile management with image uploads</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Multi-chain blockchain pages (Avalanche, Flow, Tezos, etc.)</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Optional Web3 wallet integration</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Production-ready configuration for Vercel + Supabase</span>
            </li>
          </ul>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-primary to-primary/60 p-1 rounded-2xl">
            <div className="bg-background rounded-xl px-12 py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Deploy?</h2>
              <p className="text-muted-foreground mb-6">
                Get the complete setup guide on DevDapp.com
              </p>
              
              <Button asChild size="lg" className="text-lg px-10">
                <a href="https://devdapp.com" target="_blank" rel="noopener noreferrer">
                  Visit DevDapp.com
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Free • Deploy in under 60 minutes • No coding required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
