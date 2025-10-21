'use client'

import { ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  variant?: 'optional' | 'advanced' | 'info'
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false,
  variant = 'info' 
}: CollapsibleSectionProps) {
  // Variant styling
  const variantStyles = {
    optional: 'border-yellow-500/30 bg-yellow-500/5',
    advanced: 'border-blue-500/30 bg-blue-500/5',
    info: 'border-border bg-card'
  }

  const headerStyles = {
    optional: 'text-yellow-600 dark:text-yellow-400',
    advanced: 'text-blue-600 dark:text-blue-400',
    info: 'text-foreground'
  }

  const icons = {
    optional: '⏭️',
    advanced: '🔧',
    info: '📋'
  }

  return (
    <details 
      className={`my-6 rounded-lg border ${variantStyles[variant]} overflow-hidden group`}
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none p-4 font-semibold hover:bg-muted/50 transition-colors select-none">
        <div className="flex items-center gap-3">
          <span className="text-lg flex-shrink-0">{icons[variant]}</span>
          <span className={`flex-1 ${headerStyles[variant]}`}>{title}</span>
          <svg 
            className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <div className="px-4 pb-4 pt-2">
        {children}
      </div>
    </details>
  )
}


