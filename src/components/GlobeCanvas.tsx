"use client";

import { useEffect, useRef } from "react";

export interface Pulse {
  lat: number;
  lon: number;
  mag: number | null;
}

function fibSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  return pts;
}

const DOTS = fibSphere(850);

function project(lat: number, lon: number, rot: number, R: number, cx: number, cy: number) {
  const la = (lat * Math.PI) / 180;
  const lo = ((lon + rot) * Math.PI) / 180;
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  return { x: cx + x * R, y: cy - y * R, z };
}

export default function GlobeCanvas({ pulses }: { pulses: Pulse[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pulsesRef = useRef<Pulse[]>(pulses);

  useEffect(() => {
    pulsesRef.current = pulses;
  }, [pulses]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let rot = 20;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      rot += 0.12;

      // halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.5);
      halo.addColorStop(0, "rgba(34,211,238,0.16)");
      halo.addColorStop(0.6, "rgba(167,139,250,0.07)");
      halo.addColorStop(1, "rgba(4,6,12,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // sphere body
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(30,58,95,0.55)");
      body.addColorStop(0.75, "rgba(10,20,40,0.85)");
      body.addColorStop(1, "rgba(4,6,12,0.95)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(34,211,238,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // graticule rings
      ctx.strokeStyle = "rgba(148,163,184,0.12)";
      ctx.lineWidth = 1;
      for (const tilt of [-60, -30, 0, 30, 60]) {
        ctx.beginPath();
        const rr = R * Math.cos((tilt * Math.PI) / 180);
        const yy = cy - R * Math.sin((tilt * Math.PI) / 180);
        ctx.ellipse(cx, yy, rr, rr * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // base dots
      for (const [x, y, z] of DOTS) {
        const lo = Math.atan2(x, z);
        const la = Math.asin(Math.max(-1, Math.min(1, y)));
        const lon = ((lo * 180) / Math.PI - rot + 540) % 360 - 180;
        const lat = (la * 180) / Math.PI;
        const p = project(lat, lon, 0, R, cx, cy);
        // recompute visibility from original z after rotation
        const rad = ((rot * Math.PI) / 180);
        const zz = z * Math.cos(rad) - x * Math.sin(rad);
        if (zz < -0.05) continue;
        const a = 0.12 + 0.5 * Math.max(0, zz);
        ctx.fillStyle = `rgba(125,211,252,${a.toFixed(2)})`;
        const s = zz > 0.6 ? 1.8 : 1.3;
        ctx.fillRect(p.x, p.y, s, s);
      }

      // orbit arcs
      ctx.strokeStyle = "rgba(167,139,250,0.25)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.18, R * 0.42, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // live pulses
      const t = performance.now() / 1000;
      for (const p of pulsesRef.current.slice(0, 14)) {
        if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;
        const pr = project(p.lat, p.lon, rot, R, cx, cy);
        if (pr.z < 0.02) continue;
        const mag = p.mag ?? 3;
        const heat = mag >= 6 ? "244,63,94" : mag >= 5 ? "251,113,133" : mag >= 4 ? "251,191,36" : "52,211,153";
        const phase = (t * 0.7 + Math.abs(p.lat + p.lon) / 360) % 1;
        const rr = 4 + phase * (8 + mag * 3);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${heat},${(0.7 * (1 - phase)).toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 2.6 + Math.min(3, mag / 2.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${heat},0.95)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 5.5 + Math.min(3, mag / 2.4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${heat},0.35)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-label="Rotating planetary activity globe" />;
}
