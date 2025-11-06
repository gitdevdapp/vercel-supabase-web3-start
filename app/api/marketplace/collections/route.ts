import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/marketplace/collections
 * Returns list of public NFT collections available in the marketplace
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch public collections
    const { data: collections, error } = await supabase
      .from("smart_contracts")
      .select(
        "id, collection_slug, collection_name, collection_symbol, collection_image_url, total_minted, max_supply, verified, created_at"
      )
      .eq("is_public", true)
      .eq("marketplace_enabled", true)
      .eq("contract_type", "ERC721")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching collections:", error);
      return NextResponse.json(
        { error: "Failed to fetch collections", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      collections: collections || [],
      count: collections?.length || 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Collections API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collections",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}









