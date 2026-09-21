import { SectionHeading, Footer, Navbar } from "@/components/chrome";
import SealStrip from "@/components/SealStrip";
import { getQuakes } from "@/lib/api-local";

export default async function SealPage() {
  const q = await getQuakes();
  return (
    <>
      <Navbar deployUrl="" />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-20">
        <SectionHeading
          kicker="04 — SEAL CHAIN"
          title={<>Trust, <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">but verify cryptographically.</span></>}
          lede="Every quake is sealed into a SHA-384 hash chain. Edit any record and every later seal breaks — tampering is evident even under quantum speedups."
        />
        <SealStrip seals={q.quakes.map((x) => x.seal)} />
      </main>
      <Footer />
    </>
  );
}
