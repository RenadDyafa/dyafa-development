import { prisma } from "@/lib/prisma";
import { FaqsManager } from "@/components/admin/FaqsManager";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">FAQs</h1>
      <div className="mt-6">
        <FaqsManager faqs={faqs.map((f) => ({ id: f.id, questionEn: f.questionEn, questionAr: f.questionAr, active: f.active }))} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
