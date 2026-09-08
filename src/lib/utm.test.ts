import { describe, it, expect } from "vitest";
import { extractUtmFromSearchParams, parseUtmCookie } from "./utm";

describe("extractUtmFromSearchParams", () => {
  it("extracts standard utm_* params", () => {
    const params = new URLSearchParams("utm_source=linkedin&utm_medium=social&utm_campaign=cityscape&extra=ignored");
    const attribution = extractUtmFromSearchParams(params);
    expect(attribution).toEqual({ utmSource: "linkedin", utmMedium: "social", utmCampaign: "cityscape" });
  });

  it("returns an empty object when no utm params are present", () => {
    expect(extractUtmFromSearchParams(new URLSearchParams(""))).toEqual({});
  });
});

describe("parseUtmCookie", () => {
  it("round-trips a JSON-encoded attribution cookie", () => {
    const raw = encodeURIComponent(JSON.stringify({ utmSource: "linkedin", campaignId: "abc" }));
    expect(parseUtmCookie(raw)).toEqual({ utmSource: "linkedin", campaignId: "abc" });
  });

  it("returns an empty object for missing or malformed cookies", () => {
    expect(parseUtmCookie(undefined)).toEqual({});
    expect(parseUtmCookie("not-json")).toEqual({});
  });
});
