import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  roleEn: z.string().min(1),
  roleAr: z.string().min(1),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const teamMembers = await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } });
  return ok(teamMembers);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();
  try {
    await requireRole("marketing", "ceo");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const teamMember = await prisma.teamMember.create({ data: { ...parsed.data, active: false } });
  return ok(teamMember, 201);
}
