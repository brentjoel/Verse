import { test, expect } from "./fixtures";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// README media. Run by hand: npx playwright test e2e/capture.spec.ts --project=desktop --grep @capture
// WEB only (fixtures set the cookie), so no NLT text is ever captured.
const out = join(process.cwd(), "docs");
test.describe.configure({ mode: "serial" });
test.use({ launchOptions: { args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] }, reducedMotion: "no-preference", colorScheme: "dark" });

async function settle(ms = 2500) { await new Promise(resolve => setTimeout(resolve, ms)); }

test("screenshots @capture", async ({ page, browser }) => {
  mkdirSync(join(out, "screenshots"), { recursive: true });
  await page.goto("/");
  await expect(page.locator(".wheel-lock")).toBeVisible({ timeout: 10_000 });
  await settle();
  await page.screenshot({ path: join(out, "screenshots/wheel-dark.png") });

  await page.goto("/emotions/anxious/overwhelmed");
  await settle(3500);
  await page.screenshot({ path: join(out, "screenshots/dawn.png") });

  await page.goto("/journal");
  await settle(1500);
  await page.screenshot({ path: join(out, "screenshots/journal.png") });

  const light = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  await light.addCookies([{ name: "translation", value: "web", url: "http://localhost:3200" }]);
  await light.addInitScript(() => localStorage.setItem("verselight-theme", "light"));
  const lightPage = await light.newPage();
  await lightPage.goto("http://localhost:3200/");
  await settle();
  await lightPage.locator(".wheel-options").getByRole("button", { name: "Hopeful" }).click().catch(() => {});
  await settle();
  await lightPage.screenshot({ path: join(out, "screenshots/light.png") });
  await light.close();

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark" });
  await phone.addCookies([{ name: "translation", value: "web", url: "http://localhost:3200" }]);
  const phonePage = await phone.newPage();
  await phonePage.goto("http://localhost:3200/");
  await settle();
  await phonePage.screenshot({ path: join(out, "screenshots/mobile.png") });
  await phone.close();
});

test("demo video @capture", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, colorScheme: "dark", recordVideo: { dir: join(process.cwd(), "test-results/demo"), size: { width: 1280, height: 720 } } });
  await context.addCookies([{ name: "translation", value: "web", url: "http://localhost:3200" }]);
  const page = await context.newPage();
  await page.goto("http://localhost:3200/");
  await settle(2500);
  for (const step of [1, 1, 1]) { await page.locator(".wheel-lock").focus(); await page.keyboard.press(step > 0 ? "ArrowRight" : "ArrowLeft"); await settle(700); }
  await page.locator(".wheel-options").getByRole("button", { name: "Tired" }).click();
  await settle(1800);
  await page.locator(".wheel-options").getByRole("link", { name: "Need strength" }).click();
  await settle(5000);
  const video = page.video();
  await context.close();
  if (video) copyFileSync(await video.path(), join(out, "media/demo.webm"));
});
