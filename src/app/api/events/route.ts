import { NextResponse } from "next/server";
import { loadEvents } from "@/lib/feeds";

export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await loadEvents());
}
