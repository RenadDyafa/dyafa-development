import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A conservative worker count and a couple of local retries absorb this
  // Windows dev-server setup's occasional ERR_NETWORK_IO_SUSPENDED /
  // dev-mode-first-compile flakiness under heavy parallel load — a
  // production build behind a real server has neither issue.
  workers: 4,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000/en",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
