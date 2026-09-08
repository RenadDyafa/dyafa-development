import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  mediaId: z.string().min(1).optional(),
  headlineEn: z.string().max(200).optional(),
  headlineAr: z.string().max(200).optional(),
  subheadlineEn: z.string().max(400).optional(),
  subheadlineAr: z.string().max(400).optional(),
  ctaLabelEn: z.string().max(80).optional(),
  ctaLabelAr: z.string().max(80).optional(),
  ctaHref: z.string().max(300).optional(),
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

  const existing = await prisma.homeSlide.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const slide = await prisma.homeSlide.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.active === true ? { approvedById: user.id, approvedAt: new Date() } : {}),
    },
    include: { media: true },
  });
  return ok(slide);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.homeSlide.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.homeSlide.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
