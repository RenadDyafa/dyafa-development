import { test, expect } from "@playwright/test";
import path from "path";
import { unlink } from "fs/promises";
import { prisma } from "../src/lib/prisma";
import { env } from "../src/lib/env";
import { loginAsAdmin } from "./helpers";

const TEST_LOGO_PATH = path.join(__dirname, "fixtures", "test-logo.png");
const TEST_LOGO_ALT_PREFIX = "Dyafa Development logo (";

test.describe("Site logo (admin settings -> DB -> public frontend)", () => {
  // The logo settings are global singleton Setting rows (site_logo_header/
  // _footer/legacy site_logo) - these tests must not interleave with each
  // other under the suite's default fullyParallel execution, or they race
  // on the same rows.
  test.describe.configure({ mode: "serial" });

  test.afterEach(async () => {
    // Always leave the shared dev DB (and local disk storage) back at "no
    // logo" regardless of whether the test body reached its own cleanup
    // step - both the Setting rows and the Media rows + files each upload
    // creates, identified by the alt text LogoSettingManager sets. Without
    // this, every future run leaves a growing pile of orphaned uploads in
    // storage/uploads/media and the admin media library.
    await prisma.setting.deleteMany({ where: { key: { in: ["site_logo", "site_logo_header", "site_logo_footer"] } } });

    const uploaded = await prisma.media.findMany({ where: { altEn: { startsWith: TEST_LOGO_ALT_PREFIX } } });
    for (const m of uploaded) {
      const filePart = m.path.replace(/^local:media\//, "");
      await unlink(path.resolve(process.cwd(), env.storageLocalDir, "media", filePart)).catch(() => {});
    }
    await prisma.media.deleteMany({ where: { id: { in: uploaded.map((m) => m.id) } } });
  });

  test("uploading a header logo persists it and renders only in the header, both locales", async ({ page, request }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings");

    await page.getByLabel("Header logo file").setInputFiles(TEST_LOGO_PATH);
    await expect(page.getByAltText("Current Header logo")).toBeVisible({ timeout: 10_000 });

    const setting = await prisma.setting.findUniqueOrThrow({ where: { key: "site_logo_header" } });
    const value = setting.valueJson as { mediaId: string; path: string };
    expect(value.mediaId).toBeTruthy();
    expect(value.path).toMatch(/^local:media\//);

    for (const locale of ["en", "ar"] as const) {
      await page.goto(`/${locale}`);
      const headerLogo = page.locator("header img");
      await expect(headerLogo).toBeVisible();
      await expect(page.locator("footer img")).toHaveCount(0);

      const src = await headerLogo.getAttribute("src");
      expect(src).toMatch(/^\/api\/media\//);

      // The public media route must serve the file unauthenticated.
      const res = await request.get(src!);
      expect(res.ok()).toBe(true);
      expect(res.headers()["content-type"]).toBe("image/png");
    }
  });

  test("header and footer logos are independent - uploading/removing one leaves the other untouched", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings");

    await page.getByLabel("Header logo file").setInputFiles(TEST_LOGO_PATH);
    await expect(page.getByAltText("Current Header logo")).toBeVisible({ timeout: 10_000 });
    await page.getByLabel("Footer logo file").setInputFiles(TEST_LOGO_PATH);
    await expect(page.getByAltText("Current Footer logo")).toBeVisible({ timeout: 10_000 });

    await page.goto("/en");
    await expect(page.locator("header img")).toBeVisible();
    await expect(page.locator("footer img")).toBeVisible();

    // Remove only the header logo.
    await page.goto("/admin/settings");
    await page.getByRole("button", { name: "Remove Header logo" }).click();
    await expect(page.getByAltText("Current Header logo")).toHaveCount(0);
    await expect(page.getByAltText("Current Footer logo")).toBeVisible();

    await page.goto("/en");
    await expect(page.locator("header img")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Dyafa Development" })).toBeVisible();
    await expect(page.locator("footer img")).toBeVisible();
  });

  test("a legacy single site_logo row (no header/footer-specific override) is used for both placements", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings");

    // Upload through the real header field so a genuine Media row + file on
    // disk exists, then copy that same value onto the legacy key and drop
    // the header-specific one - simulating a site that only ever used the
    // original single-logo setting, pre-dating the header/footer split.
    await page.getByLabel("Header logo file").setInputFiles(TEST_LOGO_PATH);
    await expect(page.getByAltText("Current Header logo")).toBeVisible({ timeout: 10_000 });

    const headerSetting = await prisma.setting.findUniqueOrThrow({ where: { key: "site_logo_header" } });
    await prisma.setting.upsert({
      where: { key: "site_logo" },
      update: { valueJson: headerSetting.valueJson as object },
      create: { key: "site_logo", valueJson: headerSetting.valueJson as object },
    });
    await prisma.setting.delete({ where: { key: "site_logo_header" } });

    await page.goto("/en");
    await expect(page.locator("header img")).toBeVisible();
    await expect(page.locator("footer img")).toBeVisible();
  });

  test("the public media route 404s for a namespace-mismatched or unknown filename", async ({ request }) => {
    const res = await request.get("/api/media/does-not-exist.png");
    expect(res.status()).toBe(404);
  });
});
