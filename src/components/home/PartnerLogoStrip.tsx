import { getTranslations } from "next-intl/server";
import { getActivePartners } from "@/lib/partners/service";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function PartnerLogoStrip({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("home");
  const partners = await getActivePartners(locale);
  if (partners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title={t("partnersTitle")} align="center" />
      <div className="mt-10 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {partners.map((partner) => (
          <div key={partner.id} className="flex h-16 items-center justify-center grayscale transition hover:grayscale-0">
            {partner.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
              <img src={partner.logoUrl} alt={partner.name} className="max-h-12 w-auto object-contain" />
            ) : (
              <span className="text-sm font-medium text-slate">{partner.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
