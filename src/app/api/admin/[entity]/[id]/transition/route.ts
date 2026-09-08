import type { NextRequest } from "next/server";
import { z } from "zod";
import { requestTransition, type ContentEntityType } from "@/lib/admin/workflow";
import { ok, fail, validationError, unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";

const transitionSchema = z.object({
  to_state: z.enum(["draft", "tech_review", "positioning_review", "legal_review", "approved", "published", "archived"]),
  note: z.string().max(2000).optional(),
});

const VALID_ENTITIES: ContentEntityType[] = ["insight", "project", "campaign", "page", "opportunity", "news"];

export async function POST(req: NextRequest, { params }: { params: { entity: string; id: string } }) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  if (!VALID_ENTITIES.includes(params.entity as ContentEntityType)) {
    return notFound(`Unknown entity type: ${params.entity}`);
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("VALIDATION_ERROR", "Invalid JSON body", 422);
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const result = await requestTransition({
    entityType: params.entity as ContentEntityType,
    entityId: params.id,
    toState: parsed.data.to_state,
    actorId: user.id,
    actorRole: user.role,
    note: parsed.data.note,
  });

  if (!result.ok) {
    if (result.reason === "not_found") return notFound();
    if (result.reason === "invalid_transition") return forbidden();
    return fail("COMPLIANCE_BLOCKED", "Content has compliance blocks that prevent this transition.", 422, {
      blocks: result.scan?.blocks.map((b) => b.message) ?? [],
    });
  }

  return ok({
    finalState: result.finalState,
    redirectedToLegalReview: result.redirected,
    scan: result.scan,
  });
}
