import { z } from "zod";
import { emailSchema, phoneSchema, consentSchema, utmSchema, localeSchema, requiredString } from "./common";

export const contactSchema = z
  .object({
    name: requiredString().max(200),
    email: emailSchema,
    phone: phoneSchema.optional(),
    subject: z.string().max(200).optional(),
    message: requiredString().max(4000),
    locale: localeSchema,
    consent: consentSchema,
    idempotencyKey: z.string().uuid().optional(),
  })
  .merge(utmSchema);

export type ContactInput = z.infer<typeof contactSchema>;
