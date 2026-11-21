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

test.describe("future letters", () => {
  test.use({ reducedMotion: "reduce" });

  test("a sealed letter hides its text and an old one opens", async ({ page }) => {
    await page.goto("/journal");
    await page.getByLabel("Write to the person you will be").fill("Keep going, friend.");
    await page.getByRole("button", { name: "Seal this letter" }).click();
    await expect(page.getByText("A letter waits for")).toBeVisible();
    await expect(page.getByText("Keep going, friend.", { exact: true })).toHaveCount(0);
    await page.evaluate(() => localStorage.setItem("verselight-letters", JSON.stringify([{ id: "00000000-0000-4000-8000-000000000001", writtenOn: "2026-01-01", openOn: "2026-01-02", text: "You made it." }])));
    await page.reload();
    await expect(page.getByText("You made it.")).toBeVisible();
    await page.getByRole("button", { name: "Remove letter" }).click();
    await page.getByRole("button", { name: "Yes, remove" }).click();
    await expect(page.getByText("You made it.")).toHaveCount(0);
  });
});
