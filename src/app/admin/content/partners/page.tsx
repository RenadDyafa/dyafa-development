import { prisma } from "@/lib/prisma";
import { PartnersManager } from "@/components/admin/PartnersManager";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Partners registry</h1>
      <p className="mt-1 text-sm text-grey-600">Only approved &amp; active partners may be referenced in published content — the compliance scanner checks this automatically.</p>
      <div className="mt-6">
        <PartnersManager
          partners={partners.map((p) => ({ ...p, approvedAt: p.approvedAt ? p.approvedAt.toISOString() : null }))}
        />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
