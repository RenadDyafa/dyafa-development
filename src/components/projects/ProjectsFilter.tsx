"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type Item = { city: string | null; node: ReactNode };

/**
 * Client-side city filter over server-rendered ProjectCards - the cards
 * themselves stay server components (each does its own getTranslations
 * call), passed in already-rendered as `items[].node`; this component only
 * decides which of them to show. Simple show/hide, no re-fetch, since the
 * full (small) project list is already on the page.
 */
export function ProjectsFilter({ items, cities }: { items: Item[]; cities: string[] }) {
  const t = useTranslations("projects");
  const [active, setActive] = useState<string | null>(null);

  const filtered = active === null ? items : items.filter((i) => i.city === active);

  return (
    <div>
      {cities.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={t("filterByCity")}>
          <button
            type="button"
            onClick={() => setActive(null)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === null ? "border-navy-900 bg-navy-900 text-stone-050" : "border-grey-200 text-navy-900 hover:border-navy-900",
            )}
            style={{ transitionDuration: "var(--duration-fast)" }}
            aria-pressed={active === null}
          >
            {t("filterAll")}
          </button>
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setActive(city)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active === city ? "border-navy-900 bg-navy-900 text-stone-050" : "border-grey-200 text-navy-900 hover:border-navy-900",
              )}
              style={{ transitionDuration: "var(--duration-fast)" }}
              aria-pressed={active === city}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, i) => (
          <div key={i}>{item.node}</div>
        ))}
      </div>
    </div>
  );
}
