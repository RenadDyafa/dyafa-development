import { z } from "zod";
import { emailSchema, phoneSchema, consentSchema, utmSchema, localeSchema, requiredString } from "./common";

export const talentSchema = z
  .object({
    name: requiredString().max(200),
    email: emailSchema,
    phone: phoneSchema.optional(),
    position: z.string().max(200).optional(),
    message: z.string().max(4000).optional(),
    locale: localeSchema,
    consent: consentSchema,
    idempotencyKey: z.string().uuid().optional(),
  })
  .merge(utmSchema);

export type TalentInput = z.infer<typeof talentSchema>;
