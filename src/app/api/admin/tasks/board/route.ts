import { prisma } from "@/lib/prisma";
import { ok, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { scanContent } from "@/lib/compliance/scanner";

type BoardCard = {
  id: string;
  kind: "task" | "content_workflow" | "lead_pipeline";
  title: string;
  subtitle: string;
  href: string;
  priority?: string;
};

type Columns = { todo: BoardCard[]; in_progress: BoardCard[]; blocked: BoardCard[]; done: BoardCard[] };

export async function GET() {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const columns: Columns = { todo: [], in_progress: [], blocked: [], done: [] };

  // Real to-do rows.
  const tasks = await prisma.task.findMany({ where: { category: "general", status: { not: "cancelled" } } });
  for (const task of tasks) {
    const card: BoardCard = {
      id: task.id,
      kind: "task",
      title: task.title,
      subtitle: task.dueAt ? `Due ${task.dueAt.toISOString().slice(0, 10)}` : "No due date",
      href: `/admin/tasks#${task.id}`,
      priority: task.priority,
    };
    if (task.status === "todo") columns.todo.push(card);
    else if (task.status === "in_progress") columns.in_progress.push(card);
    else if (task.status === "blocked") columns.blocked.push(card);
    else if (task.status === "done") columns.done.push(card);
  }

  // content_workflow: live read-aggregation over Insight/Page/Project/Campaign
  // WorkflowState — resolving the underlying transition is what clears the card.
  const insights = await prisma.insight.findMany({ where: { status: { notIn: ["published", "archived"] } } });
  for (const insight of insights) {
    const scan = await scanContent({ textEn: `${insight.titleEn}\n${insight.bodyEn}`, textAr: `${insight.titleAr}\n${insight.bodyAr}` });
    const card: BoardCard = {
      id: `insight-${insight.id}`,
      kind: "content_workflow",
      title: insight.titleEn,
      subtitle: `Insight · ${insight.status}`,
      href: `/admin/content/insights/${insight.id}`,
    };
    if (scan.blocks.length > 0) columns.blocked.push(card);
    else if (["draft", "tech_review"].includes(insight.status)) columns.todo.push(card);
    else columns.in_progress.push(card);
  }

  // lead_pipeline: live read-aggregation over Lead status.
  const leads = await prisma.lead.findMany({ where: { status: { notIn: ["closed", "archived"] } } });
  for (const lead of leads) {
    const card: BoardCard = {
      id: `lead-${lead.id}`,
      kind: "lead_pipeline",
      title: lead.name,
      subtitle: `Lead · ${lead.type} · ${lead.status}`,
      href: `/admin/leads/${lead.id}`,
    };
    if (lead.status === "new") columns.todo.push(card);
    else columns.in_progress.push(card);
  }

  return ok(columns);
}
