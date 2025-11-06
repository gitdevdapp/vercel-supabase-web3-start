import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeployedContractsCard } from "@/components/profile/DeployedContractsCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MyContractsPage() {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Link href="/protected/profile">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </Link>
      </div>

      {/* My NFT Collections Card - Full Width */}
      <div className="w-full">
        <DeployedContractsCard />
      </div>
    </div>
  );
}








