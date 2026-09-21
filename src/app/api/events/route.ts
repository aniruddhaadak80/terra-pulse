import { NextResponse } from "next/server";
import { sampleEvents } from "@/lib/fallback";
import { sealChain } from "@/lib/seal";
import type { PlanetEvent } from "@/lib/types";

export const revalidate = 300;

const EONET = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=60&days=60";

interface EonetFeed {
  events?: {
    id: string;
    title: string;
    categories?: { title: string }[];
    status?: string;
    closed?: string | null;
    sources?: { id: string; url: string }[];
    geometry?: { date: string; type: string; coordinates: unknown }[];
  }[];
}

export async function GET() {
  try {
    const res = await fetch(EONET, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`EONET ${res.status}`);
    const json = (await res.json()) as EonetFeed;
    const raw = (json.events ?? []).slice(0, 60);
    const seals = sealChain(raw, (e) => ({ id: e.id, title: e.title }));
    const events: PlanetEvent[] = raw.map((e, i) => {
      const last = e.geometry?.[e.geometry.length - 1];
      let lon: number | null = null;
      let lat: number | null = null;
      const coords = last?.coordinates;
      if (Array.isArray(coords) && typeof coords[0] === "number") {
        lon = coords[0];
        lat = typeof coords[1] === "number" ? coords[1] : null;
      }
      return {
        id: e.id,
        title: e.title,
        category: e.categories?.[0]?.title ?? "Unknown",
        status: e.status ?? "open",
        closed: e.closed ?? null,
        sources: e.sources ?? [],
        geometry: (e.geometry ?? []).slice(-3).map((g) => ({
          date: g.date,
          type: g.type,
          coordinates: Array.isArray(g.coordinates) ? (g.coordinates as number[]).flat().slice(0, 2) : [],
        })),
        lat,
        lon,
        seal: seals[i] ?? "TERRA-GENESIS",
      };
    });
    return NextResponse.json({ source: "NASA EONET v3", count: events.length, events, cachedAt: new Date().toISOString() });
  } catch (err) {
    const events = sampleEvents();
    return NextResponse.json({
      source: "fallback-sample",
      count: events.length,
      events,
      cachedAt: new Date().toISOString(),
      warning: err instanceof Error ? err.message : "feed unavailable",
    });
  }
}
