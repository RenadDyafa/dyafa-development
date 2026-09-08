import { prisma } from "@/lib/prisma";
import { ok, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";

export async function GET() {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const [leadsByStatus, leadsByPersona, topInsights, complianceQueue, taskCounts] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.groupBy({ by: ["persona"], _count: true }),
    prisma.insight.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.insight.count({ where: { status: { in: ["tech_review", "positioning_review", "legal_review"] } } }),
    prisma.task.groupBy({ by: ["status"], where: { category: "general" }, _count: true }),
  ]);

  return ok({
    leadsByStatus,
    leadsByPersona,
    topInsights: topInsights.map((i) => ({ id: i.id, title: i.titleEn })),
    complianceQueueLength: complianceQueue,
    taskCounts,
  });
}
