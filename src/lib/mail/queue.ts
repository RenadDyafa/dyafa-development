import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail/mailer";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

export async function enqueueEmail(input: {
  to: string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
  html: string;
  text?: string;
}) {
  const job = await prisma.emailJob.create({
    data: {
      to: input.to,
      subject: input.subject,
      template: input.template,
      dataJson: { ...input.data, html: input.html, text: input.text ?? null } as Prisma.InputJsonValue,
    },
  });

  // Best-effort immediate send for the <=1 minute SLA; on failure the job
  // stays `pending`/`failed` and the worker retries it.
  await attemptSend(job.id, job.to, job.subject, input.html, input.text);
  return job;
}

async function attemptSend(jobId: string, to: string[], subject: string, html: string, text?: string) {
  try {
    await sendMail({ to, subject, html, text });
    await prisma.emailJob.update({
      where: { id: jobId },
      data: { status: "sent", sentAt: new Date() },
    });
  } catch (error) {
    logger.error({ error, jobId }, "email send failed, will retry via worker");
    await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        attempts: { increment: 1 },
        lastError: error instanceof Error ? error.message : String(error),
        sendAfter: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }
}

const MAX_ATTEMPTS = 5;

export async function processPendingEmailJobs(): Promise<{ processed: number; sent: number; failed: number }> {
  const jobs = await prisma.emailJob.findMany({
    where: {
      status: { in: ["pending", "failed"] },
      sendAfter: { lte: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    take: 20,
  });

  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    const payload = job.dataJson as Record<string, unknown>;
    const html = typeof payload.html === "string" ? payload.html : "";
    const text = typeof payload.text === "string" ? payload.text : undefined;
    try {
      await sendMail({ to: job.to, subject: job.subject, html, text });
      await prisma.emailJob.update({ where: { id: job.id }, data: { status: "sent", sentAt: new Date() } });
      sent += 1;
    } catch (error) {
      await prisma.emailJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : String(error),
          sendAfter: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
      failed += 1;
    }
  }

  return { processed: jobs.length, sent, failed };
}
