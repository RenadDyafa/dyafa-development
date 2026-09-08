/**
 * One-time (re-runnable) seed of the official brand logo (logo/logo.png -
 * see the brand guideline deck in that gitignored folder) as both the
 * header and footer site logo. Both placements now render on a dark
 * background (see the Header rebrand), so the single light-colored asset
 * works for both without any recoloring.
 *
 * Usage: npm run seed:logo
 */
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { storeUploadedFile } from "../src/lib/storage";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "admin" } });

  const srcPath = path.resolve(process.cwd(), "logo", "logo.png");
  const resized = await sharp(srcPath).resize({ width: 600 }).webp({ quality: 90 }).toBuffer();

  const stored = await storeUploadedFile("logo.webp", resized, "image/webp", {
    allowedMimes: ["image/webp"],
    namespace: "media",
  });

  const media = await prisma.media.create({
    data: {
      path: stored.path,
      altEn: "Dyafa Real Estate Development & Investment logo",
      altAr: "شعار ضيافة للتطوير والاستثمار العقاري",
      kind: "image",
      isConceptVisual: false,
      createdById: admin.id,
    },
  });

  const value = { mediaId: media.id, path: media.path };
  await prisma.setting.upsert({
    where: { key: "site_logo_header" },
    update: { valueJson: value },
    create: { key: "site_logo_header", valueJson: value },
  });
  await prisma.setting.upsert({
    where: { key: "site_logo_footer" },
    update: { valueJson: value },
    create: { key: "site_logo_footer", valueJson: value },
  });

  console.log("seeded site_logo_header and site_logo_footer ->", media.path);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
