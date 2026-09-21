"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, Crosshair, Flame, Search, Waves } from "lucide-react";
import type { PlanetEvent, QuakeFeature } from "@/lib/types";

function ago(t: number): string {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m ago`;
  return `${Math.floor(h / 24)}d ${h % 24}h ago`;
}

function magStyle(mag: number | null): string {
  if (mag == null) return "border-white/15 text-slate-300";
  if (mag >= 6) return "border-rose-400/50 bg-rose-500/15 text-rose-200";
  if (mag >= 5) return "border-orange-400/40 bg-orange-500/10 text-orange-200";
  if (mag >= 4) return "border-amber-300/40 bg-amber-400/10 text-amber-200";
  return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
}

export interface AnalyzePreset {
  magnitude: number;
  depthKm: number;
  tsunami: boolean;
  place: string;
}

export default function LiveDashboard({
  quakes,
  events,
  loading,
  onAnalyze,
}: {
  quakes: QuakeFeature[];
  events: PlanetEvent[];
  loading: boolean;
  onAnalyze: (p: AnalyzePreset) => void;
}) {
  const [minMag, setMinMag] = useState(0);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState<QuakeFeature | null>(null);

  const filtered = useMemo(
    () =>
      quakes.filter(
        (x) =>
          (x.mag ?? 0) >= minMag &&
          (q.trim() === "" || x.place.toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [quakes, minMag, q]
  );

  const cats = useMemo(() => ["All", ...Array.from(new Set(events.map((e) => e.category)))], [events]);
  const catEvents = useMemo(() => (cat === "All" ? events : events.filter((e) => e.category === cat)), [events, cat]);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Quakes */}
      <div className="glass rounded-3xl p-5 sm:p-6 lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-slate-300">
            <Waves size={15} className="text-cyan-300" /> EARTHQUAKES · 24H · USGS
          </h3>
          <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] text-slate-400">
            {filtered.length}/{quakes.length} SHOWN
          </span>
        </div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by place — try ‘Chile’, ‘Japan’, ‘California’…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-slate-400">
            MIN&nbsp;M{minMag.toFixed(1)}
            <input type="range" min={0} max={6} step={0.5} value={minMag} onChange={(e) => setMinMag(Number(e.target.value))} className="w-28 accent-cyan-400" />
          </label>
        </div>
        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))
          ) : filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-500">
              No events match — lower the magnitude floor.
            </p>
          ) : (
            filtered.map((x) => (
              <button
                key={x.id}
                onClick={() => setSelected(x)}
                className={`flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/5 ${selected?.id === x.id ? "border-cyan-400/50 bg-cyan-400/5" : ""}`}
              >
                <span className={`flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-lg border font-mono ${magStyle(x.mag)}`}>
                  <span className="text-base font-bold leading-none">{x.mag?.toFixed(1) ?? "—"}</span>
                  <span className="text-[9px] tracking-widest">MAG</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">{x.place}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 font-mono text-[10px] tracking-wider text-slate-500">
                    <span>{ago(x.time).toUpperCase()}</span>
                    <span>{x.geometry.depthKm.toFixed(0)} KM DEEP</span>
                    {x.tsunami === 1 ? <span className="flex items-center gap-1 text-rose-300"><AlertTriangle size={11} /> TSUNAMI FLAG</span> : null}
                  </span>
                </span>
                <ArrowUpRight size={15} className="shrink-0 text-slate-600" />
              </button>
            ))
          )}
        </div>

        {selected ? (
          <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-300">SELECTED EVENT</p>
                <p className="mt-1 font-semibold">M{selected.mag?.toFixed(1)} — {selected.place}</p>
                <p className="mt-1 break-all font-mono text-[10px] text-slate-500">seal {selected.seal}</p>
              </div>
              <button
                onClick={() =>
                  onAnalyze({ magnitude: selected.mag ?? 4, depthKm: selected.geometry.depthKm, tsunami: selected.tsunami === 1, place: selected.place })
                }
                className="flex items-center gap-1.5 rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-cyan-300"
              >
                <Crosshair size={13} /> Analyze risk
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={selected.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200">
                Open USGS event page ↗
              </a>
              <a href="#analyze" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200">
                Open risk engine ↓
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* EONET */}
      <div className="glass rounded-3xl p-5 sm:p-6 lg:col-span-2">
        <h3 className="mb-4 flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-slate-300">
          <Flame size={15} className="text-orange-300" /> FIRES · STORMS · VOLCANOES · NASA
        </h3>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1 font-mono text-[10px] tracking-widest transition ${cat === c ? "bg-orange-400 text-black" : "border border-white/15 text-slate-400 hover:border-orange-300/50 hover:text-orange-200"}`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)
          ) : (
            catEvents.slice(0, 30).map((e) => (
              <div key={e.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-sm font-medium leading-snug text-slate-100">{e.title}</p>
                <p className="mt-1 font-mono text-[10px] tracking-wider text-slate-500">
                  {e.category.toUpperCase()} · {e.lat != null && e.lon != null ? `${e.lat.toFixed(1)}°, ${e.lon.toFixed(1)}°` : "LOCATION PENDING"} · {e.status.toUpperCase()}
                </p>
              </div>
            ))
          )}
          {!loading && catEvents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-500">No open events in this category.</p>
          ) : null}
        </div>
        <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wider text-slate-600">
          SOURCE: NASA EONET V3 · OPEN EVENTS · DOTS WITHOUT COORDS ARE STILL COUNTED ABOVE
        </p>
      </div>
    </div>
  );
}
