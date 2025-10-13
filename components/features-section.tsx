import { Wallet, Code, Shield, Zap, Coins, Globe } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Wallet Integration</h3>
            <p className="text-muted-foreground">
              Optional Coinbase CDP integration for creating and managing Web3 wallets. Ready to enable when you need it.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pre-Built Components</h3>
            <p className="text-muted-foreground">
              Authentication, user profiles, and blockchain pages included. TypeScript types and Tailwind styling throughout.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Database Security</h3>
            <p className="text-muted-foreground">
              PostgreSQL with Row Level Security. Users can only access their own data. Email verification required.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Vercel Deployment</h3>
            <p className="text-muted-foreground">
              Deploy to Vercel in minutes. Automatic builds on git push. Free tier available for testing and small projects.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-800 relative overflow-hidden">
            {/* Coming Soon Badge */}
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Coming Soon
            </div>
            
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-orange-900 dark:text-orange-100">Contribution Rewards</h3>
            <p className="text-orange-700 dark:text-orange-300">
              Future system for rewarding template improvements and contributions.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Chain Pages</h3>
            <p className="text-muted-foreground">
              Pre-built pages for Flow, Apechain, Avalanche, Stacks, Tezos, and ROOT. Customize or remove as needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
