import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

interface RiskContext {
  magnitude: number;
  depthKm: number;
  tsunami: boolean;
  place: string;
  level: string;
  score: number;
  factors: { label: string; weight: number; detail: string }[];
  actions: string[];
}

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
      factors?: RiskContext["factors"];
      actions?: string[];
    };
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const ctx =
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
    const question = (body.question ?? "").trim();
    const system = `You are Terra Pulse's AI assistant, a calm expert on seismic and planetary-disaster risk.
Rules:
- Use ONLY the context below plus your general knowledge of seismology, USGS terminology, and disaster response.
- Do NOT invent numbers. If the context lacks a magnitude or depth, say so.
- Structure: 3 short bullets of findings, then 3 short actionable recommendations, then one "Verify with USGS/local agencies" line.
- Tone: calm, clear, human, no hype, no em dash, no exclamation marks.`;
    const parts: { text: string }[] = [
      { text: system },
    ];
    if (ctx) {
      const factorText = ctx.factors.map((f) => `${f.label}: +${f.weight} (${f.detail})`).join("\n");
      parts.push({
        text: `LATEST RISK CONTEXT\nPlace: ${ctx.place}\nMagnitude: ${ctx.magnitude}\nDepth: ${ctx.depthKm} km\nLevel: ${ctx.level}\nScore: ${ctx.score}/100\nFactors:\n${factorText}\nActions:\n${ctx.actions.join("\n")}\n\nAnswer the user's question using only this context.`,
      });
    }
    if (question) {
      parts.push({ text: question });
    }
    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
    return NextResponse.json({ answer: text });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "gemini failed" }, { status: 500 });
  }
}
