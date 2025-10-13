import { Button } from "./ui/button";
import { Check } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Ready to Build Your Next Web3 Application?
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
          Get started with this production-ready starter template.
          Deploy your multi-chain dApp in minutes, not weeks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" variant="secondary" className="px-8 py-3" asChild>
            <a href="https://github.com/yourusername/vercel-supabase-web3-start" target="_blank" rel="noreferrer">
              Get Started Now
            </a>
          </Button>
          <Button size="lg" variant="secondary" className="px-8 py-3" asChild>
            <a href="/guide">
              View Documentation
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm opacity-75 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Open Source & Free</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>30-minute setup</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Production-ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
