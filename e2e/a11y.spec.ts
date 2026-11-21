import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const routes = ["/", "/emotions/anxious", "/emotions/anxious/overwhelmed", "/compare?ref=Psalm%2061%3A2", "/my-verses", "/journal", "/breathe", "/about", "/craft", "/accessibility"];

for (const theme of ["dark", "light"]) {
  test(`no detectable WCAG A/AA violations (${theme})`, async ({ page }) => {
    await page.addInitScript((value) => { try { localStorage.setItem("verselight-theme", value); } catch { /* ignore */ } }, theme);
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
