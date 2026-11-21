import { test, expect } from "./fixtures";

async function wheelReady(page: import("@playwright/test").Page) {
  await page.goto("/");
  return page.locator(".wheel-lock").waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false);
}

test.describe("review fixes", () => {
  test.use({ reducedMotion: "no-preference" });

  test("Compare keeps keyboard focus and one chip group after a toggle", async ({ page }) => {
    await page.goto("/compare?ref=Psalm%2061%3A2");
    const kjv = page.locator(".compare-toggles").getByRole("button", { name: "KJV" });
    await kjv.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/translations=kjv/);
    await expect(page.locator(".compare-toggles")).toHaveCount(1);
    await expect(page.locator(".compare-toggles").getByRole("button", { name: "KJV" })).toBeFocused();
    await expect(page.locator(".compare-toggles [role=status]")).not.toHaveText("Updating...", { timeout: 10_000 });
  });

  test("leaving the inner ring returns focus to the dial and names the emotion", async ({ page }) => {
    test.skip(!(await wheelReady(page)), "This device starts in the List view.");
    await page.locator(".wheel-options").getByRole("button", { name: "Sad" }).click();
    await expect(page.locator(".wheel-topbar")).toContainText("Sad");
    await page.getByRole("button", { name: /All feelings/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".wheel-lock")).toBeFocused();
  });

  test("vertical scrolling over the dial scrolls the page instead of turning the wheel", async ({ page }) => {
    test.skip(!(await wheelReady(page)), "This device starts in the List view.");
    const before = await page.locator(".wheel-lock").textContent();
    const box = (await page.locator(".wheel-dial").boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect(page.locator(".wheel-lock")).toHaveText(before!);
  });

  test("losing WebGL mid-session shows the List, keeps focus and offers the wheel again", async ({ page }) => {
    test.skip(!(await wheelReady(page)), "This device starts in the List view.");
    await page.locator("canvas").waitFor({ state: "attached", timeout: 8000 });
    await page.locator(".wheel-lock").focus();
    await page.locator("canvas").evaluate(canvas => canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
    await expect(page.locator(".emotion-grid .emotion-link")).toHaveCount(8);
    await expect(page.getByRole("heading", { name: "All feelings" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Wheel" })).toBeVisible();
  });

  test("particles follow a theme change right away", async ({ page }) => {
    test.skip(!(await wheelReady(page)), "This device starts in the List view.");
    await expect(page.locator(".wheel-canvas[data-daylight]")).toHaveCount(1, { timeout: 8000 });
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Daylight" }).click();
    await expect(page.locator('.wheel-canvas[data-daylight="true"]')).toHaveCount(1, { timeout: 500 });
    await page.getByRole("button", { name: "Night" }).click();
    await expect(page.locator('.wheel-canvas[data-daylight="false"]')).toHaveCount(1, { timeout: 500 });
  });
});

test("pills inside state panels keep their readable text color", async ({ page }) => {
  await page.goto("/not-a-real-page");
  const pill = page.locator(".state-panel .pill");
  await expect(pill).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("saved verses are evenly spaced", async ({ page }) => {
  await page.goto("/emotions/anxious/overwhelmed");
  await page.locator(".verse-list > li:not([hidden]) .save-button").first().click();
  await page.locator(".verse-list > li:not([hidden])").getByRole("button", { name: "Next verse" }).click();
  await expect(page.locator(".verse-carousel [role=status]").first()).toHaveText("Verse 2 of 4");
  await page.locator(".verse-list > li:not([hidden]) .save-button").first().click();
  await expect(page.locator(".verse-list > li:not([hidden]) .save-button").first()).toContainText("Saved");
  await page.goto("/my-verses");
  await expect(page.locator(".saved-list > li")).toHaveCount(2);
  await expect(page.locator(".saved-list > li").nth(1)).toHaveCSS("margin-top", "0px");
});

test.describe("touch", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("the undo toast goes away after a tap and focus stays in the page", async ({ page }) => {
    await page.goto("/emotions/anxious");
    await page.getByRole("link", { name: "Afraid" }).tap();
    await page.getByRole("button", { name: "Undo" }).tap();
    await expect(page.getByText("Removed from your journal")).toBeVisible();
    await expect(page.getByText("Removed from your journal")).toBeHidden({ timeout: 6000 });
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
  });
});
