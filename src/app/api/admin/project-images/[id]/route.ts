import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  captionEn: z.string().max(200).optional(),
  captionAr: z.string().max(200).optional(),
  displayOrder: z.number().int().optional(),
  isCover: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await prisma.projectImage.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  // Only one cover image per project - demote any current cover first.
  if (parsed.data.isCover === true) {
    await prisma.projectImage.updateMany({
      where: { projectId: existing.projectId, id: { not: existing.id } },
      data: { isCover: false },
    });
  }

  const image = await prisma.projectImage.update({
    where: { id: params.id },
    data: parsed.data,
    include: { media: true },
  });
  return ok(image);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.projectImage.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.projectImage.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
