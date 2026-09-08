import { getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "@/lib/env";
import { getActiveJobPostings } from "@/lib/careers/service";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { TalentForm } from "@/components/forms/TalentForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  return buildMetadata({ locale, path: "/careers", title: t("title"), description: t("subtitle") });
}

function jobPostingJsonLd(job: { title: string; description: string; employmentType: string; city: string | null; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    employmentType: job.employmentType.toUpperCase(),
    jobLocation: job.city ? { "@type": "Place", address: job.city } : undefined,
    hiringOrganization: { "@type": "Organization", name: "Dyafa Development" },
    url: job.url,
  };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const jobPostings = env.featureCareers ? await getActiveJobPostings() : [];

  return (
    <>
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 text-slate">{t("subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {jobPostings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-grey-200 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-navy-900">{t("comingSoonTitle")}</p>
            <p className="mt-2 text-sm text-slate">{t("comingSoonBody")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobPostings.map((job, i) => {
              const title = locale === "ar" ? job.titleAr : job.titleEn;
              const description = locale === "ar" ? job.descriptionAr : job.descriptionEn;
              return (
                <Reveal key={job.id} delayMs={i * 60}>
                  <JsonLd
                    data={jobPostingJsonLd({
                      title,
                      description,
                      employmentType: job.employmentType,
                      city: job.city,
                      url: `${env.siteUrl}/${locale}/careers`,
                    })}
                  />
                  <article className="hover-lift rounded-lg border border-grey-200 bg-stone-050 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="teal">{t(`employmentTypes.${job.employmentType}`)}</Badge>
                      {job.city && <span className="text-sm text-grey-600">{job.city}</span>}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-navy-900">{title}</h2>
                    {description && <p className="mt-2 text-sm text-slate">{description}</p>}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-stone-100 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-navy-900">{t("generalApplyTitle")}</h2>
          <p className="mt-2 text-sm text-slate">{t("generalApplyBody")}</p>
          <div className="mt-6 rounded-xl border border-grey-200 bg-stone-050 p-6 sm:p-8">
            <TalentForm />
          </div>
        </div>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
