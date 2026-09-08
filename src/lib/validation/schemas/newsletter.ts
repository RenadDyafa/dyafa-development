import { z } from "zod";
import { emailSchema, localeSchema } from "./common";

export const newsletterSchema = z.object({
  email: emailSchema,
  locale: localeSchema,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
