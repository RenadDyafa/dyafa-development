import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo/metadata";
import { getProjectBySlug } from "@/lib/projects/service";
import { ProjectGallery } from "@/components/projects/ProjectGallery";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!env.featureProjects) return buildMetadata({ locale, path: `/projects/${slug}`, title: "Projects", description: "Coming soon", noIndex: true });

  const project = await getProjectBySlug(slug, locale as "en" | "ar");
  if (!project) return buildMetadata({ locale, path: `/projects/${slug}`, title: "Project", description: "", noIndex: true });

  return buildMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.name,
    description: project.summary,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!env.featureProjects) notFound();

  const project = await getProjectBySlug(slug, locale as "en" | "ar");
  if (!project) notFound();

  return (
    <article>
      {project.coverImageUrl && (
        <div className="relative h-[45vh] min-h-[320px] w-full bg-navy-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route */}
          <img src={project.coverImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-teal-600">{project.stage}</p>
        <h1 className="mt-2 text-3xl font-bold text-navy-900">{project.name}</h1>
        {project.city && <p className="mt-1 text-slate">{project.city}</p>}
        <p className="mt-6 text-slate">{project.summary}</p>

        {project.images.length > 0 && (
          <div className="mt-10">
            <ProjectGallery images={project.images} />
          </div>
        )}
      </div>
    </article>
  );
}

export const dynamic = "force-dynamic";
