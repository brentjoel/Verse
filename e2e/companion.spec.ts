import { test, expect } from "./fixtures";

test.describe("anchor verse", () => {
  test.use({ reducedMotion: "reduce" });

  test("pinning on Results shows the verse on Home and Unpin removes it", async ({ page }) => {
    await page.goto("/emotions/anxious/overwhelmed");
    await page.locator(".verse-list > li:not([hidden])").getByRole("button", { name: /^Pin/ }).first().click();
    await page.goto("/");
    const anchor = page.getByRole("region", { name: "Your anchor" });
    await expect(anchor).toContainText("Psalm 61:2");
    await anchor.getByRole("button", { name: "Unpin" }).click();
    await expect(anchor).toHaveCount(0);
  });

  test("an anchor in the old separate key moves into the main record", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("verselight-anchor", JSON.stringify({ reference: "Psalm 46:1" })));
    await page.reload();
    await expect(page.getByRole("region", { name: "Your anchor" })).toContainText("Psalm 46:1");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("verselight-anchor"))).toBeNull();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("verselight-data") ?? "{}").data?.anchor)).toBe("Psalm 46:1");
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

test.describe("prayer list", () => {
  test.use({ reducedMotion: "reduce" });

  test("add a prayer, mark it answered with today's date, and undo", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-21T09:00:00"));
    await page.goto("/journal");
    await page.getByLabel("Something to bring to God").fill("Peace for my family");
    await page.getByRole("button", { name: "Add to my prayers" }).click();
    const open = page.getByRole("list", { name: "Still praying" });
    await expect(open).toContainText("Peace for my family");
    await open.getByRole("button", { name: "Mark answered" }).click();
    const answered = page.getByRole("list", { name: "Answered prayers" });
    await expect(answered).toContainText("Answered");
    await expect(answered.locator("time").first()).toHaveAttribute("datetime", "2026-11-21");
    await page.reload();
    await expect(answered).toContainText("Peace for my family");
    await answered.getByRole("button", { name: "Not yet answered" }).click();
    await expect(open).toContainText("Peace for my family");
  });
});

test.describe("journal passcode", () => {
  test.use({ reducedMotion: "reduce" });

  test("locking encrypts the prayers, a reload asks for the passcode, and it opens again", async ({ page }) => {
    await page.goto("/journal");
    await page.getByLabel("Something to bring to God").fill("TEST_SECRET_PRAYER");
    await page.getByRole("button", { name: "Add to my prayers" }).click();
    await expect(page.getByRole("list", { name: "Still praying" })).toContainText("TEST_SECRET_PRAYER");
    await page.getByRole("button", { name: "Set a passcode" }).click();
    await expect(page.getByText("If you forget this passcode, your locked notes, letters and prayers are lost.")).toBeVisible();
    await page.getByLabel("New passcode").fill("quiet morning");
    await page.getByLabel("Type it again").fill("quiet morning");
    await page.getByRole("button", { name: "Lock my journal" }).click();
    await expect(page.locator(".local-error")).toContainText("forgotten passcode");
    await page.getByLabel(/I understand/).check();
    await page.getByRole("button", { name: "Lock my journal" }).click();
    await expect(page.getByRole("button", { name: "Lock now" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("verselight-data"))).not.toContain("TEST_SECRET_PRAYER");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Your journal is locked" })).toBeVisible();
    await expect(page.getByText("TEST_SECRET_PRAYER")).toHaveCount(0);
    await page.getByLabel("Passcode").fill("wrong words");
    await page.getByRole("button", { name: "Open my journal" }).click();
    await expect(page.locator(".local-error")).toContainText("did not open");
    await page.getByLabel("Passcode").fill("quiet morning");
    await page.getByRole("button", { name: "Open my journal" }).click();
    await expect(page.getByRole("list", { name: "Still praying" })).toContainText("TEST_SECRET_PRAYER");
    await page.getByRole("button", { name: "Lock now" }).click();
    await expect(page.getByRole("heading", { name: "Your journal is locked" })).toBeVisible();
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

test.describe("this spoke to me", () => {
  test.use({ reducedMotion: "reduce" });

  test("marking toggles, and a marked verse in the other four is pointed out", async ({ page }) => {
    await page.goto("/emotions/anxious/overwhelmed");
    const first = page.locator(".verse-list > li").first();
    const button = first.getByRole("button", { name: /This spoke to me/ });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(first.getByRole("button", { name: /It spoke to me/ })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(first.getByRole("button", { name: /It spoke to me/ })).toBeVisible();
    await page.evaluate(() => localStorage.setItem("verselight-spoke", JSON.stringify(["Psalm 94:19", "Nope 1:1"])));
    await page.reload();
    await expect(page.locator(".marked-note")).toHaveCount(1);
  });
});

test.describe("time-of-day sky", () => {
  for (const [time, phase] of [["06:30", "dawn"], ["12:00", "day"], ["18:30", "dusk"], ["23:00", "night"]] as const) {
    test(`Home at ${time} is ${phase}`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(`2026-11-21T${time}:00`));
      await page.goto("/");
      await expect(page.locator(".time-sky")).toHaveAttribute("data-phase", phase);
    });
  }
});

test.describe("not sure what I feel", () => {
  test.use({ reducedMotion: "reduce" });

  test("three answers lead to a feeling", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Not sure what I feel?" }).click();
    await page.getByRole("button", { name: "Light and warm" }).click();
    await page.getByRole("button", { name: "Something good" }).click();
    await expect(page.getByRole("heading", { name: "What would help most right now?" })).toBeFocused();
    await page.getByRole("button", { name: "A way to say thank you" }).click();
    await expect(page.getByRole("heading", { name: "This sounds like Grateful" })).toBeVisible();
    await page.getByRole("link", { name: "Find verses for Grateful" }).click();
    await expect(page).toHaveURL(/\/emotions\/grateful$/);
  });

  test("Back changes an answer", async ({ page }) => {
    await page.goto("/not-sure");
    await page.getByRole("button", { name: "In my chest, a heaviness" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("heading", { name: "Where do you notice it most?" })).toBeVisible();
  });
});
