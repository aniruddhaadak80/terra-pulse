"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Activity, Star, Radio, Satellite, ShieldCheck, Zap } from "lucide-react";

export function Navbar({ deployUrl }: { deployUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "bg-[#04060c]/85 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-b border-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 font-mono text-sm font-bold text-black">
            ◉
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="animate-ping-soft absolute h-full w-full rounded-full bg-emerald-400" />
              <span className="relative h-3 w-3 rounded-full bg-emerald-400" />
            </span>
          </span>
          <span className="font-mono text-sm font-bold tracking-[0.22em]">TERRA&nbsp;PULSE</span>
        </a>
        <nav className="hidden items-center gap-7 font-mono text-[11px] tracking-[0.18em] text-slate-400 md:flex">
          <a href="#live" className="transition hover:text-cyan-300">LIVE</a>
          <a href="#analyze" className="transition hover:text-cyan-300">RISK&nbsp;ENGINE</a>
          <a href="#agents" className="transition hover:text-cyan-300">MCP&nbsp;FOR&nbsp;AGENTS</a>
          <a href="#seal" className="transition hover:text-cyan-300">SEAL&nbsp;CHAIN</a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] tracking-widest text-emerald-300 sm:flex">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-emerald-400" /> {deployUrl ? "LIVE" : "LIVE"}
          </span>
          <a
            href="https://github.com/aniruddhaadak80/terra-pulse"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-200"
          >
            <Star size={14} /> Star
          </a>
        </div>
      </div>
    </header>
  );
}

export function Ticker({ items }: { items: string[] }) {
  const row = items.length ? items : ["awaiting live feed…"];
  const doubled = [...row, ...row];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/60">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap px-5 py-2.5 font-mono text-[11px] tracking-wider text-slate-300">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <Radio size={12} className="text-cyan-400" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SectionHeading({ kicker, title, lede }: { kicker: string; title: ReactNode; lede?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 font-mono text-[11px] tracking-[0.3em] text-cyan-300">{kicker}</p>
      <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {lede ? <p className="mt-4 text-slate-400">{lede}</p> : null}
    </div>
  );
}

export function Stat({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-slate-400">
        {icon} {label}
      </div>
      <div className="font-mono text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export function StatsRow({ stats }: { stats: { icon: ReactNode; label: string; value: string; sub: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => (
        <Stat key={i} {...s} />
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2 font-mono text-sm font-bold tracking-[0.22em]">TERRA PULSE</div>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            An open planetary nervous system. Live USGS + NASA feeds, an explainable risk engine, hash-sealed audit
            trail, and an MCP server your agent can call. MIT licensed — fork it, star it, extend it.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] tracking-widest">
            {["USGS", "NASA EONET", "MCP", "SHA-384 CHAIN", "NEXT.JS", "MIT"].map((t) => (
              <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-slate-400">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 font-mono text-[11px] tracking-[0.25em] text-slate-500">LIVE</p>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li><a href="#live" className="hover:text-cyan-300">Live dashboard</a></li>
            <li><a href="#analyze" className="hover:text-cyan-300">Risk engine</a></li>
            <li><a href="/api/quakes" className="hover:text-cyan-300">/api/quakes</a></li>
            <li><a href="/api/events" className="hover:text-cyan-300">/api/events</a></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 font-mono text-[11px] tracking-[0.25em] text-slate-500">BUILDERS</p>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li><a href="#agents" className="hover:text-cyan-300">MCP for agents</a></li>
            <li><a href="#seal" className="hover:text-cyan-300">Seal chain</a></li>
            <li><a href="https://github.com/aniruddhaadak80/terra-pulse" target="_blank" rel="noreferrer" className="hover:text-cyan-300">GitHub repo</a></li>
            <li><a href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer" className="hover:text-cyan-300">USGS source</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 font-mono text-[11px] tracking-wider text-slate-500 sm:flex-row">
          <span className="flex items-center gap-2"><Activity size={13} className="text-cyan-400" /> TERRA PULSE — ALWAYS LISTENING</span>
          <span className="flex items-center gap-2"><ShieldCheck size={13} className="text-emerald-400" /> VERIFY WITH USGS + LOCAL AUTHORITIES</span>
          <span className="flex items-center gap-2"><Satellite size={13} className="text-violet-400" /> <Zap size={13} className="text-amber-300" /> OPEN SOURCE · MIT</span>
        </div>
      </div>
    </footer>
  );
}
