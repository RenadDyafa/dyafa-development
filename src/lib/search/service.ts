import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type SearchResult = {
  type: "insight" | "project" | "opportunity" | "news" | "faq";
  slug: string;
  title: string;
  excerpt: string;
};

// Published/active-only across every searchable content type - draft or
// unpublished rows never surface here regardless of match quality.
export async function searchSite(query: string, locale: "en" | "ar", limit = 20): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];

  try {
    const titleField = locale === "ar" ? "titleAr" : "titleEn";
    const slugField = locale === "ar" ? "slugAr" : "slugEn";

    const [insights, projects, opportunities, news, faqs] = await Promise.all([
      prisma.insight.findMany({
        where: { status: "published", OR: [{ titleEn: { contains: query, mode: "insensitive" } }, { titleAr: { contains: query, mode: "insensitive" } }] },
        take: limit,
      }),
      prisma.project.findMany({
        where: { status: "published", OR: [{ nameEn: { contains: query, mode: "insensitive" } }, { nameAr: { contains: query, mode: "insensitive" } }] },
        take: limit,
      }),
      prisma.opportunity.findMany({
        where: { workflowState: "published", OR: [{ titleEn: { contains: query, mode: "insensitive" } }, { titleAr: { contains: query, mode: "insensitive" } }] },
        take: limit,
      }),
      prisma.newsItem.findMany({
        where: { workflowState: "published", OR: [{ titleEn: { contains: query, mode: "insensitive" } }, { titleAr: { contains: query, mode: "insensitive" } }] },
        take: limit,
      }),
      prisma.faq.findMany({
        where: { active: true, OR: [{ questionEn: { contains: query, mode: "insensitive" } }, { questionAr: { contains: query, mode: "insensitive" } }] },
        take: limit,
      }),
    ]);

    const results: SearchResult[] = [
      ...insights.map((r) => ({ type: "insight" as const, slug: r[slugField], title: r[titleField], excerpt: locale === "ar" ? r.excerptAr : r.excerptEn })),
      ...projects.map((r) => ({ type: "project" as const, slug: r.slug, title: locale === "ar" ? r.nameAr : r.nameEn, excerpt: locale === "ar" ? r.summaryAr : r.summaryEn })),
      ...opportunities.map((r) => ({ type: "opportunity" as const, slug: r[slugField], title: r[titleField], excerpt: locale === "ar" ? r.publicSummaryAr : r.publicSummaryEn })),
      ...news.map((r) => ({ type: "news" as const, slug: r[slugField], title: r[titleField], excerpt: locale === "ar" ? r.excerptAr : r.excerptEn })),
      ...faqs.map((r) => ({ type: "faq" as const, slug: r.id, title: locale === "ar" ? r.questionAr : r.questionEn, excerpt: locale === "ar" ? r.answerAr : r.answerEn })),
    ];

    return results.slice(0, limit);
  } catch (error) {
    logger.error({ error }, "searchSite failed");
    return [];
  }
}
