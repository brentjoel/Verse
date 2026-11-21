import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const routes = ["/", "/emotions/anxious", "/emotions/anxious/overwhelmed", "/compare?ref=Psalm%2061%3A2", "/my-verses", "/journal", "/breathe", "/year", "/about", "/craft", "/accessibility", "/not-sure", "/path/sad/lonely", "/offline?to=/emotions/sad/lonely"];

for (const theme of ["dark", "light"]) {
  test(`no detectable WCAG A/AA violations (${theme})`, async ({ page }) => {
    await page.addInitScript((value) => {
      try {
        localStorage.setItem("verselight-theme", value);
        // Phase C states: a pinned anchor, an opened and a sealed letter, and a started path.
        localStorage.setItem("verselight-anchor", JSON.stringify({ reference: "Psalm 46:1" }));
        localStorage.setItem("verselight-letters", JSON.stringify([{ id: "00000000-0000-4000-8000-000000000001", writtenOn: "2026-01-01", openOn: "2026-01-02", text: "You made it." }, { id: "00000000-0000-4000-8000-000000000002", writtenOn: "2026-01-01", openOn: "2099-01-01", text: "later" }]));
        localStorage.setItem("verselight-path", JSON.stringify({ emotionId: "sad", specificId: "lonely", startedOn: "2026-11-19" }));
        // Phase D states: a reflection with intensity and a check-in answer, an open and an answered prayer.
        const at = "2026-11-19T09:00:00.000Z";
        localStorage.setItem("verselight-data", JSON.stringify({ schemaVersion: 2, revision: 1, updatedAt: at, data: {
          preferences: { theme: value === "light" ? "light" : "dark", preferredTranslation: "web" }, savedVerses: [], collections: [], badges: [],
          moodEntries: [{ id: "00000000-0000-4000-8000-000000000010", emotionId: "sad", specificEmotionId: "lonely", localDate: "2026-11-19", createdAt: at, note: "A long day.", intensity: "high", checkIn: { answer: "lighter", on: "2026-11-20" } }],
          activityDays: [{ localDate: "2026-11-19", firstActivityAt: at, utcOffsetMinutes: 0, sources: ["emotion"] }],
          streakState: { currentStreak: 0, longestStreak: 1, graceDates: [], maxObservedLocalDate: "2026-11-19", maxObservedAt: at },
          letters: [], marks: [],
          prayers: [{ id: "00000000-0000-4000-8000-000000000011", text: "Peace for my family", addedOn: "2026-11-02" }, { id: "00000000-0000-4000-8000-000000000012", text: "A new job", addedOn: "2026-10-01", answeredOn: "2026-11-20" }],
        } }));
      } catch { /* ignore */ }
    }, theme);
    for (const route of routes) {
      await page.goto(route);
      await page.getByRole("main").waitFor();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.waitForTimeout(500);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(violations.map((v) => `${route}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(" ")}`), route).toEqual([]);
    }
  });
}

for (const theme of ["dark", "light"]) {
  test(`the journal passcode screens have no detectable WCAG A/AA violations (${theme})`, async ({ page }) => {
    await page.addInitScript((value) => { try { localStorage.setItem("verselight-theme", value); } catch { /* ignore */ } }, theme);
    const scan = async (label: string) => {
      await page.waitForTimeout(300);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(violations.map((v) => `${label}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(" ")}`), label).toEqual([]);
    };
    await page.goto("/journal");
    await page.getByRole("button", { name: "Set a passcode" }).click();
    await scan("set passcode form");
    await page.getByLabel("New passcode").fill("quiet morning");
    await page.getByLabel("Type it again").fill("quiet morning");
    await page.getByLabel(/I understand/).check();
    await page.getByRole("button", { name: "Lock my journal" }).click();
    await expect(page.getByRole("button", { name: "Lock now" })).toBeVisible();
    await scan("passcode set");
    await page.getByRole("button", { name: "Lock now" }).click();
    await expect(page.getByRole("heading", { name: "Your journal is locked" })).toBeFocused();
    await page.getByRole("button", { name: "Forgot your passcode?" }).click();
    await scan("locked journal");
    await page.getByLabel("Passcode").fill("quiet morning");
    await page.getByRole("button", { name: "Open my journal" }).click();
    await expect(page.locator("#calendar-heading")).toBeFocused();
  });
}
