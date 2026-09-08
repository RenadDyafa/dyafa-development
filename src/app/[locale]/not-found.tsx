import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-teal-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-navy-900">{t("title")}</h1>
      <p className="mt-3 text-slate">{t("body")}</p>
      <ButtonLink href="/" className="mt-8">
        {t("cta")}
      </ButtonLink>
    </section>
  );
}
