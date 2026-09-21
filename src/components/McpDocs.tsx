"use client";

import { useState } from "react";
import { Bot, Copy, Check, Play, Loader2 } from "lucide-react";

function Code({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-slate-400">{title}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-slate-200">{code}</pre>
    </div>
  );
}

export default function McpDocs({ baseUrl }: { baseUrl: string }) {
  const [out, setOut] = useState("← hit TRY and watch your agent's view of the planet appear here.");
  const [busy, setBusy] = useState(false);

  async function tryCall(tool: string, args: object) {
    setBusy(true);
    setOut("calling…");
    try {
      const r = await fetch("/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: tool, arguments: args } }),
      });
      const j = await r.json();
      setOut(JSON.stringify(j, null, 2).slice(0, 3000));
    } catch (e) {
      setOut(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  const origin = baseUrl || (typeof window !== "undefined" ? window.location.origin : "https://terra-pulse-sooty.vercel.app");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <Code
          title="CLAUDE CODE / CURSOR / OPENCODE — mcp.json"
          code={`{\n  "mcpServers": {\n    "terra-pulse": { "url": "${origin}/api/mcp" }\n  }\n}`}
        />
        <Code
          title="CURL — LIST TOOLS"
          code={`curl -X POST ${origin}/api/mcp \\\n  -H 'content-type: application/json' \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
        />
        <Code
          title="CURL — AGENT RISK CALL"
          code={`curl -X POST ${origin}/api/mcp \\\n  -H 'content-type: application/json' \\\n  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",\n       "params":{"name":"analyze_risk","arguments":\n       {"magnitude":6.4,"depthKm":18,"tsunami":true,\n        "place":"Offshore Maule, Chile"}}}'`}
        />
      </div>
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h3 className="mb-1 flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-slate-300">
          <Bot size={15} className="text-emerald-300" /> LIVE AGENT CONSOLE
        </h3>
        <p className="mb-4 text-sm text-slate-400">The exact JSON-RPC your coding agent sees. No keys, no signup.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={() => tryCall("get_quakes", { minMag: 4.5 })} disabled={busy} className="flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-emerald-300 disabled:opacity-60">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} TRY get_quakes
          </button>
          <button onClick={() => tryCall("get_events", { category: "wildfires" })} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 transition hover:border-emerald-300 disabled:opacity-60">
            TRY get_events
          </button>
          <button onClick={() => tryCall("analyze_risk", { magnitude: 6.4, depthKm: 18, tsunami: true, place: "Offshore Maule, Chile" })} disabled={busy} className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 transition hover:border-emerald-300 disabled:opacity-60">
            TRY analyze_risk
          </button>
        </div>
        <pre className="max-h-[380px] overflow-auto rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-[11px] leading-relaxed text-emerald-200/90">{out}</pre>
        <p className="mt-3 font-mono text-[10px] tracking-wider text-slate-600">TOOLS: get_quakes · get_events · analyze_risk — EVERY RESPONSE CARRIES A tq384 AUDIT SEAL</p>
      </div>
    </div>
  );
}
