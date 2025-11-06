'use client'

import { useState, useEffect } from 'react'
import { SuperGuideLockedView } from './SuperGuideLockedView'

interface SuperGuideAccessWrapperProps {
  children: React.ReactNode
}

export function SuperGuideAccessWrapper({ children }: SuperGuideAccessWrapperProps) {
  const [stakedBalance, setStakedBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('SuperGuideAccessWrapper: Checking access...')
        setError(null)
        const response = await fetch('/api/staking/status')
        console.log('SuperGuideAccessWrapper: API response', response.status, response.ok)

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - likely not authenticated
            console.log('SuperGuideAccessWrapper: User not authenticated')
            setError('Please log in to access the Super Guide')
            setHasAccess(false)
          } else {
            throw new Error(`API error: ${response.status}`)
          }
        } else {
          const data = await response.json()
          console.log('SuperGuideAccessWrapper: API data', data)
          const balance = data.rair_staked || 0
          setStakedBalance(balance)
          setHasAccess(balance >= 3000)
          console.log('SuperGuideAccessWrapper: Balance', balance, 'Has access', balance >= 3000)
        }
      } catch (error) {
        console.error('Failed to check staking access:', error)
        // On network error, retry once
        if (retryCount < 1) {
          setTimeout(() => setRetryCount(retryCount + 1), 2000)
        } else {
          setError('Unable to verify staking status. Please try refreshing the page.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [retryCount])

  // Loading state - enhanced visual feedback
  if (isLoading) {
    return (
      <main className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-4 md:px-0 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Verifying Access</p>
            <p className="text-sm text-muted-foreground">Checking your staking balance...</p>
            <div className="mt-4 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse delay-100" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse delay-200" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-4 md:px-0 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Access Verification Failed</p>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true)
                setRetryCount(0)
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Access control: Show locked view if user doesn't have sufficient staked RAIR
  if (!hasAccess) {
    return <SuperGuideLockedView stakedBalance={stakedBalance ?? undefined} />
  }

  // User has access: Show full content
  return <>{children}</>
}
