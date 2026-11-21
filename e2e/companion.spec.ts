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

test.describe("gentle path", () => {
  test.use({ reducedMotion: "reduce" });

  test("begin a path, see only day one, and leave", async ({ page }) => {
    await page.goto("/emotions/sad/lonely");
    await page.getByRole("link", { name: "Walk a seven-day path" }).click();
    await expect(page.getByRole("heading", { name: "Lonely: a gentle path" })).toBeVisible();
    await page.getByRole("button", { name: "Begin this path today" }).click();
    await expect(page.getByRole("status")).toContainText("Day 1 of 7");
    await expect(page.locator(".path-day[data-today] .verse-text")).toBeVisible();
    await expect(page.locator(".path-day[data-locked]")).toHaveCount(6);
    await page.reload();
    await expect(page.getByRole("status")).toContainText("Day 1 of 7");
    await page.getByRole("button", { name: "Leave this path" }).click();
    await expect(page.getByRole("button", { name: "Begin this path today" })).toBeVisible();
  });

  test("a later day opens more verses", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-24T09:00:00"));
    await page.addInitScript(() => localStorage.setItem("verselight-path", JSON.stringify({ emotionId: "sad", specificId: "lonely", startedOn: "2026-11-21" })));
    await page.goto("/path/sad/lonely");
    await expect(page.getByRole("status")).toContainText("Day 4 of 7");
    await expect(page.locator(".path-day .verse-text")).toHaveCount(4);
  });
});

test.describe("printable journal", () => {
  test.use({ reducedMotion: "reduce" });

  test("the button prints and the print view shows only the journal", async ({ page }) => {
    await page.addInitScript(() => { (window as unknown as { printed: number }).printed = 0; window.print = () => { (window as unknown as { printed: number }).printed++; }; });
    await page.goto("/emotions/anxious");
    await page.getByRole("link", { name: "Overwhelmed" }).click();
    await expect(page.getByText("Noted in your journal")).toBeVisible();
    await page.goto("/journal");
    await page.getByRole("button", { name: "Print or save as PDF" }).click();
    expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
    await expect(page.locator(".print-journal")).toHaveCount(0);
    await page.emulateMedia({ media: "print" });
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await expect(page.locator(".print-journal")).toBeVisible();
    await expect(page.locator(".print-journal")).toContainText("Overwhelmed");
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator("#letters-heading")).toBeHidden();
  });
});
