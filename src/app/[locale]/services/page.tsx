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

const ITEMS = ["siteReview", "feasibility", "investmentStructuring", "developmentManagement", "operatingReadiness"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return buildMetadata({ locale, path: "/services", title: t("heroHeadline"), description: t("processTitle") });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tPartnerships = await getTranslations("partnerships");
  const tNav = await getTranslations("nav");

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("services"), path: `/${locale}/services` },
        ])}
      />
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("services"), href: "/services" },
            ]}
          />
          <h1 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
          <ButtonLink href="/submit-your-site" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading title={t("processTitle")} align="center" />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((key, i) => (
            <Reveal key={key} delayMs={i * 80}>
              <OutcomeCard title={t(`items.${key}.title`)} body={t(`items.${key}.body`)} className="hover-lift h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-16 text-stone-050">
        <Reveal>
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">{t("engagementTitle")}</h2>
            <p className="mt-4 text-teal-100">{tPartnerships("heroHeadline")}</p>
            <ButtonLink href="/partnerships" variant="secondary" size="lg" className="mt-8">
              {tPartnerships("cta")}
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <section className="py-16">
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
