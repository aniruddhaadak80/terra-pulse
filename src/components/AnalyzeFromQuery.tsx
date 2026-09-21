"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Analyzer from "./Analyzer";
import type { AnalyzePreset } from "./LiveDashboard";

export default function AnalyzeFromQuery() {
  const sp = useSearchParams();
  const preset: AnalyzePreset | null = useMemo(() => {
    const mag = Number(sp.get("mag"));
    if (!Number.isFinite(mag)) return null;
    const depth = Number(sp.get("depth"));
    return {
      magnitude: mag,
      depthKm: Number.isFinite(depth) ? depth : 10,
      tsunami: sp.get("tsunami") === "1",
      place: sp.get("place") ?? "Unknown location",
    };
  }, [sp]);
  return <Analyzer preset={preset} />;
}
