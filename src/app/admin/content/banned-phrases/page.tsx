import { prisma } from "@/lib/prisma";
import { BannedPhrasesManager } from "@/components/admin/BannedPhrasesManager";

export default async function AdminBannedPhrasesPage() {
  const phrases = await prisma.bannedPhrase.findMany({ orderBy: [{ lang: "asc" }, { phrase: "asc" }] });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Banned phrases</h1>
      <p className="mt-1 text-sm text-grey-600">Legal-owned. Enforced as a hard gate on every content transition.</p>
      <div className="mt-6">
        <BannedPhrasesManager phrases={phrases} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
