import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const patchSchema = z.object({
  approve: z.boolean().optional(),
  value: z.number().int().nullable().optional(),
  prefix: z.string().max(10).nullable().optional(),
  suffix: z.string().max(10).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireRole("ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await prisma.approvedFact.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const { approve, ...fields } = parsed.data;
  const fact = await prisma.approvedFact.update({
    where: { id: params.id },
    data: {
      ...fields,
      ...(approve !== undefined ? (approve ? { approvedById: user.id, approvedAt: new Date() } : { approvedById: null, approvedAt: null }) : {}),
    },
  });
  return ok(fact);
}
