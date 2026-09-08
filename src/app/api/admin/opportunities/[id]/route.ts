import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const updateSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleAr: z.string().min(1).optional(),
  type: z.enum(["land_offering", "development_partnership", "existing_asset"]).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  assetType: z.enum(["raw_land", "existing_building", "underperforming_hotel"]).optional(),
  siteSizeM2: z.number().positive().optional(),
  status: z.enum(["open", "under_review", "closed"]).optional(),
  developmentStage: z.string().optional(),
  demandDriversEn: z.string().optional(),
  demandDriversAr: z.string().optional(),
  proposedProductEn: z.string().optional(),
  proposedProductAr: z.string().optional(),
  partnershipModelsEn: z.string().optional(),
  partnershipModelsAr: z.string().optional(),
  publicSummaryEn: z.string().min(1).optional(),
  publicSummaryAr: z.string().min(1).optional(),
  coverMediaId: z.string().nullable().optional(),
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
  const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id }, include: { coverMedia: true } });
  if (!opportunity) return notFound();
  return ok(opportunity);
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

  const existing = await prisma.opportunity.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  const opportunity = await prisma.opportunity.update({ where: { id: params.id }, data: parsed.data });
  return ok(opportunity);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const existing = await prisma.opportunity.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  await prisma.opportunity.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
