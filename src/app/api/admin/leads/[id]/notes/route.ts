import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, validationError, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";
import { addLeadNote } from "@/lib/leads/service";

const noteSchema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const lead = await addLeadNote(params.id, user.id, parsed.data.body);
  return ok(lead, 201);
}
