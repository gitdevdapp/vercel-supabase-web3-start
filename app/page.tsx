import { SimpleHero } from "@/components/simple-hero";
import { SimpleFeatures } from "@/components/simple-features";
import { DevdappCtaSection } from "@/components/devdapp-cta-section";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GlobalNav } from "@/components/navigation/global-nav";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { OAuthCodeHandler } from "@/components/OAuthCodeHandler";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Web3 Starter Template",
  "description": "Production-ready multi-chain Web3 starter template. Visit devdapp.com for deployment instructions.",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "DevDapp"
  },
  "codeRepository": "https://github.com/gitdevdapp/vercel-supabase-web3-start"
};

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Suspense fallback={null}>
        <OAuthCodeHandler />
      </Suspense>
      <div className="flex-1 w-full flex flex-col items-center">
        <GlobalNav 
          showAuthButton={true} 
          showGuideButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        
        {/* Simplified Homepage Content */}
        <div className="w-full">
          <SimpleHero />
          <SimpleFeatures />
          <DevdappCtaSection />
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built with{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Next.js
            </a>
            {" "}
            and{" "}
            <a
              href="https://supabase.com/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}

/* ARCHIVED: Original homepage sections moved to components/archive/
 * These detailed marketing sections are preserved but not used in the template
 * For instructions on how to deploy this template, visit https://devdapp.com
 * 
 * Original sections:
 * - Hero (detailed marketing hero)
 * - ProblemExplanationSection
 * - HowItWorksSection
 * - FeaturesSection (detailed features)
 * - DeploymentGuideSection
 * - FoundationSection
 * - FinalCtaSection
 * - BackedBySection
 */
