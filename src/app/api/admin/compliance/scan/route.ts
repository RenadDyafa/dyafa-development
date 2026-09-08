import type { NextRequest } from "next/server";
import { z } from "zod";
import { scanContent } from "@/lib/compliance/scanner";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const scanSchema = z.object({
  text_en: z.string(),
  text_ar: z.string(),
  referenced_partner_names: z.array(z.string()).optional(),
  referenced_project_names: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);

  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const result = await scanContent({
    textEn: parsed.data.text_en,
    textAr: parsed.data.text_ar,
    referencedPartnerNames: parsed.data.referenced_partner_names,
    referencedProjectNames: parsed.data.referenced_project_names,
  });

  return ok(result);
}
