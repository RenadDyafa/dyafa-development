import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteReviewForm } from "@/components/forms/SiteReviewForm";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submitYourSite" });
  return buildMetadata({ locale, path: "/submit-your-site", title: t("heroHeadline"), description: t("heroHeadline") });
}

export default async function SubmitYourSitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submitYourSite");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
      <div className="mt-10 rounded-xl border border-grey-200 bg-stone-050 p-6 sm:p-8">
        <SiteReviewForm />
      </div>
    </section>
  );
}
