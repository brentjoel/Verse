import { test, expect, longestPassage, moodCount, noHorizontalOverflow } from "./fixtures";

test.describe("choosing a feeling", () => {
  test.use({ reducedMotion: "reduce" });

  test("the List view leads to a verse and an undo toast", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Anxious/ }).first().click();
    await page.getByRole("link", { name: "Overwhelmed" }).click();
    await expect(page).toHaveURL(/\/emotions\/anxious\/overwhelmed$/);
    await expect(page.getByRole("heading", { level: 1, name: "Overwhelmed" })).toBeVisible();
    await expect(page.getByText("Noted in your journal")).toBeVisible();
    await expect(page.locator(".passage-credit").first()).toContainText("World English Bible");
  });

  test("Undo removes exactly one journal entry, even when tapped twice", async ({ page }) => {
    await page.goto("/emotions/anxious");
    await page.getByRole("link", { name: "Afraid" }).click();
    await expect(page.getByText("Noted in your journal")).toBeVisible();
    const before = await moodCount(page);
    const undo = page.getByRole("button", { name: "Undo" });
    await undo.click();
    await undo.click({ force: true, timeout: 1000 }).catch(() => {});
    await expect(page.getByText("Removed from your journal")).toBeVisible();
    expect(await moodCount(page)).toBe(before - 1);
  });

  test("Save shows the verse in My Verses", async ({ page }) => {
    await page.goto("/emotions/anxious/overwhelmed");
    await page.locator(".verse-list > li:not([hidden]) .save-button").first().click();
    await expect(page.locator(".verse-list > li:not([hidden]) .save-button").first()).toContainText("Saved");
    await page.goto("/my-verses");
    await expect(page.locator(".saved-reference").first()).toHaveText("Psalm 61:2");
  });

  test("backup export downloads a JSON file", async ({ page }) => {
    await page.goto("/my-verses");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export backup" }).click();
    expect((await download).suggestedFilename()).toMatch(/^verselight-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

test.describe("the constellation wheel", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a chip chooses an emotion in one tap and a feeling chip opens the verses", async ({ page }) => {
    await page.goto("/");
    const sad = page.locator(".wheel-options").getByRole("button", { name: "Sad" });
    test.skip(!(await sad.waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false)), "This device starts in the List view.");
    await sad.click();
    await page.locator(".wheel-options").getByRole("link", { name: "Lonely" }).click();
    await expect(page).toHaveURL(/\/emotions\/sad\/lonely$/);
  });

  test("the keyboard turns the dial and chooses", async ({ page }) => {
    await page.goto("/");
    const lock = page.locator(".wheel-lock");
    test.skip(!(await lock.waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false)), "This device starts in the List view.");
    await lock.focus();
    await page.keyboard.press("ArrowRight");
    await expect(lock).toContainText("Sad");
    await page.keyboard.press("Enter");
    await expect(page.locator(".wheel-center a")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/emotions\/sad\/grieving$/);
  });

  test("without WebGL the List view appears and nothing errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      // Simulate a device with no WebGL; 2D canvas still works.
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        return type.startsWith("webgl") ? null : (original as (...args: unknown[]) => RenderingContext | null).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/");
    await expect(page.locator(".emotion-grid .emotion-link")).toHaveCount(8, { timeout: 10_000 });
    expect(errors).toEqual([]);
  });
});

test("Compare updates live when a translation is toggled", async ({ page }) => {
  await page.goto("/compare?ref=Psalm%2061%3A2");
  await page.locator(".compare-toggles").getByRole("button", { name: "KJV" }).click();
  await expect(page).toHaveURL(/translations=kjv/);
  await expect(page.getByRole("heading", { name: "King James Version" })).toBeVisible();
});

test("settings change theme and text size and remember them", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Daylight" }).click();
  await page.getByRole("button", { name: "Larger" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "larger");
});

test.describe("narrow phone with the largest text", () => {
  test.use({ viewport: { width: 320, height: 640 }, reducedMotion: "reduce" });

  test("the longest passage, Compare and the daily verse never scroll sideways", async ({ page, context, baseURL }) => {
    await context.addInitScript(() => localStorage.setItem("verselight-text-size", "larger"));
    const longest = longestPassage();
    await page.goto(longest.path);
    await page.getByRole("button", { name: "View all verses" }).click();
    await noHorizontalOverflow(page);
    await page.goto(`/compare?${new URLSearchParams({ ref: longest.reference })}`);
    await noHorizontalOverflow(page);
    await page.goto("/");
    await page.getByRole("button", { name: /Morning star/ }).click();
    await noHorizontalOverflow(page);
    expect(baseURL).toBeTruthy();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  // Results and Compare stream cookie-dependent passages and need JavaScript to reveal them (known limitation, see PROGRESS).
  test("Home and feeling pages still let you find your way", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".emotion-link")).toHaveCount(8);
    await page.locator(".emotion-link").first().click();
    await expect(page.locator(".specific-link")).toHaveCount(4);
    await expect(page.locator(".specific-link").first()).toHaveAttribute("href", /\/emotions\/[a-z-]+\/[a-z-]+$/);
  });
});

test.describe("night sky journal", () => {
  test.use({ reducedMotion: "reduce" });

  test("a chosen feeling becomes a star that opens its day, and the calendar is one tap away", async ({ page }) => {
    await page.goto("/emotions/sad");
    await page.getByRole("link", { name: "Lonely" }).click();
    await expect(page.getByText("Noted in your journal")).toBeVisible();
    await page.goto("/journal");
    const star = page.locator(".night-star");
    await expect(star).toHaveCount(1);
    await expect(star).toHaveAttribute("data-emotion", "sad");
    await noHorizontalOverflow(page);
    await star.click();
    await expect(page.getByRole("heading", { name: /^Reflections on / })).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the verses" })).toHaveAttribute("href", "/emotions/sad/lonely");
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.locator(".journal-calendar")).toBeVisible();
    await expect(page.locator(".night-sky")).toHaveCount(0);
    await noHorizontalOverflow(page);
  });
});

test("focus reading keeps only the passage and leaves with Escape", async ({ page }) => {
  await page.goto("/emotions/anxious/overwhelmed");
  const focus = page.getByRole("button", { name: "Focus" });
  await focus.click();
  await expect(page.getByRole("button", { name: "Exit focus" })).toBeFocused();
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".verse-actions").first()).toBeHidden();
  await expect(page.locator(".verse-text").first()).toBeVisible();
  await expect(page.locator(".passage-credit").first()).toBeVisible();
  await noHorizontalOverflow(page);
  await page.keyboard.press("Escape");
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.getByRole("button", { name: "Focus" })).toBeVisible();
});

test("breathe guides a round and stops", async ({ page }) => {
  await page.goto("/breathe");
  await expect(page.getByRole("heading", { name: "Breathe", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.locator(".breathe-label")).toHaveText("Breathe in");
  await expect(page.getByRole("button", { name: "Calm" })).toBeDisabled();
  await expect(page.locator(".breathe-label")).toHaveText("Hold", { timeout: 6000 });
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.locator(".breathe-label")).toHaveText("Ready");
  await page.getByRole("button", { name: "Steady" }).click();
  await expect(page.getByRole("button", { name: "Steady" })).toHaveAttribute("aria-pressed", "true");
});

test("Read 4 more verses shows the rest of the feeling's passages and comes back", async ({ page }) => {
  await page.goto("/emotions/anxious/overwhelmed");
  await expect(page.locator(".verse-reference").first()).toHaveText("Psalm 61:2");
  await page.getByRole("link", { name: "Read 4 more verses" }).click();
  await expect(page).toHaveURL(/\/emotions\/anxious\/overwhelmed\?more$/);
  await expect(page.locator(".verse-reference").first()).toHaveText("Psalm 55:22");
  await page.getByRole("link", { name: "Back to today's verses" }).click();
  await expect(page.locator(".verse-reference").first()).toHaveText("Psalm 61:2");
});

test.describe("return check-in", () => {
  test.use({ reducedMotion: "reduce" });

  test("a returning visitor is asked how their heart is now, and can dismiss it for the day", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Last time you felt/ })).toHaveCount(0);
    await page.goto("/emotions/sad");
    await page.getByRole("link", { name: "Lonely" }).click();
    await expect(page.getByText("Noted in your journal")).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Last time you felt/ })).toHaveCount(0);

    await page.clock.setFixedTime(new Date(Date.now() + 2 * 86_400_000));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Last time you felt Lonely. How is your heart now?" })).toBeVisible();
    await page.getByRole("button", { name: "About the same" }).click();
    await expect(page.getByRole("button", { name: "About the same" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: "Return to Lonely" })).toHaveAttribute("href", "/emotions/sad/lonely");
    await noHorizontalOverflow(page);

    await page.getByRole("button", { name: "Not now" }).click();
    await expect(page.getByRole("heading", { name: /Last time you felt/ })).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".emotion-link").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Last time you felt/ })).toHaveCount(0);
  });
});
