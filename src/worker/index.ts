import { prisma } from "@/lib/prisma";
import { processPendingEmailJobs, enqueueEmail } from "@/lib/mail/queue";
import { dailyDigestEmail } from "@/lib/mail/templates";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const POLL_INTERVAL_MS = 30_000;
const DIGEST_SETTING_KEY = "last_digest_sent_at";

async function runDailyDigestIfDue() {
  const setting = await prisma.setting.findUnique({ where: { key: DIGEST_SETTING_KEY } });
  const lastSent = setting?.valueJson ? new Date(setting.valueJson as string) : null;
  const now = new Date();

  if (lastSent && now.getTime() - lastSent.getTime() < 24 * 60 * 60 * 1000) {
    return;
  }

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const leads = await prisma.lead.findMany({ where: { createdAt: { gte: since } } });
  if (leads.length === 0) {
    await prisma.setting.upsert({
      where: { key: DIGEST_SETTING_KEY },
      update: { valueJson: now.toISOString() },
      create: { key: DIGEST_SETTING_KEY, valueJson: now.toISOString() },
    });
    return;
  }

  const counts: Record<string, number> = {};
  for (const lead of leads) counts[lead.type] = (counts[lead.type] ?? 0) + 1;

  const { subject, html } = dailyDigestEmail(counts, leads.length);
  await enqueueEmail({ to: env.bdNotificationEmails, subject, template: "daily-digest", data: { count: leads.length }, html });

  await prisma.setting.upsert({
    where: { key: DIGEST_SETTING_KEY },
    update: { valueJson: now.toISOString() },
    create: { key: DIGEST_SETTING_KEY, valueJson: now.toISOString() },
  });

  logger.info({ count: leads.length }, "daily digest sent");
}

async function tick() {
  try {
    const result = await processPendingEmailJobs();
    if (result.processed > 0) {
      logger.info(result, "email queue processed");
    }
    await runDailyDigestIfDue();
  } catch (error) {
    logger.error({ error }, "worker tick failed");
  }
}

async function main() {
  logger.info("worker started");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main();
