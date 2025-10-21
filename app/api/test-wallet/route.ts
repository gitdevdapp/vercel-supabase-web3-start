import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Test API route working" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "Test POST working",
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Test API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
