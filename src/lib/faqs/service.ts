import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function getActiveFaqs(category?: string) {
  try {
    return await prisma.faq.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: { displayOrder: "asc" },
    });
  } catch (error) {
    logger.error({ error }, "getActiveFaqs failed");
    return [];
  }
}
