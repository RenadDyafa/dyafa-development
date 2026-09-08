import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  slugEn: z.string().min(1).regex(/^[a-z0-9-]+$/),
  slugAr: z.string().min(1),
  type: z.enum(["news", "milestone", "partnership", "event"]),
  excerptEn: z.string(),
  excerptAr: z.string(),
  bodyEn: z.string(),
  bodyAr: z.string(),
});

export async function GET() {
  try {
    await requireRole("marketing", "dev_lead", "ceo", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const newsItems = await prisma.newsItem.findMany({ orderBy: { updatedAt: "desc" } });
  return ok(newsItems);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("marketing");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const newsItem = await prisma.newsItem.create({
    data: { ...parsed.data, workflowState: "draft" },
  });

  return ok(newsItem, 201);
}
