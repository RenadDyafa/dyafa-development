import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleAr: z.string().min(1).optional(),
  departmentEn: z.string().optional(),
  departmentAr: z.string().optional(),
  city: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]).optional(),
  descriptionEn: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const jobPosting = await prisma.jobPosting.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.active === true ? { approvedById: user.id, approvedAt: new Date() } : {}),
    },
  });
  return ok(jobPosting);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.jobPosting.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
