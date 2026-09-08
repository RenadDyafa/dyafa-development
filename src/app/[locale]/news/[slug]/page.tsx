import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { getNewsBySlug } from "@/lib/news/service";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!env.featureNews) return buildMetadata({ locale, path: `/news/${slug}`, title: "News", description: "", noIndex: true });

  const newsItem = await getNewsBySlug(slug, locale as "en" | "ar");
  if (!newsItem) return buildMetadata({ locale, path: `/news/${slug}`, title: "News", description: "", noIndex: true });

  const title = locale === "ar" ? newsItem.titleAr : newsItem.titleEn;
  const excerpt = locale === "ar" ? newsItem.excerptAr : newsItem.excerptEn;
  return buildMetadata({ locale, path: `/news/${slug}`, title, description: excerpt });
}

function newsArticleJsonLd({ title, description, url, datePublished }: { title: string; description: string; url: string; datePublished: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    url,
    datePublished: datePublished ?? undefined,
    publisher: { "@type": "Organization", name: "Dyafa Development" },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!env.featureNews) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const tNav = await getTranslations("nav");

  const newsItem = await getNewsBySlug(slug, locale as "en" | "ar");
  if (!newsItem) notFound();

  const title = locale === "ar" ? newsItem.titleAr : newsItem.titleEn;
  const body = locale === "ar" ? newsItem.bodyAr : newsItem.bodyEn;
  const excerpt = locale === "ar" ? newsItem.excerptAr : newsItem.excerptEn;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={newsArticleJsonLd({
          title,
          description: excerpt,
          url: `${env.siteUrl}/${locale}/news/${slug}`,
          datePublished: newsItem.publishedAt?.toISOString() ?? null,
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("news"), path: `/${locale}/news` },
          { name: title, path: `/${locale}/news/${slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("news"), href: "/news" },
          { label: title, href: `/news/${slug}` },
        ]}
      />
      <Badge tone={newsItem.type === "milestone" ? "bronze" : "teal"} className="mt-4">
        {t(`typeLabels.${newsItem.type}`)}
      </Badge>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">{title}</h1>
      <div className="prose prose-slate mt-8 max-w-none whitespace-pre-line text-slate">{body}</div>
    </article>
  );
}

export const dynamic = "force-dynamic";
