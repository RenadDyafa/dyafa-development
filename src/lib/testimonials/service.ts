import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publicStorageUrl } from "@/lib/storage";

export type TestimonialView = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  avatarUrl: string | null;
};

// Fails soft (returns []) so the homepage simply omits the testimonials
// section (matching the existing Insights-section pattern) until at least
// one real, approved testimonial is published.
export async function getActiveTestimonials(locale: "en" | "ar"): Promise<TestimonialView[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      include: { avatarMedia: true },
    });

    return rows.map((row) => ({
      id: row.id,
      quote: locale === "ar" ? row.quoteAr : row.quoteEn,
      authorName: row.authorName,
      authorRole: (locale === "ar" ? row.authorRoleAr : row.authorRoleEn) || null,
      authorCompany: row.authorCompany || null,
      avatarUrl: row.avatarMedia ? publicStorageUrl(row.avatarMedia.path) : null,
    }));
  } catch (error) {
    logger.error({ error }, "getActiveTestimonials failed");
    return [];
  }
}
