import type { Role, WorkflowState } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { scanContent, type ScanResult } from "@/lib/compliance/scanner";
import { canTransition } from "@/lib/authz";

export type ContentEntityType = "insight" | "project" | "campaign" | "page" | "opportunity" | "news";

type EntityAdapter = {
  findState(id: string): Promise<WorkflowState | null>;
  getBilingualText(id: string): Promise<{ textEn: string; textAr: string }>;
  setState(id: string, state: WorkflowState, approverId?: string): Promise<void>;
};

const adapters: Record<ContentEntityType, EntityAdapter> = {
  insight: {
    async findState(id) {
      const row = await prisma.insight.findUnique({ where: { id } });
      return row?.status ?? null;
    },
    async getBilingualText(id) {
      const row = await prisma.insight.findUniqueOrThrow({ where: { id } });
      return { textEn: `${row.titleEn}\n${row.bodyEn}`, textAr: `${row.titleAr}\n${row.bodyAr}` };
    },
    async setState(id, state, approverId) {
      await prisma.insight.update({
        where: { id },
        data: {
          status: state,
          publishedAt: state === "published" ? new Date() : undefined,
          ...(state === "approved" && approverId ? { approvedById: approverId, approvedAt: new Date() } : {}),
        },
      });
    },
  },
  project: {
    async findState(id) {
      const row = await prisma.project.findUnique({ where: { id } });
      return row?.status ?? null;
    },
    async getBilingualText(id) {
      const row = await prisma.project.findUniqueOrThrow({ where: { id } });
      return { textEn: `${row.nameEn}\n${row.summaryEn}`, textAr: `${row.nameAr}\n${row.summaryAr}` };
    },
    async setState(id, state, approverId) {
      await prisma.project.update({
        where: { id },
        data: {
          status: state,
          ...(state === "approved" && approverId ? { approvedById: approverId, approvedAt: new Date() } : {}),
        },
      });
    },
  },
  campaign: {
    async findState(id) {
      const row = await prisma.campaign.findUnique({ where: { id } });
      return row?.status ?? null;
    },
    async getBilingualText(id) {
      // `name` is an internal-only identifier (never rendered publicly —
      // only headlineEn/headlineAr appear on the live campaign page) and
      // routinely contains reference codes/numbers, so it must stay out of
      // the public-facing compliance scan to avoid spurious HIGH-RISK flags.
      const row = await prisma.campaign.findUniqueOrThrow({ where: { id } });
      return { textEn: row.headlineEn, textAr: row.headlineAr };
    },
    async setState(id, state) {
      await prisma.campaign.update({ where: { id }, data: { status: state } });
    },
  },
  page: {
    async findState(id) {
      const row = await prisma.page.findUnique({ where: { id } });
      return row?.status ?? null;
    },
    async getBilingualText(id) {
      const blocks = await prisma.pageBlock.findMany({ where: { pageId: id } });
      const textEn = blocks.map((b) => JSON.stringify((b.dataJson as Record<string, unknown>)?.en ?? "")).join("\n");
      const textAr = blocks.map((b) => JSON.stringify((b.dataJson as Record<string, unknown>)?.ar ?? "")).join("\n");
      return { textEn, textAr };
    },
    async setState(id, state, approverId) {
      await prisma.page.update({
        where: { id },
        data: {
          status: state,
          publishedAt: state === "published" ? new Date() : undefined,
          ...(state === "approved" && approverId ? { approvedById: approverId, approvedAt: new Date() } : {}),
        },
      });
    },
  },
  opportunity: {
    async findState(id) {
      const row = await prisma.opportunity.findUnique({ where: { id } });
      return row?.workflowState ?? null;
    },
    async getBilingualText(id) {
      // confidentialNote (if any is ever added) must stay out of the scan
      // the same way campaign.name does — only ever the public-facing
      // fields are checked here.
      const row = await prisma.opportunity.findUniqueOrThrow({ where: { id } });
      return {
        textEn: `${row.titleEn}\n${row.publicSummaryEn}`,
        textAr: `${row.titleAr}\n${row.publicSummaryAr}`,
      };
    },
    async setState(id, state, approverId) {
      await prisma.opportunity.update({
        where: { id },
        data: {
          workflowState: state,
          publishedAt: state === "published" ? new Date() : undefined,
          ...(state === "approved" && approverId ? { approvedById: approverId, approvedAt: new Date() } : {}),
        },
      });
    },
  },
  news: {
    async findState(id) {
      const row = await prisma.newsItem.findUnique({ where: { id } });
      return row?.workflowState ?? null;
    },
    async getBilingualText(id) {
      const row = await prisma.newsItem.findUniqueOrThrow({ where: { id } });
      return {
        textEn: `${row.titleEn}\n${row.bodyEn}`,
        textAr: `${row.titleAr}\n${row.bodyAr}`,
      };
    },
    async setState(id, state, approverId) {
      await prisma.newsItem.update({
        where: { id },
        data: {
          workflowState: state,
          publishedAt: state === "published" ? new Date() : undefined,
          ...(state === "approved" && approverId ? { approvedById: approverId, approvedAt: new Date() } : {}),
        },
      });
    },
  },
};

export type TransitionResult =
  | { ok: true; finalState: WorkflowState; scan: ScanResult; redirected: boolean }
  | { ok: false; reason: "not_found" | "invalid_transition" | "blocked"; scan?: ScanResult };

export async function requestTransition({
  entityType,
  entityId,
  toState,
  actorId,
  actorRole,
  note,
}: {
  entityType: ContentEntityType;
  entityId: string;
  toState: WorkflowState;
  actorId: string;
  actorRole: Role;
  note?: string;
}): Promise<TransitionResult> {
  const adapter = adapters[entityType];
  const fromState = await adapter.findState(entityId);
  if (!fromState) return { ok: false, reason: "not_found" };

  if (!canTransition(actorRole, fromState, toState)) {
    return { ok: false, reason: "invalid_transition" };
  }

  const { textEn, textAr } = await adapter.getBilingualText(entityId);
  const scan = await scanContent({ textEn, textAr });

  let finalState = toState;
  let redirected = false;

  // Any block prevents advancing past tech_review.
  const pastTechReview: WorkflowState[] = ["positioning_review", "legal_review", "approved", "published"];
  if (scan.blocks.length > 0 && pastTechReview.includes(toState)) {
    await recordApproval(entityType, entityId, fromState, "blocked", actorId, note, scan);
    return { ok: false, reason: "blocked", scan };
  }

  // Any HIGH-RISK flag force-redirects the target state to legal_review,
  // regardless of what was requested (BRD §6) — this fires for any forward
  // move past tech_review (positioning_review, approved, published); a
  // request that already targets legal_review itself, or a backward move
  // (draft/archived), passes through unchanged.
  if (scan.flags.length > 0 && pastTechReview.includes(toState) && toState !== "legal_review") {
    finalState = "legal_review";
    redirected = true;
  }

  await adapter.setState(entityId, finalState, actorId);
  await recordApproval(entityType, entityId, fromState, finalState, actorId, note, scan);

  return { ok: true, finalState, scan, redirected };
}

async function recordApproval(
  entityType: string,
  entityId: string,
  fromState: WorkflowState,
  toState: string,
  actorId: string,
  note: string | undefined,
  scan: ScanResult,
) {
  await prisma.approval.create({
    data: {
      entityType,
      entityId,
      fromState,
      toState,
      actorId,
      note: [note, scan.blocks.length ? `${scan.blocks.length} block(s)` : null, scan.flags.length ? `${scan.flags.length} flag(s)` : null]
        .filter(Boolean)
        .join(" | ") || undefined,
    },
  });
}
