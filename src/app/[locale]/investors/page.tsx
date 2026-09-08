import { getTranslations, setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { RiskMatrix } from "@/components/insights/RiskMatrix";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

const TAB_KEYS = ["thesis", "lifecycle", "governance", "riskFramework", "partnershipModels"] as const;
const RISK_CATEGORY_KEYS = ["market", "execution", "regulatory", "operating"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "investors" });
  return buildMetadata({ locale, path: "/investors", title: t("heroHeadline"), description: t("heroBody") });
}

export default async function InvestorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("investors");
  const tNav = await getTranslations("nav");

  const items = TAB_KEYS.map((key) => ({
    key,
    label: t(`tabs.${key}.label`),
    content:
      key === "riskFramework" ? (
        <div>
          <h3 className="text-lg font-semibold text-navy-900">{t("tabs.riskFramework.title")}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate">{t("tabs.riskFramework.body")}</p>
          <div className="mt-6 max-w-md">
            <RiskMatrix
              likelihoodLabel={t("tabs.riskFramework.matrixLikelihood")}
              impactLabel={t("tabs.riskFramework.matrixImpact")}
              categories={RISK_CATEGORY_KEYS.map((k) => ({
                key: k,
                title: t(`tabs.riskFramework.categories.${k}.title`),
                mitigation: t(`tabs.riskFramework.categories.${k}.mitigation`),
              }))}
            />
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-navy-900">{t(`tabs.${key}.title`)}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate">{t(`tabs.${key}.body`)}</p>
        </div>
      ),
  }));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: tNav("home"), path: `/${locale}` },
          { name: tNav("investors"), path: `/${locale}/investors` },
        ])}
      />
      <section className="border-b border-grey-100 bg-stone-050 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("investors"), href: "/investors" },
            ]}
          />
          <h1 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{t("heroHeadline")}</h1>
          <p className="mt-4 text-base text-slate">{t("heroBody")}</p>
          <ButtonLink href="/submit-your-site" size="lg" className="mt-8">
            {t("cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Tabs items={items} />
      </section>
    </>
  );
}
