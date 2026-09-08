-- CreateEnum
CREATE TYPE "EmailJobStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "email_jobs" (
    "id" TEXT NOT NULL,
    "to" TEXT[],
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "data_json" JSONB NOT NULL,
    "status" "EmailJobStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "send_after" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "email_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_jobs_status_send_after_idx" ON "email_jobs"("status", "send_after");
