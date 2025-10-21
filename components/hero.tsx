"use client";

import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

export function Hero() {
  const incentives = [
    // Existing chains
    { name: "Flow", color: "text-emerald-500 dark:text-emerald-400" },
    { name: "Apechain", color: "text-orange-500 dark:text-orange-400" },
    { name: "Tezos", color: "text-blue-500 dark:text-blue-400" },
    { name: "Avalanche", color: "text-red-500 dark:text-red-400" },
    { name: "Stacks", color: "text-purple-500 dark:text-purple-400" },
    // New chains
    { name: "Polygon", color: "text-violet-500 dark:text-violet-400" },
    { name: "Soneium", color: "text-cyan-500 dark:text-cyan-400" },
    { name: "Astar", color: "text-pink-500 dark:text-pink-400" },
    { name: "Telos", color: "text-yellow-500 dark:text-yellow-400" },
    { name: "Ethereum", color: "text-indigo-500 dark:text-indigo-400" },
    { name: "Base", color: "text-green-500 dark:text-green-400" },
    { name: "Ink", color: "text-slate-500 dark:text-slate-400" },
    { name: "Chainlink", color: "text-sky-500 dark:text-sky-400" }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % incentives.length);
    }, 2000); // Change every 2 seconds
    
    return () => clearInterval(interval);
  }, [incentives.length]);

  return (
    <section className="flex flex-col gap-16 items-center py-20">
      <h2 className="sr-only">Vercel + Supabase + Web3 Stack</h2>

      <div className="text-center max-w-4xl">
        <h1 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-3xl text-center font-bold mb-4">
          An AI Framework for{" "}
          <span className="inline-block min-w-[120px]">
            <span 
              className={`font-semibold transition-all duration-500 ease-in-out ${incentives[currentIndex].color}`}
              key={currentIndex}
            >
              {incentives[currentIndex].name}
            </span>
          </span>
          {" "}that makes building Dapps with Vibe Coding as easy as Apps
        </h1>
        <p className="text-lg lg:text-xl mx-auto max-w-xl text-center text-muted-foreground mb-8 font-medium">
          vercel + supabase + web3
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" className="px-8 py-3" asChild>
            <a href="/guide">
              Get the Guide
            </a>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-3" asChild>
            <a href="https://github.com/gitdevdapp/vercel-supabase-web3-start" target="_blank" rel="noreferrer">
              Source Code
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Zero Setup Required</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Production Ready</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>AI-Powered Development</span>
          </div>
        </div>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </section>
  );
}
