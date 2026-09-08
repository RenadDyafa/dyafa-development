import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Users</h1>
      <div className="mt-6">
        <UsersManager users={users} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
