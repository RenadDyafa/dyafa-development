import { test, expect } from "@playwright/test";

// FEATURE_PROJECTS is on, and the site's real hospitality assets have been
// published through the compliance workflow (see requestTransition calls
// driving them draft -> ... -> published), so /projects now renders the
// live portfolio grid instead of its coming-soon state. The flag itself
// being on is what puts /projects into the sitemap.
test.describe("FEATURE_PROJECTS=true, projects published", () => {
  test("/projects renders the published portfolio", async ({ page }) => {
    await page.goto("/en/projects");
    await expect(page.getByRole("heading", { name: "Delivered and operating", level: 1 })).toBeVisible();
  });

  test("/ar/projects renders the Arabic published portfolio", async ({ page }) => {
    await page.goto("/ar/projects");
    await expect(page.getByRole("heading", { name: "أصول تم تسليمها وتعمل الآن", level: 1 })).toBeVisible();
  });

  test("/projects is included in sitemap.xml now that the flag is on", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toContain("/en/projects");
    expect(body).toContain("/ar/projects");
    // sanity: sitemap does contain other known routes
    expect(body).toContain("/en/about");
  });
});

test.describe("FEATURE_OPPORTUNITIES/FEATURE_NEWS/FEATURE_CAREERS=false", () => {
  test("/opportunities, /news and /careers each render a branded coming-soon state", async ({ page }) => {
    await page.goto("/en/opportunities");
    await expect(page.getByRole("heading", { name: /coming soon/i })).toBeVisible();

    await page.goto("/en/news");
    await expect(page.getByRole("heading", { name: /coming soon/i })).toBeVisible();

    await page.goto("/en/careers");
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });

  test("Arabic coming-soon state renders for each", async ({ page }) => {
    await page.goto("/ar/opportunities");
    await expect(page.getByRole("heading", { name: /قريباً/ })).toBeVisible();

    await page.goto("/ar/news");
    await expect(page.getByRole("heading", { name: /قريباً/ })).toBeVisible();

    await page.goto("/ar/careers");
    await expect(page.getByText(/قريباً/)).toBeVisible();
  });

  test("/opportunities and /news are excluded from sitemap.xml", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    const body = await res.text();
    expect(body).not.toContain("/en/opportunities");
    expect(body).not.toContain("/en/news");
    expect(body).not.toContain("/en/careers");
  });
});
