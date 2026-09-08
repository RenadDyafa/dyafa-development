import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminOpportunitiesListPage() {
  const opportunities = await prisma.opportunity.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">Opportunities</h1>
        <Link href="/admin/content/opportunities/new" className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-stone-050 hover:bg-navy-800">
          New opportunity
        </Link>
      </div>

      <div className="mt-6">
        {opportunities.length === 0 ? (
          <EmptyState title="No opportunities yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
                <th className="py-2 text-start">Title</th>
                <th className="py-2 text-start">Type</th>
                <th className="py-2 text-start">Status</th>
                <th className="py-2 text-start">Updated</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b border-grey-100 hover:bg-stone-050">
                  <td className="py-2">
                    <Link href={`/admin/content/opportunities/${o.id}`} className="font-medium text-teal-600 hover:underline">
                      {o.titleEn}
                    </Link>
                  </td>
                  <td className="py-2">{o.type.replace(/_/g, " ")}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{o.workflowState}</span>
                  </td>
                  <td className="py-2 text-grey-600">{o.updatedAt.toISOString().slice(0, 10)}</td>
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
