import { prisma } from "@/lib/prisma";
import { FactsManager } from "@/components/admin/FactsManager";

export default async function AdminFactsPage() {
  const facts = await prisma.approvedFact.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Approved facts registry</h1>
      <div className="mt-6">
        <FactsManager facts={facts.map((f) => ({ ...f, approvedAt: f.approvedAt ? f.approvedAt.toISOString() : null }))} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
