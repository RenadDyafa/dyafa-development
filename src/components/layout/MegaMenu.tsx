"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";

type Group = {
  key: "exploreDyafa" | "exploreOpportunities" | "exploreProof";
  items: { href: string; key: string }[];
};

const GROUPS: Group[] = [
  {
    key: "exploreDyafa",
    items: [
      { href: "/about", key: "about" },
      { href: "/development-model", key: "developmentModel" },
      { href: "/modular-hospitality", key: "modularHospitality" },
      { href: "/services", key: "services" },
    ],
  },
  {
    key: "exploreOpportunities",
    items: [
      { href: "/opportunities", key: "opportunities" },
      { href: "/landowners", key: "landowners" },
      { href: "/partnerships", key: "partnerships" },
      { href: "/investors", key: "investors" },
    ],
  },
  {
    key: "exploreProof",
    items: [
      { href: "/projects", key: "projects" },
      { href: "/insights", key: "insights" },
      { href: "/news", key: "news" },
    ],
  },
];

/**
 * Click-to-toggle (not hover-only, so touch and keyboard users get
 * identical behavior) mega menu grouped by user intent (design.md §6),
 * not internal departments. Closes on outside-click or Escape.
 */
export function MegaMenu() {
  const t = useTranslations("megaMenu");
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<Group["key"] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenGroup(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenGroup(null);
    }
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="hidden items-center gap-1 lg:flex">
      {GROUPS.map((group) => {
        const isOpen = openGroup === group.key;
        const isActiveGroup = group.items.some((item) => pathname === item.href);
        return (
          <div key={group.key} className="relative">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={() => setOpenGroup(isOpen ? null : group.key)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-stone-050/80 transition-colors hover:text-teal-300",
                isActiveGroup && "text-teal-300",
              )}
            >
              {t(`${group.key}.label`)}
            </button>
            {isOpen && (
              <div
                className="absolute start-0 top-full z-50 mt-2 w-64 rounded-lg border border-grey-200 bg-stone-050 p-2"
                style={{ boxShadow: "var(--elev-2)", animation: "reveal-fade var(--duration-fast) var(--ease-standard) both" }}
              >
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenGroup(null)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium text-navy-900 hover:bg-stone-100",
                      pathname === item.href && "bg-teal-050 text-teal-600",
                    )}
                  >
                    {t(`${group.key}.${item.key}`)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
