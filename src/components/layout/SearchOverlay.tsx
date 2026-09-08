"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/lib/cn";

/**
 * Header search trigger + Drawer. Submits straight to the dedicated
 * /search page (which does its own debounced live search) rather than
 * duplicating the fetch/results UI here. tone="dark" for the sticky
 * header's own (now dark) bar; the Drawer's own content stays light
 * regardless, matching the mega menu/mobile-nav panel treatment.
 */
export function SearchOverlay({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("megaMenu");
  const tSearch = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tSearch("title")}
        className={cn(
          "rounded-md p-2",
          tone === "dark" ? "text-stone-050/80 hover:bg-stone-050/10 hover:text-teal-300" : "text-navy-900/80 hover:bg-stone-100 hover:text-teal-600",
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title={tSearch("title")} side="start">
        <form onSubmit={onSubmit}>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-md border border-grey-200 px-4 py-3 text-base"
          />
          <button type="submit" className="mt-4 w-full rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-stone-050 hover:bg-navy-800">
            {t("searchCta")}
          </button>
        </form>
      </Drawer>
    </>
  );
}
