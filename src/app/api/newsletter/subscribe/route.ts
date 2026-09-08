import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validation/schemas/newsletter";
import { ok, fail, validationError, rateLimited } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { prisma } from "@/lib/prisma";
import { enqueueEmail } from "@/lib/mail/queue";
import { newsletterConfirmEmail } from "@/lib/mail/templates";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(`newsletter:subscribe:${ip}`);
  if (!allowed) return rateLimited(retryAfterMs);

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const { email, locale } = parsed.data;

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing?.confirmedAt) {
      return ok({ status: "already_subscribed" }, 200);
    }

    const confirmToken = randomBytes(24).toString("hex");
    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: { confirmToken, locale, unsubscribedAt: null },
      create: { email, locale, confirmToken },
    });

    const confirmUrl = `${env.siteUrl}/api/newsletter/confirm?token=${subscriber.confirmToken}`;
    const { subject, html } = newsletterConfirmEmail(confirmUrl);
    await enqueueEmail({ to: [email], subject, template: "newsletter-confirm", data: { subscriberId: subscriber.id }, html });

    return ok({ status: "confirmation_sent" }, 201);
  } catch (error) {
    logger.error({ error }, "newsletter subscribe failed");
    return fail("INTERNAL_ERROR", "Could not subscribe. Please try again.", 500);
  }
}
