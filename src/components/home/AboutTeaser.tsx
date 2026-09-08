import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { publicStorageUrl } from "@/lib/storage";

// Real property photography (an interior architectural detail shot) rather
// than a generic stock image - configurable later via a Setting the same
// way the hero/capability tiles are, but a single fixed image is enough for
// a single homepage teaser section, so this isn't over-engineered into a
// new admin surface for one photo.
const ABOUT_TEASER_MEDIA_PATH = "local:media/6f79ad16-f633-4c74-b1db-02168de21284.webp";

/**
 * Premium split image+content "who we are" teaser (competitor synthesis:
 * a lightweight about-teaser sits just below the hero on all three
 * reference sites - see docs/competitor-analysis.md). Reuses the About
 * page's own real copy rather than inventing new marketing text.
 */
export async function AboutTeaser({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("about");
  const media = await prisma.media.findFirst({ where: { path: ABOUT_TEASER_MEDIA_PATH } });
  const imageUrl = media ? publicStorageUrl(media.path) : null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal variant="fade">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </Reveal>
        <Reveal delayMs={80}>
          <p className="text-sm font-semibold text-navy-900">{t("ecosystemTitle")}</p>
          <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">{t("heroHeadline")}</h2>
          <p className="mt-4 text-slate">{t("longDescription")}</p>
          <div className="mt-8">
            <ButtonLink href="/about" size="lg">
              {t("cta")}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
