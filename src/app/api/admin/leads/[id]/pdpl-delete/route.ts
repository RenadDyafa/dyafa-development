import type { NextRequest } from "next/server";
import { ok, unauthorized, forbidden } from "@/lib/api/response";
import { requireRole, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";
import { pdplDeleteLead } from "@/lib/leads/service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireRole("admin", "legal");
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const lead = await pdplDeleteLead(params.id, user.id);
  return ok(lead);
}
