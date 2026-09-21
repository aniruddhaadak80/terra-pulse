import type { RiskAssessment, RiskInput, ThreatLevel } from "./types";
import { sealRecord } from "./seal";

function levelFor(score: number): ThreatLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 45) return "ELEVATED";
  if (score >= 25) return "GUARDED";
  return "LOW";
}

const LEVEL_COLOR: Record<ThreatLevel, string> = {
  LOW: "#34d399",
  GUARDED: "#a3e635",
  ELEVATED: "#fbbf24",
  HIGH: "#fb7185",
  CRITICAL: "#f43f5e",
};

export function levelColor(level: ThreatLevel): string {
  return LEVEL_COLOR[level];
}

/**
 * Deterministic, explainable risk engine. No API key required.
 * Transparent weights so the briefing is auditable — designed for
 * agentic consumption (every factor carries its contribution).
 */
export function assessRisk(input: RiskInput, prevSeal = "TERRA-GENESIS"): RiskAssessment {
  const mag = Math.max(0, Math.min(10, Number(input.magnitude) || 0));
  const depth = Math.max(0, Number(input.depthKm) || 0);
  const tsunami = Boolean(input.tsunami);

  const factors: RiskAssessment["factors"] = [];

  // Magnitude is the dominant term: ~18 pts per unit above M3.
  const magPts = Math.max(0, Math.min(72, (mag - 3) * 18));
  factors.push({
    label: "Magnitude",
    weight: Math.round(magPts),
    detail: `M${mag.toFixed(1)} releases ~${energyTNT(mag)} of energy.`,
  });

  // Shallow quakes couple far more energy into the surface.
  let depthPts = 0;
  let depthDetail = `Hypocenter at ${depth.toFixed(0)} km depth.`;
  if (depth < 30) {
    depthPts = 12;
    depthDetail += " Shallow — strong surface coupling.";
  } else if (depth < 70) {
    depthPts = 4;
    depthDetail += " Intermediate depth.";
  } else if (depth > 300) {
    depthPts = -8;
    depthDetail += " Very deep — surface shaking attenuated.";
  } else {
    depthPts = -2;
    depthDetail += " Deep — partially attenuated.";
  }
  factors.push({ label: "Depth", weight: depthPts, detail: depthDetail });

  // Tsunami flag dominates coastal risk.
  const tsunamiPts = tsunami ? 20 : 0;
  factors.push({
    label: "Tsunami flag",
    weight: tsunamiPts,
    detail: tsunami
      ? "USGS tsunami flag set — treat coastlines as exposed until all-clear."
      : "No tsunami flag from USGS.",
  });

  // Offshore / populated-place heuristic from the place string.
  const place = (input.place ?? "").toLowerCase();
  let expoPts = 2;
  let expoDetail = "Exposure baseline for a generic location.";
  if (/ocean|offshore|sea|trench|rise|ridge|island/.test(place)) {
    expoPts = 6;
    expoDetail = "Offshore / island context — tsunami + logistics risk.";
  } else if (/city|tokyo|jakarta|manila|lima|mexico|istanbul|tehran|delhi|kathmandu|los angeles|san francisco|seattle|anchorage/i.test(input.place ?? "")) {
    expoPts = 8;
    expoDetail = "Dense urban context — exposure multiplier.";
  }
  factors.push({ label: "Exposure", weight: expoPts, detail: expoDetail });

  const raw = magPts + depthPts + tsunamiPts + expoPts;
  const score = Math.max(1, Math.min(99, Math.round(raw)));
  const level = levelFor(score);

  // Felt-radius heuristic: log10 scaling, km.
  const radiusKm = Math.round(Math.min(1500, Math.max(5, 10 * Math.pow(2, mag - 4))));

  const actions = actionsFor(level, tsunami, depth);

  const where =
    input.place ??
    (input.lat !== undefined && input.lon !== undefined
      ? `${input.lat.toFixed(2)}°, ${input.lon.toFixed(2)}°`
      : "unspecified location");

  const briefing =
    `M${mag.toFixed(1)} ${tsunami ? "with tsunami flag " : ""}at ${where} — ` +
    `depth ${depth.toFixed(0)} km. Risk ${level} (${score}/100). ` +
    `Estimated felt radius ~${radiusKm} km. ` +
    `Primary driver: ${dominantFactor(factors)}. ${actions[0] ?? ""}`;

  const seal = sealRecord(prevSeal, { mag, depth, tsunami, score, level, where });

  return { score, level, radiusKm, factors, actions, briefing, seal };
}

function dominantFactor(factors: RiskAssessment["factors"]): string {
  const top = [...factors].sort((a, b) => b.weight - a.weight)[0];
  return top ? `${top.label} (+${top.weight})` : "magnitude baseline";
}

function energyTNT(mag: number): string {
  // log10(E joules) = 4.8 + 1.5M ; TNT ton = 4.184e9 J
  const joules = Math.pow(10, 4.8 + 1.5 * mag);
  const tons = joules / 4.184e9;
  if (tons >= 1e6) return `${(tons / 1e6).toFixed(1)}M tons of TNT`;
  if (tons >= 1e3) return `${(tons / 1e3).toFixed(0)}k tons of TNT`;
  return `${tons.toFixed(0)} tons of TNT`;
}

function actionsFor(level: ThreatLevel, tsunami: boolean, depth: number): string[] {
  const base: string[] = [];
  if (tsunami) {
    base.push("Move to high ground immediately if you are near a coast — do not wait for sirens.");
    base.push("Stay off beaches, harbors and estuaries until an official all-clear.");
  }
  if (depth < 30) {
    base.push("Expect aftershocks: drop, cover and hold on during shaking; check gas and power lines after.");
  }
  switch (level) {
    case "CRITICAL":
      base.push("Treat as a major emergency: call local emergency services, avoid damaged buildings and bridges.");
      base.push("Share this briefing with people in the affected radius; keep phones free for emergencies.");
      break;
    case "HIGH":
      base.push("Secure heavy furniture, check on neighbors, and prepare a go-bag with water, meds and documents.");
      break;
    case "ELEVATED":
      base.push("Review your household emergency plan and keep a battery radio / charged phone nearby.");
      break;
    case "GUARDED":
      base.push("No immediate action needed — stay informed via USGS and local authorities.");
      break;
    default:
      base.push("Felt lightly or not at all — log it and carry on.");
  }
  base.push("Verify with USGS event page and your local disaster agency before acting on automated output.");
  return base.slice(0, 5);
}
