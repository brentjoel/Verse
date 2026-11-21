import { test, expect } from "./fixtures";

// Screenshots compare layout and color only. The WebGL canvas and ambient stars are masked or disabled.
const routes = ["/", "/emotions/anxious", "/emotions/anxious/overwhelmed", "/compare?ref=Psalm%2061%3A2", "/my-verses", "/journal", "/about", "/not-a-page"];

for (const theme of ["dark", "light"] as const) {
  test.describe(`${theme} theme @visual`, () => {
    test.use({ colorScheme: theme, reducedMotion: "reduce" });

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-11-20T09:00:00"));
      await page.addInitScript(t => localStorage.setItem("verselight-theme", t), theme);
      // Seed one saved verse and one reflection through the real UI.
      await page.goto("/emotions/anxious/overwhelmed");
      await page.locator(".verse-list > li:not([hidden]) .save-button").first().click();
      await expect(page.locator(".verse-list > li:not([hidden]) .save-button").first()).toContainText("Saved");
    });

    for (const route of routes) {
      test(`${route} @visual`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot(`${theme}${route.replace(/[^a-z0-9]+/gi, "-")}.png`, { fullPage: true, mask: [page.locator("canvas")] });
      });
    }
  });
}
