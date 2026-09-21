import { NextResponse } from "next/server";
import { assessRisk } from "@/lib/risk";
import type { McpTool } from "@/lib/types";

const TOOLS: McpTool[] = [
  {
    name: "get_quakes",
    description: "Live earthquakes from USGS (last 24h), biggest first, each with a quantum-resilient audit seal.",
    inputSchema: { type: "object", properties: { minMag: { type: "number", default: 0 } } },
  },
  {
    name: "get_events",
    description: "Open wildfires, storms, floods and volcanoes from NASA EONET.",
    inputSchema: { type: "object", properties: { category: { type: "string" } } },
  },
  {
    name: "analyze_risk",
    description: "Deterministic seismic risk briefing: score, level, factors, actions. No API key needed.",
    inputSchema: {
      type: "object",
      required: ["magnitude", "depthKm"],
      properties: {
        magnitude: { type: "number" },
        depthKm: { type: "number" },
        tsunami: { type: "boolean" },
        place: { type: "string" },
        lat: { type: "number" },
        lon: { type: "number" },
      },
    },
  },
];

interface RpcBody {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown>; minMag?: number; category?: string } & Record<string, unknown>;
}

async function callTool(name: string, args: Record<string, unknown>, origin: string) {
  if (name === "analyze_risk") {
    const a = assessRisk({
      magnitude: Number(args.magnitude ?? 5),
      depthKm: Number(args.depthKm ?? 20),
      tsunami: Boolean(args.tsunami),
      place: typeof args.place === "string" ? args.place : undefined,
      lat: typeof args.lat === "number" ? args.lat : undefined,
      lon: typeof args.lon === "number" ? args.lon : undefined,
    });
    return a;
  }
  if (name === "get_quakes") {
    const r = await fetch(`${origin}/api/quakes`, { next: { revalidate: 120 } });
    const j = await r.json();
    const min = Number(args.minMag ?? 0);
    return { ...(j as object), quakes: ((j as { quakes: { mag: number | null }[] }).quakes ?? []).filter((q) => (q.mag ?? 0) >= min).slice(0, 20) };
  }
  if (name === "get_events") {
    const r = await fetch(`${origin}/api/events`, { next: { revalidate: 300 } });
    const j = await r.json();
    const cat = typeof args.category === "string" ? args.category.toLowerCase() : "";
    const events = ((j as { events: { category: string }[] }).events ?? []).filter((e) =>
      cat ? e.category.toLowerCase().includes(cat) : true
    ).slice(0, 20);
    return { ...(j as object), events };
  }
  throw new Error(`unknown tool: ${name}`);
}

export async function GET() {
  return NextResponse.json({
    protocol: "mcp-like JSON-RPC 2.0 over HTTPS",
    server: "terra-pulse-mcp",
    version: "1.0.0",
    tools: TOOLS,
    usage: {
      endpoint: "/api/mcp",
      methods: ["initialize", "tools/list", "tools/call"],
      claudeCode: { mcpServers: { "terra-pulse": { url: "<DEPLOY_URL>/api/mcp" } } },
    },
  });
}

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  let body: RpcBody;
  try {
    body = (await req.json()) as RpcBody;
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, { status: 400 });
  }
  const { method, params = {}, id = null } = body;
  try {
    if (method === "initialize") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", serverInfo: { name: "terra-pulse-mcp", version: "1.0.0" } } });
    }
    if (method === "tools/list") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    }
    if (method === "tools/call") {
      const name = String(params.name ?? params.tool ?? "");
      const args = (params.arguments ?? params) as Record<string, unknown>;
      const result = await callTool(name, args, origin);
      return NextResponse.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result).slice(0, 8000) }], structured: result } });
    }
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `unknown method: ${method}` } }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32603, message: err instanceof Error ? err.message : "internal error" } }, { status: 500 });
  }
}
