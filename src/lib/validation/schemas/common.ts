import { z } from "zod";

// Schema `.message` values are i18n keys under `forms.errors.*`, translated
// client-side — this is how "bilingual validation messages" (FEATURES §4.1)
// are achieved without duplicating English/Arabic strings in the schema.
//
// `required_error`/`invalid_type_error` must also be set to "required" —
// otherwise a genuinely missing (undefined) field falls back to Zod's
// built-in "Required" message instead of our i18n key.
export function requiredString(message = "required") {
  return z.string({ required_error: message, invalid_type_error: message }).min(1, message);
}

export const emailSchema = requiredString().email("invalidEmail");

// Loose E.164-ish check: 7-15 digits, optional leading +.
export const phoneSchema = requiredString().regex(/^\+?[0-9\s-]{7,20}$/, "invalidPhone");

export const consentSchema = z.literal(true, {
  errorMap: () => ({ message: "consentRequired" }),
});

export const utmSchema = z.object({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  campaignId: z.string().optional(),
});

export const localeSchema = z.enum(["en", "ar"]);

// Honeypot: must stay empty. A filled value indicates a bot.
export const honeypotSchema = z.object({
  website: z.string().max(0).optional().or(z.literal("")),
});
