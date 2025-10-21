'use client'

import { useEffect, useState, useRef } from 'react'
import { Check, ChevronRight, ChevronDown } from 'lucide-react'

interface SubStep {
  id: string
  title: string
  shortTitle: string
  estimatedTime: string
  isOptional?: boolean
}

interface Phase {
  id: string
  phaseNumber: number
  title: string
  emoji: string
  isRequired?: boolean
  description: string
  steps: SubStep[]
}

const phases: Phase[] = [
  {
    id: 'phase-0',
    phaseNumber: 0,
    title: 'Welcome',
    emoji: '👋',
    description: 'Getting started with the guide',
    steps: [
      { id: 'welcome', title: 'Getting Started', shortTitle: 'Welcome', estimatedTime: '2 min' }
    ]
  },
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'GitHub Setup',
    emoji: '🐙',
    description: 'Configure GitHub as your master login',
    steps: [
      { id: 'git', title: '1.1 Install Git', shortTitle: 'Install Git', estimatedTime: '5 min' },
      { id: 'github', title: '1.2 Create GitHub Account', shortTitle: 'GitHub Account', estimatedTime: '5 min' },
      { id: 'ssh', title: '1.3 Setup SSH Keys', shortTitle: 'SSH Keys', estimatedTime: '5 min' },
      { id: 'fork', title: '1.4 Fork Repository', shortTitle: 'Fork Repo', estimatedTime: '3 min' }
    ]
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Vercel Deployment',
    emoji: '▲',
    description: 'Deploy your application to production',
    steps: [
      { id: 'node', title: '2.1 Install Node.js', shortTitle: 'Node.js', estimatedTime: '3 min' },
      { id: 'clone', title: '2.2 Clone Repository', shortTitle: 'Clone Repo', estimatedTime: '5 min' },
      { id: 'vercel', title: '2.3 Create Vercel Account & Deploy', shortTitle: 'Deploy', estimatedTime: '10 min' }
    ]
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: 'Supabase Setup',
    emoji: '🗄️',
    description: 'Configure database and authentication',
    steps: [
      { id: 'supabase', title: '3.1 Create Supabase Account', shortTitle: 'Supabase Account', estimatedTime: '7 min' },
      { id: 'env', title: '3.2 Configure Environment Variables', shortTitle: 'Env Vars', estimatedTime: '10 min' },
      { id: 'database', title: '3.3 Setup Database', shortTitle: 'Database', estimatedTime: '10 min' },
      { id: 'email', title: '3.4 Configure Email', shortTitle: 'Email', estimatedTime: '5 min' }
    ]
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Coinbase Developer Program',
    emoji: '💰',
    isRequired: true,
    description: 'Enable Web3 wallet creation (REQUIRED)',
    steps: [
      { id: 'coinbase', title: '4.1 Create CDP Account', shortTitle: 'CDP Account', estimatedTime: '3 min' },
      { id: 'cdp-keys', title: '4.2 Generate API Keys', shortTitle: 'API Keys', estimatedTime: '10 min' },
      { id: 'cdp-env', title: '4.3 Add CDP to Vercel', shortTitle: 'CDP Env Vars', estimatedTime: '5 min' }
    ]
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Testing & Verification',
    emoji: '✅',
    description: 'Verify end-to-end functionality',
    steps: [
      { id: 'test-auth', title: '5.1 Test User Authentication', shortTitle: 'Test Auth', estimatedTime: '3 min' },
      { id: 'test-wallet', title: '5.2 Test Wallet Creation', shortTitle: 'Test Wallet', estimatedTime: '5 min' },
      { id: 'test-supabase', title: '5.3 Verify Supabase', shortTitle: 'Verify DB', estimatedTime: '3 min' },
      { id: 'test-transaction', title: '5.4 Test Send Transaction', shortTitle: 'Test TX', estimatedTime: '5 min' },
      { id: 'test-additional', title: '5.5 Additional Tests', shortTitle: 'More Tests', estimatedTime: '3 min' }
    ]
  },
  {
    id: 'phase-6',
    phaseNumber: 6,
    title: 'Feature Planning & Implementation',
    emoji: '🚀',
    description: 'Plan, implement, and scale new features',
    steps: [
      { id: 'feature-planning', title: '6.1 Feature Planning Workflow', shortTitle: 'Feature Planning', estimatedTime: '15 min' },
      { id: 'architecture-reviews', title: '6.2 Architecture Reviews', shortTitle: 'Architecture Reviews', estimatedTime: '10 min' },
      { id: 'database-extensions', title: '6.3 Database Schema Extensions', shortTitle: 'Database Extensions', estimatedTime: '20 min' },
      { id: 'code-structure', title: '6.4 Code Structure Best Practices', shortTitle: 'Code Structure', estimatedTime: '15 min' },
      { id: 'community-contribution', title: '6.5 Community Contribution', shortTitle: 'Community Contribution', estimatedTime: '10 min' },
      { id: 'advanced-patterns', title: '6.6 Advanced Patterns Library', shortTitle: 'Advanced Patterns', estimatedTime: '25 min' }
    ]
  }
]

export function ProgressNav() {
  const [activeStep, setActiveStep] = useState('welcome')
  const [activePhase, setActivePhase] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set())
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]))
  const stepListRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get all steps flattened for easier lookup
  const allSteps = phases.flatMap(p => p.steps)

  useEffect(() => {
    // Track which sections are currently intersecting with their position info
    const intersectingSteps = new Map<string, number>()
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Update intersecting map with position information
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Store the position - lower boundingClientRect.top means higher on screen
            intersectingSteps.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            intersectingSteps.delete(entry.target.id)
          }
        })

        // If any sections are intersecting, pick the one closest to the top of the viewport
        if (intersectingSteps.size > 0) {
          // Find the step that's highest on screen (smallest top value)
          let topMostStepId = ''
          let minTop = Infinity
          
          for (const [stepId, top] of intersectingSteps.entries()) {
            if (top < minTop) {
              minTop = top
              topMostStepId = stepId
            }
          }
          
          // Find the step and phase for this ID
          let topMostStep: SubStep | null = null
          let topMostPhase: Phase | null = null
          
          for (const phase of phases) {
            for (const step of phase.steps) {
              if (step.id === topMostStepId) {
                topMostStep = step
                topMostPhase = phase
                break
              }
            }
            if (topMostStep) break
          }
          
          if (topMostStep && topMostPhase) {
            setActiveStep(topMostStep.id)
            setActivePhase(topMostPhase.phaseNumber)
            
            // Auto-expand active phase
            setExpandedPhases(prev => new Set(prev).add(topMostPhase.phaseNumber))
            
            // Mark previous steps as completed
            const currentIndex = allSteps.findIndex(s => s.id === topMostStep.id)
            const completed = new Set<string>()
            allSteps.slice(0, currentIndex).forEach(s => completed.add(s.id))
            
            // If we're at the last step, mark it as complete too (for 100% progress)
            if (currentIndex === allSteps.length - 1) {
              completed.add(topMostStep.id)
            }
            
            setCompletedSteps(completed)
            
            // Mark previous phases as completed
            const completedPhaseNumbers = new Set<number>()
            for (const phase of phases) {
              if (phase.phaseNumber < topMostPhase.phaseNumber) {
                // Check if all steps in this phase are completed
                const allPhaseStepsCompleted = phase.steps.every(step => 
                  completed.has(step.id) || allSteps.findIndex(s => s.id === step.id) < currentIndex
                )
                if (allPhaseStepsCompleted) {
                  completedPhaseNumbers.add(phase.phaseNumber)
                }
              }
            }
            setCompletedPhases(completedPhaseNumbers)
          }
        }
      },
      {
        // Less aggressive rootMargin - detect when section enters top 20% of viewport
        rootMargin: '-20% 0px -70% 0px',
        // Simpler thresholds for better performance
        threshold: [0, 0.5, 1.0]
      }
    )

    // Observe all step IDs
    phases.forEach(phase => {
      phase.steps.forEach(step => {
        const element = document.getElementById(step.id)
        if (element) observer.observe(element)
      })
    })

    // Cleanup
    return () => {
      observer.disconnect()
      intersectingSteps.clear()
    }
  }, [allSteps])

  // Auto-scroll sidebar to keep active step visible and CENTERED
  // Manual scroll control for nested scrollable containers
  useEffect(() => {
    if (!scrollContainerRef.current || !stepListRef.current) return
    
    // Use requestAnimationFrame to ensure DOM is fully painted
    const rafId = requestAnimationFrame(() => {
      const scrollContainer = scrollContainerRef.current
      const activeButton = stepListRef.current?.querySelector(`[data-step-id="${activeStep}"]`) as HTMLElement
      
      if (!activeButton || !scrollContainer) return
      
      // Get the position of the active button relative to the scroll container
      const containerRect = scrollContainer.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      
      // Calculate the offset needed to center the button in the visible area
      const buttonOffsetTop = buttonRect.top - containerRect.top + scrollContainer.scrollTop
      const containerHeight = scrollContainer.clientHeight
      const buttonHeight = buttonRect.height
      
      // Center the button: scroll so button is in middle of visible area
      const targetScrollTop = buttonOffsetTop - (containerHeight / 2) + (buttonHeight / 2)
      
      // Smooth scroll to the target position
      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    })
    
    return () => cancelAnimationFrame(rafId)
  }, [activeStep, expandedPhases])

  const progress = ((completedSteps.size / allSteps.length) * 100).toFixed(0)

  const scrollToStep = (stepId: string) => {
    const element = document.getElementById(stepId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const togglePhaseExpansion = (phaseNumber: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(phaseNumber)) {
        newSet.delete(phaseNumber)
      } else {
        newSet.add(phaseNumber)
      }
      return newSet
    })
  }

  const currentPhase = phases.find(p => p.phaseNumber === activePhase)
  const currentStepData = allSteps.find(s => s.id === activeStep)
  const currentIndex = allSteps.findIndex(s => s.id === activeStep)
  const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null

  return (
    <>
      {/* Desktop Sidebar - Always visible on screens 768px+ */}
      <nav 
        className="progress-nav-desktop hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r border-border bg-background flex flex-col z-30"
        style={{
          // Defensive CSS to ensure visibility above 768px
          minHeight: '400px',
          maxHeight: 'calc(100vh - 4rem)',
        }}
      >
        {/* Sticky header section - stays at top */}
        <div className="flex-shrink-0 p-6 pb-0 bg-background">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Setup Guide
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow these steps to deploy your Web3 dApp
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable steps section - scrolls independently */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 scrollbar-visible" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
          <div ref={stepListRef} className="space-y-2 pb-32">
            {phases.map((phase) => {
              const isActivePhase = activePhase === phase.phaseNumber
              const isPhaseCompleted = completedPhases.has(phase.phaseNumber)
              const isExpanded = expandedPhases.has(phase.phaseNumber)
              
              return (
                <div key={phase.id} className="mb-2">
                  {/* Phase Header Button */}
                  <button
                    onClick={() => togglePhaseExpansion(phase.phaseNumber)}
                    className={`w-full text-left rounded-lg p-3 transition-all ${
                      isActivePhase 
                        ? 'bg-primary/10 border-l-4 border-primary' 
                        : isPhaseCompleted
                        ? 'bg-green-500/5 border-l-4 border-green-500'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Phase Status Icon */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPhaseCompleted ? 'bg-green-500' : isActivePhase ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {isPhaseCompleted ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-sm">{phase.emoji}</span>
                        )}
                      </div>
                      
                      {/* Phase Title */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${
                          isActivePhase ? 'text-primary' : isPhaseCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        }`}>
                          {phase.phaseNumber === 0 ? phase.title : `Phase ${phase.phaseNumber}: ${phase.title}`}
                        </p>
                        {phase.isRequired && (
                          <span className="text-xs text-red-500 font-semibold">⚠️ REQUIRED</span>
                        )}
                      </div>
                      
                      {/* Expand/Collapse Icon */}
                      <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${
                        isExpanded ? '' : '-rotate-90'
                      } ${isActivePhase ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </button>
                  
                  {/* Sub-Steps (Collapsible) */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-3">
                      {phase.steps.map((step) => {
                        const isActive = activeStep === step.id
                        const isCompleted = completedSteps.has(step.id)
                        
                        return (
                          <button
                            key={step.id}
                            data-step-id={step.id}
                            onClick={() => scrollToStep(step.id)}
                            className={`w-full text-left rounded p-2 transition-all ${
                              isActive 
                                ? 'bg-primary/10 border-l-2 border-primary' 
                                : isCompleted
                                ? 'bg-muted/50'
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Step Status Icon */}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted 
                                  ? 'bg-green-500' 
                                  : isActive
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              }`}>
                                {isCompleted ? (
                                  <Check className="w-3 h-3 text-white" />
                                ) : (
                                  <div className={`w-2 h-2 rounded-full ${
                                    isActive ? 'bg-white' : 'bg-muted-foreground'
                                  }`} />
                                )}
                              </div>
                              
                              {/* Step Title */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${
                                  isActive 
                                    ? 'text-primary' 
                                    : isCompleted
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                                }`}>
                                  {step.title}
                                  {step.isOptional && (
                                    <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {step.estimatedTime}
                                </p>
                              </div>
                              
                              {isActive && (
                                <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sticky footer with navigation info - always visible */}
        <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="px-6 py-3">
            {/* Current Step Info */}
            {currentStepData && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-muted-foreground mb-1">CURRENT STEP</div>
                <div className="text-sm font-medium text-primary">
                  {currentStepData.title}
                </div>
              </div>
            )}
            
            {/* Next Step Info */}
            {nextStep && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs font-semibold text-muted-foreground mb-1">UP NEXT</div>
                <button
                  onClick={() => scrollToStep(nextStep.id)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <span>{nextStep.title}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar - Only visible below 768px */}
      <div 
        className="progress-nav-mobile md:hidden fixed top-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
        style={{
          // Ensure this is hidden above 768px
          maxWidth: '100vw',
        }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Setup Guide
            </h2>
            <span className="text-sm font-bold text-primary">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Current phase and step info on mobile */}
          <div className="mt-2 text-xs">
            {activePhase > 0 && currentPhase && (
              <div className="text-primary font-semibold mb-1">
                Phase {activePhase}: {currentPhase.title}
              </div>
            )}
            <div className="text-muted-foreground">
              {currentStepData && currentStepData.shortTitle}
              {nextStep && (
                <span className="ml-2">→ {nextStep.shortTitle}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}