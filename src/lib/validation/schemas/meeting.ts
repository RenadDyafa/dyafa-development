import { z } from "zod";
import { emailSchema, phoneSchema, consentSchema, utmSchema, localeSchema, requiredString } from "./common";
import { LEAD_ROLES } from "./siteReview";

export const meetingSchema = z
  .object({
    name: requiredString().max(200),
    role: z.enum(LEAD_ROLES, { errorMap: () => ({ message: "required" }) }),
    organization: z.string().max(200).optional(),
    email: emailSchema,
    phone: phoneSchema,
    preferredDate: z.string().optional(),
    message: z.string().max(2000).optional(),
    locale: localeSchema,
    consent: consentSchema,
    idempotencyKey: z.string().uuid().optional(),
  })
  .merge(utmSchema);

export type MeetingInput = z.infer<typeof meetingSchema>;
