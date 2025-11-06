import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { UnifiedProfileWalletCard } from "@/components/profile/UnifiedProfileWalletCard";
import { NFTCreationCard } from "@/components/profile/NFTCreationCard";
import { MyCollectionsPreview } from "@/components/profile/MyCollectionsPreview";
import { CollapsibleGuideAccess } from "@/components/profile/CollapsibleGuideAccess";
import { StakingCardWrapper } from "@/components/staking/StakingCardWrapper";
import { InfoIcon } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userEmail = data.claims.email as string;
  const userId = data.claims.sub;

  // Get or create user profile
  const profile = await getOrCreateProfile(userId, userEmail);

  if (!profile) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="w-full">
          <div className="bg-destructive/10 border border-destructive/20 text-sm p-3 px-5 rounded-md text-destructive-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            Unable to load profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Collapsible Guide Access Banner */}
      <CollapsibleGuideAccess />
      
      {/* Desktop: Two-column layout, Mobile: Stacked with custom order */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        {/* Right Column Wrapper - Unified Profile & Wallet Card (First on mobile) */}
        <div className="order-1 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
          <UnifiedProfileWalletCard profile={profile} userEmail={userEmail} />
        </div>

        {/* Staking Card */}
        <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-1">
          <StakingCardWrapper />
        </div>

        {/* NFT Creation Card - Order 3 on mobile (moved to bottom) */}
        <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
          <NFTCreationCard />
        </div>

        {/* My Collections Preview - Order 4 on mobile */}
        <div className="order-4 lg:order-none lg:col-start-1 lg:row-start-3">
          <MyCollectionsPreview />
        </div>
      </div>
    </div>
  );
}
