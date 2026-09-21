import { SectionHeading, StatsRow, Ticker, Footer, Navbar } from "@/components/chrome";
import LiveDashboard from "@/components/LiveDashboard";
import { getQuakes, getEvents } from "@/lib/api-local";
import { Activity, AlertTriangle, Flame, Waves } from "lucide-react";

export default async function LivePage() {
  const q = await getQuakes();
  const e = await getEvents();
  const s = q.quakes[0];
  const tsunami = q.quakes.filter((x) => x.tsunami === 1).length;
  const big = q.quakes.filter((x) => (x.mag ?? 0) >= 4.5).length;
  const ticker = [
    ...(s ? [`STRONGEST 24H: M${s.mag?.toFixed(1)} — ${s.place}`] : []),
    `${q.quakes.length} QUAKES TRACKED · ${big} ≥ M4.5`,
    tsunami > 0 ? `⚠ ${tsunami} TSUNAMI FLAG${tsunami > 1 ? "S" : ""} ACTIVE` : "NO TSUNAMI FLAGS",
    `${e.events.length} NASA EONET EVENTS OPEN`,
    "RISK ENGINE: DETERMINISTIC · GEMINI-POWERED AI · MCP-READY",
  ];
  return (
    <>
      <Navbar deployUrl="" />
      <Ticker items={ticker} />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-20">
        <SectionHeading
          kicker="01 — LIVE"
          title={<>One screen. <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Every tremor, fire &amp; storm.</span></>}
          lede="Straight from USGS and NASA, resealed into a tamper-evident chain. Filter, inspect, then push any quake into the risk engine."
        />
        <StatsRow
          stats={[
            { icon: <Waves size={13} className="text-cyan-300" />, label: "QUAKES · 24H", value: String(q.quakes.length), sub: "USGS all-day feed" },
            { icon: <Activity size={13} className="text-amber-300" />, label: "STRONGEST", value: s ? `M${s.mag?.toFixed(1) ?? "—"}` : "—", sub: s?.place.slice(0, 34) ?? "awaiting feed" },
            { icon: <Flame size={13} className="text-orange-300" />, label: "EONET OPEN", value: String(e.events.length), sub: "Fires · storms · volcanoes · floods" },
            { icon: <AlertTriangle size={13} className="text-rose-300" />, label: "TSUNAMI FLAGS", value: String(q.quakes.filter((x) => x.tsunami === 1).length), sub: "Coastal caution" },
          ]}
        />
        <div className="mt-8">
          <LiveDashboard quakes={q.quakes} events={e.events} loading={false} />
        </div>
      </main>
      <Footer />
    </>
  );
}
