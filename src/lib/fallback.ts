import type { PlanetEvent, QuakeFeature } from "./types";
import { GENESIS_SEAL, sealChain } from "./seal";

/** Offline-safe sample so the UI + build never break without network. */
export function sampleQuakes(): QuakeFeature[] {
  const now = Date.now();
  const raw = [
    { id: "nc75012345", mag: 4.8, place: "12km SW of Ferndale, California", lon: -124.28, lat: 40.28, depthKm: 18.2, tsunami: 0 as const, agoMin: 34 },
    { id: "us7000abcd", mag: 5.6, place: "Offshore Biobio, Chile", lon: -73.9, lat: -36.7, depthKm: 22.5, tsunami: 1 as const, agoMin: 96 },
    { id: "us7000efgh", mag: 6.1, place: "Hindu Kush region, Afghanistan", lon: 70.9, lat: 36.4, depthKm: 190.0, tsunami: 0 as const, agoMin: 210 },
    { id: "ak025abc123", mag: 3.9, place: "64km SE of Adak, Alaska", lon: -175.9, lat: 51.4, depthKm: 42.0, tsunami: 0 as const, agoMin: 300 },
    { id: "ci41234567", mag: 2.8, place: "9km NE of Coso Junction, CA", lon: -117.85, lat: 36.12, depthKm: 6.4, tsunami: 0 as const, agoMin: 420 },
  ];
  const seals = sealChain(raw, (r) => ({ id: r.id, mag: r.mag, place: r.place }));
  return raw.map((r, i) => ({
    id: r.id,
    mag: r.mag,
    place: r.place,
    time: now - r.agoMin * 60_000,
    updated: now - r.agoMin * 60_000,
    tz: null,
    url: `https://earthquake.usgs.gov/earthquakes/eventpage/${r.id}`,
    felt: null,
    cdi: null,
    mmi: null,
    alert: null,
    tsunami: r.tsunami,
    sig: Math.round(r.mag * 100),
    net: "us",
    code: r.id,
    geometry: { lon: r.lon, lat: r.lat, depthKm: r.depthKm },
    seal: seals[i] || GENESIS_SEAL,
  }));
}

export function sampleEvents(): PlanetEvent[] {
  const raw = [
    { id: "EONET_WF_2026a", title: "Wildfire — Attica, Greece", category: "Wildfires", lon: 23.9, lat: 38.1 },
    { id: "EONET_ST_2026b", title: "Severe Storm — Luzon, Philippines", category: "Severe Storms", lon: 121.0, lat: 16.5 },
    { id: "EONET_VO_2026c", title: "Volcanic activity — Reykjanes, Iceland", category: "Volcanoes", lon: -22.4, lat: 63.9 },
    { id: "EONET_FL_2026d", title: "Flooding — Sindh, Pakistan", category: "Floods", lon: 68.8, lat: 26.2 },
  ];
  const seals = sealChain(raw, (r) => ({ id: r.id, title: r.title }));
  return raw.map((r, i) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: "open",
    closed: null,
    sources: [{ id: "NASA EONET", url: "https://eonet.gsfc.nasa.gov/" }],
    geometry: [{ date: new Date().toISOString(), type: "Point", coordinates: [r.lon, r.lat] }],
    lat: r.lat,
    lon: r.lon,
    seal: seals[i] || GENESIS_SEAL,
  }));
}
