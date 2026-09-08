import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicStorageUrl } from "@/lib/storage";
import { logger } from "@/lib/logger";

// One legacy key (a single logo used everywhere) plus two placement-specific
// keys, so an admin can upload a variant that reads correctly against the
// header's light background and a separate variant for the footer's dark
// background - a single logo asset frequently can't do both (e.g. dark
// wordmark text disappears on a dark footer).
export const SITE_LOGO_SETTING_KEY = "site_logo";
export const SITE_LOGO_HEADER_KEY = "site_logo_header";
export const SITE_LOGO_FOOTER_KEY = "site_logo_footer";

const logoValueSchema = z.object({
  mediaId: z.string().min(1),
  path: z.string().min(1),
});

export type SiteLogo = { mediaId: string; url: string };
export type SiteLogos = { header: SiteLogo | null; footer: SiteLogo | null };

async function readLogoSetting(key: string): Promise<SiteLogo | null> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return null;

  const parsed = logoValueSchema.safeParse(setting.valueJson);
  if (!parsed.success) return null;

  const url = publicStorageUrl(parsed.data.path);
  if (!url) return null;

  return { mediaId: parsed.data.mediaId, url };
}

// Fails soft (returns nulls) so the header/footer fall back to the text
// wordmark if the DB is briefly unavailable or a stored value is malformed
// - a missing logo is never a page-breaking condition. Each placement
// checks its own key first, then falls back to the original single
// site_logo key, so a logo uploaded before this header/footer split
// keeps working in both places until explicitly overridden.
export async function getSiteLogos(): Promise<SiteLogos> {
  try {
    const [header, footer, legacy] = await Promise.all([
      readLogoSetting(SITE_LOGO_HEADER_KEY),
      readLogoSetting(SITE_LOGO_FOOTER_KEY),
      readLogoSetting(SITE_LOGO_SETTING_KEY),
    ]);

    return { header: header ?? legacy, footer: footer ?? legacy };
  } catch (error) {
    logger.error({ error }, "getSiteLogos failed");
    return { header: null, footer: null };
  }
}
