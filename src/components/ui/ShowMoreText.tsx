"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * Progressive-disclosure text block (Red Sea Global's mission-statement
 * "show more" pattern - see docs/competitor-analysis.md) - avoids either
 * truncating awkwardly or dumping a wall of text right under the hero.
 */
export function ShowMoreText({ children, className, clampLines = 3 }: { children: string; className?: string; clampLines?: number }) {
  const t = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <p
        className={cn(!expanded && "overflow-hidden")}
        style={!expanded ? { display: "-webkit-box", WebkitLineClamp: clampLines, WebkitBoxOrient: "vertical" } : undefined}
      >
        {children}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm font-medium text-teal-600 hover:text-navy-800"
      >
        {expanded ? t("showLess") : t("showMore")}
      </button>
    </div>
  );
}
