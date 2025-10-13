"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface DemoLogoProps {
  className?: string;
  priority?: boolean;
}

export function DemoLogo({ className = "" }: DemoLogoProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch with transparent placeholder
  if (!mounted) {
    return (
      <div className="h-10 w-[200px] bg-transparent" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 transition-all duration-200 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            {/* Web3 symbol - connected nodes */}
            <circle cx="6" cy="6" r="2" fill="currentColor" />
            <circle cx="18" cy="6" r="2" fill="currentColor" />
            <circle cx="6" cy="18" r="2" fill="currentColor" />
            <circle cx="18" cy="18" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path 
              d="M8 6 L10.5 10.5 M16 6 L13.5 10.5 M8 18 L10.5 13.5 M16 18 L13.5 13.5" 
              stroke="currentColor" 
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-md opacity-50 -z-10"></div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className={`text-xl font-bold tracking-tight ${
          isDark 
            ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' 
            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
        } bg-clip-text text-transparent`}>
          Your Logo Here
        </span>
        <span className="text-[10px] text-muted-foreground font-medium -mt-1">
          Replace with your branding
        </span>
      </div>
    </div>
  );
}

