import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";
import { updateLeadStatus } from "@/lib/leads/service";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "meeting", "handed_to_bd", "closed", "archived"]),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { notes: { include: { author: true }, orderBy: { createdAt: "desc" } }, files: true },
  });
  if (!lead) return notFound();
  return ok(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const lead = await updateLeadStatus(params.id, parsed.data.status, user.id);
  return ok(lead);
}
