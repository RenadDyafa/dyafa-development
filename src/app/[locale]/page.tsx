import { getTranslations, setRequestLocale } from "next-intl/server";
import { AscentMotif } from "@/components/motif/AscentMotif";
import { GateDiagram } from "@/components/motif/GateDiagram";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OutcomeCard } from "@/components/ui/OutcomeCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedInsights } from "@/lib/insights/service";
import { InsightCard } from "@/components/insights/InsightCard";
import { getActiveHomeSlides } from "@/lib/homeSlides/service";
import { getActiveTestimonials } from "@/lib/testimonials/service";
import { getHomeSliderSettings, getTestimonialSliderSettings } from "@/lib/settings/sliders";
import { HomeSlider } from "@/components/home/HomeSlider";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { CapabilityTileRow } from "@/components/home/CapabilityTileRow";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { StatStrip } from "@/components/home/StatStrip";
import { PartnerLogoStrip } from "@/components/home/PartnerLogoStrip";
import { getFeaturedStats } from "@/lib/settings/stats";
import { getPublishedProjects } from "@/lib/projects/service";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { env } from "@/lib/env";

const GATE_COUNT = 5;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tGates = await getTranslations("gates");
  const localeTyped = locale as "en" | "ar";
  const [insights, homeSlides, homeSliderSettings, testimonials, testimonialSliderSettings, stats, properties] = await Promise.all([
    getPublishedInsights({ locale: localeTyped, limit: 3 }),
    getActiveHomeSlides(localeTyped),
    getHomeSliderSettings(),
    getActiveTestimonials(localeTyped),
    getTestimonialSliderSettings(),
    getFeaturedStats(localeTyped),
    env.featureProjects ? getPublishedProjects({ locale: localeTyped, limit: 3 }) : Promise.resolve([]),
  ]);

  return (
    <>
      {homeSlides.length > 0 ? (
        <HomeSlider slides={homeSlides} settings={homeSliderSettings} />
      ) : (
        <section className="relative overflow-hidden bg-navy-900 text-stone-050">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(120% 100% at 100% 0%, rgba(133,130,112,0.18), transparent 60%)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-20 lg:pt-36 lg:px-8">
            <div>
              <p className="text-sm font-semibold text-teal-100">{t("heroPromise")}</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{t("heroHeadline")}</h1>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/submit-your-site" size="lg" className="border border-stone-050/25">
                  {t("heroCta")}
                </ButtonLink>
                <ButtonLink href="/about" variant="outline" size="lg" className="border-stone-050 text-stone-050 hover:bg-stone-050 hover:text-navy-900">
                  {t("heroSecondaryCta")}
                </ButtonLink>
              </div>
            </div>
            <AscentMotif locale={locale} tone="onDark" className="max-w-md justify-self-center lg:justify-self-end" />
          </div>

          {/* Subtle bottom rail (design.md §7 "01 Hero"): the same five gates
              as GateDiagram below, condensed to a single-line progression. */}
          <div className="relative border-t border-stone-050/10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-4 text-xs font-medium text-teal-100/80 sm:px-6 lg:px-8">
              {Array.from({ length: GATE_COUNT }).map((_, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-teal-100/40">
                      →
                    </span>
                  )}
                  {tGates(`${i + 1}.title`)}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <AboutTeaser locale={localeTyped} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading title={t("promiseBandTitle")} subtitle={t("promiseBandBody")} align="center" />
        </Reveal>
      </section>

      <CapabilityTileRow />

      <section className="bg-navy-900 py-16 text-stone-050">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              title={t("gatesTitle")}
              subtitle={t("gatesSubtitle")}
              className="[&_h2]:text-stone-050 [&_p]:text-teal-100"
            />
          </Reveal>
          <div className="mt-10">
            <GateDiagram />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading title={t("audienceTitle")} align="center" />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Reveal delayMs={0}>
            <OutcomeCard
              className="hover-lift h-full"
              title={t("audienceLandowner.title")}
              body={t("audienceLandowner.body")}
              cta={
                <ButtonLink href="/submit-your-site" variant="outline">
                  {t("audienceLandowner.cta")}
                </ButtonLink>
              }
            />
          </Reveal>
          <Reveal delayMs={80}>
            <OutcomeCard
              className="hover-lift h-full"
              title={t("audienceInvestor.title")}
              body={t("audienceInvestor.body")}
              cta={
                <ButtonLink href="/contact" variant="outline">
                  {t("audienceInvestor.cta")}
                </ButtonLink>
              }
            />
          </Reveal>
          <Reveal delayMs={160}>
            <OutcomeCard
              className="hover-lift h-full"
              title={t("audiencePartner.title")}
              body={t("audiencePartner.body")}
              cta={
                <ButtonLink href="/partnerships" variant="outline">
                  {t("audiencePartner.cta")}
                </ButtonLink>
              }
            />
          </Reveal>
        </div>
      </section>

      {stats.length > 0 && <StatStrip metrics={stats} />}

      {properties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title={t("propertiesTitle")} subtitle={t("propertiesSubtitle")} />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {properties.map((project, i) => (
              <Reveal key={project.id} delayMs={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <SectionHeading title={t("modularTitle")} subtitle={t("modularBody")} />
                <ButtonLink href="/modular-hospitality" className="mt-6" variant="secondary">
                  {t("modularCta")}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <PartnerLogoStrip locale={localeTyped} />

      {insights.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title={t("insightsTitle")} subtitle={t("insightsSubtitle")} />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {insights.map((insight, i) => (
              <Reveal key={insight.id} delayMs={i * 80}>
                <div className="hover-lift h-full">
                  <InsightCard insight={insight} locale={locale as "en" | "ar"} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title={t("testimonialsTitle")} align="center" />
          </Reveal>
          <div className="mt-10">
            <TestimonialSlider testimonials={testimonials} settings={testimonialSliderSettings} />
          </div>
        </section>
      )}

      <section className="bg-navy-900 py-16 text-stone-050">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl font-bold sm:text-3xl">{t("submitBandTitle")}</h2>
            <ButtonLink href="/submit-your-site" variant="secondary" size="lg" className="mt-8">
              {t("submitBandCta")}
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// This page reads live, admin-editable content (home slides, testimonials,
// capability tiles, stats, properties, insights) - without this, Next.js
// prerenders it once at build time and admin publishes would never appear
// on the live site until the next deploy. Same reasoning as every other
// CMS-driven page (projects, news, insights, opportunities, careers, search).
export const dynamic = "force-dynamic";
