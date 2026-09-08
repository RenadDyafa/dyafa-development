import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publicStorageUrl } from "@/lib/storage";

export type PartnerView = { id: string; name: string; logoUrl: string | null };

// Fails soft (returns []) so the homepage simply omits the partner strip
// until at least one partner is marked active - same pattern as every other
// optional homepage section this session.
export async function getActivePartners(locale: "en" | "ar"): Promise<PartnerView[]> {
  try {
    const rows = await prisma.partner.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
      include: { logoMedia: true },
    });

    return rows.map((row) => ({
      id: row.id,
      name: locale === "ar" ? row.nameAr : row.nameEn,
      logoUrl: row.logoMedia ? publicStorageUrl(row.logoMedia.path) : null,
    }));
  } catch (error) {
    logger.error({ error }, "getActivePartners failed");
    return [];
  }
}
