"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";

// tone="dark" for the sticky header's own (now dark) bar; the default
// light tone still applies inside the header's light mobile-nav panel.
export function LocaleSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === "en" ? "ar" : "en";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium",
        tone === "dark"
          ? "border-stone-050/30 text-stone-050 hover:border-teal-300 hover:text-teal-300"
          : "border-grey-200 text-navy-900 hover:border-teal-500 hover:text-teal-600",
      )}
      lang={nextLocale}
      aria-label={t("switchLanguage")}
    >
      {t("switchLanguage")}
    </button>
  );
}
