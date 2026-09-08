import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  mediaId: z.string().min(1),
  captionEn: z.string().max(200).optional(),
  captionAr: z.string().max(200).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return notFound();

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const maxOrder = await prisma.projectImage.aggregate({
    where: { projectId: project.id },
    _max: { displayOrder: true },
  });
  const existingCount = await prisma.projectImage.count({ where: { projectId: project.id } });

  const image = await prisma.projectImage.create({
    data: {
      ...parsed.data,
      projectId: project.id,
      displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      isCover: existingCount === 0,
    },
    include: { media: true },
  });
  return ok(image, 201);
}
