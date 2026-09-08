import type { NextRequest } from "next/server";
import { contactSchema } from "@/lib/validation/schemas/contact";
import { ok, fail, validationError, rateLimited } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { createLead } from "@/lib/leads/service";
import { parseUtmCookie, UTM_COOKIE_NAME } from "@/lib/utm";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(`leads:contact:${ip}`);
  if (!allowed) return rateLimited(retryAfterMs);

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  if (body.website) return ok({ id: "ok" }, 201);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  const utm = parseUtmCookie(req.cookies.get(UTM_COOKIE_NAME)?.value);

  try {
    const { lead, deduped } = await createLead({
      type: "contact",
      persona: "other",
      name: input.name,
      email: input.email,
      phone: input.phone ?? "-",
      locale: input.locale,
      message: input.subject ? `Subject: ${input.subject}\n\n${input.message}` : input.message,
      consentAt: new Date(),
      idempotencyKey: input.idempotencyKey ?? req.headers.get("idempotency-key") ?? undefined,
      utm: { ...utm, campaignId: input.campaignId ?? utm.campaignId },
    });
    return ok({ id: lead.id, deduped }, 201);
  } catch (error) {
    logger.error({ error }, "contact lead creation failed");
    return fail("INTERNAL_ERROR", "Could not send your message. Please try again.", 500);
  }
}
