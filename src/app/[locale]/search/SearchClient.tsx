"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SearchResult } from "@/lib/search/service";

const DETAIL_PATH: Record<SearchResult["type"], string | null> = {
  insight: "/insights",
  project: "/projects",
  opportunity: "/opportunities",
  news: "/news",
  faq: null,
};

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const t = useTranslations("search");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json) => setResults(json.data?.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, locale]);

  return (
    <div>
      <label htmlFor="search-input" className="sr-only">
        {t("title")}
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full rounded-md border border-grey-200 px-4 py-3 text-base"
        autoFocus
      />

      <div className="mt-8">
        {loading && <Skeleton variant="text" count={4} />}
        {!loading && results && results.length === 0 && <p className="text-sm text-slate">{t("noResults")}</p>}
        {!loading && results && results.length > 0 && (
          <ul className="space-y-4">
            {results.map((r) => {
              const href = DETAIL_PATH[r.type];
              const content = (
                <>
                  <div className="flex items-center gap-2">
                    <Badge tone="teal">{t(`typeLabels.${r.type}`)}</Badge>
                  </div>
                  <p className="mt-1 font-semibold text-navy-900">{r.title}</p>
                  <p className="mt-1 text-sm text-slate">{r.excerpt}</p>
                </>
              );
              return (
                <li key={`${r.type}-${r.slug}`} className="rounded-lg border border-grey-200 bg-stone-050 p-4">
                  {href ? (
                    <Link href={`${href}/${r.slug}`} className="block hover:text-teal-600">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
