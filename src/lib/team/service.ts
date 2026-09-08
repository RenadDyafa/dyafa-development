import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function getActiveTeamMembers() {
  try {
    return await prisma.teamMember.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      include: { photoMedia: true },
    });
  } catch (error) {
    logger.error({ error }, "getActiveTeamMembers failed");
    return [];
  }
}
