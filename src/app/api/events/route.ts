import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, rateLimited } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";

const eventSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().max(500).optional(),
  utm: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(`events:${ip}`);
  if (!allowed) return rateLimited(retryAfterMs);

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  // Hash IP+UA instead of storing raw PII, per "no PII in logs/URLs".
  const sessionHash = createHash("sha256").update(`${ip}:${req.headers.get("user-agent") ?? ""}`).digest("hex");

  await prisma.event.create({
    data: {
      name: parsed.data.name,
      path: parsed.data.path,
      utmJson: parsed.data.utm,
      sessionHash,
    },
  });

  return ok({ recorded: true }, 201);
}
