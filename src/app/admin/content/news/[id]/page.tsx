import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewsEditor } from "@/components/admin/NewsEditor";
import { signPreviewToken } from "@/lib/admin/preview";
import { env } from "@/lib/env";

export default async function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const newsItem = await prisma.newsItem.findUnique({ where: { id } });
  if (!newsItem) notFound();

  const token = signPreviewToken(newsItem.id);
  const previewHref = `${env.siteUrl}/en/news/${newsItem.slugEn}?preview=${token}`;

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{newsItem.titleEn}</h1>
      <div className="mt-6">
        <NewsEditor newsItem={newsItem} previewHref={previewHref} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
