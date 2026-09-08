import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default async function AdminProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { include: { media: true }, orderBy: { displayOrder: "asc" } } },
  });
  if (!project) notFound();

  const { images, ...projectFields } = project;

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{project.nameEn}</h1>
      <div className="mt-6">
        <ProjectEditor project={projectFields} images={images} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
