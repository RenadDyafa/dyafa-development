import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OutcomeCard } from "@/components/ui/OutcomeCard";
import { ButtonLink } from "@/components/ui/Button";
import { ShowMoreText } from "@/components/ui/ShowMoreText";
import { buildMetadata } from "@/lib/seo/metadata";
import { getActiveTeamMembers } from "@/lib/team/service";
import { publicStorageUrl } from "@/lib/storage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({ locale, path: "/about", title: t("heroHeadline"), description: t("longDescription") });
}

const ECOSYSTEM_KEYS = ["holding", "hotels", "services", "aqar", "dyafaOne"] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const whatWeAre = t.raw("whatWeAre") as string[];
  const whatWeAreNot = t.raw("whatWeAreNot") as string[];
  const principles = t.raw("principles") as Array<{ title: string; body: string }>;
  const team = await getActiveTeamMembers();

  return (
    <>
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
          <ShowMoreText className="mt-6 text-lg text-slate">{t("longDescription")}</ShowMoreText>
          <ButtonLink href="/contact" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title={t("ecosystemTitle")} align="center" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {ECOSYSTEM_KEYS.map((key) => (
            <OutcomeCard key={key} title={t(`ecosystem.${key}.title`)} body={t(`ecosystem.${key}.body`)} />
          ))}
        </div>
      </section>

      <section className="bg-stone-100 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-xl font-bold text-navy-900">{t("whatWeAreTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {whatWeAre.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900">{t("whatWeAreNotTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {whatWeAreNot.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-grey-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title={t("principlesTitle")} align="center" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <OutcomeCard key={i} title={p.title} body={p.body} />
          ))}
        </div>
      </section>

      {team.length > 0 && (
        <section className="bg-stone-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading title={t("leadershipTitle")} align="center" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => {
                const photoUrl = member.photoMedia ? publicStorageUrl(member.photoMedia.path) : null;
                return (
                  <div key={member.id} className="group hover-lift overflow-hidden rounded-lg border border-grey-200 bg-stone-050">
                    <div className="aspect-square overflow-hidden bg-stone-050">
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
                        <img
                          src={photoUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-grey-500">{locale === "ar" ? member.nameAr : member.nameEn}</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-navy-900">{locale === "ar" ? member.nameAr : member.nameEn}</p>
                      <p className="mt-0.5 text-sm text-slate">{locale === "ar" ? member.roleAr : member.roleEn}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// Renders live, admin-editable team members - without this, Next.js would
// prerender the page once at build time and future roster changes would
// never appear until the next deploy (same reasoning as the homepage).
export const dynamic = "force-dynamic";
