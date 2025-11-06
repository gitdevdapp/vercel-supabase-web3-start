'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
    emoji: '',
    description: 'Getting started with the Web3 dApp guide',
    steps: [
      { id: 'welcome', title: 'Complete Web3 dApp Superguide', shortTitle: 'Welcome', estimatedTime: '2 min' }
    ]
  },
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'GitHub Setup',
    emoji: '',
    description: 'Configure Git and GitHub',
    steps: [
      { id: 'git', title: '1.1 Install Git', shortTitle: 'Install Git', estimatedTime: '2 min' },
      { id: 'ssh', title: '1.2 Add SSH Key to GitHub', shortTitle: 'SSH Key', estimatedTime: '2 min' },
      { id: 'fork', title: '1.3 Fork Repository', shortTitle: 'Fork', estimatedTime: '2 min' }
    ]
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Vercel Deployment',
    emoji: '',
    description: 'Deploy to production',
    steps: [
      { id: 'nodejs', title: '2.1 Install Node.js', shortTitle: 'Node.js', estimatedTime: '3 min' },
      { id: 'install', title: '2.2 Install Dependencies', shortTitle: 'Install Deps', estimatedTime: '8 min' },
      { id: 'deploy', title: '2.3 Deploy to Vercel', shortTitle: 'Deploy', estimatedTime: '4 min' }
    ]
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: 'Supabase Setup',
    emoji: '',
    description: 'Configure database and auth',
    steps: [
      { id: 'supabase-account', title: '3.1 Create Supabase Account', shortTitle: 'Supabase', estimatedTime: '3 min' },
      { id: 'env-vars', title: '3.2 Setup Environment Variables', shortTitle: 'Env Vars', estimatedTime: '3 min' },
      { id: 'database', title: '3.3 Create Database Tables', shortTitle: 'DB Tables', estimatedTime: '4 min' },
      { id: 'email-auth', title: '3.4 Enable Email Auth', shortTitle: 'Email Auth', estimatedTime: '2 min' }
    ]
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Wallet & Contract Deployment',
    emoji: '',
    description: 'CDP wallet and ERC721 contract setup',
    steps: [
      { id: 'cdp-account', title: '4.1 Create CDP Account', shortTitle: 'CDP Account', estimatedTime: '2 min' },
      { id: 'cdp-keys', title: '4.2 Generate API Keys', shortTitle: 'API Keys', estimatedTime: '3 min' },
      { id: 'cdp-test', title: '4.3 Test CDP Wallet', shortTitle: 'Test Wallet', estimatedTime: '2 min' },
      { id: 'ethers-setup', title: '4.4 Setup Ethers.js', shortTitle: 'Ethers.js', estimatedTime: '2 min' },
      { id: 'fund-wallet', title: '4.5 Fund Wallet on Testnet', shortTitle: 'Fund Wallet', estimatedTime: '4 min' },
      { id: 'deploy-contract', title: '4.6 Deploy ERC721 Contract', shortTitle: 'Deploy ERC721', estimatedTime: '2 min' }
    ]
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Testing & Verification',
    emoji: '',
    description: 'Verify everything works',
    steps: [
      { id: 'test-auth', title: '5.1 Test User Authentication', shortTitle: 'Test Auth', estimatedTime: '2 min' },
      { id: 'test-wallet', title: '5.2 Test ERC721 Deployment', shortTitle: 'Test ERC721', estimatedTime: '5 min' },
      { id: 'test-supabase', title: '5.3 Verify Supabase Database', shortTitle: 'Verify DB', estimatedTime: '2 min' },
      { id: 'test-checklist', title: '5.4 Final Verification Checklist', shortTitle: 'Checklist', estimatedTime: '1 min' }
    ]
  }
]

export function SuperGuideProgressNav() {
  const [activeStep, setActiveStep] = useState('welcome')
  const [activePhase, setActivePhase] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set())
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5]))
  const stepListRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Get all steps flattened for easier lookup
  const allSteps = useMemo(() => phases.flatMap(p => p.steps), [])

  // Memoized detection function
  const detectActiveStep = useCallback(() => {
    let topMostStep: SubStep | null = null
    let topMostPhase: Phase | null = null
    let minTop = Infinity

    for (const phase of phases) {
      for (const step of phase.steps) {
        const element = document.getElementById(step.id)
        if (!element) {
          continue
        }

        const rect = element.getBoundingClientRect()
        const viewportTop = rect.top
        const isInViewport = viewportTop < window.innerHeight * 0.5 && viewportTop > -window.innerHeight * 0.1

        // If element is in viewport (changed from 0.9 to 0.5 for earlier detection)
        if (isInViewport) {
          if (viewportTop < minTop) {
            minTop = viewportTop
            topMostStep = step
            topMostPhase = phase
          }
        }
      }
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
      completed.add(topMostStep.id)
      
      setCompletedSteps(completed)
      
      // Mark previous phases as completed
      const completedPhaseNumbers = new Set<number>()
      for (const phase of phases) {
        if (phase.phaseNumber < topMostPhase.phaseNumber) {
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
  }, [allSteps])

  // Scroll detection with debouncing
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(detectActiveStep, 100)
    }

    // Initial detection
    detectActiveStep()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [detectActiveStep])

  // Removed auto-scroll behavior - user scroll is manual and smoother
  // This eliminates jank and scroll conflicts with Intersection Observer
  // Sidebar navigation updates happen independently without forced scrolling

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
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Super Guide
              </h2>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                v12
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium Web3 deployment guide
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
          <div ref={stepListRef} className="space-y-2 pb-8">
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
              Super Guide
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
