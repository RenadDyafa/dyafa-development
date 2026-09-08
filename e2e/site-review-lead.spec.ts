import { test, expect } from "@playwright/test";
import { prisma } from "../src/lib/prisma";
import { loginAsAdmin, fillSiteReviewWizard } from "./helpers";

test.describe("Site-review lead — submit -> admin visible -> status change -> email queued", () => {
  test("EN submission reaches the admin inbox and can be actioned", async ({ page }) => {
    const email = `e2e-en-${Date.now()}@example.com`;

    await page.goto("/en/submit-your-site");
    await fillSiteReviewWizard(page, "en", {
      name: "Playwright EN Landowner",
      role: "landowner",
      email,
      phone: "+966500000010",
      city: "Riyadh",
    });

    await expect(page.getByText("Thank you — your submission has been received.")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/DYA-[A-Z0-9]{8}/)).toBeVisible();

    const lead = await prisma.lead.findFirst({ where: { email } });
    expect(lead).not.toBeNull();
    expect(lead?.type).toBe("site_review");
    expect(lead?.persona).toBe("landowner");
    expect(lead?.status).toBe("new");

    const emailJob = await prisma.emailJob.findFirst({ where: { subject: { contains: "Playwright EN Landowner" } } });
    expect(emailJob).not.toBeNull();

    await loginAsAdmin(page);
    await page.goto(`/admin/leads/${lead!.id}`);
    await expect(page.getByRole("heading", { name: "Playwright EN Landowner" })).toBeVisible();

    await page.getByLabel("Status").selectOption("contacted");
    await expect(page.getByLabel("Status")).toHaveValue("contacted");

    // The status select fires a fire-and-forget PATCH + router.refresh();
    // poll the DB instead of a fixed sleep since the server round-trip
    // isn't guaranteed to finish by the time the local <select> updates.
    await expect
      .poll(async () => (await prisma.lead.findUnique({ where: { id: lead!.id } }))?.status, { timeout: 10_000 })
      .toBe("contacted");

    const approval = await prisma.approval.findFirst({ where: { entityId: lead!.id, toState: "contacted" } });
    expect(approval).not.toBeNull();
  });

  test("AR submission persists with locale=ar", async ({ page }) => {
    const email = `e2e-ar-${Date.now()}@example.com`;

    await page.goto("/ar/submit-your-site");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await fillSiteReviewWizard(page, "ar", {
      name: "مالك أرض تجريبي",
      role: "landowner",
      email,
      phone: "+966500000011",
      city: "جدة",
    });

    await expect(page.getByText("شكراً لك")).toBeVisible({ timeout: 15_000 });

    const lead = await prisma.lead.findFirst({ where: { email } });
    expect(lead).not.toBeNull();
    expect(lead?.locale).toBe("ar");
  });
});
