import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const patchSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

// Approving a partner (active=true) is a HIGH-RISK/governance action —
// restricted to ceo/legal/admin, distinct from ordinary field edits.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  let user;
  try {
    user = parsed.data.active !== undefined ? await requireRole("ceo", "legal") : await requireRole("marketing", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.partner.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const partner = await prisma.partner.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.active ? { approvedById: user.id, approvedAt: new Date() } : {}),
    },
  });
  return ok(partner);
}
