import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { publicStorageUrl } from "@/lib/storage";

export const HOME_CAPABILITY_TILES_KEY = "home_capability_tiles";

const tileSchema = z.object({
  key: z.string().min(1),
  href: z.string().min(1),
  mediaId: z.string().nullable().optional(),
});
const configSchema = z.array(tileSchema);

export type CapabilityTile = { key: string; href: string; imageUrl: string | null };

// The four destinations recommended by the competitor synthesis (a visual
// site-map just below the hero) - admins can repoint `href`/`mediaId` or
// add/remove tiles via Settings without a deploy; the caption text for each
// `key` still comes from next-intl (home.capabilityTiles.<key>), matching
// how every other homepage section's copy is translated and reviewed.
const DEFAULT_TILES: z.infer<typeof configSchema> = [
  { key: "developmentModel", href: "/development-model", mediaId: null },
  { key: "modularHospitality", href: "/modular-hospitality", mediaId: null },
  { key: "opportunities", href: "/opportunities", mediaId: null },
  { key: "investors", href: "/investors", mediaId: null },
];

export async function getCapabilityTiles(): Promise<CapabilityTile[]> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: HOME_CAPABILITY_TILES_KEY } });
    const parsed = configSchema.safeParse(setting?.valueJson);
    const tiles = parsed.success && parsed.data.length > 0 ? parsed.data : DEFAULT_TILES;

    const mediaIds = tiles.map((t) => t.mediaId).filter((id): id is string => Boolean(id));
    const media = mediaIds.length > 0 ? await prisma.media.findMany({ where: { id: { in: mediaIds } } }) : [];
    const urlById = new Map(media.map((m) => [m.id, publicStorageUrl(m.path)]));

    return tiles.map((t) => ({
      key: t.key,
      href: t.href,
      imageUrl: t.mediaId ? (urlById.get(t.mediaId) ?? null) : null,
    }));
  } catch (error) {
    logger.error({ error }, "getCapabilityTiles failed");
    return DEFAULT_TILES.map((t) => ({ key: t.key, href: t.href, imageUrl: null }));
  }
}
