import { test, expect } from "@playwright/test";

const PAGES = ["/", "/about", "/development-model", "/modular-hospitality", "/services", "/partnerships", "/insights", "/submit-your-site", "/contact", "/privacy", "/terms"];

test.describe("Locale switch preserves the equivalent route (BR-01)", () => {
  for (const path of PAGES) {
    test(`en${path} <-> ar${path}`, async ({ page }) => {
      await page.goto(`/en${path}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

      // Client-side transitions never fire a browser "load" event, so
      // waitForURL's default waitUntil would hang until timeout — assert
      // on the URL directly instead, which polls without waiting for load.
      // A generous timeout absorbs Next dev-mode's on-demand first-compile
      // latency for a not-yet-visited route (irrelevant in production,
      // where everything is precompiled).
      await page.getByRole("button", { name: "العربية" }).click();
      await expect(page).toHaveURL(new RegExp(`/ar${path === "/" ? "" : path}$`), { timeout: 15_000 });
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

      await page.getByRole("button", { name: "English" }).click();
      await expect(page).toHaveURL(new RegExp(`/en${path === "/" ? "" : path}$`), { timeout: 15_000 });
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  }
});
