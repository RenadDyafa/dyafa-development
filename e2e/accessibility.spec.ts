import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  "/",
  "/about",
  "/development-model",
  "/submit-your-site",
  "/landowners",
  "/investors",
  "/opportunities",
  "/projects",
  "/news",
  "/careers",
  "/search",
];
const LOCALES = ["en", "ar"];

test.describe("axe-core accessibility scan (FEATURES §12)", () => {
  for (const locale of LOCALES) {
    for (const path of PAGES) {
      test(`${locale}${path} has no serious/critical a11y violations`, async ({ page }) => {
        // Scroll-revealed content (<Reveal>) resolves instantly under
        // reduced motion instead of playing its fade/slide-in transition
        // (see useScrollReveal), but hydration + the IntersectionObserver
        // callback + the (near-zero but non-zero) reduced-motion animation
        // still need a paint cycle to settle - without waiting for that,
        // axe-core can sample a mid-animation frame for any card already in
        // the initial viewport and report a false contrast violation
        // against its transient state.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`/${locale}${path}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(100);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();

        const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        if (serious.length > 0) {
          console.log(JSON.stringify(serious, null, 2));
        }
        expect(serious).toEqual([]);
      });
    }
  }
});
