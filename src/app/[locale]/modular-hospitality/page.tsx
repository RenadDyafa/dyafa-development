import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OutcomeCard } from "@/components/ui/OutcomeCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AscentMotif } from "@/components/motif/AscentMotif";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, faqJsonLd } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "modularHospitality" });
  return buildMetadata({ locale, path: "/modular-hospitality", title: t("heroHeadline"), description: t("whatItMeansTitle") });
}

export default async function ModularHospitalityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("modularHospitality");
  const tNav = await getTranslations("nav");
  const faq = t.raw("faq") as Array<{ q: string; a: string }>;

  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("modularHospitality"), path: `/${locale}/modular-hospitality` },
        ])}
      />
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <Reveal>
            <Breadcrumbs
              items={[
                { label: tNav("home"), href: "/" },
                { label: tNav("modularHospitality"), href: "/modular-hospitality" },
              ]}
            />
            <h1 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
            <ButtonLink href="/contact" size="lg" className="mt-8">
              {t("cta")}
            </ButtonLink>
          </Reveal>
          <Reveal delayMs={80}>
            <AscentMotif locale={locale} className="max-w-md justify-self-center lg:justify-self-end" />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Reveal>
            <OutcomeCard title={t("whatItMeansTitle")} body={faq[0]?.a ?? ""} className="hover-lift h-full" />
          </Reveal>
          <Reveal delayMs={80}>
            <OutcomeCard title={t("whatItDoesNotMeanTitle")} body={faq[1]?.a ?? ""} className="hover-lift h-full" />
          </Reveal>
          <Reveal delayMs={160}>
            <OutcomeCard title={t("whereItWorksTitle")} body={faq[2]?.a ?? ""} className="hover-lift h-full" />
          </Reveal>
          <Reveal delayMs={240}>
            <OutcomeCard title={t("scaleTitle")} body={faq[3]?.a ?? ""} className="hover-lift h-full" />
          </Reveal>
        </div>
      </section>

      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title={t("faqTitle")} align="center" />
          </Reveal>
          <dl className="mt-10 space-y-6">
            {faq.map((item, i) => (
              <Reveal key={i} delayMs={i * 60}>
                <div className="rounded-lg border border-grey-200 bg-stone-050 p-6">
                  <dt className="font-semibold text-navy-900">{item.q}</dt>
                  <dd className="mt-2 text-sm text-slate">{item.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
