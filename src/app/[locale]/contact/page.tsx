import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { TalentForm } from "@/components/forms/TalentForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { env } from "@/lib/env";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({ locale, path: "/contact", title: t("heroHeadline"), description: t("heroHeadline") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
      {env.whatsappNumber && (
        <a href={`https://wa.me/${env.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-teal-600">
          WhatsApp →
        </a>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-xl border border-grey-200 bg-stone-050 p-6 sm:p-8">
          <ContactForm />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-navy-900">{t("talentTitle")}</h2>
          <p className="mt-2 text-sm text-slate">{t("talentBody")}</p>
          <div className="mt-6 rounded-xl border border-grey-200 bg-stone-050 p-6 sm:p-8">
            <TalentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
