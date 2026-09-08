import { test, expect } from "@playwright/test";
import { prisma } from "../src/lib/prisma";
import { loginAsAdmin, fillSiteReviewWizard } from "./helpers";

test("Campaign landing page carries UTM + campaign_id through to the lead payload", async ({ page }) => {
  // Chains an admin campaign creation + 4 transitions with a full 5-step
  // site-review wizard submission - real work that, combined with more
  // specs now sharing the 4-worker pool, exceeds the default 30s margin
  // under this sandbox's load. Flow/assertions unchanged.
  test.setTimeout(60_000);
  await loginAsAdmin(page);

  const slug = `e2e-campaign-${Date.now()}`;
  await page.goto("/admin/content/campaigns");
  await page.getByLabel("Internal name").fill(slug);
  await page.getByLabel("Headline (EN)").fill("E2E Campaign Headline");
  await page.getByLabel("Headline (AR)").fill("عنوان الحملة التجريبية");
  await page.getByRole("button", { name: "Create draft" }).click();
  // Client-side router.push() never fires a "load" event, so
  // waitForURL's default waitUntil would hang — poll the URL instead.
  await expect(page).toHaveURL(/\/admin\/content\/campaigns\/[a-z0-9]+$/, { timeout: 15_000 });

  // Publish the campaign so its public landing page resolves.
  await page.getByRole("button", { name: "→ tech_review" }).click();
  await page.getByRole("button", { name: "→ positioning_review" }).click();
  await page.getByRole("button", { name: "→ approved" }).click();
  await page.getByRole("button", { name: "→ published" }).click();
  await expect(page.getByText("Moved to published.")).toBeVisible();

  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { slug } });

  const email = `e2e-campaign-${Date.now()}@example.com`;
  await page.goto(`/en/campaigns/${slug}?utm_source=linkedin&utm_medium=social&utm_campaign=cityscape`);
  await expect(page.getByRole("heading", { name: "E2E Campaign Headline" })).toBeVisible();

  await fillSiteReviewWizard(page, "en", {
    name: "Campaign Lead",
    role: "landowner",
    email,
    phone: "+966500000099",
    city: "Riyadh",
  });
  await expect(page.getByText("Thank you")).toBeVisible({ timeout: 15_000 });

  const lead = await prisma.lead.findFirstOrThrow({ where: { email } });
  expect(lead.campaignId).toBe(campaign.id);
  expect(lead.utmSource).toBe("linkedin");
  expect(lead.utmMedium).toBe("social");
  expect(lead.utmCampaign).toBe("cityscape");
});
