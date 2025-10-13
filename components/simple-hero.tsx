"use client";

import { Button } from "./ui/button";
import { ArrowRight, Github } from "lucide-react";

export function SimpleHero() {
  return (
    <section className="flex flex-col gap-12 items-center py-24 px-4">
      <div className="text-center max-w-4xl">
        {/* Logo Placeholder */}
        <div className="mb-8">
          <div className="inline-block px-8 py-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-2xl font-bold text-muted-foreground">Your Logo Here</p>
          </div>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Multi-Chain Web3 Starter Template
        </h1>
        
        <p className="text-xl lg:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Production-ready code for Next.js + Supabase + Web3
        </p>
        
        <p className="text-lg text-muted-foreground/80 mb-10 max-w-xl mx-auto">
          Login to <span className="font-semibold text-primary">devdapp.com</span> for step-by-step deployment instructions
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="px-8 py-6 text-lg" asChild>
            <a href="https://devdapp.com" target="_blank" rel="noopener noreferrer">
              Get Setup Guide
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-lg" asChild>
            <a href="https://github.com/gitdevdapp/vercel-supabase-web3-start" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 w-5 h-5" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>

      <div className="w-full max-w-5xl p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </section>
  );
}

