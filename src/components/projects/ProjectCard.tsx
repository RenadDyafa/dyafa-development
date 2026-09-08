import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import type { ProjectSummary } from "@/lib/projects/service";

/**
 * Image-forward project/property card with a hover zoom micro-interaction
 * (inspired by Red Sea Global's card treatment - see
 * docs/competitor-analysis.md), used on both /projects and the homepage
 * "Our Properties" showcase.
 */
export async function ProjectCard({ project }: { project: ProjectSummary }) {
  const t = await getTranslations("projects");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group hover-lift block overflow-hidden rounded-lg border border-grey-200 bg-stone-050"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {project.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
          <img
            src={project.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-grey-500">{project.name}</div>
        )}
        <span className="absolute start-3 top-3 rounded-full bg-stone-050/90 px-2.5 py-1 text-xs font-semibold text-navy-900">
          {project.stage}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-navy-900">{project.name}</h3>
        {project.city && <p className="mt-1 text-sm text-slate">{project.city}</p>}
        <span className="mt-3 inline-block text-sm font-medium text-teal-600 group-hover:text-navy-800">{t("viewProject")}</span>
      </div>
    </Link>
  );
}
