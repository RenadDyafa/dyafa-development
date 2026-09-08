import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { routing } from "@/lib/i18n/routing";

const STATIC_PATHS = [
  "",
  "/about",
  "/development-model",
  "/modular-hospitality",
  "/services",
  "/partnerships",
  "/insights",
  "/landowners",
  "/investors",
  "/submit-your-site",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${env.siteUrl}/${locale}${path}`,
        alternates: {
          languages: Object.fromEntries(routing.locales.map((l) => [l, `${env.siteUrl}/${l}${path}`])),
        },
      });
    }
  }

  // /projects, /opportunities, /news, /careers are each deliberately
  // excluded while their feature flag is off (FEATURES §5 coming-soon
  // pattern) - noIndex on the page itself, and never listed here either.
  if (env.featureProjects) {
    for (const locale of routing.locales) {
      entries.push({ url: `${env.siteUrl}/${locale}/projects` });
    }
  }
  if (env.featureOpportunities) {
    for (const locale of routing.locales) {
      entries.push({ url: `${env.siteUrl}/${locale}/opportunities` });
    }
  }
  if (env.featureNews) {
    for (const locale of routing.locales) {
      entries.push({ url: `${env.siteUrl}/${locale}/news` });
    }
  }
  if (env.featureCareers) {
    for (const locale of routing.locales) {
      entries.push({ url: `${env.siteUrl}/${locale}/careers` });
    }
  }

  try {
    const insights = await prisma.insight.findMany({ where: { status: "published" }, select: { slugEn: true, slugAr: true } });
    for (const insight of insights) {
      entries.push({ url: `${env.siteUrl}/en/insights/${insight.slugEn}` });
      entries.push({ url: `${env.siteUrl}/ar/insights/${insight.slugAr}` });
    }

    if (env.featureOpportunities) {
      const opportunities = await prisma.opportunity.findMany({ where: { workflowState: "published" }, select: { slugEn: true, slugAr: true } });
      for (const o of opportunities) {
        entries.push({ url: `${env.siteUrl}/en/opportunities/${o.slugEn}` });
        entries.push({ url: `${env.siteUrl}/ar/opportunities/${o.slugAr}` });
      }
    }

    if (env.featureNews) {
      const newsItems = await prisma.newsItem.findMany({ where: { workflowState: "published" }, select: { slugEn: true, slugAr: true } });
      for (const n of newsItems) {
        entries.push({ url: `${env.siteUrl}/en/news/${n.slugEn}` });
        entries.push({ url: `${env.siteUrl}/ar/news/${n.slugAr}` });
      }
    }
  } catch {
    // DB unavailable during build; static entries above still get emitted.
  }

  return entries;
}
