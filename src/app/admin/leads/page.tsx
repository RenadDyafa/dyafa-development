import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { LeadStatus, Persona } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "meeting", "handed_to_bd", "closed", "archived"];
const PERSONAS: Persona[] = ["landowner", "investor", "developer_jv", "government", "hotel_owner", "consultant", "media", "talent", "other"];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; persona?: string }>;
}) {
  const params = await searchParams;
  const leads = await prisma.lead.findMany({
    where: {
      ...(params.status ? { status: params.status as LeadStatus } : {}),
      ...(params.persona ? { persona: params.persona as Persona } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">Leads</h1>
        <a href="/api/admin/leads/export.csv" className="text-sm font-semibold text-teal-600 hover:underline">
          Export CSV
        </a>
      </div>

      <form className="mt-4 flex flex-wrap gap-3 text-sm">
        <select name="status" defaultValue={params.status ?? ""} className="rounded-md border border-grey-200 px-2 py-1.5">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="persona" defaultValue={params.persona ?? ""} className="rounded-md border border-grey-200 px-2 py-1.5">
          <option value="">All personas</option>
          {PERSONAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-navy-900 px-3 py-1.5 text-stone-050">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        {leads.length === 0 ? (
          <EmptyState title="No leads match these filters" />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-grey-200 text-start text-xs uppercase text-grey-500">
                <th className="py-2 text-start">Name</th>
                <th className="py-2 text-start">Type</th>
                <th className="py-2 text-start">Persona</th>
                <th className="py-2 text-start">Status</th>
                <th className="py-2 text-start">City</th>
                <th className="py-2 text-start">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-grey-100 hover:bg-stone-050">
                  <td className="py-2">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-teal-600 hover:underline">
                      {lead.name}
                    </Link>
                  </td>
                  <td className="py-2">{lead.type}</td>
                  <td className="py-2">{lead.persona ?? "-"}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{lead.status}</span>
                  </td>
                  <td className="py-2">{lead.city ?? "-"}</td>
                  <td className="py-2 text-grey-600">{lead.createdAt.toISOString().slice(0, 10)}</td>
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
