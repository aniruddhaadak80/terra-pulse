"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ArrowDown, Flame, Star, Globe2, PlugZap, ShieldCheck, Waves } from "lucide-react";

const PlanetGlobe = dynamic(() => import("@/components/PlanetGlobe"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20" />
      <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500">SPINNING UP WEBGL GLOBE…</p>
    </div>
  ),
});
import LiveDashboard, { type AnalyzePreset } from "@/components/LiveDashboard";
import Analyzer from "@/components/Analyzer";
import McpDocs from "@/components/McpDocs";
import SealStrip from "@/components/SealStrip";
import { Footer, Navbar, SectionHeading, StatsRow, Ticker } from "@/components/chrome";
import type { PlanetEvent, QuakeFeature } from "@/lib/types";

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08 } }),
};

export default function Home() {
  const [quakes, setQuakes] = useState<QuakeFeature[]>([]);
  const [events, setEvents] = useState<PlanetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");
  const [preset, setPreset] = useState<AnalyzePreset | null>(null);

  const load = useCallback(async () => {
    try {
      const [q, e] = await Promise.all([
        fetch("/api/quakes").then((r) => r.json()),
        fetch("/api/events").then((r) => r.json()),
      ]);
      setQuakes((q.quakes ?? []) as QuakeFeature[]);
      setEvents((e.events ?? []) as PlanetEvent[]);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch {
      /* fallback already handled server-side */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(load, 120_000);
    // initial sync with external feeds (not derived render state)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => clearInterval(id);
  }, [load]);

  const strongest = useMemo(() => quakes.reduce<QuakeFeature | null>((a, b) => (!a || (b.mag ?? -1) > (a.mag ?? -1) ? b : a), null), [quakes]);
  const big = quakes.filter((x) => (x.mag ?? 0) >= 4.5).length;
  const tsunami = quakes.filter((x) => x.tsunami === 1).length;

  const ticker = useMemo(
    () => [
      ...(strongest ? [`STRONGEST 24H: M${strongest.mag?.toFixed(1)} — ${strongest.place}`] : []),
      `${quakes.length} QUAKES TRACKED · ${big} ≥ M4.5`,
      tsunami > 0 ? `⚠ ${tsunami} TSUNAMI FLAG${tsunami > 1 ? "S" : ""} ACTIVE` : "NO TSUNAMI FLAGS",
      `${events.length} NASA EONET EVENTS OPEN`,
      "RISK ENGINE: DETERMINISTIC · NO KEY · MCP-READY",
    ],
    [strongest, quakes.length, big, tsunami, events.length]
  );

  return (
    <div id="top" className="relative">
      <Navbar deployUrl="" />

      {/* HERO */}
      <section className="grid-bg relative overflow-hidden pb-10 pt-28 sm:pt-32">
        <div className="animate-aurora pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-rose-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-2">
          <motion.div variants={fade} initial="hidden" animate="show" custom={0}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 font-mono text-[10px] tracking-[0.25em] text-cyan-200">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-cyan-300" />
              OPEN SOURCE · LIVE PLANET DATA · {updatedAt ? `SYNCED ${updatedAt}` : "SYNCING…"}
            </div>
            <h1 className="text-glow-cyan text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              The planet has a pulse.
              <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-rose-300 bg-clip-text text-transparent">
                Now you can hear it.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Terra Pulse fuses live <span className="text-slate-200">USGS earthquakes</span> with{" "}
              <span className="text-slate-200">NASA wildfires, storms &amp; volcanoes</span> into one open dashboard —
              with an explainable risk engine, a quantum-resilient audit seal, and an{" "}
              <span className="text-slate-200">MCP server your coding agent can call</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#live" className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-300">
                <Activity size={16} /> Watch it live <ArrowDown size={15} />
              </a>
              <a href="#agents" className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-violet-300 hover:text-violet-200">
                <PlugZap size={16} /> Connect your agent
              </a>
              <a href="https://github.com/aniruddhaadak80/terra-pulse" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/50">
                <Star size={16} /> Star on GitHub
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.2em] text-slate-500">
              <span className="flex items-center gap-1.5"><Waves size={13} className="text-cyan-400" /> USGS LIVE</span>
              <span className="flex items-center gap-1.5"><Flame size={13} className="text-orange-400" /> NASA EONET</span>
              <span className="flex items-center gap-1.5"><PlugZap size={13} className="text-emerald-400" /> MCP SERVER</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-violet-400" /> SHA-384 SEALED</span>
            </div>
          </motion.div>

          <motion.div variants={fade} initial="hidden" animate="show" custom={1} className="glass relative overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.25em] text-slate-400">
              <span className="flex items-center gap-2"><Globe2 size={14} className="text-cyan-300" /> PLANETARY SCOPE · LIVE</span>
              <span className="flex items-center gap-1.5 text-emerald-300"><span className="h-1.5 w-1.5 animate-blink rounded-full bg-emerald-400" /> {quakes.length} CONTACTS</span>
            </div>
            <div className="h-[380px] sm:h-[440px]">
              <PlanetGlobe quakes={quakes} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3">
              {strongest ? (
                <span className="flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 font-mono text-[10px] text-rose-200">
                  <AlertTriangle size={12} /> M{strongest.mag?.toFixed(1)} · {strongest.place.slice(0, 42)}
                </span>
              ) : (
                <span className="font-mono text-[10px] text-slate-500">ACQUIRING SIGNAL…</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Ticker items={ticker} />

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <StatsRow
          stats={[
            { icon: <Waves size={13} className="text-cyan-300" />, label: "QUAKES · 24H", value: loading ? "…" : String(quakes.length), sub: "USGS all-day feed" },
            { icon: <Activity size={13} className="text-amber-300" />, label: "STRONGEST", value: loading ? "…" : strongest?.mag != null ? `M${strongest.mag.toFixed(1)}` : "—", sub: strongest ? strongest.place.slice(0, 34) : "awaiting feed" },
            { icon: <Flame size={13} className="text-orange-300" />, label: "EONET OPEN", value: loading ? "…" : String(events.length), sub: "Fires · storms · volcanoes · floods" },
            { icon: <AlertTriangle size={13} className="text-rose-300" />, label: "TSUNAMI FLAGS", value: loading ? "…" : String(tsunami), sub: tsunami > 0 ? "Coastal caution active" : "All clear right now" },
          ]}
        />
      </section>

      {/* LIVE */}
      <section id="live" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-10">
        <SectionHeading
          kicker="01 — LIVE"
          title={<>One screen. <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Every tremor, fire &amp; storm.</span></>}
          lede="Straight from USGS and NASA, resealed into a tamper-evident chain. Filter, inspect, then push any quake into the risk engine."
        />
        <LiveDashboard quakes={quakes} events={events} loading={loading} onAnalyze={setPreset} />
      </section>

      {/* ANALYZE */}
      <section id="analyze" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-10">
        <SectionHeading
          kicker="02 — RISK ENGINE"
          title={<>Explainable risk, <span className="bg-gradient-to-r from-violet-300 to-rose-300 bg-clip-text text-transparent">not black-box vibes.</span></>}
          lede="Every score shows its math: magnitude, depth, tsunami flag, exposure. The same engine answers your agents over MCP."
        />
        <Analyzer preset={preset} />
      </section>

      {/* AGENTS */}
      <section id="agents" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-10">
        <SectionHeading
          kicker="03 — MCP FOR AGENTS"
          title={<>Give your coding agent <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">a live planet.</span></>}
          lede="Three tools — get_quakes, get_events, analyze_risk — over MCP-style JSON-RPC. Paste one block into Claude Code, Cursor or OpenCode."
        />
        <McpDocs baseUrl="" />
      </section>

      {/* SEAL */}
      <section id="seal" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-10">
        <SectionHeading
          kicker="04 — SEAL CHAIN"
          title={<>Trust, <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">but verify cryptographically.</span></>}
        />
        <SealStrip seals={quakes.map((x) => x.seal)} />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-violet-500/15 to-rose-500/10 p-8 text-center sm:p-12">
          <div className="animate-aurora pointer-events-none absolute -top-24 left-1/4 h-64 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <h2 className="relative text-3xl font-black tracking-tight sm:text-4xl">If the planet is talking, the code should be open.</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-slate-400">MIT licensed. One-click deploy. Star it, fork it, plug your agent into it — and stay safe out there.</p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <a href="https://github.com/aniruddhaadak80/terra-pulse" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-200">
              <Star size={16} /> Star terra-pulse
            </a>
            <a href="#top" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition hover:border-white/60">Back to live globe ↑</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
