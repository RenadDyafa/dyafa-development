import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const sliderSettingsSchema = z.object({
  autoplayMs: z.number().int().min(0).max(60_000),
  showArrows: z.boolean(),
  showBullets: z.boolean(),
  loop: z.boolean(),
});

export type SliderSettings = z.infer<typeof sliderSettingsSchema>;

// autoplayMs: 0 disables autoplay entirely (manual arrows/bullets only).
export const DEFAULT_SLIDER_SETTINGS: SliderSettings = {
  autoplayMs: 6000,
  showArrows: true,
  showBullets: true,
  loop: true,
};

export const HOME_SLIDER_SETTINGS_KEY = "home_slider_settings";
export const TESTIMONIAL_SLIDER_SETTINGS_KEY = "testimonial_slider_settings";

async function readSliderSettings(key: string): Promise<SliderSettings> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) return DEFAULT_SLIDER_SETTINGS;

    const parsed = sliderSettingsSchema.safeParse(setting.valueJson);
    return parsed.success ? parsed.data : DEFAULT_SLIDER_SETTINGS;
  } catch (error) {
    logger.error({ error, key }, "readSliderSettings failed");
    return DEFAULT_SLIDER_SETTINGS;
  }
}

export function getHomeSliderSettings(): Promise<SliderSettings> {
  return readSliderSettings(HOME_SLIDER_SETTINGS_KEY);
}

export function getTestimonialSliderSettings(): Promise<SliderSettings> {
  return readSliderSettings(TESTIMONIAL_SLIDER_SETTINGS_KEY);
}
