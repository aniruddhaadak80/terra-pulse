"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import GlobeCanvas from "./GlobeCanvas";
import type { QuakeFeature } from "@/lib/types";

const NIGHT_EARTH = "//cdn.jsdelivr.net/npm/three-globe@2.41.12/example/img/earth-night.jpg";

interface P {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  url: string;
}

function magColor(mag: number | null): string {
  if (mag == null) return "#34d399";
  if (mag >= 6) return "#f43f5e";
  if (mag >= 5) return "#fb923c";
  if (mag >= 4) return "#fbbf24";
  return "#34d399";
}

function GlobeErrorBoundary({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return <Boundary fallback={fallback}>{children}</Boundary>;
}

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function PlanetGlobe({ quakes }: { quakes: QuakeFeature[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 560, h: 440 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const points = useMemo<P[]>(
    () =>
      quakes.slice(0, 60).map((q) => ({
        lat: q.geometry.lat,
        lng: q.geometry.lon,
        size: 0.35 + Math.max(0, (q.mag ?? 3) - 3) * 0.28,
        color: magColor(q.mag),
        label: `M${q.mag?.toFixed(1) ?? "—"} — ${q.place}`,
        url: q.url,
      })),
    [quakes]
  );

  const rings = useMemo(
    () =>
      [...quakes]
        .sort((a, b) => (b.mag ?? -1) - (a.mag ?? -1))
        .slice(0, 8)
        .map((q) => ({ lat: q.geometry.lat, lng: q.geometry.lon, color: magColor(q.mag) })),
    [quakes]
  );

  // Animated sequence arcs linking the strongest events in time order —
  // the planet's recent seismic story drawn as one path.
  const arcs = useMemo(() => {
    const top = [...quakes]
      .filter((q) => (q.mag ?? 0) >= 4)
      .sort((a, b) => (b.mag ?? -1) - (a.mag ?? -1))
      .slice(0, 6)
      .sort((a, b) => a.time - b.time);
    return top.slice(1).map((q, i) => ({
      startLat: top[i].geometry.lat,
      startLng: top[i].geometry.lon,
      endLat: q.geometry.lat,
      endLng: q.geometry.lon,
      color: ["rgba(244,63,94,0.85)", "rgba(251,191,36,0.85)"] as [string, string],
    }));
  }, [quakes]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <GlobeErrorBoundary fallback={<GlobeCanvas pulses={quakes.slice(0, 14).map((q) => ({ lat: q.geometry.lat, lon: q.geometry.lon, mag: q.mag }))} />}>
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={NIGHT_EARTH}
          showAtmosphere
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.22}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.02}
          pointRadius="size"
          pointColor="color"
          pointLabel="label"
          pointsMerge
          ringsData={rings}
          ringLat="lat"
          ringLng="lng"
          ringColor="color"
          ringMaxRadius={6}
          ringPropagationSpeed={2.2}
          ringRepeatPeriod={1400}
          arcsData={arcs}
          arcColor="color"
          arcDashLength={0.45}
          arcDashGap={0.25}
          arcDashAnimateTime={3200}
          arcStroke={0.6}
          onPointClick={(p) => {
            const url = (p as P).url;
            if (url) window.open(url, "_blank", "noreferrer");
          }}
          onGlobeReady={() => {
            try {
              const c = globeRef.current?.controls();
              if (c) {
                c.autoRotate = true;
                c.autoRotateSpeed = 0.55;
              }
            } catch {
              /* controls unavailable — globe still renders */
            }
          }}
        />
      </GlobeErrorBoundary>
    </div>
  );
}
