import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkflowStatusBar } from "@/components/admin/WorkflowStatusBar";
import { TransitionDialog } from "@/components/admin/TransitionDialog";

export default async function AdminPageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">{page.key}</h1>
      <p className="mt-1 text-sm text-grey-600">Template: {page.template}</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-grey-500">Audience</dt>
          <dd>{page.audience}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Objective</dt>
          <dd>{page.objective}</dd>
        </div>
        <div>
          <dt className="text-grey-500">CTA</dt>
          <dd>{page.cta}</dd>
        </div>
        <div>
          <dt className="text-grey-500">Risk level</dt>
          <dd>{page.riskLevel}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <WorkflowStatusBar state={page.status} />
      </div>
      <div className="mt-6">
        <TransitionDialog entity="page" entityId={page.id} state={page.status} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
