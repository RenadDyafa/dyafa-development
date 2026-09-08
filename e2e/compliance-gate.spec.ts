import { test, expect } from "@playwright/test";
import { prisma } from "../src/lib/prisma";
import { loginAsAdmin } from "./helpers";

const LONG = { timeout: 10_000 };

// Assert on persisted DB state (with polling) rather than the transient
// "Moved to X." toast — the toast is real UI feedback (still exercised
// throughout this test), but asserting on its visibility as the *pass
// condition* proved flaky: it can render and clear before Playwright's next
// scheduling tick under dev-server load, even though the underlying
// transition always completes correctly. The DB row is the actual source of
// truth and what this scenario is really about.
async function waitForInsightStatus(id: string, status: string) {
  await expect
    .poll(async () => (await prisma.insight.findUnique({ where: { id } }))?.status, LONG)
    .toBe(status);
}

test.describe("Compliance gate — blocks publish on banned phrase, HIGH-RISK redirects to legal_review, fix succeeds", () => {
  test.afterEach(async () => {
    // Real, previously-shipped bug: this test creates (and, until now, never
    // deleted) a genuinely *published* insight every run - 22 of these had
    // silently accumulated and were visible on the live /insights page and
    // homepage teaser before being cleaned up by hand.
    const junk = await prisma.insight.findMany({ where: { titleEn: { startsWith: "E2E Compliance Insight" } } });
    for (const j of junk) {
      await prisma.approval.deleteMany({ where: { entityType: "insight", entityId: j.id } });
      await prisma.insight.delete({ where: { id: j.id } });
    }
  });

  test("full workflow lifecycle enforces the compliance engine", async ({ page }) => {
    // This scenario chains a real admin login, multiple transitions, and
    // compliance scans in one test - the heaviest in the suite. Adding more
    // specs elsewhere in this pass pushed the 4-worker parallel run past the
    // default 30s margin under this sandbox's load; the assertions and flow
    // are unchanged, this only gives the same work more wall-clock room.
    test.setTimeout(60_000);
    await loginAsAdmin(page);

    // Letters only (no digits) — the title is real scanned content (unlike
    // a throwaway id), and the compliance engine correctly flags any 2+
    // digit run as a HIGH-RISK number. A numeric Date.now() suffix here
    // would permanently trip that flag and the insight could never reach
    // "approved", no matter what the body said.
    const uniqueSuffix = Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
    const title = `E2E Compliance Insight ${uniqueSuffix}`;

    await page.goto("/admin/content/insights/new");
    await page.getByLabel("Title (EN)").fill(title);
    await page.getByLabel("Title (AR)").fill("عنوان تجريبي للاختبار");
    await page.getByRole("button", { name: "Create draft" }).click();
    // Client-side router.push() never fires a "load" event, so
    // waitForURL's default waitUntil would hang — poll the URL instead.
    // Length-gated so this never trivially matches the starting
    // "/admin/content/insights/new" URL itself (which is also all-lowercase
    // a-z, so a naive [a-z0-9]+ pattern is a false-positive no-op there).
    await expect(page).toHaveURL(/\/admin\/content\/insights\/[a-z0-9]{20,}$/, { timeout: 15_000 });

    const insightId = await prisma.insight.findFirstOrThrow({ where: { titleEn: title } }).then((i) => i.id);

    // 1. Add a banned phrase.
    await page.getByLabel("Body (EN)").fill("This development offers guaranteed returns to every investor.");
    await page.getByLabel("النص").fill("يقدّم هذا التطوير قيمة تشغيلية واضحة للمستثمرين على المدى الطويل.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved ✓")).toBeVisible(LONG);

    // draft -> tech_review is allowed even with a block (only blocks *past* tech_review).
    await page.getByRole("button", { name: "→ tech_review" }).click();
    await waitForInsightStatus(insightId, "tech_review");

    // tech_review -> positioning_review must be BLOCKED by the banned phrase.
    await page.getByRole("button", { name: "→ positioning_review" }).click();
    await expect(page.getByText(/Banned phrase detected/)).toBeVisible(LONG);
    await waitForInsightStatus(insightId, "tech_review"); // unchanged — blocked

    // 2. Fix the banned phrase but introduce a HIGH-RISK number instead.
    await page.getByLabel("Body (EN)").fill("This development is designed for long-term operating value, targeting 12% efficiency gains.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved ✓")).toBeVisible(LONG);

    await page.getByRole("button", { name: "→ positioning_review" }).click();
    // Requested positioning_review, but the HIGH-RISK number flag force-redirects to legal_review.
    await waitForInsightStatus(insightId, "legal_review");

    // 3. Remove the HIGH-RISK number — content is now clean.
    await page.getByLabel("Body (EN)").fill("This development is designed for long-term operating value and disciplined delivery.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved ✓")).toBeVisible(LONG);

    await page.getByRole("button", { name: "→ approved" }).click();
    await waitForInsightStatus(insightId, "approved");

    await page.getByRole("button", { name: "→ published" }).click();
    await waitForInsightStatus(insightId, "published");

    const insight = await prisma.insight.findUniqueOrThrow({ where: { id: insightId } });
    expect(insight.publishedAt).not.toBeNull();
  });
});
