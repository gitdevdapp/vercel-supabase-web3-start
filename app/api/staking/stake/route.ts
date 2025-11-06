import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a number greater than 0." },
        { status: 400 }
      );
    }

    // Call the stake_rair function
    const { data: result, error: functionError } = await supabase.rpc('stake_rair', {
      p_amount: amount
    });

    if (functionError) {
      console.error('Staking function error:', functionError);

      // Handle specific error cases
      if (functionError.message?.includes('Insufficient RAIR balance')) {
        return NextResponse.json(
          { error: "Insufficient RAIR balance" },
          { status: 400 }
        );
      }

      if (functionError.message?.includes('Not authenticated')) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to stake RAIR tokens" },
        { status: 500 }
      );
    }

    // stake_rair returns a BOOLEAN, not a structured result
    if (result !== true) {
      return NextResponse.json(
        { error: "Failed to stake RAIR tokens" },
        { status: 400 }
      );
    }

    // Fetch updated staking status after successful stake
    const { data: updatedStatus, error: statusError } = await supabase.rpc('get_staking_status');

    if (statusError || !updatedStatus || updatedStatus.length === 0) {
      console.error('Error fetching updated status:', statusError);
      // Still return success since the stake worked
      return NextResponse.json({
        success: true,
        amount: amount,
        message: "Staked successfully"
        // Don't include balance - let frontend refetch
      });
    }

    // updatedStatus is an array from the function's RETURNS TABLE
    const status = updatedStatus[0];
    return NextResponse.json({
      success: true,
      rair_balance: status?.rair_balance || 0,
      rair_staked: status?.rair_staked || 0,
      has_superguide_access: (status?.rair_staked || 0) >= 3000,
      amount: amount
    });

  } catch (error) {
    console.error('Unexpected error in stake API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
