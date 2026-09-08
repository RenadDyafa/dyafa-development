import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetailPanel } from "@/components/admin/LeadDetailPanel";

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { notes: { include: { author: true }, orderBy: { createdAt: "desc" } }, files: true },
  });
  if (!lead) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{lead.name}</h1>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-grey-500">Type</dt>
          <dd>{lead.type}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Persona</dt>
          <dd>{lead.persona ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Email</dt>
          <dd>{lead.email}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Phone</dt>
          <dd>{lead.phone}</dd>
        </div>
        <div>
          <dt className="text-grey-500">City</dt>
          <dd>{lead.city ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Campaign</dt>
          <dd>{lead.campaignId ?? "-"} </dd>
        </div>
        <div>
          <dt className="text-grey-500">UTM source</dt>
          <dd>{lead.utmSource ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Land area (m²)</dt>
          <dd>{lead.landAreaM2 ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Legal status</dt>
          <dd>{lead.legalStatus ?? "-"}</dd>
        </div>
      </dl>
      {lead.message && (
        <div className="mt-4">
          <p className="text-sm font-medium text-grey-500">Message</p>
          <p className="mt-1 whitespace-pre-line text-sm text-navy-900">{lead.message}</p>
        </div>
      )}
      {lead.files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-grey-500">Files</p>
          <ul className="mt-1 text-sm text-navy-900">
            {lead.files.map((f) => (
              <li key={f.id}>{f.filename}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 border-t border-grey-200 pt-6">
        <LeadDetailPanel
          lead={{
            id: lead.id,
            status: lead.status,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            message: lead.message,
            notes: lead.notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
          }}
        />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
