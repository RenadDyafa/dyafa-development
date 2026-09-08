-- CreateTable
CREATE TABLE "home_slides" (
    "id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "media_id" TEXT NOT NULL,
    "headline_en" TEXT,
    "headline_ar" TEXT,
    "subheadline_en" TEXT,
    "subheadline_ar" TEXT,
    "cta_label_en" TEXT,
    "cta_label_ar" TEXT,
    "cta_href" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "quote_en" TEXT NOT NULL,
    "quote_ar" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_role_en" TEXT,
    "author_role_ar" TEXT,
    "author_company" TEXT,
    "avatar_media_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "home_slides" ADD CONSTRAINT "home_slides_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_slides" ADD CONSTRAINT "home_slides_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_media_id_fkey" FOREIGN KEY ("avatar_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

