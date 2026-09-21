import { NextResponse } from "next/server";
import { sampleQuakes } from "@/lib/fallback";
import { sealChain } from "@/lib/seal";
import type { QuakeFeature } from "@/lib/types";

export const revalidate = 120;

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

interface UsgsFeed {
  features?: {
    id: string;
    properties?: Record<string, unknown>;
    geometry?: { coordinates?: number[] };
  }[];
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function GET() {
  try {
    const res = await fetch(FEED, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`USGS ${res.status}`);
    const json = (await res.json()) as UsgsFeed;
    const feats = (json.features ?? []).slice(0, 80);
    const seals = sealChain(feats, (f) => ({ id: f.id, p: f.properties?.mag }));
    const quakes: QuakeFeature[] = feats.map((f, i) => {
      const p = f.properties ?? {};
      const c = f.geometry?.coordinates ?? [0, 0, 0];
      return {
        id: f.id,
        mag: num(p.mag),
        place: typeof p.place === "string" ? p.place : "Unknown location",
        time: typeof p.time === "number" ? p.time : Date.now(),
        updated: typeof p.updated === "number" ? p.updated : Date.now(),
        tz: num(p.tz),
        url: typeof p.url === "string" ? p.url : "https://earthquake.usgs.gov/",
        felt: num(p.felt),
        cdi: num(p.cdi),
        mmi: num(p.mmi),
        alert: typeof p.alert === "string" ? p.alert : null,
        tsunami: p.tsunami === 1 ? 1 : 0,
        sig: typeof p.sig === "number" ? p.sig : 0,
        net: typeof p.net === "string" ? p.net : "?",
        code: typeof p.code === "string" ? p.code : f.id,
        geometry: {
          lon: typeof c[0] === "number" ? c[0] : 0,
          lat: typeof c[1] === "number" ? c[1] : 0,
          depthKm: typeof c[2] === "number" ? c[2] : 0,
        },
        seal: seals[i] ?? "TERRA-GENESIS",
      };
    });
    quakes.sort((a, b) => (b.mag ?? -1) - (a.mag ?? -1));
    return NextResponse.json({ source: "USGS all_day.geojson", count: quakes.length, quakes, cachedAt: new Date().toISOString() });
  } catch (err) {
    const quakes = sampleQuakes();
    return NextResponse.json({
      source: "fallback-sample",
      count: quakes.length,
      quakes,
      cachedAt: new Date().toISOString(),
      warning: err instanceof Error ? err.message : "feed unavailable",
    });
  }
}
