import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteReviewForm } from "@/components/forms/SiteReviewForm";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { slug, status: "published" } });
  if (!campaign) return buildMetadata({ locale, path: `/campaigns/${slug}`, title: "Campaign", description: "", noIndex: true });

  return buildMetadata({
    locale,
    path: `/campaigns/${slug}`,
    title: campaign.name,
    description: locale === "ar" ? campaign.headlineAr : campaign.headlineEn,
  });
}

export default async function CampaignPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const campaign = await prisma.campaign.findFirst({ where: { slug, status: "published" } });
  if (!campaign) notFound();

  const now = new Date();
  if ((campaign.startsAt && campaign.startsAt > now) || (campaign.endsAt && campaign.endsAt < now)) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">
        {locale === "ar" ? campaign.headlineAr : campaign.headlineEn}
      </h1>
      <div className="mt-10 rounded-xl border border-grey-200 bg-stone-050 p-6 sm:p-8">
        <SiteReviewForm campaignId={campaign.id} />
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
