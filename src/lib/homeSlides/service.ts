import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publicStorageUrl } from "@/lib/storage";

export type HomeSlideView = {
  id: string;
  mediaUrl: string;
  mediaKind: "image" | "video";
  headline: string | null;
  subheadline: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

// Fails soft (returns []) so the homepage falls back to its existing static
// hero if the DB is briefly unavailable or no slides are published yet.
export async function getActiveHomeSlides(locale: "en" | "ar"): Promise<HomeSlideView[]> {
  try {
    const rows = await prisma.homeSlide.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      include: { media: true },
    });

    return rows
      .map((row) => {
        const url = publicStorageUrl(row.media.path);
        if (!url) return null;
        return {
          id: row.id,
          mediaUrl: url,
          mediaKind: row.media.kind === "video" ? ("video" as const) : ("image" as const),
          headline: (locale === "ar" ? row.headlineAr : row.headlineEn) || null,
          subheadline: (locale === "ar" ? row.subheadlineAr : row.subheadlineEn) || null,
          ctaLabel: (locale === "ar" ? row.ctaLabelAr : row.ctaLabelEn) || null,
          ctaHref: row.ctaHref || null,
        };
      })
      .filter((s): s is HomeSlideView => s !== null);
  } catch (error) {
    logger.error({ error }, "getActiveHomeSlides failed");
    return [];
  }
}
