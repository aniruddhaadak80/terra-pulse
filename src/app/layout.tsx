import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terra Pulse — Open Planetary Nervous System",
  description:
    "Live earthquakes (USGS) + wildfires, storms & volcanoes (NASA EONET) fused into one open dashboard with an explainable AI risk engine, quantum-resilient audit seals, and an MCP server your coding agent can call.",
  keywords: ["earthquakes", "disasters", "USGS", "NASA EONET", "MCP", "AI agents", "open source", "risk", "quantum-safe"],
  authors: [{ name: "Terra Pulse contributors" }],
  openGraph: {
    title: "Terra Pulse — Open Planetary Nervous System",
    description: "Live planet. Explainable risk. Agent-ready. Open source.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terra Pulse — Open Planetary Nervous System",
    description: "Live planet. Explainable risk. Agent-ready. Open source.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col noise">{children}</body>
    </html>
  );
}
