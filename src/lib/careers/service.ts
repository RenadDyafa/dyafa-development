import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function getActiveJobPostings() {
  try {
    return await prisma.jobPosting.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
  } catch (error) {
    logger.error({ error }, "getActiveJobPostings failed");
    return [];
  }
}

export async function getJobPostingBySlug(slug: string) {
  try {
    return await prisma.jobPosting.findFirst({ where: { slug, active: true } });
  } catch (error) {
    logger.error({ error }, "getJobPostingBySlug failed");
    return null;
  }
}
