import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publicStorageUrl } from "@/lib/storage";

export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  stage: string;
  summary: string;
  coverImageUrl: string | null;
};

export type ProjectDetail = ProjectSummary & {
  images: { id: string; url: string; caption: string | null }[];
};

function summarize(
  row: {
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    city: string | null;
    stage: string;
    summaryEn: string;
    summaryAr: string;
    images: { mediaId: string; isCover: boolean; media: { path: string } }[];
  },
  locale: "en" | "ar",
): ProjectSummary {
  const cover = row.images.find((i) => i.isCover) ?? row.images[0];
  return {
    id: row.id,
    slug: row.slug,
    name: locale === "ar" ? row.nameAr : row.nameEn,
    city: row.city,
    stage: row.stage,
    summary: locale === "ar" ? row.summaryAr : row.summaryEn,
    coverImageUrl: cover ? publicStorageUrl(cover.media.path) : null,
  };
}

// Fails soft (returns []) so the homepage/projects page keep rendering their
// empty state rather than erroring - same discipline as every other
// optional content feed in this codebase.
export async function getPublishedProjects({ locale, limit }: { locale: "en" | "ar"; limit?: number }): Promise<ProjectSummary[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { images: { include: { media: true } } },
    });
    return rows.map((row) => summarize(row, locale));
  } catch (error) {
    logger.error({ error }, "getPublishedProjects failed");
    return [];
  }
}

export async function getProjectBySlug(slug: string, locale: "en" | "ar"): Promise<ProjectDetail | null> {
  try {
    const row = await prisma.project.findFirst({
      where: { slug, status: "published" },
      include: { images: { include: { media: true }, orderBy: { displayOrder: "asc" } } },
    });
    if (!row) return null;

    return {
      ...summarize(row, locale),
      images: row.images.map((img) => ({
        id: img.id,
        url: publicStorageUrl(img.media.path) ?? "",
        caption: (locale === "ar" ? img.captionAr : img.captionEn) || null,
      })),
    };
  } catch (error) {
    logger.error({ error }, "getProjectBySlug failed");
    return null;
  }
}
