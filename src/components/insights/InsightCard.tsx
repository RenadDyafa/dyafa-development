import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { InsightSummary } from "@/lib/insights/service";

export function InsightCard({
  insight,
}: {
  insight: InsightSummary;
  locale: "en" | "ar";
}) {
  return (
    <article className="flex flex-col rounded-lg border border-grey-200 bg-stone-050 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{insight.pillarName}</p>
      <h3 className="mt-2 text-lg font-semibold text-navy-900">
        <Link href={`/insights/${insight.slug}`} className="hover:text-teal-600">
          {insight.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate">{insight.excerpt}</p>
      <ReadMoreLink slug={insight.slug} />
    </article>
  );
}

function ReadMoreLink({ slug }: { slug: string }) {
  const t = useTranslations("common");
  return (
    <Link href={`/insights/${slug}`} className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700">
      {t("readMore")}
    </Link>
  );
}
