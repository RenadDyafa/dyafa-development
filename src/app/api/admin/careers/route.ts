import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]),
  descriptionEn: z.string(),
  descriptionAr: z.string(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const jobPostings = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });
  return ok(jobPostings);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();
  try {
    await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const jobPosting = await prisma.jobPosting.create({ data: { ...parsed.data, active: false } });
  return ok(jobPosting, 201);
}
