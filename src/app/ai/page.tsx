import { SectionHeading, Footer, Navbar } from "@/components/chrome";
import AiAssistant from "@/components/AiAssistant";

export default function AiPage() {
  return (
    <>
      <Navbar deployUrl="" />
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-20">
        <SectionHeading
          kicker="05 — AI ASSISTANT"
          title={<>Ask the planet anything. <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Powered by Gemini 3.5 Flash.</span></>}
          lede="A Gemini-powered assistant that reasons over live risk context — magnitude, depth, tsunami flag, factors and actions — without your key ever leaving the server."
        />
        <AiAssistant />
      </main>
      <Footer />
    </>
  );
}
