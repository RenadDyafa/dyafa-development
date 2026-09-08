import { describe, it, expect } from "vitest";
import { computeLeadScore } from "./scoring";

describe("computeLeadScore", () => {
  it("scores zero for a minimal, empty submission", () => {
    expect(computeLeadScore({ fileCount: 0 })).toBe(0);
  });

  it("awards clear-intent points only when intent is not 'unsure'", () => {
    expect(computeLeadScore({ opportunityIntent: "hotel", fileCount: 0 })).toBe(20);
    expect(computeLeadScore({ opportunityIntent: "unsure", fileCount: 0 })).toBe(0);
  });

  it("awards complete-site-data points only when city, location and asset type are all present", () => {
    const full = computeLeadScore({ city: "Riyadh", landLocation: "Al Olaya", assetType: "raw_land", fileCount: 0 });
    const partial = computeLeadScore({ city: "Riyadh", fileCount: 0 });
    expect(full).toBeGreaterThan(partial);
  });

  it("awards documentation points when at least one file is attached", () => {
    expect(computeLeadScore({ fileCount: 1 })).toBe(10);
    expect(computeLeadScore({ fileCount: 0 })).toBe(0);
  });

  it("awards existing-asset-repositioning points for existing_building and underperforming_hotel only", () => {
    expect(computeLeadScore({ assetType: "existing_building", fileCount: 0 })).toBe(5);
    expect(computeLeadScore({ assetType: "underperforming_hotel", fileCount: 0 })).toBe(5);
    expect(computeLeadScore({ assetType: "raw_land", fileCount: 0 })).toBe(0);
  });

  it("caps the total score at 100 even when every signal fires", () => {
    const score = computeLeadScore({
      opportunityIntent: "hotel",
      city: "Riyadh",
      landLocation: "Al Olaya",
      assetType: "underperforming_hotel",
      legalStatus: "owned",
      landAreaM2: 5000,
      organization: "Acme Holdings",
      fileCount: 3,
    });
    expect(score).toBe(100);
  });
});
