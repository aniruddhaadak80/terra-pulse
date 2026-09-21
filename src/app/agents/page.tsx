import { SectionHeading, Footer, Navbar } from "@/components/chrome";
import McpDocs from "@/components/McpDocs";

export default function AgentsPage() {
  return (
    <>
      <Navbar deployUrl="" />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-20">
        <SectionHeading
          kicker="03 — MCP FOR AGENTS"
          title={<>Give your coding agent <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">a live planet.</span></>}
          lede="Three tools — get_quakes, get_events, analyze_risk — over MCP-style JSON-RPC. Paste one block into Claude Code, Cursor or OpenCode."
        />
        <McpDocs baseUrl="" />
      </main>
      <Footer />
    </>
  );
}
