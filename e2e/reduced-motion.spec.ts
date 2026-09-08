import { test, expect } from "@playwright/test";

// The browser serializes computed animation-duration in whichever unit is
// shortest (e.g. "1e-06s" for 0.001ms) — parse to seconds instead of
// comparing the raw string.
function toSeconds(value: string): number {
  const match = value.match(/^([\d.e+-]+)(ms|s)$/);
  if (!match) throw new Error(`Unrecognized CSS time value: ${value}`);
  const [, num, unit] = match;
  return unit === "ms" ? Number(num) / 1000 : Number(num);
}

test("prefers-reduced-motion skips the hero ascent animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");

  const firstBlock = page.locator("svg rect").first();
  await expect(firstBlock).toBeVisible();

  const duration = await firstBlock.evaluate((el) => getComputedStyle(el).animationDuration);
  // globals.css forces 0.001ms under prefers-reduced-motion.
  expect(toSeconds(duration)).toBeLessThan(0.01);
});

test("without reduced motion, the hero ascent animation runs at its normal duration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");

  const firstBlock = page.locator("svg rect").first();
  const duration = await firstBlock.evaluate((el) => getComputedStyle(el).animationDuration);
  expect(toSeconds(duration)).toBeCloseTo(0.62, 2);
});

test("prefers-reduced-motion makes <Reveal>-wrapped content visible immediately with near-zero animation duration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");

  // useScrollReveal() checks matchMedia directly and marks content visible
  // on mount under reduced motion, without waiting for it to scroll into
  // view — so this section, though below the fold, should already carry
  // the reveal-up class with the global 0.001ms override applied.
  const revealed = page.locator(".reveal-up, .reveal-fade").first();
  await expect(revealed).toBeAttached();

  const duration = await revealed.evaluate((el) => getComputedStyle(el).animationDuration);
  expect(toSeconds(duration)).toBeLessThan(0.01);
});
