"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type TabItem = {
  key: string;
  label: string;
  content: React.ReactNode;
};

/**
 * Accessible tablist/tab/tabpanel. Panels are hidden (not unmounted) when
 * inactive, so scroll position and any form state inside a panel survives
 * switching tabs — used by the Investors page (Thesis/Lifecycle/Governance/
 * Risk Framework/Partnership Models) and the Modular Hospitality page.
 */
export function Tabs({ items, defaultKey }: { items: TabItem[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key);
  const baseId = useId();

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-grey-200" aria-label="Sections">
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.key)}
              onKeyDown={(e) => {
                const idx = items.findIndex((i) => i.key === active);
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const dir = e.key === "ArrowRight" ? 1 : -1;
                  const next = items[(idx + dir + items.length) % items.length];
                  if (next) setActive(next.key);
                }
              }}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                selected
                  ? "border-bronze text-navy-900"
                  : "border-transparent text-slate hover:text-navy-900",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          role="tabpanel"
          id={`${baseId}-panel-${item.key}`}
          aria-labelledby={`${baseId}-tab-${item.key}`}
          hidden={item.key !== active}
          className="pt-6"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
