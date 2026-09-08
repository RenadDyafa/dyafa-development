import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const createSchema = z.object({
  phrase: z.string().min(1),
  lang: z.enum(["en", "ar"]),
  severity: z.enum(["block", "flag"]),
});

export async function GET() {
  const phrases = await prisma.bannedPhrase.findMany({ orderBy: [{ lang: "asc" }, { phrase: "asc" }] });
  return ok(phrases);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  try {
    await requireRole("legal", "admin");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const phrase = await prisma.bannedPhrase.upsert({
    where: { phrase_lang: { phrase: parsed.data.phrase, lang: parsed.data.lang } },
    update: { severity: parsed.data.severity, active: true },
    create: parsed.data,
  });

  return ok(phrase, 201);
}
