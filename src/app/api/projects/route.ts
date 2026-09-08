import { env } from "@/lib/env";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!env.featureProjects) {
    return ok({ items: [], featureEnabled: false });
  }

  const projects = await prisma.project.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  return ok({ items: projects, featureEnabled: true });
}
