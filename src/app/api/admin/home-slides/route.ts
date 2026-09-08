import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  mediaId: z.string().min(1),
  headlineEn: z.string().max(200).optional(),
  headlineAr: z.string().max(200).optional(),
  subheadlineEn: z.string().max(400).optional(),
  subheadlineAr: z.string().max(400).optional(),
  ctaLabelEn: z.string().max(80).optional(),
  ctaLabelAr: z.string().max(80).optional(),
  ctaHref: z.string().max(300).optional(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const slides = await prisma.homeSlide.findMany({ orderBy: { displayOrder: "asc" }, include: { media: true } });
  return ok(slides);
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

  const maxOrder = await prisma.homeSlide.aggregate({ _max: { displayOrder: true } });
  const slide = await prisma.homeSlide.create({
    data: { ...parsed.data, displayOrder: (maxOrder._max.displayOrder ?? -1) + 1, active: false },
    include: { media: true },
  });
  return ok(slide, 201);
}
