import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

// Body/excerpt may start empty — this endpoint creates a WIP draft (the
// admin "new insight" quick-form only collects title + pillar up front);
// completeness before publish is enforced separately by the compliance
// scanner's bilingual-completeness check at transition time.
const createSchema = z.object({
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  slugEn: z.string().min(1).regex(/^[a-z0-9-]+$/),
  slugAr: z.string().min(1),
  excerptEn: z.string(),
  excerptAr: z.string(),
  bodyEn: z.string(),
  bodyAr: z.string(),
  pillarId: z.string().min(1),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const insights = await prisma.insight.findMany({ include: { pillar: true, author: true }, orderBy: { updatedAt: "desc" } });
  return ok(insights);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireRole("marketing");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const insight = await prisma.insight.create({
    data: { ...parsed.data, authorId: user.id, status: "draft" },
  });

  return ok(insight, 201);
}
