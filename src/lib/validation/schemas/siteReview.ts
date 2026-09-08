import { z } from "zod";
import { emailSchema, phoneSchema, consentSchema, utmSchema, localeSchema, requiredString } from "./common";

export const ASSET_TYPES = ["raw_land", "existing_building", "underperforming_hotel"] as const;
export const LEGAL_STATUSES = ["owned", "deed", "leased", "other"] as const;
export const LEAD_ROLES = ["landowner", "investor", "developer", "government", "hotel_owner", "other"] as const;

// Step 1 of the site-review wizard ("What are you looking for?") -
// design.md §10A's "Hospitality intent" step.
export const OPPORTUNITY_INTENTS = [
  "hotel",
  "serviced_apartments",
  "extended_stay",
  "mixed_use",
  "existing_asset_repositioning",
  "unsure",
] as const;

// Step 4 ("Context") of the wizard - a self-reported timeline preference,
// purely informational for BD triage, not part of the scoring model.
export const TIMELINES = ["immediate", "short_term", "long_term", "exploring"] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 5;
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg"];

export const siteReviewSchema = z
  .object({
    name: requiredString().max(200),
    role: z.enum(LEAD_ROLES, { errorMap: () => ({ message: "required" }) }),
    organization: z.string().max(200).optional(),
    email: emailSchema,
    phone: phoneSchema,
    city: requiredString().max(120),
    landLocation: z.string().max(500).optional(),
    landLocationLat: z.number().min(-90).max(90).optional(),
    landLocationLng: z.number().min(-180).max(180).optional(),
    landAreaM2: z.number().positive().optional(),
    legalStatus: z.enum(LEGAL_STATUSES).optional(),
    assetType: z.enum(ASSET_TYPES).optional(),
    message: z.string().max(4000).optional(),
    // .nullish() (not .optional()) - an unchecked HTML radio group reports
    // its react-hook-form value as `null`, not `undefined`, and Zod's
    // .optional() only accepts the latter.
    opportunityIntent: z.enum(OPPORTUNITY_INTENTS).nullish(),
    timeline: z.enum(TIMELINES).optional(),
    locale: localeSchema,
    consent: consentSchema,
    idempotencyKey: z.string().uuid().optional(),
  })
  .merge(utmSchema);

export type SiteReviewInput = z.infer<typeof siteReviewSchema>;
