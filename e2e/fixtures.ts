import { test as base, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every test reads public-domain WEB only, so no NLT text can reach screenshots or the repo.
export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await context.addCookies([{ name: "translation", value: "web", url: baseURL! }]);
    await use(context);
  },
});
export { expect };

const web = JSON.parse(readFileSync(join(process.cwd(), "data/verses/web.json"), "utf8")) as Record<string, string>;
const emotions = JSON.parse(readFileSync(join(process.cwd(), "data/emotions.json"), "utf8")) as { id: string; specifics: { id: string; references: string[] }[] }[];

/** The curated feeling whose passages include the longest WEB text, for overflow checks. */
export function longestPassage() {
  let best = { path: "", reference: "", length: 0 };
  for (const emotion of emotions) for (const specific of emotion.specifics) for (const reference of specific.references) {
    const length = web[reference]?.length ?? 0;
    if (length > best.length) best = { path: `/emotions/${emotion.id}/${specific.id}`, reference, length };
  }
  return best;
}

export async function moodCount(page: Page): Promise<number> {
  return page.evaluate(() => { try { return JSON.parse(localStorage.getItem("verselight-data") ?? "null")?.data.moodEntries.length ?? 0; } catch { return 0; } });
}

export async function noHorizontalOverflow(page: Page) {
  const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
  expect(scroll, "page must not scroll sideways").toBeLessThanOrEqual(width);
}
