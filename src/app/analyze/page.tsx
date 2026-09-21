import { SectionHeading, Footer, Navbar } from "@/components/chrome";
import Analyzer from "@/components/Analyzer";

export default function AnalyzePage() {
  return (
    <>
      <Navbar deployUrl="" />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-20">
        <SectionHeading
          kicker="02 — RISK ENGINE"
          title={<>Explainable risk, <span className="bg-gradient-to-r from-violet-300 to-rose-300 bg-clip-text text-transparent">not black-box vibes.</span></>}
          lede="Every score shows its math: magnitude, depth, tsunami flag, exposure. The same engine answers your agents over MCP."
        />
        <Analyzer preset={null} />
      </main>
      <Footer />
    </>
  );
}
