import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { env } from "@/lib/env";

// Grouped by audience (competitor synthesis §b.5 - see
// docs/competitor-analysis.md) rather than one flat list, and also fixes a
// real bug: the legal-entity-name column previously reused the same
// "legal" header as the Privacy/Terms column.
const COMPANY_LINKS = [
  { href: "/about", key: "about" },
  { href: "/development-model", key: "developmentModel" },
  { href: "/services", key: "services" },
  { href: "/careers", key: "careers" },
] as const;

const OPPORTUNITIES_LINKS = [
  { href: "/opportunities", key: "opportunities" },
  { href: "/landowners", key: "landowners" },
  { href: "/partnerships", key: "partnerships" },
  { href: "/investors", key: "investors" },
] as const;

const PROOF_LINKS = [
  { href: "/projects", key: "projects" },
  { href: "/insights", key: "insights" },
  { href: "/news", key: "news" },
] as const;

export async function Footer({ logoUrl }: { logoUrl?: string | null }) {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();
  const waNumber = env.whatsappNumber;

  return (
    <footer className="border-t border-navy-800 bg-navy-900 text-stone-050">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route, not an optimizable remote image
            <img src={logoUrl} alt="Dyafa Development" className="h-16 w-auto object-contain" />
          ) : (
            <p className="text-lg font-bold">Dyafa Development</p>
          )}
          <p className="mt-2 text-sm text-teal-100">{t("tagline")}</p>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-teal-300 hover:text-teal-100"
            >
              {t("whatsapp")}
            </a>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-grey-400">{t("companyTitle")}</p>
          <ul className="mt-3 space-y-2">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-stone-050/90 hover:text-teal-300">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-grey-400">{t("opportunitiesTitle")}</p>
          <ul className="mt-3 space-y-2">
            {OPPORTUNITIES_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-stone-050/90 hover:text-teal-300">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-grey-400">{t("projectsInsightsTitle")}</p>
          <ul className="mt-3 space-y-2">
            {PROOF_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-stone-050/90 hover:text-teal-300">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-grey-400">{t("legal")}</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/privacy" className="text-sm text-stone-050/90 hover:text-teal-300">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-stone-050/90 hover:text-teal-300">
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-stone-050/90 hover:text-teal-300">
                {t("contact")}
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs text-stone-050/60">{t("legalName")}</p>
        </div>
      </div>

      <div className="border-t border-navy-800 px-4 py-4 text-center text-xs text-stone-050/60 sm:px-6 lg:px-8">
        © {year} {t("legalName")}. {t("rights")}
      </div>
    </footer>
  );
}
