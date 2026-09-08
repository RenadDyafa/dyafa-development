import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

function pickLocaleFields(
  row: { slugEn: string; slugAr: string; titleEn: string; titleAr: string; excerptEn: string; excerptAr: string },
  locale: "en" | "ar",
) {
  return locale === "ar"
    ? { slug: row.slugAr, title: row.titleAr, excerpt: row.excerptAr }
    : { slug: row.slugEn, title: row.titleEn, excerpt: row.excerptEn };
}

export async function getPublishedNews({ locale, limit = 20 }: { locale: "en" | "ar"; limit?: number }) {
  try {
    const rows = await prisma.newsItem.findMany({
      where: { workflowState: "published" },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      ...pickLocaleFields(row, locale),
      type: row.type,
      eventDate: row.eventDate,
      publishedAt: row.publishedAt,
    }));
  } catch (error) {
    logger.error({ error }, "getPublishedNews failed");
    return [];
  }
}

export async function getNewsBySlug(slug: string, locale: "en" | "ar") {
  try {
    return await prisma.newsItem.findFirst({
      where: {
        workflowState: "published",
        ...(locale === "ar" ? { slugAr: slug } : { slugEn: slug }),
      },
      include: { coverMedia: true, relatedProject: true },
    });
  } catch (error) {
    logger.error({ error }, "getNewsBySlug failed");
    return null;
  }
}
