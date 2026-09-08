import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { key: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Pages</h1>
      <p className="mt-1 text-sm text-grey-600">
        Structural marketing pages ship approved copy from <code>messages/en.json</code> / <code>messages/ar.json</code> (git-reviewed) rather than this CMS,
        so compliance-sensitive copy stays out of a freely-editable surface. These rows track governance metadata and workflow state per FEATURES.md §5.
      </p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Key</th>
            <th className="py-2 text-start">Status</th>
            <th className="py-2 text-start">Risk</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id} className="border-b border-grey-100">
              <td className="py-2">
                <Link href={`/admin/content/pages/${p.id}`} className="font-medium text-teal-600 hover:underline">
                  {p.key}
                </Link>
              </td>
              <td className="py-2">
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{p.status}</span>
              </td>
              <td className="py-2">{p.riskLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const dynamic = "force-dynamic";
