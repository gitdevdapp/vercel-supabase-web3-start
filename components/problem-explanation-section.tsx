"use client";

import { CheckCircle, Clock, DollarSign, AlertTriangle, Users, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function ProblemExplanationSection() {
  const [isVisible, setIsVisible] = useState(false);
  const bridgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    const currentRef = bridgeRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 leading-tight">
            Building <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold">Web Apps</span>: Fast & Simple<br />
            <span className="text-muted-foreground">Building <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold text-foreground">Web3 Apps</span>: Slow & Complex</span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-green-500 to-amber-500 mx-auto rounded-full"></div>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Web2 Card - Positive */}
          <div className="bg-background rounded-lg p-6 lg:p-8 border border-green-200 dark:border-green-800 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Traditional Web Apps</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Simple & Fast</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-foreground font-medium">1 Day to MVP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-foreground">One developer builds complete SaaS apps</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-foreground">Free production infrastructure to test ideas</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Web3 Card - Warning */}
          <div className="bg-background rounded-lg p-6 lg:p-8 border border-amber-200 dark:border-amber-800 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-500/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Web3 Apps Without Template</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Complex & Slow</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-foreground font-medium">Weeks of configuration and debugging</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-foreground">Requires blockchain expertise</span>
                </div>
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-foreground">Complex wallet setup and gas management</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Bridge to Solution */}
        <div ref={bridgeRef} className="text-center mt-12">
          <div className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full border-2 border-gradient-to-r border-green-500/20 transition-all duration-700 ease-out ${
            isVisible 
              ? 'transform scale-110 shadow-2xl shadow-green-500/20' 
              : 'transform scale-100'
          }`}>
            <span className={`text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent transition-all duration-700 ${
              isVisible ? 'animate-pulse' : ''
            }`}>
              This Template Makes Web3 Development Fast Like Web2
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
