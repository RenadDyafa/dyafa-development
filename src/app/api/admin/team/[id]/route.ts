import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  roleEn: z.string().min(1).optional(),
  roleAr: z.string().min(1).optional(),
  bioEn: z.string().optional(),
  bioAr: z.string().optional(),
  linkedinUrl: z.string().url().or(z.literal("")).optional(),
  photoMediaId: z.string().nullable().optional(),
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

  const existing = await prisma.teamMember.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const teamMember = await prisma.teamMember.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.active === true ? { approvedById: user.id, approvedAt: new Date() } : {}),
    },
  });
  return ok(teamMember);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.teamMember.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.teamMember.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
