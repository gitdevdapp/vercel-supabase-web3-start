import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RefreshResponse {
  success: boolean;
  contract_address: string;
  collection_name: string;
  before_count: number;
  after_count: number;
  needs_refresh: boolean;
  sync_status: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<RefreshResponse>> {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // 1. AUTH CHECK
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          contract_address: "",
          collection_name: "",
          before_count: 0,
          after_count: 0,
          needs_refresh: false,
          sync_status: "error",
          error: "Unauthorized - Please sign in"
        },
        { status: 401 }
      );
    }

    // 2. FETCH COLLECTION
    const { data: collection, error: collectionError } = await supabase
      .from("smart_contracts")
      .select("contract_address, collection_name, total_minted, user_id")
      .eq("collection_slug", slug)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        {
          success: false,
          contract_address: "",
          collection_name: "",
          before_count: 0,
          after_count: 0,
          needs_refresh: false,
          sync_status: "error",
          error: "Collection not found"
        },
        { status: 404 }
      );
    }

    // 3. PERMISSION CHECK (use user_id instead of deployed_by_user_id)
    const isOwner = collection.user_id === user.id;
    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          contract_address: collection.contract_address,
          collection_name: collection.collection_name,
          before_count: 0,
          after_count: 0,
          needs_refresh: false,
          sync_status: "error",
          error: "Only collection owner can refresh"
        },
        { status: 403 }
      );
    }

    // 4. CALL REFRESH RPC
    const { data: refreshResult, error: rpcError } = await supabase.rpc(
      "refresh_collection_from_blockchain",
      { p_contract_address: collection.contract_address }
    );

    if (rpcError) {
      console.error("Refresh RPC failed:", rpcError);
      return NextResponse.json(
        {
          success: false,
          contract_address: collection.contract_address,
          collection_name: collection.collection_name,
          before_count: 0,
          after_count: 0,
          needs_refresh: false,
          sync_status: "error",
          error: rpcError.message
        },
        { status: 500 }
      );
    }

    // 5. RETURN SUCCESS
    const result = refreshResult[0];
    return NextResponse.json({
      success: true,
      contract_address: collection.contract_address,
      collection_name: collection.collection_name,
      before_count: result.before_count,
      after_count: result.after_count,
      needs_refresh: result.before_count !== result.after_count,
      sync_status: result.sync_status
    });

  } catch (error) {
    console.error("Refresh endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        contract_address: "",
        collection_name: "",
        before_count: 0,
        after_count: 0,
        needs_refresh: false,
        sync_status: "error",
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
