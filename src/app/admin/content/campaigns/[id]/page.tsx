import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CampaignEditor } from "@/components/admin/CampaignEditor";

export default async function AdminCampaignEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{campaign.name}</h1>
      <div className="mt-6">
        <CampaignEditor campaign={campaign} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
