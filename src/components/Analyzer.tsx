"use client";

import { useEffect, useRef, useState } from "react";
import { BrainCircuit, Loader2, ShieldAlert } from "lucide-react";
import { levelColor } from "@/lib/risk";
import type { RiskAssessment, ThreatLevel } from "@/lib/types";
import type { AnalyzePreset } from "./LiveDashboard";

const PRESETS: { label: string; v: AnalyzePreset }[] = [
  { label: "M7.2 shallow + tsunami", v: { magnitude: 7.2, depthKm: 15, tsunami: true, place: "Offshore Biobio, Chile" } },
  { label: "M6.0 deep", v: { magnitude: 6.0, depthKm: 190, tsunami: false, place: "Hindu Kush region, Afghanistan" } },
  { label: "M4.5 urban shallow", v: { magnitude: 4.5, depthKm: 10, tsunami: false, place: "Los Angeles, California" } },
];

export default function Analyzer({ preset }: { preset: AnalyzePreset | null }) {
  const [mag, setMag] = useState("5.6");
  const [depth, setDepth] = useState("22");
  const [tsunami, setTsunami] = useState(false);
  const [place, setPlace] = useState("Offshore Biobio, Chile");
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const lastPreset = useRef<AnalyzePreset | null>(null);

  // Preset arrives as an external event from the quake feed — apply once, deferred.
  useEffect(() => {
    if (!preset || preset === lastPreset.current) return;
    lastPreset.current = preset;
    const p = preset;
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "start" });
    queueMicrotask(() => {
      setMag(String(p.magnitude));
      setDepth(String(p.depthKm));
      setTsunami(p.tsunami);
      setPlace(p.place);
      run(p.magnitude, p.depthKm, p.tsunami, p.place);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  async function run(m = Number(mag), d = Number(depth), t = tsunami, p = place) {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ magnitude: m, depthKm: d, tsunami: t, place: p }),
      });
      if (!r.ok) throw new Error(`engine ${r.status}`);
      setResult((await r.json()) as RiskAssessment);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "engine unreachable");
    } finally {
      setBusy(false);
    }
  }

  const level: ThreatLevel | null = result?.level ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass rounded-3xl p-5 sm:p-7">
        <h3 className="mb-1 flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-slate-300">
          <BrainCircuit size={15} className="text-violet-300" /> EXPLAINABLE RISK ENGINE
        </h3>
        <p className="mb-5 text-sm text-slate-400">Deterministic. Auditable. No API key. Same engine your agent calls over MCP.</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setMag(String(p.v.magnitude)); setDepth(String(p.v.depthKm)); setTsunami(p.v.tsunami); setPlace(p.v.place); run(p.v.magnitude, p.v.depthKm, p.v.tsunami, p.v.place); }}
              className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-200 transition hover:bg-violet-400/20"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500">MAGNITUDE</span>
            <input value={mag} onChange={(e) => setMag(e.target.value)} inputMode="decimal" className="mt-1 w-full bg-transparent font-mono text-2xl font-bold outline-none" />
          </label>
          <label className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500">DEPTH (KM)</span>
            <input value={depth} onChange={(e) => setDepth(e.target.value)} inputMode="decimal" className="mt-1 w-full bg-transparent font-mono text-2xl font-bold outline-none" />
          </label>
        </div>
        <label className="mt-3 block rounded-xl border border-white/10 bg-black/40 p-3">
          <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500">PLACE / CONTEXT</span>
          <input value={place} onChange={(e) => setPlace(e.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
        </label>
        <button
          onClick={() => setTsunami(!tsunami)}
          className={`mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${tsunami ? "border-rose-400/50 bg-rose-500/10 text-rose-200" : "border-white/10 bg-black/40 text-slate-400 hover:border-white/25"}`}
        >
          <span className="flex items-center gap-2"><ShieldAlert size={15} /> USGS tsunami flag set</span>
          <span className={`flex h-5 w-10 items-center rounded-full p-0.5 transition ${tsunami ? "justify-end bg-rose-500" : "justify-start bg-slate-700"}`}>
            <span className="h-4 w-4 rounded-full bg-white" />
          </span>
        </button>
        <button
          onClick={() => run()}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
          {busy ? "ASSESSING…" : "RUN ASSESSMENT"}
        </button>
        {err ? <p className="mt-3 font-mono text-xs text-rose-300">⚠ {err}</p> : null}
      </div>

      <div className="glass rounded-3xl p-5 sm:p-7">
        {!result ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <BrainCircuit size={36} className="mb-3 text-slate-600" />
            <p className="max-w-xs text-sm text-slate-500">Run an assessment — or pick a quake above and hit <span className="text-slate-300">Analyze risk</span> to prefill it here.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.25em] text-slate-500">ASSESSMENT</p>
              <span className="font-mono text-[10px] text-slate-600">terra-risk-v1</span>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-mono text-6xl font-black" style={{ color: level ? levelColor(level) : "#fff" }}>{result.score}</span>
              <div className="pb-1.5">
                <div className="font-mono text-sm font-bold tracking-[0.2em]" style={{ color: level ? levelColor(level) : "#fff" }}>{result.level}</div>
                <div className="font-mono text-[11px] text-slate-500">/ 100 · radius ~{result.radiusKm} km</div>
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${result.score}%`, background: level ? levelColor(level) : "#22d3ee" }} />
            </div>
            <p className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-sm leading-relaxed text-slate-200">{result.briefing}</p>
            <div className="mt-4 space-y-2">
              {result.factors.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-mono text-[10px] tracking-widest text-slate-400">{f.label.toUpperCase()}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${Math.max(0, Math.min(100, (f.weight / 72) * 100))}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-xs text-slate-300">+{f.weight}</span>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-1.5">
              {result.actions.map((a, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-snug text-slate-300"><span className="text-cyan-300">▸</span>{a}</li>
              ))}
            </ul>
            <p className="mt-3 break-all font-mono text-[10px] text-slate-600">seal {result.seal}</p>
          </div>
        )}
      </div>
    </div>
  );
}
