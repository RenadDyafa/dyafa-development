import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InsightEditor } from "@/components/admin/InsightEditor";
import { signPreviewToken } from "@/lib/admin/preview";
import { env } from "@/lib/env";

export default async function AdminInsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [insight, pillars] = await Promise.all([
    prisma.insight.findUnique({ where: { id } }),
    prisma.pillar.findMany({ orderBy: { nameEn: "asc" } }),
  ]);
  if (!insight) notFound();

  const token = signPreviewToken(insight.id);
  const previewHref = `${env.siteUrl}/en/insights/${insight.slugEn}?preview=${token}`;

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{insight.titleEn}</h1>
      <div className="mt-6">
        <InsightEditor insight={insight} pillars={pillars} previewHref={previewHref} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
