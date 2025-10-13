"use client";

import { Shield, Link2, User, Rocket, Code, Wallet } from "lucide-react";

export function SimpleFeatures() {
  const features = [
    {
      icon: Shield,
      title: "Authentication System",
      description: "Email signup, login, password reset with Supabase auth"
    },
    {
      icon: Link2,
      title: "Multi-Chain Support",
      description: "Pre-built pages for 6+ blockchain networks"
    },
    {
      icon: User,
      title: "User Profiles",
      description: "Profile management with image upload and storage"
    },
    {
      icon: Rocket,
      title: "Production Ready",
      description: "Deployed on Vercel with PostgreSQL database"
    },
    {
      icon: Code,
      title: "Modern Stack",
      description: "Next.js 14, TypeScript, Tailwind CSS, Supabase"
    },
    {
      icon: Wallet,
      title: "Web3 Ready",
      description: "Optional wallet integration with CDP SDK"
    }
  ];

  return (
    <section className="w-full py-20 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            What&apos;s Included
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build and deploy a Web3 application
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

