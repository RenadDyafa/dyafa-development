import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const patchSchema = z.object({
  active: z.boolean().optional(),
  severity: z.enum(["block", "flag"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("legal", "admin");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await prisma.bannedPhrase.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const phrase = await prisma.bannedPhrase.update({ where: { id: params.id }, data: parsed.data });
  return ok(phrase);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("legal", "admin");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.bannedPhrase.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.bannedPhrase.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
