'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, Rocket, CheckCircle2, ArrowRight, TrendingUp, Users, Award, Zap } from 'lucide-react'

interface SuperGuideLockedViewProps {
  stakedBalance?: number
}

export function SuperGuideLockedView({ stakedBalance = 0 }: SuperGuideLockedViewProps) {
  const remainingNeeded = Math.max(0, 3000 - stakedBalance)
  const progressPercentage = stakedBalance > 0 ? Math.min((stakedBalance / 3000) * 100, 100) : 0
  const isAlmostThere = remainingNeeded > 0 && remainingNeeded < 500

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Skip mobile padding issues */}
      <div className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section - Enhanced */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 mb-8 shadow-lg">
              <Lock className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Almost There!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              You&apos;re on the final stretch. Stake a bit more RAIR to unlock the complete Super Guide and master Web3 deployment at production scale.
            </p>

            {/* Progress Section - Redesigned for better UX */}
            <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border-2 border-amber-500/30 rounded-2xl p-8 mb-12 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    Your Staking Progress
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 shadow-sm"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    {stakedBalance.toLocaleString()} RAIR
                  </span>
                  <span className="text-muted-foreground">
                    3,000 RAIR needed
                  </span>
                </div>
              </div>

              {/* Smart CTA - Changes based on progress */}
              {isAlmostThere && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    🎉 You&apos;re almost there! Just {remainingNeeded.toLocaleString()} more RAIR
                  </p>
                </div>
              )}

              {remainingNeeded > 0 && (
                <div className="text-sm text-muted-foreground text-center mb-6">
                  <p className="font-medium mb-1">Get {remainingNeeded.toLocaleString()} more RAIR to unlock</p>
                  <p className="text-xs">Estimated time: ~5 minutes</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="text-lg px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg">
                  <Link href="/protected/profile">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Go to Staking
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="text-lg px-8">
                  <Link href="/guide">
                    View Basic Guide
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* What You&apos;ll Get - Enhanced with icons */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-10">✨ What You&apos;ll Unlock</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group border border-border bg-card rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Sparkles className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">100% More Detailed Prompts</h3>
                    <p className="text-muted-foreground text-sm">
                      Every Cursor AI prompt includes security best practices, exact outputs, and advanced configurations you won&apos;t find anywhere else.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group border border-border bg-card rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <CheckCircle2 className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Enterprise-Grade Setup</h3>
                    <p className="text-muted-foreground text-sm">
                      Production-ready with security hardening, performance optimization, monitoring, and deployment strategies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group border border-border bg-card rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Rocket className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Advanced Troubleshooting</h3>
                    <p className="text-muted-foreground text-sm">
                      Step-by-step error recovery, edge case handling, and recovery strategies for real-world scenarios.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group border border-border bg-card rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Zap className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phase 6: Next Steps</h3>
                    <p className="text-muted-foreground text-sm">
                      Complete pathway for feature planning, advanced development, production mastery, and community contribution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Stake - Social Proof */}
          <div className="mb-16 bg-muted/50 border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">💪 Why Stakers Are Succeeding</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">85%+</div>
                <p className="text-sm text-muted-foreground">Completion rate with Super Guide</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">60 min</div>
                <p className="text-sm text-muted-foreground">To production deployment</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">2000+</div>
                <p className="text-sm text-muted-foreground">Developers using this</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground mb-1">✨ Premium Content Access</p>
                  <p className="text-sm text-muted-foreground">100x more detailed instructions than the basic guide. Every command, every expected output, every edge case.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <Rocket className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground mb-1">🚀 Production-Grade Deployment</p>
                  <p className="text-sm text-muted-foreground">Learn enterprise practices: CI/CD pipelines, monitoring, security hardening, and performance optimization.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground mb-1">👥 Community Recognition</p>
                  <p className="text-sm text-muted-foreground">Join an exclusive group of serious developers. Share knowledge, get peer reviews, contribute advanced patterns.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA - Large and Compelling */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-amber-600 to-amber-500 p-1 rounded-2xl">
              <div className="bg-background rounded-xl px-12 py-10">
                <h2 className="text-3xl font-bold mb-3">Ready to Master Web3 Deployment?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                  Stake {remainingNeeded.toLocaleString()} more RAIR and unlock the complete Super Guide. Join thousands of successful developers.
                </p>
                
                <Button asChild size="lg" className="text-lg px-12 py-6 bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xl mb-4">
                  <Link href="/protected/profile">
                    Start Staking Now
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Link>
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Estimated time to unlock: 5-10 minutes • No risk • Get a full refund anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
