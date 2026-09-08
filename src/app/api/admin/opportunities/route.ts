import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

// Public summary fields may start empty - this creates a WIP draft (the
// admin "new opportunity" quick-form only collects title + type up front);
// completeness before publish is enforced by the compliance scanner's
// bilingual-completeness check at transition time, matching InsightEditor.
const createSchema = z.object({
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  slugEn: z.string().min(1).regex(/^[a-z0-9-]+$/),
  slugAr: z.string().min(1),
  type: z.enum(["land_offering", "development_partnership", "existing_asset"]),
  publicSummaryEn: z.string(),
  publicSummaryAr: z.string(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const opportunities = await prisma.opportunity.findMany({ orderBy: { updatedAt: "desc" } });
  return ok(opportunities);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("marketing", "dev_lead");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const opportunity = await prisma.opportunity.create({
    data: { ...parsed.data, workflowState: "draft" },
  });

  return ok(opportunity, 201);
}
