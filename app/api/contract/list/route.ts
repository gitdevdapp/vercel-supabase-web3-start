import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/contract/list
 * Returns user's deployed ERC721 contracts
 */
export async function GET() {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Query user's deployed contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('user_id', user.id)
      .eq('contract_type', 'ERC721')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json(
        { error: 'Failed to fetch contracts', details: contractsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contracts: contracts || [],
      count: contracts?.length || 0
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Contract list error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list contracts',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
