export type ThreatLevel = "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface QuakeFeature {
  id: string;
  mag: number | null;
  place: string;
  time: number;
  updated: number;
  tz: number | null;
  url: string;
  felt: number | null;
  cdi: number | null;
  mmi: number | null;
  alert: string | null;
  tsunami: 0 | 1;
  sig: number;
  net: string;
  code: string;
  geometry: { lon: number; lat: number; depthKm: number };
  seal: string;
}

export interface PlanetEvent {
  id: string;
  title: string;
  category: string;
  status: string;
  closed: string | null;
  sources: { id: string; url: string }[];
  geometry: { date: string; type: string; coordinates: number[] }[];
  lat: number | null;
  lon: number | null;
  seal: string;
}

export interface RiskInput {
  magnitude: number;
  depthKm: number;
  tsunami?: boolean;
  place?: string;
  lat?: number;
  lon?: number;
}

export interface RiskAssessment {
  score: number;
  level: ThreatLevel;
  radiusKm: number;
  factors: { label: string; weight: number; detail: string }[];
  actions: string[];
  briefing: string;
  seal: string;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
