import { GlobalNav } from '@/components/navigation/global-nav'
import { GuideLockedView } from '@/components/guide/GuideLockedView'
import { AuthButton } from '@/components/auth-button'
import { EnvVarWarning } from '@/components/env-var-warning'
import { hasEnvVars } from '@/lib/utils'

export const metadata = {
  title: 'Setup Guide | Web3 Starter Template',
  description: 'Visit devdapp.com for complete deployment instructions. This repository contains production-ready code.',
}

export default async function GuidePage() {
  // Show devdapp.com redirect for all users
  return (
    <>
      <GlobalNav 
        showHomeButton={true} 
        showAuthButton={true} 
        authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
      />
      <GuideLockedView />
    </>
  )
}

// NOTE: Full step-by-step guide content has been moved to devdapp.com
// This template repository contains only the production-ready source code
// For deployment instructions, visit: https://devdapp.com
// Original guide content is preserved in git history (commit before this change)
