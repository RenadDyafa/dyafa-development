import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OutcomeCard } from "@/components/ui/OutcomeCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MeetingForm } from "@/components/forms/MeetingForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

const MODELS = ["landContribution", "jvSpv", "developmentManagement", "coInvestment", "operatorPartnership"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partnerships" });
  return buildMetadata({ locale, path: "/partnerships", title: t("heroHeadline"), description: t("heroHeadline") });
}

export default async function PartnershipsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("partnerships");
  const tNav = await getTranslations("nav");

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("partnerships"), path: `/${locale}/partnerships` },
        ])}
      />
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("partnerships"), href: "/partnerships" },
            ]}
          />
          <h1 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
          <ButtonLink href="/contact" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading title={t("modelsTitle")} align="center" />
        </Reveal>
        <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map((key, i) => (
            <Reveal key={key} delayMs={i * 80} className={i === MODELS.length - 1 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <OutcomeCard title={t(`models.${key}.title`)} body={t(`models.${key}.body`)} className="hover-lift h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-xl border border-grey-200 bg-stone-050 p-6 sm:p-8">
              <MeetingForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
