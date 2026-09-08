import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Metric } from "@/components/ui/MetricStrip";

export const HOME_STATS_CONFIG_KEY = "home_stats_config";

const configSchema = z.object({ factIds: z.array(z.string()) });

// Fails soft (returns []) so the homepage simply omits the StatStrip section
// until an admin features at least one approved, structured fact - the
// same "ships empty, nothing invented" discipline as HomeSlide/Testimonial.
// A fact only counts once it has both approvedAt set AND a numeric value -
// free-text-only facts (e.g. compliance-scanner reference facts) are never
// accidentally rendered as a homepage number.
export async function getFeaturedStats(locale: "en" | "ar"): Promise<Metric[]> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: HOME_STATS_CONFIG_KEY } });
    const parsed = configSchema.safeParse(setting?.valueJson);
    const factIds = parsed.success ? parsed.data.factIds : [];
    if (factIds.length === 0) return [];

    const facts = await prisma.approvedFact.findMany({ where: { id: { in: factIds } } });
    const byId = new Map(facts.map((f) => [f.id, f]));

    return factIds
      .map((id) => byId.get(id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f && f.approvedAt && f.value !== null))
      .map((f) => ({
        value: f.value as number,
        prefix: f.prefix ?? undefined,
        suffix: f.suffix ?? undefined,
        label: locale === "ar" ? f.statementAr : f.statementEn,
      }));
  } catch (error) {
    logger.error({ error }, "getFeaturedStats failed");
    return [];
  }
}
