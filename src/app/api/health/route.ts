import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "terra-pulse",
    status: "ok",
    time: new Date().toISOString(),
    feeds: ["/api/quakes", "/api/events", "/api/analyze", "/api/mcp"],
  });
}
