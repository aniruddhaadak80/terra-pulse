import { NextResponse } from "next/server";
import { assessRisk } from "@/lib/risk";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      magnitude?: number;
      depthKm?: number;
      tsunami?: boolean;
      place?: string;
      lat?: number;
      lon?: number;
    };
    const magnitude = Number(body.magnitude);
    const depthKm = Number(body.depthKm);
    if (!Number.isFinite(magnitude) || !Number.isFinite(depthKm)) {
      return NextResponse.json(
        { error: "magnitude and depthKm must be finite numbers" },
        { status: 400 }
      );
    }
    const assessment = assessRisk({
      magnitude,
      depthKm,
      tsunami: Boolean(body.tsunami),
      place: typeof body.place === "string" ? body.place : undefined,
      lat: typeof body.lat === "number" ? body.lat : undefined,
      lon: typeof body.lon === "number" ? body.lon : undefined,
    });
    return NextResponse.json({ ...assessment, engine: "terra-risk-v1 (deterministic, no key required)" });
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const magnitude = Number(u.searchParams.get("magnitude") ?? "5");
  const depthKm = Number(u.searchParams.get("depthKm") ?? "20");
  const assessment = assessRisk({
    magnitude: Number.isFinite(magnitude) ? magnitude : 5,
    depthKm: Number.isFinite(depthKm) ? depthKm : 20,
    tsunami: u.searchParams.get("tsunami") === "1",
    place: u.searchParams.get("place") ?? undefined,
  });
  return NextResponse.json({ ...assessment, engine: "terra-risk-v1 (deterministic, no key required)" });
}
