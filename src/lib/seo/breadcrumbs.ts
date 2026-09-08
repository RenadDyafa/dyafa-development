import { env } from "@/lib/env";
import { breadcrumbJsonLd } from "./metadata";

export type BreadcrumbSeoItem = { name: string; path: string };

/**
 * Builds BreadcrumbList JSON-LD from locale-relative paths (e.g. "/en",
 * "/en/opportunities"), resolving them to absolute URLs against
 * env.siteUrl — the shape every new page (Opportunities, Landowners,
 * Investors, News, Careers) uses for its trail.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbSeoItem[]) {
  return breadcrumbJsonLd(
    items.map((item) => ({
      name: item.name,
      url: `${env.siteUrl}${item.path}`,
    })),
  );
}
