import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const patchSchema = z.object({ key: z.string().min(1), value: z.unknown() });

export async function GET() {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return ok(settings);
}

export async function PATCH(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("admin");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const setting = await prisma.setting.upsert({
    where: { key: parsed.data.key },
    update: { valueJson: parsed.data.value as never },
    create: { key: parsed.data.key, valueJson: parsed.data.value as never },
  });

  return ok(setting);
}
