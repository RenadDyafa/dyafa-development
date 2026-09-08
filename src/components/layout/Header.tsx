"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MegaMenu } from "./MegaMenu";
import { SearchOverlay } from "./SearchOverlay";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const DIRECT_LINKS = [
  { href: "/about", key: "about" },
  { href: "/careers", key: "careers" },
  { href: "/contact", key: "contact" },
] as const;

const MOBILE_GROUPS = [
  { href: "/about", key: "about" },
  { href: "/development-model", key: "developmentModel" },
  { href: "/modular-hospitality", key: "modularHospitality" },
  { href: "/services", key: "services" },
  { href: "/opportunities", key: "opportunities" },
  { href: "/landowners", key: "landowners" },
  { href: "/partnerships", key: "partnerships" },
  { href: "/investors", key: "investors" },
  { href: "/projects", key: "projects" },
  { href: "/insights", key: "insights" },
  { href: "/news", key: "news" },
  { href: "/careers", key: "careers" },
  { href: "/contact", key: "contact" },
] as const;

// A transparent-over-hero header was tried in an earlier pass and reverted:
// the header is a DOM sibling of the hero section (not a descendant it
// visually overlaps via layout), so "transparent" text rendered directly on
// the page's light body background instead of the dark hero — a confirmed
// serious color-contrast a11y regression (axe-core color-contrast, both
// locales), not a false positive. This header stays a genuinely solid bar
// (never relying on what's behind it for contrast) — it's just solid dark
// now, matching the official brand's own dark-first presentation (see
// logo/), which happens to blend seamlessly into the homepage's own dark
// hero without reintroducing that risk.
export function Header({ logoUrl }: { logoUrl?: string | null }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Elevation-on-scroll only - no transparent-over-hero state. That exact
  // pattern was tried and reverted (see below): the header is a DOM sibling
  // of the hero, not a visual overlay of it, so "transparent" produced a
  // confirmed axe-core color-contrast failure. A subtle shadow once
  // scrolled still reads as a more premium, production-polished sticky nav
  // without reintroducing that risk.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b border-navy-800 bg-navy-900/95 backdrop-blur transition-shadow"
      style={{ transitionDuration: "var(--duration-base)", boxShadow: scrolled ? "var(--elev-1)" : "none" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center text-lg font-bold tracking-tight text-stone-050">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route, not an optimizable remote image
            <img src={logoUrl} alt="Dyafa Development" className="h-16 w-auto object-contain" />
          ) : (
            <>
              Dyafa <span className="text-teal-300">Development</span>
            </>
          )}
        </Link>

        <MegaMenu />

        <nav className="hidden items-center gap-4 lg:flex" aria-label={t("menu")}>
          {DIRECT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-stone-050/80 transition-colors hover:text-teal-300",
                pathname === item.href && "text-teal-300",
              )}
              style={{ transitionDuration: "var(--duration-fast)" }}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <SearchOverlay tone="dark" />
          <LocaleSwitcher tone="dark" />
          <ButtonLink href="/submit-your-site" size="md">
            {t("submitSite")}
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-stone-050 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? t("closeMenu") : t("menu")}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="max-h-[70vh] overflow-y-auto border-t border-grey-100 bg-stone-050 px-4 py-4 lg:hidden" aria-label={t("menu")}>
          <ul className="flex flex-col gap-3">
            {MOBILE_GROUPS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="text-base font-medium text-navy-900">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <LocaleSwitcher />
            <ButtonLink href="/submit-your-site" size="md" onClick={() => setOpen(false)}>
              {t("submitSite")}
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
