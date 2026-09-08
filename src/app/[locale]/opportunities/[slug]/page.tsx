import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { getOpportunityBySlug } from "@/lib/opportunities/service";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!env.featureOpportunities) return buildMetadata({ locale, path: `/opportunities/${slug}`, title: "Opportunity", description: "", noIndex: true });

  const opportunity = await getOpportunityBySlug(slug, locale as "en" | "ar");
  if (!opportunity) return buildMetadata({ locale, path: `/opportunities/${slug}`, title: "Opportunity", description: "", noIndex: true });

  const title = locale === "ar" ? opportunity.titleAr : opportunity.titleEn;
  const summary = locale === "ar" ? opportunity.publicSummaryAr : opportunity.publicSummaryEn;
  return buildMetadata({ locale, path: `/opportunities/${slug}`, title, description: summary });
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!env.featureOpportunities) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("opportunities");
  const tNav = await getTranslations("nav");

  const opportunity = await getOpportunityBySlug(slug, locale as "en" | "ar");
  if (!opportunity) notFound();

  const title = locale === "ar" ? opportunity.titleAr : opportunity.titleEn;
  const summary = locale === "ar" ? opportunity.publicSummaryAr : opportunity.publicSummaryEn;
  const demandDrivers = locale === "ar" ? opportunity.demandDriversAr : opportunity.demandDriversEn;
  const proposedProduct = locale === "ar" ? opportunity.proposedProductAr : opportunity.proposedProductEn;
  const partnershipModels = locale === "ar" ? opportunity.partnershipModelsAr : opportunity.partnershipModelsEn;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("opportunities"), path: `/${locale}/opportunities` },
          { name: title, path: `/${locale}/opportunities/${slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("opportunities"), href: "/opportunities" },
          { label: title, href: `/opportunities/${slug}` },
        ]}
      />

      <div className="mt-4 flex items-center gap-2">
        <Badge tone="bronze">{t(`typeLabels.${opportunity.type}`)}</Badge>
        <Badge tone={opportunity.status === "open" ? "teal" : "neutral"}>{t(`statusLabels.${opportunity.status}`)}</Badge>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">{title}</h1>
      {opportunity.city && <p className="mt-1 text-sm text-grey-600">{opportunity.city}{opportunity.region ? `, ${opportunity.region}` : ""}</p>}

      <p className="mt-8 whitespace-pre-line text-base text-slate">{summary}</p>

      {demandDrivers && (
        <div className="mt-8 border-t border-grey-200 pt-8">
          <h2 className="text-lg font-semibold text-navy-900">{t("demandDriversTitle")}</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate">{demandDrivers}</p>
        </div>
      )}

      {proposedProduct && (
        <div className="mt-8 border-t border-grey-200 pt-8">
          <h2 className="text-lg font-semibold text-navy-900">{t("proposedProductTitle")}</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate">{proposedProduct}</p>
        </div>
      )}

      {partnershipModels && (
        <div className="mt-8 border-t border-grey-200 pt-8">
          <h2 className="text-lg font-semibold text-navy-900">{t("partnershipModelsTitle")}</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate">{partnershipModels}</p>
        </div>
      )}

      <div className="mt-12 rounded-lg bg-navy-900 p-8 text-center text-stone-050">
        <ButtonLink href="/submit-your-site" variant="secondary" size="lg">
          {t("cta")}
        </ButtonLink>
      </div>
    </article>
  );
}

export const dynamic = "force-dynamic";
