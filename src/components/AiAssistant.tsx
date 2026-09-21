"use client";

import { useState } from "react";
import { BrainCircuit, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function AiAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setBusy(true);
    setErr("");
    setAnswer("");
    setFallback(false);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(typeof j.error === "string" ? j.error : `AI ${r.status}`);
      setAnswer(j.answer ?? "No response.");
      setFallback(j.fallback === true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "AI unavailable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-5 sm:p-8">
      <h3 className="mb-1 flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-slate-300">
        <Sparkles size={15} className="text-emerald-300" /> RISK ASSISTANT (Gemini 3.5 Flash)
      </h3>
      <p className="mb-5 text-sm text-slate-400">Your key never leaves the server — the route reads GEMINI_API_KEY from Vercel runtime env.</p>
      <div className="mb-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask about seismic risk, tsunami safety, or a recent event…"
          className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
        />
        <button
          onClick={ask}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />} Ask
        </button>
      </div>
      {err ? <p className="mb-4 font-mono text-xs text-rose-300">⚠ {err}</p> : null}
      <div className="min-h-[160px] rounded-2xl border border-white/10 bg-black/70 p-5">
        {answer ? (
          <div className="space-y-4 text-sm leading-relaxed text-slate-200">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-emerald-300">
              <ShieldCheck size={13} /> {fallback ? "DETERMINISTIC FALLBACK (GEMINI BUSY)" : "ASSISTANT REPLY"}
            </div>
            {answer.split("\n").map((line, i) => (
              <p key={i} className={line.startsWith("Verify") ? "text-rose-300/90 font-medium" : ""}>
                {line}
              </p>
            ))}
            <p className="mt-3 font-mono text-[10px] text-slate-600">MODEL: gemini-3.5-flash · SERVER-SIDE · KEY NEVER EXPOSED</p>
          </div>
        ) : (
          <div className="flex h-full min-h-[140px] flex-col items-center justify-center text-center">
            <BrainCircuit size={30} className="mb-3 text-slate-600" />
            <p className="max-w-sm text-sm text-slate-500">Type a question — e.g. &quot;What should I do if M6.4 hits near my coast?&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
