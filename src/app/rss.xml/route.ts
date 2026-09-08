import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const insights = await prisma.insight.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const items = insights
    .map(
      (i) => `
    <item>
      <title>${escapeXml(i.titleEn)}</title>
      <link>${env.siteUrl}/en/insights/${i.slugEn}</link>
      <guid>${env.siteUrl}/en/insights/${i.slugEn}</guid>
      <pubDate>${(i.publishedAt ?? i.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(i.excerptEn)}</description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Dyafa Development — Insights</title>
  <link>${env.siteUrl}/en/insights</link>
  <description>Perspective on hospitality development, modular delivery, and disciplined investment in Saudi Arabia.</description>
  ${items}
</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
