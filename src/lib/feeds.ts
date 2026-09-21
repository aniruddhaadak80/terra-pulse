import { sampleEvents, sampleQuakes } from "./fallback";
import { sealChain } from "./seal";
import type { PlanetEvent, QuakeFeature } from "./types";

export const revalidateQuakeSecs = 120;
export const revalidateEventSecs = 300;

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const EONET = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=60&days=60";

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

interface UsgsFeed {
  features?: { id: string; properties?: Record<string, unknown>; geometry?: { coordinates?: number[] } }[];
}

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

export async function loadQuakes(): Promise<{ source: string; count: number; quakes: QuakeFeature[]; cachedAt: string; warning?: string }> {
  try {
    const res = await fetch(FEED, { next: { revalidate: revalidateQuakeSecs } });
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
    return { source: "USGS all_day.geojson", count: quakes.length, quakes, cachedAt: new Date().toISOString() };
  } catch (err) {
    return {
      source: "fallback-sample",
      count: 0,
      quakes: sampleQuakes(),
      cachedAt: new Date().toISOString(),
      warning: err instanceof Error ? err.message : "feed unavailable",
    };
  }
}

export async function loadEvents(): Promise<{ source: string; count: number; events: PlanetEvent[]; cachedAt: string; warning?: string }> {
  try {
    const res = await fetch(EONET, { next: { revalidate: revalidateEventSecs } });
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
    return { source: "NASA EONET v3", count: events.length, events, cachedAt: new Date().toISOString() };
  } catch (err) {
    return {
      source: "fallback-sample",
      count: 0,
      events: sampleEvents(),
      cachedAt: new Date().toISOString(),
      warning: err instanceof Error ? err.message : "feed unavailable",
    };
  }
}
