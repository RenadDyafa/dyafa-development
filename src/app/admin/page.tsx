import Link from "next/link";
import { prisma } from "@/lib/prisma";

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-5">
      <p className="text-xs font-semibold uppercase text-grey-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const [leadsByStatus, leadsTotal, topInsights, complianceQueue, taskCounts] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.count(),
    prisma.insight.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.insight.count({ where: { status: { in: ["tech_review", "positioning_review", "legal_review"] } } }),
    prisma.task.groupBy({ by: ["status"], where: { category: "general" }, _count: true }),
  ]);

  const openTasks = taskCounts.filter((t) => t.status !== "done" && t.status !== "cancelled").reduce((sum, t) => sum + t._count, 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={leadsTotal} href="/admin/leads" />
        <StatCard label="New leads" value={leadsByStatus.find((s) => s.status === "new")?._count ?? 0} href="/admin/leads?status=new" />
        <StatCard label="Compliance queue" value={complianceQueue} href="/admin/content/insights" />
        <StatCard label="Open tasks" value={openTasks} href="/admin/tasks/board" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-grey-200 bg-stone-050 p-5">
          <h2 className="text-sm font-semibold text-navy-900">Lead funnel</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {leadsByStatus.map((s) => (
              <li key={s.status} className="flex justify-between">
                <span>{s.status}</span>
                <span className="font-semibold">{s._count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-grey-200 bg-stone-050 p-5">
          <h2 className="text-sm font-semibold text-navy-900">Top published content</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {topInsights.map((i) => (
              <li key={i.id}>
                <Link href={`/admin/content/insights/${i.id}`} className="text-teal-600 hover:underline">
                  {i.titleEn}
                </Link>
              </li>
            ))}
            {topInsights.length === 0 && <p className="text-grey-500">Nothing published yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
