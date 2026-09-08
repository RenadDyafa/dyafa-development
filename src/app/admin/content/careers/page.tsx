import { prisma } from "@/lib/prisma";
import { CareersManager } from "@/components/admin/CareersManager";

export default async function AdminCareersPage() {
  const jobPostings = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Careers</h1>
      <div className="mt-6">
        <CareersManager
          jobPostings={jobPostings.map((j) => ({
            id: j.id,
            titleEn: j.titleEn,
            titleAr: j.titleAr,
            employmentType: j.employmentType,
            active: j.active,
          }))}
        />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
