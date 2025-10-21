import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call the get_staking_status function
    const { data: result, error: functionError } = await supabase.rpc('get_staking_status');

    if (functionError) {
      console.error('Staking status function error:', functionError);

      if (functionError.message?.includes('Not authenticated')) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      if (functionError.message?.includes('Profile not found')) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to get staking status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rair_balance: result.rair_balance || 0,
      rair_staked: result.rair_staked || 0,
      has_superguide_access: result.has_superguide_access || false
    });

  } catch (error) {
    console.error('Unexpected error in staking status API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
