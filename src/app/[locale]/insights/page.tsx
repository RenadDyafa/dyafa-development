import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublishedInsights } from "@/lib/insights/service";
import { InsightCard } from "@/components/insights/InsightCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return buildMetadata({ locale, path: "/insights", title: t("title"), description: t("subtitle") });
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const insights = await getPublishedInsights({ locale: locale as "en" | "ar", limit: 24 });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-slate">{t("subtitle")}</p>

      <div className="mt-8 max-w-md">
        <NewsletterForm />
      </div>

      <div className="mt-10">
        {insights.length === 0 ? (
          <EmptyState title={t("title")} body={t("subtitle")} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} locale={locale as "en" | "ar"} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
