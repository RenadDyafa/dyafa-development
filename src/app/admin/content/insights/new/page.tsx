import { prisma } from "@/lib/prisma";
import { NewInsightForm } from "@/components/admin/NewInsightForm";

export default async function NewInsightPage() {
  const pillars = await prisma.pillar.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">New insight</h1>
      <div className="mt-6 max-w-lg">
        <NewInsightForm pillars={pillars.map((p) => ({ id: p.id, nameEn: p.nameEn }))} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
