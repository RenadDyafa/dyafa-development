import { getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "@/lib/env";
import { getPublishedNews } from "@/lib/news/service";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return buildMetadata({
    locale,
    path: "/news",
    title: env.featureNews ? t("title") : t("comingSoonTitle"),
    description: env.featureNews ? t("subtitle") : t("comingSoonBody"),
    noIndex: !env.featureNews,
  });
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  const newsItems = env.featureNews ? await getPublishedNews({ locale: locale as "en" | "ar" }) : [];

  if (!env.featureNews || newsItems.length === 0) {
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
        {newsItems.map((n, i) => (
          <Reveal key={n.id} delayMs={i * 60}>
            <article className="hover-lift flex h-full flex-col rounded-lg border border-grey-200 bg-stone-050 p-6">
              <Badge tone={n.type === "milestone" ? "bronze" : "teal"}>{t(`typeLabels.${n.type}`)}</Badge>
              <h2 className="mt-3 text-lg font-semibold text-navy-900">
                <Link href={`/news/${n.slug}`} className="hover:text-teal-600">
                  {n.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm text-slate">{n.excerpt}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
