import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewProjectForm } from "@/components/admin/NewProjectForm";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Projects</h1>
      <p className="mt-1 text-sm text-grey-600">
        A project appears on /projects and the homepage showcase once it is published through the workflow below.
      </p>

      <div className="mt-6 max-w-lg">
        <NewProjectForm />
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Name</th>
            <th className="py-2 text-start">Stage</th>
            <th className="py-2 text-start">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-grey-100">
              <td className="py-2">
                <Link href={`/admin/content/projects/${p.id}`} className="font-medium text-teal-600 hover:underline">
                  {p.nameEn}
                </Link>
              </td>
              <td className="py-2">{p.stage}</td>
              <td className="py-2">
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{p.status}</span>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-grey-500">
                No projects yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const dynamic = "force-dynamic";
