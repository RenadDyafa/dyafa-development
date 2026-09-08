import type { Metadata } from "next";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/constants/brand";

export function buildMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const cleanPath = path === "/" ? "" : path;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${cleanPath}`,
      languages: {
        en: `/en${cleanPath}`,
        ar: `/ar${cleanPath}`,
        "x-default": `/en${cleanPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${env.siteUrl}/${locale}${cleanPath}`,
      locale,
      siteName: "Dyafa Development",
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dyafa Development",
    legalName: BRAND.legalNameEn,
    alternateName: "ضيافة للتطوير",
    url: env.siteUrl,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dyafa Development",
    url: env.siteUrl,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  url,
  datePublished,
  authorName,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string | null;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: datePublished ?? undefined,
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "Dyafa Development" },
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

