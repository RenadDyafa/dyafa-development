import { getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPublishedProjects } from "@/lib/projects/service";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectsFilter } from "@/components/projects/ProjectsFilter";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return buildMetadata({
    locale,
    path: "/projects",
    title: t("comingSoonTitle"),
    description: t("comingSoonBody"),
    noIndex: !env.featureProjects,
  });
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const tHome = await getTranslations("home");
  const localeTyped = locale as "en" | "ar";

  const projects = env.featureProjects ? await getPublishedProjects({ locale: localeTyped }) : [];

  if (projects.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy-900">{t("comingSoonTitle")}</h1>
        <p className="mt-4 text-slate">{t("comingSoonBody")}</p>
      </section>
    );
  }

  const cities = Array.from(new Set(projects.map((p) => p.city).filter((c): c is string => Boolean(c))));

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="sr-only">{tHome("propertiesTitle")}</h1>
      <Reveal>
        <SectionHeading title={tHome("propertiesTitle")} subtitle={tHome("propertiesSubtitle")} />
      </Reveal>
      <div className="mt-10">
        <ProjectsFilter
          cities={cities}
          items={projects.map((project, i) => ({
            city: project.city,
            node: (
              <Reveal delayMs={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ),
          }))}
        />
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
