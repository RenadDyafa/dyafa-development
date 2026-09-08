import type { Role, WorkflowState } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED", 401);
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role) && user.role !== "admin") {
    throw new AuthError("FORBIDDEN", 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// BRD §6 governance workflow: draft (Marketing) -> tech_review (dev lead) ->
// positioning_review (CEO, if flagged) -> legal_review (if HIGH-RISK fires) ->
// approved -> published (Marketing QA). `admin` may always transition.
// The compliance gate (lib/compliance/scanner.ts) additionally forces a
// redirect to legal_review or blocks approved -> published regardless of
// whether the actor's role would otherwise be allowed here.
type Transition = { from: WorkflowState; to: WorkflowState; roles: Role[] };

export const WORKFLOW_TRANSITIONS: Transition[] = [
  { from: "draft", to: "tech_review", roles: ["marketing"] },
  { from: "tech_review", to: "draft", roles: ["dev_lead"] },
  { from: "tech_review", to: "positioning_review", roles: ["dev_lead"] },
  { from: "tech_review", to: "legal_review", roles: ["dev_lead"] },
  { from: "positioning_review", to: "draft", roles: ["ceo"] },
  { from: "positioning_review", to: "legal_review", roles: ["ceo"] },
  { from: "positioning_review", to: "approved", roles: ["ceo"] },
  { from: "legal_review", to: "draft", roles: ["legal"] },
  { from: "legal_review", to: "approved", roles: ["legal"] },
  { from: "approved", to: "published", roles: ["marketing"] },
  { from: "approved", to: "draft", roles: ["marketing", "ceo"] },
  { from: "published", to: "archived", roles: ["marketing", "ceo"] },
  { from: "draft", to: "archived", roles: ["marketing", "ceo"] },
];

export function canTransition(role: Role, from: WorkflowState, to: WorkflowState): boolean {
  if (role === "admin") return true;
  return WORKFLOW_TRANSITIONS.some((t) => t.from === from && t.to === to && t.roles.includes(role));
}

export function allowedNextStates(role: Role, from: WorkflowState): WorkflowState[] {
  if (role === "admin") {
    return WORKFLOW_TRANSITIONS.filter((t) => t.from === from).map((t) => t.to);
  }
  return WORKFLOW_TRANSITIONS.filter((t) => t.from === from && t.roles.includes(role)).map((t) => t.to);
}
