import { test, expect } from "./fixtures";

test.describe("anchor verse", () => {
  test.use({ reducedMotion: "reduce" });

  test("pinning on Results shows the verse on Home and Unpin removes it", async ({ page }) => {
    await page.goto("/emotions/anxious/overwhelmed");
    await page.locator(".verse-list > li:not([hidden]) button[aria-pressed]").first().click();
    await page.goto("/");
    const anchor = page.getByRole("region", { name: "Your anchor" });
    await expect(anchor).toContainText("Psalm 61:2");
    await anchor.getByRole("button", { name: "Unpin" }).click();
    await expect(anchor).toHaveCount(0);
  });

  test("a tampered key shows nothing", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("verselight-anchor", JSON.stringify({ reference: "Nope 9:9" })));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "How is your heart today?" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Your anchor" })).toHaveCount(0);
  });
});
