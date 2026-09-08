import type { NextRequest } from "next/server";
import { meetingSchema } from "@/lib/validation/schemas/meeting";
import { ok, fail, validationError, rateLimited } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { createLead, mapRoleToPersona } from "@/lib/leads/service";
import { parseUtmCookie, UTM_COOKIE_NAME } from "@/lib/utm";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(`leads:meeting:${ip}`);
  if (!allowed) return rateLimited(retryAfterMs);

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  if (body.website) return ok({ id: "ok" }, 201);

  const parsed = meetingSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  const utm = parseUtmCookie(req.cookies.get(UTM_COOKIE_NAME)?.value);

  try {
    const { lead, deduped } = await createLead({
      type: "meeting",
      persona: mapRoleToPersona(input.role),
      name: input.name,
      org: input.organization,
      email: input.email,
      phone: input.phone,
      locale: input.locale,
      message: input.message ? `Preferred date: ${input.preferredDate ?? "-"}\n\n${input.message}` : `Preferred date: ${input.preferredDate ?? "-"}`,
      consentAt: new Date(),
      idempotencyKey: input.idempotencyKey ?? req.headers.get("idempotency-key") ?? undefined,
      utm: { ...utm, campaignId: input.campaignId ?? utm.campaignId },
    });
    return ok({ id: lead.id, deduped }, 201);
  } catch (error) {
    logger.error({ error }, "meeting lead creation failed");
    return fail("INTERNAL_ERROR", "Could not submit your request. Please try again.", 500);
  }
}
