import { afterEach, describe, expect, it, vi } from "vitest";
import { loadQuakes } from "./feeds";
import { GENESIS_SEAL, sealRecord } from "./seal";
import { parseAnalyzePreset } from "./analyze-preset";

const FEED = {
  type: "FeatureCollection",
  features: [
    { id: "a", properties: { mag: 4.1, place: "Small" }, geometry: { coordinates: [1, 2, 3] } },
    { id: "b", properties: { mag: 6.4, place: "Big" }, geometry: { coordinates: [4, 5, 6] } },
    { id: "c", properties: { mag: 5.9, place: "Medium" }, geometry: { coordinates: [7, 8, 9] } },
  ],
};

describe("quake audit chain", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verifies over the order the records are served in", async () => {
    vi.stubGlobal("fetch", async () =>
      ({ ok: true, status: 200, json: async () => FEED }) as unknown as Response
    );

    const feed = await loadQuakes();
    expect(feed.quakes.map((q) => q.id)).toEqual(["b", "c", "a"]);

    let previous = GENESIS_SEAL;
    for (const quake of feed.quakes) {
      const expected = sealRecord(previous, { id: quake.id, p: quake.mag });
      expect(quake.seal).toBe(expected);
      previous = quake.seal;
    }
  });
});

describe("analyze preset", () => {
  it("returns no preset when mag is missing", () => {
    expect(parseAnalyzePreset(new URLSearchParams(""))).toBeNull();
    expect(parseAnalyzePreset(new URLSearchParams("depth=10"))).toBeNull();
  });

  it("returns no preset for a malformed magnitude", () => {
    expect(parseAnalyzePreset(new URLSearchParams("mag=abc"))).toBeNull();
  });

  it("uses the depth default when depth is missing", () => {
    expect(parseAnalyzePreset(new URLSearchParams("mag=6.0"))).toEqual({
      magnitude: 6,
      depthKm: 10,
      tsunami: false,
      place: "Unknown location",
    });
  });

  it("reads every parameter when they are present", () => {
    expect(
      parseAnalyzePreset(new URLSearchParams("mag=7.2&depth=15&tsunami=1&place=Offshore"))
    ).toEqual({ magnitude: 7.2, depthKm: 15, tsunami: true, place: "Offshore" });
  });
});
