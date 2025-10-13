"use client";

import { Button } from "./ui/button";
import { ArrowRight, BookOpen, Video, FileText } from "lucide-react";

export function DevdappCtaSection() {
  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Deploy?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Visit <span className="font-semibold text-primary">devdapp.com</span> for the complete step-by-step deployment guide
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <Video className="w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Video Tutorials</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Copy-Paste Commands</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Detailed Documentation</p>
            </div>
          </div>

          <Button size="lg" className="px-10 py-6 text-lg" asChild>
            <a href="https://devdapp.com" target="_blank" rel="noopener noreferrer">
              Get Started on DevDapp.com
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Free account required • Deploy in under 60 minutes
          </p>
        </div>
      </div>
    </section>
  );
}

