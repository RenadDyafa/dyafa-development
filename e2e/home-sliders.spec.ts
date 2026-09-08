import { test, expect } from "@playwright/test";
import path from "path";
import { unlink } from "fs/promises";
import { prisma } from "../src/lib/prisma";
import { env } from "../src/lib/env";
import { loginAsAdmin } from "./helpers";

const TEST_LOGO_PATH = path.join(__dirname, "fixtures", "test-logo.png");

test.describe("Home slider (admin -> DB -> public homepage)", () => {
  test.describe.configure({ mode: "serial" });

  test.afterEach(async () => {
    const slides = await prisma.homeSlide.findMany({ include: { media: true } });
    await prisma.homeSlide.deleteMany({});
    for (const s of slides) {
      const filePart = s.media.path.replace(/^local:media\//, "");
      await unlink(path.resolve(process.cwd(), env.storageLocalDir, "media", filePart)).catch(() => {});
    }
    await prisma.media.deleteMany({ where: { id: { in: slides.map((s) => s.mediaId) } } });
    await prisma.setting.deleteMany({ where: { key: "home_slider_settings" } });
  });

  test("adding a slide shows it in the homepage hero; publishing gates public visibility", async ({ page }) => {
    // Chains an admin login, a file upload, two publish-state checks, and
    // three page navigations - real work that, combined with this route's
    // first-compile cost on a cold dev server and other specs sharing the
    // 4-worker pool, exceeds the default 30s margin under this sandbox's
    // load. Same fix as compliance-gate.spec.ts/campaign-attribution.spec.ts.
    test.setTimeout(60_000);
    await loginAsAdmin(page);
    await page.goto("/admin/content/home-slides");

    await page.getByPlaceholder("Headline (EN, optional)").fill("E2E Test Slide");
    await page.getByLabel("Choose file & add").setInputFiles(TEST_LOGO_PATH);
    await expect(page.getByText("E2E Test Slide")).toBeVisible({ timeout: 10_000 });

    // Not yet published (active: false) - must not appear in the public hero,
    // regardless of whatever other real slides are already active there.
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "E2E Test Slide" })).toHaveCount(0);

    // Publish it.
    await page.goto("/admin/content/home-slides");
    await page.getByRole("button", { name: "Draft" }).click();
    await expect(page.getByRole("button", { name: "Published" })).toBeVisible();

    await page.goto("/en");
    await expect(page.getByRole("region", { name: "Featured" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "E2E Test Slide" })).toBeVisible();
  });

  test("carousel arrows navigate between multiple published slides", async ({ page }) => {
    const user = await prisma.user.findFirstOrThrow({ where: { role: "admin" } });
    const media1 = await prisma.media.create({ data: { path: "local:media/e2e-slide-1-fixture.png", kind: "image", createdById: user.id } });
    const media2 = await prisma.media.create({ data: { path: "local:media/e2e-slide-2-fixture.png", kind: "image", createdById: user.id } });
    await prisma.homeSlide.create({ data: { mediaId: media1.id, headlineEn: "Slide One", headlineAr: "الشريحة الأولى", displayOrder: 0, active: true } });
    await prisma.homeSlide.create({ data: { mediaId: media2.id, headlineEn: "Slide Two", headlineAr: "الشريحة الثانية", displayOrder: 1, active: true } });

    await page.goto("/en");
    const region = page.getByRole("region", { name: "Featured" });
    await expect(region.getByRole("heading", { name: "Slide One" })).toBeVisible();

    await region.getByRole("button", { name: "Next slide" }).click();
    await expect(region.getByRole("heading", { name: "Slide Two" })).toBeVisible();

    await region.getByRole("button", { name: "Previous slide" }).click();
    await expect(region.getByRole("heading", { name: "Slide One" })).toBeVisible();
  });
});

test.describe("Testimonials (admin -> DB -> public homepage)", () => {
  test.describe.configure({ mode: "serial" });

  test.afterEach(async () => {
    await prisma.testimonial.deleteMany({});
    await prisma.setting.deleteMany({ where: { key: "testimonial_slider_settings" } });
  });

  test("the testimonials section stays hidden until at least one testimonial is published", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("region", { name: "Testimonials" })).toHaveCount(0);

    await loginAsAdmin(page);
    await page.goto("/admin/content/testimonials");
    await page.getByPlaceholder("Quote (EN)").fill("Dyafa delivered exactly what they promised, on time.");
    await page.getByPlaceholder("الاقتباس").fill("قدّمت ضيافة بالضبط ما وعدت به، في الوقت المحدد.");
    await page.getByPlaceholder("Author name").fill("E2E Test Client");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("E2E Test Client")).toBeVisible({ timeout: 10_000 });

    // Draft by default - still hidden publicly.
    await page.goto("/en");
    await expect(page.getByRole("region", { name: "Testimonials" })).toHaveCount(0);

    await page.goto("/admin/content/testimonials");
    await page.getByRole("button", { name: "Draft" }).click();
    await expect(page.getByRole("button", { name: "Published" })).toBeVisible();

    await page.goto("/en");
    await expect(page.getByRole("region", { name: "Testimonials" })).toBeVisible();
    await expect(page.getByText("Dyafa delivered exactly what they promised, on time.")).toBeVisible();
  });
});
