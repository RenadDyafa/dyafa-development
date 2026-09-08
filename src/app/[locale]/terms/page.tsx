import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return buildMetadata({ locale, path: "/terms", title: t("title"), description: t("intro") });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as Array<{ title: string; body: string }>;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900">{t("title")}</h1>
      <p className="mt-4 rounded-md bg-teal-050 p-3 text-sm text-teal-600">{t("draftNotice")}</p>
      <p className="mt-6 text-slate">{t("intro")}</p>
      <div className="mt-8 space-y-6">
        {sections.map((s, i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold text-navy-900">{s.title}</h2>
            <p className="mt-2 text-sm text-slate">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
