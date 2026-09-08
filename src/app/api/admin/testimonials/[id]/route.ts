import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  quoteEn: z.string().min(1).max(1000).optional(),
  quoteAr: z.string().min(1).max(1000).optional(),
  authorName: z.string().min(1).max(200).optional(),
  authorRoleEn: z.string().max(200).optional(),
  authorRoleAr: z.string().max(200).optional(),
  authorCompany: z.string().max(200).optional(),
  avatarMediaId: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
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

  const existing = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const testimonial = await prisma.testimonial.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.active === true ? { approvedById: user.id, approvedAt: new Date() } : {}),
    },
    include: { avatarMedia: true },
  });
  return ok(testimonial);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.testimonial.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
