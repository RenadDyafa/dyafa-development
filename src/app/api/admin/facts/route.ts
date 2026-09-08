import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  statementEn: z.string().min(1),
  statementAr: z.string().min(1),
  source: z.string().optional(),
  owner: z.string().optional(),
  value: z.number().int().optional(),
  prefix: z.string().max(10).optional(),
  suffix: z.string().max(10).optional(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const facts = await prisma.approvedFact.findMany({ orderBy: { createdAt: "desc" } });
  return ok(facts);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();
  try {
    await requireRole("marketing", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const fact = await prisma.approvedFact.create({ data: parsed.data });
  return ok(fact, 201);
}
