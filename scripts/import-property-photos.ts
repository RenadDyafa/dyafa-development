/**
 * One-time (re-runnable) import of the real property photography dropped
 * into `photos/` at the repo root into the CMS, as draft Projects.
 *
 * The source files are Instagram-style marketing posts (real interior
 * photography with a "Dyafa Hotels & Resorts" logo lockup baked into the
 * top of every image and a www.dyafa.com watermark at the bottom, on a
 * consistent 1080x1440 canvas per the template). This script crops both
 * bands off, keeping only the clean photography, and skips any file that
 * also carries a mid-frame promotional caption or a booking-contact-info
 * card (manually identified by visual review - see docs/competitor-analysis.md
 * synthesis notes and the session history for how these were curated).
 *
 * Everything lands as a `draft` Project - nothing here is invented beyond
 * the brand name read directly off each property's own logo and the city
 * named in its folder; the summary is an explicit placeholder an admin must
 * replace before this can pass the existing compliance/approval workflow.
 *
 * Usage: npm run import:photos
 */
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { storeUploadedFile } from "../src/lib/storage";

const prisma = new PrismaClient();

const PHOTOS_ROOT = path.resolve(process.cwd(), "photos");

// Every source template shares this exact 1080x1440 canvas: crop the top
// logo lockup and bottom watermark band, keep the clean photo in between.
const CROP = { left: 0, top: 300, width: 1080, height: 1440 - 300 - 90 };

type PropertySeed = {
  folder: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  city: string;
  images: { file: string; cover?: boolean }[];
};

const PROPERTIES: PropertySeed[] = [
  {
    folder: "العنوان",
    nameEn: "The Address",
    nameAr: "العنوان",
    slug: "the-address-al-khobar",
    city: "Al-Khobar",
    images: [
      { file: "DYAFA TEMPLATE EL E3ONWAN 1.3.png", cover: true },
      { file: "DYAFA TEMPLATE EL E3ONWAN 1.4.png" },
      { file: "DYAFA TEMPLATE EL E3ONWAN 1.5.png" },
      { file: "DYAFA TEMPLATE EL E3ONWAN 1.6.png" },
      { file: "DYAFA TEMPLATE EL E3ONWAN 1.7.png" },
    ],
  },
  {
    folder: "سدرا",
    nameEn: "Sedra",
    nameAr: "سدرا",
    slug: "sedra-al-khobar",
    city: "Al-Khobar",
    images: [
      { file: "DYAFA TEMPLATE SEDRA 8 (1).png", cover: true },
      { file: "DYAFA TEMPLATE SEDRA 2.png" },
      { file: "DYAFA TEMPLATE SEDRA 7 (1).png" },
      { file: "DYAFA TEMPLATE SEDRA 10 (1).png" },
    ],
  },
  {
    folder: "فخامة",
    nameEn: "Fakhama",
    nameAr: "فخامة",
    slug: "fakhama-al-khobar",
    city: "Al-Khobar",
    images: [
      { file: "IMG_3513.png", cover: true },
      { file: "IMG_3512.png" },
      { file: "IMG_3515.png" },
      { file: "IMG_3516.png" },
    ],
  },
  {
    folder: "كارم الخبر",
    nameEn: "Karim Hotel – Al-Khobar",
    nameAr: "فندق كارم - الخبر",
    slug: "karim-hotel-al-khobar",
    city: "Al-Khobar",
    images: [
      { file: "IMG_3475.png", cover: true },
      { file: "IMG_3476.png" },
      { file: "IMG_3478.png" },
      { file: "IMG_3479.png" },
      { file: "IMG_3480.png" },
    ],
  },
  {
    folder: "كارم الدمام",
    nameEn: "Karim Hotel – Dammam",
    nameAr: "فندق كارم - الدمام",
    slug: "karim-hotel-dammam",
    city: "Dammam",
    images: [
      { file: "IMG_0646 (1).png", cover: true },
      { file: "IMG_0648 (1).png" },
      { file: "IMG_0649.png" },
      { file: "IMG_0650 (1).png" },
      { file: "IMG_0651 (1).png" },
    ],
  },
  {
    folder: "شرفة 3",
    nameEn: "Terrace View Residence",
    nameAr: "إطلالة الشرفة 3",
    slug: "terrace-view-residence-dammam",
    city: "Dammam",
    images: [{ file: "DYAFA TEMPLATE اطلاله الشرفة  2 1.2.png", cover: true }],
  },
];

const SUMMARY_EN =
  "Imported from the property photo library — description pending admin review before publish.";
const SUMMARY_AR =
  "تم الاستيراد من مكتبة صور العقار - الوصف قيد المراجعة الإدارية قبل النشر.";

async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "admin" } });

  for (const property of PROPERTIES) {
    const existing = await prisma.project.findUnique({ where: { slug: property.slug } });
    if (existing) {
      console.log(`skip (already imported): ${property.slug}`);
      continue;
    }

    const project = await prisma.project.create({
      data: {
        nameEn: property.nameEn,
        nameAr: property.nameAr,
        slug: property.slug,
        stage: "Operating",
        city: property.city,
        summaryEn: SUMMARY_EN,
        summaryAr: SUMMARY_AR,
        status: "draft",
      },
    });

    let order = 0;
    for (const image of property.images) {
      const srcPath = path.join(PHOTOS_ROOT, property.folder, image.file);
      const cropped = await sharp(srcPath).extract(CROP).webp({ quality: 85 }).toBuffer();

      const stored = await storeUploadedFile(image.file, cropped, "image/webp", {
        allowedMimes: ["image/webp"],
        namespace: "media",
      });

      const media = await prisma.media.create({
        data: {
          path: stored.path,
          altEn: `${property.nameEn} — interior photography`,
          altAr: `${property.nameAr} - تصوير داخلي`,
          kind: "image",
          isConceptVisual: false,
          createdById: admin.id,
        },
      });

      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          mediaId: media.id,
          displayOrder: order,
          isCover: Boolean(image.cover),
        },
      });

      order += 1;
    }

    console.log(`imported: ${property.slug} (${order} images)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
