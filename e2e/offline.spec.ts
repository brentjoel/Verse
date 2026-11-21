import { test, expect } from "./fixtures";

test.use({ serviceWorkers: "allow", reducedMotion: "reduce" });

test("pages and WEB verses read offline, and Results are never cached", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  // The worker takes control, then caching the shell finishes in the background.
  await expect.poll(() => page.evaluate(async () => (await (await caches.open("verselight-v1")).keys()).length)).toBeGreaterThan(5);
  // A Results page loaded online must not be stored.
  await page.goto("/emotions/sad/lonely");
  await expect(page.getByRole("heading", { level: 1, name: "Lonely" })).toBeVisible();
  const stored = await page.evaluate(async () => (await (await caches.open("verselight-v1")).keys()).map(request => new URL(request.url).pathname));
  expect(stored.filter(path => /^\/emotions\/[^/]+\/[^/]+/.test(path))).toEqual([]);
  expect(stored).toContain("/");
  expect(stored).toContain("/offline");

  await context.setOffline(true);
  await page.goto("/breathe");
  await expect(page.getByRole("heading", { level: 1, name: "Breathe" })).toBeVisible();
  await page.goto("/emotions/sad/lonely");
  await expect(page).toHaveURL(/\/offline\?to=%2Femotions%2Fsad%2Flonely$/);
  await expect(page.getByRole("heading", { level: 1, name: "Lonely, offline" })).toBeVisible();
  await expect(page.locator(".translation-tag").first()).toHaveText("WEB");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How is your heart today?" })).toBeVisible();
});

test("the worker registers and has no push or notification code", async ({ page }) => {
  await page.goto("/");
  const registrations = await page.evaluate(async () => { await navigator.serviceWorker.ready; return (await navigator.serviceWorker.getRegistrations()).length; });
  expect(registrations).toBe(1);
  const subscription = await page.evaluate(async () => (await (await navigator.serviceWorker.ready).pushManager.getSubscription()) === null);
  expect(subscription).toBe(true);
});
