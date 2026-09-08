import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { requestTransition } from "./workflow";

const createdOpportunityIds: string[] = [];
const createdNewsIds: string[] = [];

async function ensureAdmin() {
  return prisma.user.upsert({
    where: { email: "vitest-workflow-actor@dyafa.com" },
    update: {},
    create: { email: "vitest-workflow-actor@dyafa.com", name: "Vitest Workflow Actor", passwordHash: "x", role: "admin" },
  });
}

afterAll(async () => {
  await prisma.approval.deleteMany({ where: { entityId: { in: [...createdOpportunityIds, ...createdNewsIds] } } });
  await prisma.opportunity.deleteMany({ where: { id: { in: createdOpportunityIds } } });
  await prisma.newsItem.deleteMany({ where: { id: { in: createdNewsIds } } });
  await prisma.$disconnect();
});

describe("requestTransition — opportunity adapter", () => {
  it("moves a clean draft all the way to published", async () => {
    const actor = await ensureAdmin();
    const opportunity = await prisma.opportunity.create({
      data: {
        slugEn: `wf-test-${Date.now()}-en`,
        slugAr: `wf-test-${Date.now()}-ar`,
        titleEn: "Riyadh Corridor Site",
        titleAr: "موقع ممر الرياض",
        type: "land_offering",
        publicSummaryEn: "Dyafa reviews this site under its standard development gates.",
        publicSummaryAr: "تراجع ضيافة هذا الموقع وفق بوابات التطوير المعتادة.",
      },
    });
    createdOpportunityIds.push(opportunity.id);

    for (const toState of ["tech_review", "positioning_review", "approved", "published"] as const) {
      const result = await requestTransition({
        entityType: "opportunity",
        entityId: opportunity.id,
        toState,
        actorId: actor.id,
        actorRole: actor.role,
      });
      expect(result.ok).toBe(true);
    }

    const final = await prisma.opportunity.findUniqueOrThrow({ where: { id: opportunity.id } });
    expect(final.workflowState).toBe("published");
    expect(final.publishedAt).not.toBeNull();
    expect(final.approvedById).toBe(actor.id);
  });

  it("force-redirects to legal_review when the public summary trips a HIGH-RISK flag", async () => {
    const actor = await ensureAdmin();
    const opportunity = await prisma.opportunity.create({
      data: {
        slugEn: `wf-risk-${Date.now()}-en`,
        slugAr: `wf-risk-${Date.now()}-ar`,
        titleEn: "Jeddah Waterfront Opportunity",
        titleAr: "فرصة واجهة جدة البحرية",
        type: "development_partnership",
        // "12%" trips the high_risk_number detector.
        publicSummaryEn: "Expected yield of 12% on this development.",
        publicSummaryAr: "نص عربي محايد بلا أي عبارات محظورة.",
      },
    });
    createdOpportunityIds.push(opportunity.id);

    await requestTransition({ entityType: "opportunity", entityId: opportunity.id, toState: "tech_review", actorId: actor.id, actorRole: actor.role });
    const result = await requestTransition({
      entityType: "opportunity",
      entityId: opportunity.id,
      toState: "positioning_review",
      actorId: actor.id,
      actorRole: actor.role,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.redirected).toBe(true);
      expect(result.finalState).toBe("legal_review");
    }

    const final = await prisma.opportunity.findUniqueOrThrow({ where: { id: opportunity.id } });
    expect(final.workflowState).toBe("legal_review");
  });
});

describe("requestTransition — news adapter", () => {
  it("moves a clean draft all the way to published", async () => {
    const actor = await ensureAdmin();
    const newsItem = await prisma.newsItem.create({
      data: {
        slugEn: `wf-news-${Date.now()}-en`,
        slugAr: `wf-news-${Date.now()}-ar`,
        titleEn: "Dyafa opens a new regional office",
        titleAr: "ضيافة تفتتح مكتباً إقليمياً جديداً",
        type: "milestone",
        excerptEn: "A short update on our regional presence.",
        excerptAr: "تحديث موجز حول حضورنا الإقليمي.",
        bodyEn: "Dyafa Development continues to grow its regional development capacity.",
        bodyAr: "تواصل ضيافة للتطوير توسيع قدرتها التطويرية الإقليمية.",
      },
    });
    createdNewsIds.push(newsItem.id);

    for (const toState of ["tech_review", "positioning_review", "approved", "published"] as const) {
      const result = await requestTransition({
        entityType: "news",
        entityId: newsItem.id,
        toState,
        actorId: actor.id,
        actorRole: actor.role,
      });
      expect(result.ok).toBe(true);
    }

    const final = await prisma.newsItem.findUniqueOrThrow({ where: { id: newsItem.id } });
    expect(final.workflowState).toBe("published");
    expect(final.publishedAt).not.toBeNull();
  });

  it("blocks the transition past tech_review when the body contains a banned phrase", async () => {
    const actor = await ensureAdmin();
    const newsItem = await prisma.newsItem.create({
      data: {
        slugEn: `wf-news-blocked-${Date.now()}-en`,
        slugAr: `wf-news-blocked-${Date.now()}-ar`,
        titleEn: "Announcement",
        titleAr: "إعلان",
        type: "news",
        excerptEn: "Update.",
        excerptAr: "تحديث.",
        bodyEn: "We offer guaranteed returns on every asset.",
        bodyAr: "نص عربي محايد بلا أي عبارات محظورة.",
      },
    });
    createdNewsIds.push(newsItem.id);

    const result = await requestTransition({
      entityType: "news",
      entityId: newsItem.id,
      toState: "positioning_review",
      actorId: actor.id,
      actorRole: actor.role,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("blocked");

    const final = await prisma.newsItem.findUniqueOrThrow({ where: { id: newsItem.id } });
    expect(final.workflowState).toBe("draft");
  });
});
