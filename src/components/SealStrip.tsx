"use client";

import { Fingerprint, Lock, Atom } from "lucide-react";

export default function SealStrip({ seals }: { seals: string[] }) {
  const chain = seals.slice(0, 5);
  return (
    <div className="glass rounded-3xl p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-slate-300">
            <Fingerprint size={15} className="text-cyan-300" /> QUANTUM-RESILIENT AUDIT SEAL
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Every quake, wildfire and risk score is sealed into a <span className="text-slate-200">SHA-384 hash chain</span>:
            each seal commits to the previous one, so silently editing any record breaks every seal after it. SHA-384
            keeps a 192-bit margin even under Grover-style quantum speedups — the same “harvest now, decrypt later”
            threat model keeping CISOs up in 2026.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: <Lock size={16} />, t: "Tamper-evident", d: "Edit one byte, break the chain." },
              { icon: <Atom size={16} />, t: "PQC-ready", d: "ML-DSA envelope swap-in marked in code." },
              { icon: <Fingerprint size={16} />, t: "Agent-verifiable", d: "Seals ride every MCP response." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="mb-1.5 text-cyan-300">{c.icon}</div>
                <p className="text-xs font-semibold">{c.t}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-slate-500">LIVE CHAIN — LATEST SEALS</p>
          <div className="space-y-2">
            {chain.length === 0 ? (
              <div className="h-12 animate-pulse rounded-xl bg-white/5" />
            ) : (
              chain.map((s, i) => (
                <div key={s + i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 font-mono text-[10px] text-cyan-300">{i + 1}</span>
                  <code className="flex-1 truncate rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-slate-300">{s}</code>
                </div>
              ))
            )}
          </div>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-slate-600">
            GENESIS: TERRA-GENESIS · ALGO: tq384 = SHA-384(prevSeal ‖ canonicalJson) · VERIFY: REFETCH /api/quakes AND REPLAY src/lib/seal.ts
          </p>
        </div>
      </div>
    </div>
  );
}
