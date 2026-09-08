import type { NextRequest } from "next/server";
import { getInsightBySlug } from "@/lib/insights/service";
import { ok, notFound } from "@/lib/api/response";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const locale = req.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
  const insight = await getInsightBySlug(params.slug, locale);
  if (!insight) return notFound("Insight not found");

  return ok({
    id: insight.id,
    title: locale === "ar" ? insight.titleAr : insight.titleEn,
    body: locale === "ar" ? insight.bodyAr : insight.bodyEn,
    excerpt: locale === "ar" ? insight.excerptAr : insight.excerptEn,
    slug: locale === "ar" ? insight.slugAr : insight.slugEn,
    pillar: locale === "ar" ? insight.pillar.nameAr : insight.pillar.nameEn,
    author: insight.author.name,
    publishedAt: insight.publishedAt,
  });
}
