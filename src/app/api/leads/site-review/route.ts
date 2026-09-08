import type { NextRequest } from "next/server";
import { siteReviewSchema, MAX_FILE_SIZE_BYTES, MAX_FILES, ALLOWED_FILE_TYPES } from "@/lib/validation/schemas/siteReview";
import { ok, fail, validationError, rateLimited } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { createLead, mapRoleToPersona } from "@/lib/leads/service";
import { storeUploadedFile, StorageValidationError } from "@/lib/storage";
import { parseUtmCookie, UTM_COOKIE_NAME } from "@/lib/utm";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(`leads:site-review:${ip}`);
  if (!allowed) return rateLimited(retryAfterMs);

  const formData = await req.formData();
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "documents" || key === "website") continue;
    if (key === "landAreaM2" || key === "landLocationLat" || key === "landLocationLng") {
      raw[key] = value ? Number(value) : undefined;
    } else if (key === "consent") {
      raw[key] = value === "true" || value === "on";
    } else {
      raw[key] = value === "" ? undefined : value;
    }
  }

  // Honeypot: silently accept (never reveal to bots that they were caught).
  if (formData.get("website")) {
    return ok({ id: "ok" }, 201);
  }

  const parsed = siteReviewSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  const files = formData.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) {
    return fail("VALIDATION_ERROR", "Too many files", 422, { documents: ["tooManyFiles"] });
  }

  const storedFiles = [];
  try {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return fail("VALIDATION_ERROR", "File too large", 422, { documents: ["fileTooLarge"] });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      storedFiles.push(
        await storeUploadedFile(file.name, buffer, file.type, {
          allowedMimes: ALLOWED_FILE_TYPES,
          namespace: "leads",
        }),
      );
    }
  } catch (error) {
    if (error instanceof StorageValidationError) {
      return fail("VALIDATION_ERROR", error.message, 422, { documents: ["fileTypeInvalid"] });
    }
    throw error;
  }

  const utm = parseUtmCookie(req.cookies.get(UTM_COOKIE_NAME)?.value);

  try {
    const { lead, deduped } = await createLead({
      type: "site_review",
      persona: mapRoleToPersona(input.role),
      name: input.name,
      org: input.organization,
      email: input.email,
      phone: input.phone,
      city: input.city,
      locale: input.locale,
      message: input.message,
      landLocation: input.landLocation,
      landLocationLat: input.landLocationLat,
      landLocationLng: input.landLocationLng,
      landAreaM2: input.landAreaM2,
      legalStatus: input.legalStatus,
      assetType: input.assetType,
      opportunityIntent: input.opportunityIntent ?? undefined,
      timeline: input.timeline,
      consentAt: new Date(),
      idempotencyKey: input.idempotencyKey ?? req.headers.get("idempotency-key") ?? undefined,
      utm: { ...utm, campaignId: input.campaignId ?? utm.campaignId },
      files: storedFiles,
    });

    return ok({ id: lead.id, referenceNumber: lead.referenceNumber, deduped }, 201);
  } catch (error) {
    logger.error({ error }, "site-review lead creation failed");
    return fail("INTERNAL_ERROR", "Could not submit your site. Please try again.", 500);
  }
}

export async function GET() {
  return fail("METHOD_NOT_ALLOWED", "Use POST", 405);
}
