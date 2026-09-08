import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OutcomeCard } from "@/components/ui/OutcomeCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const BENEFIT_KEYS = ["siteContext", "assetFit", "structures", "nextSteps"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landowners" });
  return buildMetadata({ locale, path: "/landowners", title: t("heroHeadline"), description: t("heroBody") });
}

export default async function LandownersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landowners");
  const tNav = await getTranslations("nav");

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("landowners"), path: `/${locale}/landowners` },
        ])}
      />
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("landowners"), href: "/landowners" },
            ]}
          />
          <h1 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
          <p className="mt-4 text-base text-slate">{t("heroBody")}</p>
          <ButtonLink href="/submit-your-site" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title={t("benefitsTitle")} align="center" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFIT_KEYS.map((key, i) => (
            <Reveal key={key} delayMs={i * 80}>
              <OutcomeCard title={t(`benefits.${key}.title`)} body={t(`benefits.${key}.body`)} className="hover-lift h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-16 text-stone-050">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("processTitle")}</h2>
          <ButtonLink href="/submit-your-site" variant="secondary" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
