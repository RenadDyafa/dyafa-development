import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

function pickLocaleFields(
  row: { slugEn: string; slugAr: string; titleEn: string; titleAr: string; publicSummaryEn: string; publicSummaryAr: string },
  locale: "en" | "ar",
) {
  return locale === "ar"
    ? { slug: row.slugAr, title: row.titleAr, summary: row.publicSummaryAr }
    : { slug: row.slugEn, title: row.titleEn, summary: row.publicSummaryEn };
}

// Fails soft (returns []) so the Opportunities page keeps rendering its
// coming-soon/empty state if the DB is briefly unavailable.
export async function getPublishedOpportunities({
  locale,
  type,
  city,
}: {
  locale: "en" | "ar";
  type?: "land_offering" | "development_partnership" | "existing_asset";
  city?: string;
}) {
  try {
    const rows = await prisma.opportunity.findMany({
      where: {
        workflowState: "published",
        ...(type ? { type } : {}),
        ...(city ? { city } : {}),
      },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      ...pickLocaleFields(row, locale),
      type: row.type,
      city: row.city,
      region: row.region,
      assetType: row.assetType,
      status: row.status,
      developmentStage: row.developmentStage,
      publishedAt: row.publishedAt,
    }));
  } catch (error) {
    logger.error({ error }, "getPublishedOpportunities failed");
    return [];
  }
}

export async function getOpportunityBySlug(slug: string, locale: "en" | "ar") {
  try {
    return await prisma.opportunity.findFirst({
      where: {
        workflowState: "published",
        ...(locale === "ar" ? { slugAr: slug } : { slugEn: slug }),
      },
      include: { coverMedia: true },
    });
  } catch (error) {
    logger.error({ error }, "getOpportunityBySlug failed");
    return null;
  }
}
