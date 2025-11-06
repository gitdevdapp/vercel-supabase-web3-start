import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  slug: string;
}

/**
 * GET /api/marketplace/collections/[slug]
 * Returns a single collection by its slug
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch collection by slug
    const { data: collection, error } = await supabase
      .from("smart_contracts")
      .select("*")
      .eq("collection_slug", slug)
      .eq("is_public", true)
      .eq("marketplace_enabled", true)
      .eq("contract_type", "ERC721")
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      collection
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Collection detail API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collection",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

