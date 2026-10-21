"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Analyzer from "./Analyzer";
import { parseAnalyzePreset } from "@/lib/analyze-preset";

export default function AnalyzeFromQuery() {
  const sp = useSearchParams();
  const preset = useMemo(() => parseAnalyzePreset(new URLSearchParams(sp.toString())), [sp]);
  return <Analyzer preset={preset} />;
}
