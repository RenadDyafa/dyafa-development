import { getTranslations, setRequestLocale } from "next-intl/server";
import { GateDiagram } from "@/components/motif/GateDiagram";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { prisma } from "@/lib/prisma";
import { publicStorageUrl } from "@/lib/storage";

const HERO_MEDIA_PATH = "local:media/e3619bd6-5757-463a-98af-483b33e18ae3.webp";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developmentModel" });
  return buildMetadata({ locale, path: "/development-model", title: t("heroHeadline"), description: t("riskGatesTitle") });
}

export default async function DevelopmentModelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developmentModel");
  const tNav = await getTranslations("nav");
  const media = await prisma.media.findFirst({ where: { path: HERO_MEDIA_PATH } });
  const imageUrl = media ? publicStorageUrl(media.path) : null;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("developmentModel"), path: `/${locale}/development-model` },
        ])}
      />
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <Reveal>
            <Breadcrumbs
              items={[
                { label: tNav("home"), href: "/" },
                { label: tNav("developmentModel"), href: "/development-model" },
              ]}
            />
            <h1 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
            <ButtonLink href="/submit-your-site" size="lg" className="mt-8">
              {t("cta")}
            </ButtonLink>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-900 py-16 text-stone-050">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title={t("riskGatesTitle")} className="[&_h2]:text-stone-050" align="center" />
          </Reveal>
          <Reveal delayMs={80}>
            <div className="mt-10">
              <GateDiagram />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// Looks up a live Media row for the hero image - without this, Next.js
// would prerender the page once at build time and a future change to (or
// removal of) that media would never appear until the next deploy.
export const dynamic = "force-dynamic";
