import { prisma } from "@/lib/prisma";
import { TeamManager } from "@/components/admin/TeamManager";

export default async function AdminTeamPage() {
  const teamMembers = await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Leadership &amp; Team</h1>
      <div className="mt-6">
        <TeamManager
          teamMembers={teamMembers.map((m) => ({
            id: m.id,
            nameEn: m.nameEn,
            nameAr: m.nameAr,
            roleEn: m.roleEn,
            roleAr: m.roleAr,
            active: m.active,
            approvedAt: m.approvedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
