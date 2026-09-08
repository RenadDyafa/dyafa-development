import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { getCapabilityTiles } from "@/lib/settings/capabilityTiles";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A 4-tile photo+caption row just below the hero, used as visual site-map
 * navigation (inspired by Red Sea Global's "Services / Portfolio / Invest"
 * row - see docs/competitor-analysis.md). Reflows 4 -> 2 -> 1 across
 * breakpoints. Tile photos/links are admin-editable via Settings
 * (home_capability_tiles); captions stay in next-intl like every other
 * homepage section's copy.
 */
export async function CapabilityTileRow() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tiles = await getCapabilityTiles();
  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <Reveal key={tile.key} delayMs={i * 80}>
            <Link
              href={tile.href}
              className="group hover-lift relative block h-64 overflow-hidden rounded-lg bg-navy-800"
            >
              {tile.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
                <img
                  src={tile.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/30 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-bold text-stone-050">{t(`capabilityTiles.${tile.key}.title`)}</h3>
                <p className="mt-1 text-sm text-teal-100">{t(`capabilityTiles.${tile.key}.body`)}</p>
                <p
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-stone-050 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ transitionDuration: "var(--duration-base)" }}
                >
                  {tCommon("learnMore")}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1" style={{ transitionDuration: "var(--duration-base)" }}>
                    →
                  </span>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
