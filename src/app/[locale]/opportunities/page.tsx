import { getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "@/lib/env";
import { getPublishedOpportunities } from "@/lib/opportunities/service";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "opportunities" });
  return buildMetadata({
    locale,
    path: "/opportunities",
    title: env.featureOpportunities ? t("title") : t("comingSoonTitle"),
    description: env.featureOpportunities ? t("subtitle") : t("comingSoonBody"),
    noIndex: !env.featureOpportunities,
  });
}

export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("opportunities");

  const opportunities = env.featureOpportunities
    ? await getPublishedOpportunities({ locale: locale as "en" | "ar" })
    : [];

  if (!env.featureOpportunities || opportunities.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy-900">{t("comingSoonTitle")}</h1>
        <p className="mt-4 text-slate">{t("comingSoonBody")}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-slate">{t("subtitle")}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((o, i) => (
          <Reveal key={o.id} delayMs={i * 60}>
            <article className="hover-lift flex h-full flex-col rounded-lg border border-grey-200 bg-stone-050 p-6">
              <div className="flex items-center gap-2">
                <Badge tone="bronze">{t(`typeLabels.${o.type}`)}</Badge>
                <Badge tone={o.status === "open" ? "teal" : "neutral"}>{t(`statusLabels.${o.status}`)}</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-navy-900">
                <Link href={`/opportunities/${o.slug}`} className="hover:text-teal-600">
                  {o.title}
                </Link>
              </h2>
              {o.city && <p className="mt-1 text-sm text-grey-600">{o.city}</p>}
              <p className="mt-2 flex-1 text-sm text-slate">{o.summary}</p>
              <Link href={`/opportunities/${o.slug}`} className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700">
                {t("viewCta")}
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
