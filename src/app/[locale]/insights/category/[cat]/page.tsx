import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublishedInsights } from "@/lib/insights/service";
import { InsightCard } from "@/components/insights/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; cat: string }> }) {
  const { locale, cat } = await params;
  const pillar = await prisma.pillar.findUnique({ where: { key: cat } });
  const name = pillar ? (locale === "ar" ? pillar.nameAr : pillar.nameEn) : cat;
  return buildMetadata({ locale, path: `/insights/category/${cat}`, title: name, description: name });
}

export default async function InsightCategoryPage({ params }: { params: Promise<{ locale: string; cat: string }> }) {
  const { locale, cat } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const pillar = await prisma.pillar.findUnique({ where: { key: cat } });
  if (!pillar) notFound();

  const insights = await getPublishedInsights({ locale: locale as "en" | "ar", limit: 24, pillarKey: cat });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">{locale === "ar" ? pillar.nameAr : pillar.nameEn}</h1>
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
