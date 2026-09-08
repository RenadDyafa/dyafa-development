import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminInsightsListPage() {
  const insights = await prisma.insight.findMany({ include: { pillar: true }, orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">Insights</h1>
        <Link href="/admin/content/insights/new" className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-stone-050 hover:bg-navy-800">
          New insight
        </Link>
      </div>

      <div className="mt-6">
        {insights.length === 0 ? (
          <EmptyState title="No insights yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
                <th className="py-2 text-start">Title</th>
                <th className="py-2 text-start">Pillar</th>
                <th className="py-2 text-start">Status</th>
                <th className="py-2 text-start">Updated</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((i) => (
                <tr key={i.id} className="border-b border-grey-100 hover:bg-stone-050">
                  <td className="py-2">
                    <Link href={`/admin/content/insights/${i.id}`} className="font-medium text-teal-600 hover:underline">
                      {i.titleEn}
                    </Link>
                  </td>
                  <td className="py-2">{i.pillar.nameEn}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{i.status}</span>
                  </td>
                  <td className="py-2 text-grey-600">{i.updatedAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
