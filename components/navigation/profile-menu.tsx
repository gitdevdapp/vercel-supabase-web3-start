"use client";

import { Menu, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ProfileMenuProps {
  userEmail?: string;
  showGuideButton?: boolean;
}

interface StakingStatus {
  has_superguide_access: boolean;
}

export function ProfileMenu({ userEmail, showGuideButton = false }: ProfileMenuProps) {
  const router = useRouter();
  const [stakingStatus, setStakingStatus] = useState<StakingStatus | null>(null);

  // Fetch staking status
  useEffect(() => {
    const fetchStakingStatus = async () => {
      try {
        const response = await fetch('/api/staking/status');

        if (response.ok) {
          const data = await response.json();
          setStakingStatus(data);
        } else if (response.status === 401) {
          // User not authenticated, this is expected
          setStakingStatus(null);
        }
      } catch (error) {
        console.error('Error fetching staking status:', error);
        setStakingStatus(null);
      }
    };

    fetchStakingStatus();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          aria-label="Open profile menu"
        >
          {/* Show hamburger icon on mobile, user icon with text on desktop */}
          <Menu className="h-5 w-5 md:hidden" />
          <User className="h-4 w-4 hidden md:block" />
          <span className="hidden md:inline text-xs lg:text-sm max-w-[120px] lg:max-w-[180px] truncate">
            {userEmail}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userEmail && (
          <>
            <div className="px-2 py-1.5 text-sm text-muted-foreground md:hidden">
              {userEmail}
            </div>
            <DropdownMenuSeparator className="md:hidden" />
          </>
        )}
        
        {showGuideButton && (
          <DropdownMenuItem asChild>
            <Link href="/guide" className="cursor-pointer">
              Guide
            </Link>
          </DropdownMenuItem>
        )}

        {/* Super Guide - conditionally shown based on staking status */}
        {stakingStatus?.has_superguide_access && (
          <DropdownMenuItem asChild>
            <Link href="/superguide" className="cursor-pointer">
              <Star className="h-4 w-4 mr-2" />
              Super Guide
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/protected/profile" className="cursor-pointer">
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Keep the old export name for backward compatibility
export { ProfileMenu as MobileMenu };
