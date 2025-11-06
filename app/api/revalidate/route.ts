import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * API endpoint to revalidate a Next.js path
 * Triggers cache invalidation for a specific route
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Revalidate the path in Next.js cache
    revalidatePath(path);

    console.log(`✅ Revalidated path: ${path}`);

    return NextResponse.json({
      success: true,
      message: `Path revalidated: ${path}`
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate path" },
      { status: 500 }
    );
  }
}








