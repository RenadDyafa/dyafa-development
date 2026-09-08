import type { AssetType, LegalStatus } from "@prisma/client";

// Transparent, additive-weight internal routing score - architecture.md
// §5. This is never shown to the lead and never implies an investment
// recommendation; it only helps BD triage which submissions to review
// first. Weights sum to 110 by design (a fully-complete submission still
// caps at 100) and every signal here is either self-reported by the
// visitor or a plain count - nothing is inferred about site quality,
// market attractiveness, or feasibility.
const SCORE_WEIGHTS = {
  clearIntent: 20,
  completeSiteData: 15,
  locationProvided: 15,
  ownershipStatus: 10,
  appropriateSize: 10,
  documentation: 10,
  companyInfo: 10,
  existingAssetRepositioning: 5,
  strategicCityFit: 5,
} as const;

// A plain internal heuristic for routing priority, not a public claim
// about any city's market attractiveness.
const STRATEGIC_CITIES = ["riyadh", "jeddah", "makkah", "madinah", "dammam", "khobar", "abha", "neom"];

export type LeadScoringInput = {
  opportunityIntent?: string;
  city?: string;
  landLocation?: string;
  assetType?: AssetType;
  legalStatus?: LegalStatus;
  landAreaM2?: number;
  organization?: string;
  fileCount: number;
};

export function computeLeadScore(input: LeadScoringInput): number {
  let score = 0;

  if (input.opportunityIntent && input.opportunityIntent !== "unsure") {
    score += SCORE_WEIGHTS.clearIntent;
  }
  if (input.city && input.landLocation && input.assetType) {
    score += SCORE_WEIGHTS.completeSiteData;
  }
  if (input.city || input.landLocation) {
    score += SCORE_WEIGHTS.locationProvided;
  }
  if (input.legalStatus) {
    score += SCORE_WEIGHTS.ownershipStatus;
  }
  if (input.landAreaM2 && input.landAreaM2 > 0) {
    score += SCORE_WEIGHTS.appropriateSize;
  }
  if (input.fileCount > 0) {
    score += SCORE_WEIGHTS.documentation;
  }
  if (input.organization) {
    score += SCORE_WEIGHTS.companyInfo;
  }
  if (input.assetType === "existing_building" || input.assetType === "underperforming_hotel") {
    score += SCORE_WEIGHTS.existingAssetRepositioning;
  }
  if (input.city && STRATEGIC_CITIES.includes(input.city.trim().toLowerCase())) {
    score += SCORE_WEIGHTS.strategicCityFit;
  }

  return Math.min(score, 100);
}
