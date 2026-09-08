import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type InsightSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  pillarKey: string;
  pillarName: string;
  publishedAt: Date | null;
};

function pickLocaleFields(row: {
  slugEn: string;
  slugAr: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
}, locale: "en" | "ar") {
  return locale === "ar"
    ? { slug: row.slugAr, title: row.titleAr, excerpt: row.excerptAr }
    : { slug: row.slugEn, title: row.titleEn, excerpt: row.excerptEn };
}

// Fails soft (returns []) so marketing pages keep rendering if the DB is
// briefly unavailable — the insights feed is an enhancement, not core content.
export async function getPublishedInsights({
  locale,
  limit = 10,
  pillarKey,
}: {
  locale: "en" | "ar";
  limit?: number;
  pillarKey?: string;
}): Promise<InsightSummary[]> {
  try {
    const rows = await prisma.insight.findMany({
      where: {
        status: "published",
        ...(pillarKey ? { pillar: { key: pillarKey } } : {}),
      },
      include: { pillar: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      ...pickLocaleFields(row, locale),
      pillarKey: row.pillar.key,
      pillarName: locale === "ar" ? row.pillar.nameAr : row.pillar.nameEn,
      publishedAt: row.publishedAt,
    }));
  } catch (error) {
    logger.error({ error }, "getPublishedInsights failed");
    return [];
  }
}

export async function getInsightBySlug(slug: string, locale: "en" | "ar", options?: { includeUnpublished?: boolean }) {
  try {
    return await prisma.insight.findFirst({
      where: {
        ...(options?.includeUnpublished ? {} : { status: "published" }),
        ...(locale === "ar" ? { slugAr: slug } : { slugEn: slug }),
      },
      include: { pillar: true, author: true, coverMedia: true },
    });
  } catch (error) {
    logger.error({ error }, "getInsightBySlug failed");
    return null;
  }
}
