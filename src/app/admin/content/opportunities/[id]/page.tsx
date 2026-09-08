import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OpportunityEditor } from "@/components/admin/OpportunityEditor";
import { signPreviewToken } from "@/lib/admin/preview";
import { env } from "@/lib/env";

export default async function AdminOpportunityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) notFound();

  const token = signPreviewToken(opportunity.id);
  const previewHref = `${env.siteUrl}/en/opportunities/${opportunity.slugEn}?preview=${token}`;

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{opportunity.titleEn}</h1>
      <div className="mt-6">
        <OpportunityEditor opportunity={opportunity} previewHref={previewHref} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
