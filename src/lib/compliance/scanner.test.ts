import { describe, it, expect } from "vitest";
import { scanContent } from "./scanner";
import { BANNED_PHRASES } from "../../../prisma/seed-data/banned-phrases";

// Integration tests against the seeded dev database (banned_phrases, settings).
// Run `npm run db:setup` first so these phrases exist.

describe("compliance scanner — banned phrases (table-driven)", () => {
  for (const bp of BANNED_PHRASES) {
    it(`detects "${bp.phrase}" (${bp.lang}/${bp.severity})`, async () => {
      const result = await scanContent({
        textEn: bp.lang === "en" ? `This copy contains ${bp.phrase} in context.` : "Neutral English copy.",
        textAr: bp.lang === "ar" ? `هذا النص يحتوي على ${bp.phrase} ضمن السياق.` : "نص عربي محايد بلا أي عبارات محظورة.",
      });

      const bucket = bp.severity === "block" ? result.blocks : result.flags;
      expect(bucket.some((issue) => issue.type === "banned_phrase" && issue.match === bp.phrase)).toBe(true);
    });
  }

  it("is case-insensitive for English phrases", async () => {
    const result = await scanContent({
      textEn: "We offer GUARANTEED RETURNS on every asset.",
      textAr: "نص عربي محايد بلا أي عبارات محظورة.",
    });
    expect(result.blocks.some((b) => b.match === "guaranteed returns")).toBe(true);
  });
});

describe("compliance scanner — HIGH-RISK detectors", () => {
  it("flags numbers/percentages/currency", async () => {
    const result = await scanContent({ textEn: "Expected yield of 12% on this development.", textAr: "نص عربي محايد." });
    expect(result.flags.some((f) => f.type === "high_risk_number")).toBe(true);
  });

  it("flags EN secured/approved/funded/guaranteed keywords", async () => {
    const result = await scanContent({ textEn: "This project is fully funded already.", textAr: "نص عربي محايد." });
    expect(result.flags.some((f) => f.type === "high_risk_keyword" && f.lang === "en")).toBe(true);
  });

  it("flags AR مضمون/معتمد keywords", async () => {
    const result = await scanContent({ textEn: "Neutral English copy.", textAr: "هذا المشروع معتمد بالكامل من الجهات المعنية." });
    expect(result.flags.some((f) => f.type === "high_risk_keyword" && f.lang === "ar")).toBe(true);
  });

  it("flags hard delivery dates", async () => {
    const result = await scanContent({ textEn: "Handover in 2027 is confirmed.", textAr: "نص عربي محايد." });
    expect(result.flags.some((f) => f.type === "high_risk_date")).toBe(true);
  });

  it("produces no blocks or flags for clean, bilingual, distinct copy", async () => {
    const result = await scanContent({
      textEn: "Dyafa Development reviews every site with operating discipline in mind.",
      textAr: "تراجع ضيافة للتطوير كل موقع بانضباط تشغيلي واضح.",
    });
    expect(result.blocks).toHaveLength(0);
    expect(result.flags).toHaveLength(0);
  });
});

describe("compliance scanner — bilingual completeness", () => {
  it("blocks when Arabic is empty", async () => {
    const result = await scanContent({ textEn: "Some English copy.", textAr: "" });
    expect(result.blocks.some((b) => b.type === "bilingual_incomplete")).toBe(true);
  });

  it("blocks when Arabic is identical to English", async () => {
    const result = await scanContent({ textEn: "Same text", textAr: "Same text" });
    expect(result.blocks.some((b) => b.type === "bilingual_incomplete")).toBe(true);
  });

  it("passes when Arabic is distinct and non-empty", async () => {
    const result = await scanContent({ textEn: "Some English copy.", textAr: "نص عربي مختلف تماماً." });
    expect(result.blocks.some((b) => b.type === "bilingual_incomplete")).toBe(false);
  });
});
