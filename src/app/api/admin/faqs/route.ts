import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  questionEn: z.string().min(1),
  questionAr: z.string().min(1),
  answerEn: z.string().min(1),
  answerAr: z.string().min(1),
  category: z.string().optional(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const faqs = await prisma.faq.findMany({ orderBy: { displayOrder: "asc" } });
  return ok(faqs);
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

  const faq = await prisma.faq.create({ data: { ...parsed.data, active: false } });
  return ok(faq, 201);
}
