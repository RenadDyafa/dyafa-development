import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { PILLARS } from "./seed-data/pillars";
import { BANNED_PHRASES } from "./seed-data/banned-phrases";
import { INSIGHT_SEEDS } from "./seed-data/insights";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding pillars...");
  for (const pillar of PILLARS) {
    await prisma.pillar.upsert({
      where: { key: pillar.key },
      update: { nameEn: pillar.nameEn, nameAr: pillar.nameAr },
      create: pillar,
    });
  }

  console.log("Seeding banned phrases...");
  for (const bp of BANNED_PHRASES) {
    await prisma.bannedPhrase.upsert({
      where: { phrase_lang: { phrase: bp.phrase, lang: bp.lang } },
      update: { severity: bp.severity, active: true },
      create: bp,
    });
  }

  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@dyafa.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.ADMIN_SEED_NAME ?? "Dyafa Admin";
  const passwordHash = await hashPassword(adminPassword);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: adminName, role: "admin", isActive: true },
    create: { email: adminEmail, name: adminName, passwordHash, role: "admin" },
  });

  console.log("Seeding settings...");
  const settings: Array<{ key: string; valueJson: unknown }> = [
    { key: "FEATURE_PROJECTS", valueJson: false },
    { key: "bd_notification_emails", valueJson: (process.env.BD_NOTIFICATION_EMAILS ?? "bd@dyafa.com").split(",").map((s) => s.trim()) },
    { key: "whatsapp_number", valueJson: process.env.WHATSAPP_NUMBER ?? "" },
    {
      key: "government_entity_dictionary",
      valueJson: {
        note: "[NEEDS VERIFICATION] starter list only — expand with legal before launch",
        entities: ["Ministry", "وزارة", "Municipality", "أمانة", "بلدية", "Royal Commission", "الهيئة الملكية"],
      },
    },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { valueJson: s.valueJson as never },
      create: { key: s.key, valueJson: s.valueJson as never },
    });
  }

  console.log("Seeding structural pages (locked-copy pages; content lives in messages/*.json)...");
  const structuralPages: Array<{ key: string; template: string; audience: string; objective: string; cta: string }> = [
    { key: "home", template: "home", audience: "All priority audiences", objective: "Generate qualified leads and build credibility", cta: "Submit your site for review" },
    { key: "about", template: "about", audience: "All priority audiences", objective: "Build institutional credibility", cta: "Request a development discussion" },
    { key: "development-model", template: "development-model", audience: "Landowners, investors", objective: "Explain the 5-gate development process", cta: "Submit your site" },
    { key: "modular-hospitality", template: "modular-hospitality", audience: "Investors, municipalities, developers", objective: "Own modular hospitality education in KSA", cta: "Explore modular with Dyafa" },
    { key: "services", template: "services", audience: "Landowners, investors, developers", objective: "Communicate service offering", cta: "Request a review" },
    { key: "partnerships", template: "partnerships", audience: "Landowners, investors, JV partners", objective: "Generate partnership conversations", cta: "Start a partnership conversation" },
    { key: "submit-your-site", template: "submit-your-site", audience: "Landowners", objective: "Primary lead funnel", cta: "Submit your site for review" },
  ];
  for (const p of structuralPages) {
    await prisma.page.upsert({
      where: { key: p.key },
      update: {},
      create: {
        key: p.key,
        template: p.template,
        status: "published",
        audience: p.audience,
        objective: p.objective,
        cta: p.cta,
        riskLevel: "low",
        approvedById: admin.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seeding insight drafts...");
  for (const insight of INSIGHT_SEEDS) {
    const pillar = await prisma.pillar.findUniqueOrThrow({ where: { key: insight.pillarKey } });
    await prisma.insight.upsert({
      where: { slugEn: insight.slugEn },
      update: {},
      create: {
        slugEn: insight.slugEn,
        slugAr: insight.slugAr,
        titleEn: insight.titleEn,
        titleAr: insight.titleAr,
        bodyEn: insight.bodyEn,
        bodyAr: insight.bodyAr,
        excerptEn: insight.excerptEn,
        excerptAr: insight.excerptAr,
        pillarId: pillar.id,
        authorId: admin.id,
        status: "draft",
        riskLevel: "low",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
