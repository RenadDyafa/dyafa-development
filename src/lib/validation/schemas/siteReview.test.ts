import { describe, it, expect } from "vitest";
import { siteReviewSchema } from "./siteReview";

const validPayload = {
  name: "Jane Landowner",
  role: "landowner" as const,
  email: "jane@example.com",
  phone: "+966500000000",
  city: "Riyadh",
  locale: "en" as const,
  consent: true as const,
};

describe("siteReviewSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = siteReviewSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a missing required field with the 'required' i18n key", () => {
    const { name, ...rest } = validPayload;
    void name;
    const result = siteReviewSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameIssue?.message).toBe("required");
    }
  });

  it("rejects an invalid email with the 'invalidEmail' i18n key", () => {
    const result = siteReviewSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === "email")?.message).toBe("invalidEmail");
    }
  });

  it("rejects consent=false with the 'consentRequired' i18n key", () => {
    const result = siteReviewSchema.safeParse({ ...validPayload, consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((i) => i.path[0] === "consent")?.message).toBe("consentRequired");
    }
  });

  it("accepts optional land/asset fields when provided", () => {
    const result = siteReviewSchema.safeParse({
      ...validPayload,
      landAreaM2: 5000,
      legalStatus: "deed",
      assetType: "raw_land",
      landLocationLat: 24.7,
      landLocationLng: 46.6,
    });
    expect(result.success).toBe(true);
  });
});
