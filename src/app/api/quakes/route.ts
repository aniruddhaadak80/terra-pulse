import { NextResponse } from "next/server";
import { loadQuakes } from "@/lib/feeds";

export const revalidate = 120;

export async function GET() {
  return NextResponse.json(await loadQuakes());
}
