import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { assessRisk } from "@/lib/risk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const MODEL = "gemini-3.5-flash";
const MAX_ATTEMPTS = 3;

interface Factor {
  label: string;
  weight: number;
  detail: string;
}

interface RiskContext {
  magnitude: number;
  depthKm: number;
  tsunami: boolean;
  place: string;
  level: string;
  score: number;
  factors: Factor[];
  actions: string[];
}

function fallbackAnswer(question: string, ctx?: RiskContext): string {
  const lines: string[] = [];
  if (ctx) {
    lines.push(`Deterministic engine reading for ${ctx.place}: M${ctx.magnitude} at ${ctx.depthKm} km depth, level ${ctx.level} (${ctx.score}/100).`);
    for (const f of ctx.factors.slice(0, 3)) lines.push(`- ${f.label}: +${f.weight}. ${f.detail}`);
    for (const a of ctx.actions.slice(0, 3)) lines.push(`- Action: ${a}`);
  } else {
    lines.push("Gemini is temporarily overloaded, so here is timeless preparedness guidance instead of a live answer.");
    lines.push("- M7+ is major: expect strong shaking, aftershocks, possible tsunami if offshore and shallow.");
    lines.push("- During shaking: drop, cover, hold on. After: check gas and power, help neighbors, keep a go-bag ready.");
    lines.push("- For event-specific numbers, check the /live feed or USGS event page for the quake in question.");
  }
  if (question) lines.push(`Your question was: "${question}". Please retry in a minute for the full Gemini briefing.`);
  lines.push("Verify with USGS and your local disaster agency before acting on automated output.");
  return lines.join("\n");
}

function retryable(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /503|429|overloaded|high demand|Service Unavailable|Too Many Requests/i.test(m);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      question?: string;
      magnitude?: number;
      depthKm?: number;
      tsunami?: boolean;
      place?: string;
      level?: string;
      score?: number;
      factors?: Factor[];
      actions?: string[];
    };
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }
    const model = genAI.getGenerativeModel({ model: MODEL });
    const rawCtx: RiskContext | undefined =
      body.magnitude != null
        ? {
            magnitude: body.magnitude,
            depthKm: body.depthKm ?? 0,
            tsunami: body.tsunami ?? false,
            place: body.place ?? "unknown",
            level: body.level ?? "?",
            score: body.score ?? 0,
            factors: body.factors ?? [],
            actions: body.actions ?? [],
          }
        : undefined;
    // Re-run the deterministic engine server-side so factors/actions are never hallucinated.
    const ctx: RiskContext | undefined = rawCtx
      ? (() => {
          const r = assessRisk({ magnitude: rawCtx.magnitude, depthKm: rawCtx.depthKm, tsunami: rawCtx.tsunami, place: rawCtx.place });
          return { ...rawCtx, level: r.level, score: r.score, factors: r.factors, actions: r.actions };
        })()
      : undefined;
    const question = (body.question ?? "").trim();
    const system = `You are Terra Pulse's AI assistant, a calm expert on seismic and planetary-disaster risk.
Rules:
- Use ONLY the context below plus your general knowledge of seismology, USGS terminology, and disaster response.
- Do NOT invent numbers. If the context lacks a magnitude or depth, say so.
- Structure: 3 short bullets of findings, then 3 short actionable recommendations, then one "Verify with USGS/local agencies" line.
- Tone: calm, clear, human, no hype, no em dash, no exclamation marks.`;
    const parts: { text: string }[] = [{ text: system }];
    if (ctx) {
      const factorText = ctx.factors.map((f) => `${f.label}: +${f.weight} (${f.detail})`).join("\n");
      parts.push({
        text: `LATEST RISK CONTEXT\nPlace: ${ctx.place}\nMagnitude: ${ctx.magnitude}\nDepth: ${ctx.depthKm} km\nLevel: ${ctx.level}\nScore: ${ctx.score}/100\nFactors:\n${factorText}\nActions:\n${ctx.actions.join("\n")}\n\nAnswer the user's question using only this context.`,
      });
    }
    if (question) {
      parts.push({ text: question });
    }
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await model.generateContent({ contents: [{ role: "user", parts }] });
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
        return NextResponse.json({ answer: text, model: MODEL });
      } catch (err) {
        lastErr = err;
        if (!retryable(err) || attempt === MAX_ATTEMPTS) break;
        await sleep(800 * 2 ** (attempt - 1));
      }
    }
    // Graceful degradation: deterministic briefing instead of a bare 500.
    return NextResponse.json(
      { answer: fallbackAnswer(question, ctx), fallback: true, model: "terra-risk-v1 (deterministic fallback)", error: lastErr instanceof Error ? lastErr.message : "gemini unavailable" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "gemini failed" }, { status: 500 });
  }
}
