import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getInsightBySlug, getPublishedInsights } from "@/lib/insights/service";
import { InsightCard } from "@/components/insights/InsightCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, articleJsonLd } from "@/lib/seo/metadata";
import { env } from "@/lib/env";
import { verifyPreviewToken } from "@/lib/admin/preview";
import { readingTimeMinutes } from "@/lib/insights/readingTime";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const insight = await getInsightBySlug(slug, locale as "en" | "ar");
  if (!insight) return buildMetadata({ locale, path: `/insights/${slug}`, title: "Insight", description: "", noIndex: true });

  const title = locale === "ar" ? insight.titleAr : insight.titleEn;
  const excerpt = locale === "ar" ? insight.excerptAr : insight.excerptEn;
  return buildMetadata({ locale, path: `/insights/${slug}`, title, description: excerpt, noIndex: insight.status !== "published" });
}

export default async function InsightDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale, slug } = await params;
  const { preview } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const tCommon = await getTranslations("common");

  // Preview mode: a signed, non-indexed link lets reviewers see draft
  // content before it clears the compliance gate and is published.
  let insight = await getInsightBySlug(slug, locale as "en" | "ar");
  if (!insight && preview) {
    const draft = await getInsightBySlug(slug, locale as "en" | "ar", { includeUnpublished: true });
    if (draft && verifyPreviewToken(draft.id, preview)) insight = draft;
  }
  if (!insight) notFound();

  const title = locale === "ar" ? insight.titleAr : insight.titleEn;
  const body = locale === "ar" ? insight.bodyAr : insight.bodyEn;
  const related = (await getPublishedInsights({ locale: locale as "en" | "ar", limit: 4, pillarKey: insight.pillar.key })).filter(
    (i) => i.id !== insight.id,
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={articleJsonLd({
          title,
          description: locale === "ar" ? insight.excerptAr : insight.excerptEn,
          url: `${env.siteUrl}/${locale}/insights/${slug}`,
          datePublished: insight.publishedAt?.toISOString() ?? null,
          authorName: insight.author.name,
        })}
      />
      <p className="text-sm font-semibold text-teal-600">{locale === "ar" ? insight.pillar.nameAr : insight.pillar.nameEn}</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">{title}</h1>
      <p className="mt-2 text-sm text-grey-600">
        {t("by")} {insight.author.name} · {tCommon("minRead", { minutes: readingTimeMinutes(body) })}
      </p>
      <div className="prose prose-slate mt-8 max-w-none whitespace-pre-line text-slate">{body}</div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-grey-200 pt-10">
          <h2 className="text-lg font-semibold text-navy-900">{t("relatedTitle")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.slice(0, 3).map((r) => (
              <InsightCard key={r.id} insight={r} locale={locale as "en" | "ar"} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export const dynamic = "force-dynamic";
