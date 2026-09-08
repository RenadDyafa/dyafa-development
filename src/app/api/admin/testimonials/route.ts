import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  quoteEn: z.string().min(1).max(1000),
  quoteAr: z.string().min(1).max(1000),
  authorName: z.string().min(1).max(200),
  authorRoleEn: z.string().max(200).optional(),
  authorRoleAr: z.string().max(200).optional(),
  authorCompany: z.string().max(200).optional(),
  avatarMediaId: z.string().optional(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const testimonials = await prisma.testimonial.findMany({ orderBy: { displayOrder: "asc" }, include: { avatarMedia: true } });
  return ok(testimonials);
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

  const maxOrder = await prisma.testimonial.aggregate({ _max: { displayOrder: true } });
  const testimonial = await prisma.testimonial.create({
    data: { ...parsed.data, displayOrder: (maxOrder._max.displayOrder ?? -1) + 1, active: false },
    include: { avatarMedia: true },
  });
  return ok(testimonial, 201);
}
