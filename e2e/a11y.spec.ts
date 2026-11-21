import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const routes = ["/", "/emotions/anxious", "/emotions/anxious/overwhelmed", "/compare?ref=Psalm%2061%3A2", "/my-verses", "/journal", "/breathe", "/about", "/craft", "/accessibility", "/not-sure", "/path/sad/lonely", "/offline?to=/emotions/sad/lonely"];

for (const theme of ["dark", "light"]) {
  test(`no detectable WCAG A/AA violations (${theme})`, async ({ page }) => {
    await page.addInitScript((value) => {
      try {
        localStorage.setItem("verselight-theme", value);
        // Phase C states: a pinned anchor, an opened and a sealed letter, and a started path.
        localStorage.setItem("verselight-anchor", JSON.stringify({ reference: "Psalm 46:1" }));
        localStorage.setItem("verselight-letters", JSON.stringify([{ id: "00000000-0000-4000-8000-000000000001", writtenOn: "2026-01-01", openOn: "2026-01-02", text: "You made it." }, { id: "00000000-0000-4000-8000-000000000002", writtenOn: "2026-01-01", openOn: "2099-01-01", text: "later" }]));
        localStorage.setItem("verselight-path", JSON.stringify({ emotionId: "sad", specificId: "lonely", startedOn: "2026-11-19" }));
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
