-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('land_offering', 'development_partnership', 'existing_asset');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('open', 'under_review', 'closed');

-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('news', 'milestone', 'partnership', 'event');

-- CreateEnum
CREATE TYPE "JobEmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'internship');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "opportunity_intent" TEXT,
ADD COLUMN     "reference_number" TEXT,
ADD COLUMN     "score" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "slug_en" TEXT NOT NULL,
    "slug_ar" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "asset_type" "AssetType",
    "site_size_m2" DOUBLE PRECISION,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'open',
    "development_stage" TEXT,
    "demand_drivers_en" TEXT,
    "demand_drivers_ar" TEXT,
    "proposed_product_en" TEXT,
    "proposed_product_ar" TEXT,
    "partnership_models_en" TEXT,
    "partnership_models_ar" TEXT,
    "public_summary_en" TEXT NOT NULL,
    "public_summary_ar" TEXT NOT NULL,
    "cover_media_id" TEXT,
    "workflow_state" "WorkflowState" NOT NULL DEFAULT 'draft',
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'medium',
    "audience" TEXT,
    "objective" TEXT,
    "cta" TEXT,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_items" (
    "id" TEXT NOT NULL,
    "slug_en" TEXT NOT NULL,
    "slug_ar" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "type" "NewsType" NOT NULL,
    "excerpt_en" TEXT NOT NULL,
    "excerpt_ar" TEXT NOT NULL,
    "body_en" TEXT NOT NULL,
    "body_ar" TEXT NOT NULL,
    "event_date" TIMESTAMP(3),
    "location" TEXT,
    "related_project_id" TEXT,
    "cover_media_id" TEXT,
    "workflow_state" "WorkflowState" NOT NULL DEFAULT 'draft',
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'low',
    "audience" TEXT,
    "objective" TEXT,
    "cta" TEXT,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "role_en" TEXT NOT NULL,
    "role_ar" TEXT NOT NULL,
    "bio_en" TEXT,
    "bio_ar" TEXT,
    "photo_media_id" TEXT,
    "linkedin_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "department_en" TEXT,
    "department_ar" TEXT,
    "city" TEXT,
    "employment_type" "JobEmploymentType" NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question_en" TEXT NOT NULL,
    "question_ar" TEXT NOT NULL,
    "answer_en" TEXT NOT NULL,
    "answer_ar" TEXT NOT NULL,
    "category" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_en_key" ON "opportunities"("slug_en");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_ar_key" ON "opportunities"("slug_ar");

-- CreateIndex
CREATE INDEX "opportunities_status_workflow_state_idx" ON "opportunities"("status", "workflow_state");

-- CreateIndex
CREATE UNIQUE INDEX "news_items_slug_en_key" ON "news_items"("slug_en");

-- CreateIndex
CREATE UNIQUE INDEX "news_items_slug_ar_key" ON "news_items"("slug_ar");

-- CreateIndex
CREATE INDEX "news_items_workflow_state_published_at_idx" ON "news_items"("workflow_state", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "job_postings_slug_key" ON "job_postings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "leads_reference_number_key" ON "leads"("reference_number");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_related_project_id_fkey" FOREIGN KEY ("related_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_media_id_fkey" FOREIGN KEY ("photo_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

