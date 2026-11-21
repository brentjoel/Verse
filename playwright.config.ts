import { defineConfig, devices } from "@playwright/test";

const port = 3200;

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  expect: { timeout: 8_000, toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.01 } },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure", serviceWorkers: "block" },
  // Pins the daily verse rotation so screenshots and flows see the same passages every day.
  webServer: { command: `npm run start -- -p ${port}`, env: { VERSELIGHT_TODAY: "2026-11-19" }, port, reuseExistingServer: !process.env.CI, timeout: 120_000 },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
