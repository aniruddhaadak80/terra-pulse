import type { AnalyzePreset } from "@/components/LiveDashboard";

const DEFAULT_DEPTH_KM = 10;

/**
 * Read the `?mag=…&depth=…&tsunami=…&place=…` preset from a query string.
 *
 * A missing parameter is *not* the number zero: `Number(null)` is `0`, which
 * would silently analyse a magnitude-0.0 quake instead of leaving the form on
 * its own defaults. A parameter is only read when it is actually present.
 */
export function parseAnalyzePreset(params: URLSearchParams): AnalyzePreset | null {
  const rawMag = params.get("mag");
  if (rawMag === null || rawMag.trim() === "") return null;
  const magnitude = Number(rawMag);
  if (!Number.isFinite(magnitude)) return null;

  const rawDepth = params.get("depth");
  const depth = rawDepth === null || rawDepth.trim() === "" ? DEFAULT_DEPTH_KM : Number(rawDepth);

  return {
    magnitude,
    depthKm: Number.isFinite(depth) ? depth : DEFAULT_DEPTH_KM,
    tsunami: params.get("tsunami") === "1",
    place: params.get("place") ?? "Unknown location",
  };
}
