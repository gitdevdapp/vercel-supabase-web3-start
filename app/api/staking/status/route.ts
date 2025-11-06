import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Staking status API: No authenticated user', { authError, user });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('Staking status API: Authenticated user', user.id);

    // Query the profiles table directly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('rair_balance, rair_staked')
      .eq('id', user.id)
      .single();

    console.log('Staking status API: Profile query result', { profile, profileError });

    if (profileError) {
      console.error('Profile query error:', profileError);

      if (profileError.code === 'PGRST116') {
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

    const rair_balance = profile.rair_balance || 0;
    const rair_staked = profile.rair_staked || 0;
    const has_superguide_access = rair_staked >= 3000;

    return NextResponse.json({
      rair_balance,
      rair_staked,
      has_superguide_access
    });

  } catch (error) {
    console.error('Unexpected error in staking status API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
