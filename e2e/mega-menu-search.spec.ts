import { test, expect } from "@playwright/test";

test.describe("Mega menu", () => {
  test("opens on click, shows grouped links, and navigates on selection", async ({ page }) => {
    await page.goto("/en");

    const trigger = page.getByRole("button", { name: "Explore Opportunities" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const landownersLink = page.getByRole("link", { name: "Landowners" }).first();
    await expect(landownersLink).toBeVisible();
    await landownersLink.click();

    await expect(page).toHaveURL(/\/en\/landowners$/);
  });

  test("closes on outside click", async ({ page }) => {
    await page.goto("/en");
    const trigger = page.getByRole("button", { name: "Explore Dyafa" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.locator("main").click({ position: { x: 10, y: 10 } });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("closes on Escape", async ({ page }) => {
    await page.goto("/en");
    const trigger = page.getByRole("button", { name: "Explore Proof" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("Header search", () => {
  test("opens the search drawer and navigates to /search with the query", async ({ page }) => {
    await page.goto("/en");

    await page.getByRole("button", { name: "Search" }).click();
    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toBeVisible();

    await dialog.getByPlaceholder(/Search insights, projects, opportunities/).fill("hospitality");
    await dialog.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page).toHaveURL(/\/en\/search\?q=hospitality$/);
  });
});

test.describe("/search page", () => {
  test("shows a no-results state for an obscure query", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("searchbox").fill("zzzzznotarealquery");
    await expect(page.getByText("No results found.")).toBeVisible({ timeout: 10_000 });
  });
});
