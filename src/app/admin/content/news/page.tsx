import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminNewsListPage() {
  const newsItems = await prisma.newsItem.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">News</h1>
        <Link href="/admin/content/news/new" className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-stone-050 hover:bg-navy-800">
          New news item
        </Link>
      </div>

      <div className="mt-6">
        {newsItems.length === 0 ? (
          <EmptyState title="No news yet" />
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
              {newsItems.map((n) => (
                <tr key={n.id} className="border-b border-grey-100 hover:bg-stone-050">
                  <td className="py-2">
                    <Link href={`/admin/content/news/${n.id}`} className="font-medium text-teal-600 hover:underline">
                      {n.titleEn}
                    </Link>
                  </td>
                  <td className="py-2">{n.type}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{n.workflowState}</span>
                  </td>
                  <td className="py-2 text-grey-600">{n.updatedAt.toISOString().slice(0, 10)}</td>
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
