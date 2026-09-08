import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleAr: z.string().min(1).optional(),
  excerptEn: z.string().min(1).optional(),
  excerptAr: z.string().min(1).optional(),
  bodyEn: z.string().min(1).optional(),
  bodyAr: z.string().min(1).optional(),
  pillarId: z.string().min(1).optional(),
  audience: z.string().optional(),
  objective: z.string().optional(),
  cta: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const insight = await prisma.insight.findUnique({ where: { id: params.id }, include: { pillar: true } });
  if (!insight) return notFound();
  return ok(insight);
}

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

  const existing = await prisma.insight.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const insight = await prisma.insight.update({ where: { id: params.id }, data: parsed.data });
  return ok(insight);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.insight.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.insight.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
