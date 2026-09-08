import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/lib/i18n/routing";
import { montserrat, almarai } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UtmCapture } from "@/components/analytics/UtmCapture";
import { env } from "@/lib/env";
import { getSiteLogos } from "@/lib/settings/logo";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: "Dyafa Development | ضيافة للتطوير",
      template: "%s | Dyafa Development",
    },
    description: t("heroHeadline"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, logos] = await Promise.all([getMessages(), getSiteLogos()]);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${montserrat.variable} ${almarai.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <UtmCapture />
          <a href="#main-content" className="skip-link">
            {locale === "ar" ? "الانتقال إلى المحتوى" : "Skip to content"}
          </a>
          <Header logoUrl={logos.header?.url ?? null} />
          <main id="main-content">{children}</main>
          <Footer logoUrl={logos.footer?.url ?? null} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
