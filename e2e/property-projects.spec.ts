import { test, expect } from "@playwright/test";
import path from "path";
import { unlink } from "fs/promises";
import { prisma } from "../src/lib/prisma";
import { env } from "../src/lib/env";
import { loginAsAdmin } from "./helpers";

const TEST_LOGO_PATH = path.join(__dirname, "fixtures", "test-logo.png");
const LONG = { timeout: 10_000 };

async function waitForProjectStatus(id: string, status: string) {
  await expect
    .poll(async () => (await prisma.project.findUnique({ where: { id } }))?.status, LONG)
    .toBe(status);
}

test.describe("Property/project gallery (admin -> workflow -> public homepage & /projects)", () => {
  test.describe.configure({ mode: "serial" });

  test.afterEach(async () => {
    const projects = await prisma.project.findMany({
      where: { nameEn: { startsWith: "E2E Test Property" } },
      include: { images: { include: { media: true } } },
    });
    for (const project of projects) {
      for (const image of project.images) {
        const filePart = image.media.path.replace(/^local:media\//, "");
        await unlink(path.resolve(process.cwd(), env.storageLocalDir, "media", filePart)).catch(() => {});
      }
      await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
      await prisma.media.deleteMany({ where: { id: { in: project.images.map((i) => i.mediaId) } } });
      await prisma.project.delete({ where: { id: project.id } });
    }
  });

  test("create, add a photo, publish through the workflow, and confirm it appears with a working gallery lightbox", async ({ page }) => {
    // Chains admin login, a create, a file upload, four workflow
    // transitions, and three public-page navigations - the heaviest test in
    // this spec, same first-compile-under-load reason as
    // compliance-gate.spec.ts/home-sliders.spec.ts.
    test.setTimeout(60_000);

    const uniqueSuffix = Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
    const nameEn = `E2E Test Property ${uniqueSuffix}`;

    await loginAsAdmin(page);
    await page.goto("/admin/content/projects");
    await page.getByLabel("Name (EN)").fill(nameEn);
    await page.getByLabel("Name (AR)").fill("عقار تجريبي للاختبار");
    await page.getByLabel("Stage").fill("Operating");
    await page.getByLabel("Summary (EN)").fill("A disciplined, operating hospitality asset used for end-to-end test coverage.");
    await page.getByLabel("Summary (AR)").fill("أصل ضيافة تشغيلي منضبط يُستخدم لتغطية اختبار شاملة.");
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page).toHaveURL(/\/admin\/content\/projects\/[a-z0-9]{20,}$/, { timeout: 15_000 });

    const projectId = await prisma.project.findFirstOrThrow({ where: { nameEn } }).then((p) => p.id);

    // Add a gallery photo.
    await page.getByLabel("Choose file & add").setInputFiles(TEST_LOGO_PATH);
    await expect(page.getByText("Cover")).toBeVisible(LONG);

    // draft -> tech_review -> positioning_review -> approved -> published.
    // Content is clean (no banned phrases/HIGH-RISK numbers), so this never
    // gets redirected to legal_review.
    await page.getByRole("button", { name: "→ tech_review" }).click();
    await waitForProjectStatus(projectId, "tech_review");

    await page.getByRole("button", { name: "→ positioning_review" }).click();
    await waitForProjectStatus(projectId, "positioning_review");

    await page.getByRole("button", { name: "→ approved" }).click();
    await waitForProjectStatus(projectId, "approved");

    await page.getByRole("button", { name: "→ published" }).click();
    await waitForProjectStatus(projectId, "published");

    // Appears on /projects with its cover photo.
    await page.goto("/en/projects");
    await expect(page.getByRole("heading", { name: nameEn })).toBeVisible();

    // Appears on the homepage "Our Properties" showcase.
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: nameEn })).toBeVisible();

    // Detail page: gallery lightbox opens, shows the image, and closes on Escape.
    await page.goto(`/en/projects/${(await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).slug}`);
    await expect(page.getByRole("heading", { name: nameEn })).toBeVisible();
    await page.getByRole("button", { name: "Gallery 1 / 1" }).click();
    const dialog = page.getByRole("dialog", { name: "Gallery" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
