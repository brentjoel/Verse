# Constellation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Verselight's night-and-gold look with the "Constellation" world: void canvas, huge light type, violet actions, amber spark, and an interactive particle-constellation emotion wheel, across every screen, with e2e, visual and Lighthouse checks in CI.

**Architecture:** Behavior, data, routes and storage stay; the visual layer is replaced. Pure decision logic (emotion hues, quality tiers, lean weights, text size, undo intent) lives in `lib/` with node:test coverage. The wheel renders through one `THREE.Points` draw call with a custom shader; DOM labels, chips and a server-rendered List view carry all semantics and fallbacks. The 753-line `app/globals.css` becomes ordered partials in `app/styles/`.

**Tech Stack:** Next.js 16 App Router (read `node_modules/next/dist/docs/` before using any Next API), React 19, strict TypeScript, Tailwind v4 imports, Three.js 0.186, node:test, new dev dependencies `@playwright/test` (e2e and screenshots) and `@lhci/cli` (Lighthouse budgets).

**Spec:** `docs/superpowers/specs/2026-11-20-constellation-redesign-design.md` (approved 2026-11-20). Read it before every task; it holds the token tables, type scale, screen sketches and the builder's calls.

## Global Constraints

- Privacy: never send user data to any server. The translation preference cookie is the sole documented preference exception; never put personal records in cookies, URLs, requests, or logs. Never add analytics or tracking.
- Strictly noncommercial: no ads, payments, subscriptions, donations, or paid features.
- NLT default via official Tyndale API, server-side `NLT_API_KEY` only. Never log credentials or persist NLT verse text in browser storage, backups, files, framework caches, images or the repository. Preserve wording and attribution; never invent Bible text.
- KJV, WEB, ASV, BSB use static public-domain files. WEB is the labeled fallback. Keep the disabled NIV Coming soon option. Never scrape or copy NIV text.
- Share, social, screenshot and README images use public-domain WEB text only; all tests and captures set the cookie `translation=web`.
- Accessibility: WCAG AA text and controls in Night and Daylight, visible focus, 44px targets, full keyboard paths, reduced motion (no particle motion, instant Scripture), screen-reader names and live regions, no-JavaScript and no-WebGL paths keep working.
- Scripture: 32px desktop / 26px phone at Default text size, Compare 24px, serif stack `"New York", ui-serif, var(--font-lora), Georgia, serif`, weight 400, `--ink`; attribution directly under every quotation.
- Sans stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", var(--font-geist), system-ui, sans-serif`. No font files added; Apple fonts never self-hosted.
- Violet `--action` only for filled pill buttons, the current pager dot, the active-nav dot and focus rings; at most one filled pill per view. No cards, shadows or gradients on components (gradients only in the logo and particles).
- Copy: warm, plain, no em dashes.
- Budgets: mobile Lighthouse 90+ in all four categories on `/` and `/emotions/anxious/overwhelmed`; wheel never blocks first paint.
- No new runtime dependencies. Every new dev dependency gets a one-line reason in the PR.
- `npm run check` passes at the end of every task; commit after every task with the attribution line from AGENTS.md.

## Review Focus

1. WebGL unavailable, context lost mid-session, or fps collapse: the List view appears in place with no layout jump and focus is not lost (Task 6 test).
2. Theme switched while particles or the dawn burst animate: colors follow the new theme within one frame and no Night color sticks in Daylight (Task 5 test).
3. Text size Larger on a 320px-wide phone with the longest curated passage: no horizontal overflow on Results, Compare and the daily dialog (Task 12 e2e).
4. Undo after navigating away, double-tapping Undo, or in storage-conflict mode: no crash, at most one removal, the toast explains the failure (Task 8 tests).
5. JavaScript disabled: Home shows the List view, Results shows all four passages with attribution, Compare's GET form works (Task 12 e2e).

## File map

| Path | Responsibility |
| --- | --- |
| `lib/constellation.ts` (new) | Emotion hues, quality tiers, lean weights. Pure. |
| `lib/wheel.ts` | Keep `wrapIndex`; remove waveform, `needsSimplePicker`, `isSlowWheel`. |
| `lib/theme.ts` | Theme and text-size resolution and the single pre-paint script. |
| `lib/translation-client.ts` (new) | `setTranslationCookie` shared by settings and compare. |
| `lib/dawn.ts` | Add one-use undo intent next to the dawn intent. |
| `lib/storage.ts` | `recordMood` accepts a caller-supplied id. |
| `app/styles/tokens.css`, `base.css`, `layout.css`, `components.css`, `screens.css` (new) | The stylesheet, in that order. |
| `app/globals.css` | Only imports (Tailwind, tw-animate, shadcn if still used, then the partials). |
| `components/constellation-scene.tsx` (replaces `wheel-scene.tsx`) | WebGL particle wheel. |
| `components/wheel-picker.tsx` | Wheel / List switch, hero split, chips, intensity. |
| `components/settings-sheet.tsx` (new), `components/theme-sync.tsx` (new) | Settings dialog; theme-color and system-theme syncing moved out of the old toggle. |
| `components/ambient-sky.tsx` (new) | Low-cost drifting star field for non-Home pages. |
| `components/undo-toast.tsx` (new) | "Noted in your journal · Undo". |
| `components/compare-toggles.tsx` (new) | Live translation chips on Compare. |
| `components/brand-mark.tsx` | New logo. |
| `e2e/` (new), `playwright.config.ts` (new), `lighthouserc.json` (new) | Browser tests and budgets. |

---

### Task 1: Pure constellation logic

**Files:**
- Create: `lib/constellation.ts`
- Modify: `lib/wheel.ts` later: its waveform helpers, `needsSimplePicker` and `isSlowWheel` are deleted in Task 5 together with `wheel-scene.tsx`, so every task leaves the build green; keep `wrapIndex`
- Test: `scripts/test-wheel.mjs` (rewrite)

**Interfaces:**
- Produces:
  - `emotionHues: Readonly<Record<string, { night: string; day: string }>>` with the spec's 8 pairs (anxious `#2dd4bf`/`#0f8f80`, sad `#4f8cff`/`#2457c5`, angry `#ff5a5f`/`#c62f35`, tired `#a78bfa`/`#6d4fd6`, guilty `#22d3ee`/`#0e7f93`, grateful `#facc15`/`#9a7a00`, hopeful `#ffb829`/`#a35f00`, doubtful `#f472b6`/`#b8357a`)
  - `type QualityTier = "high" | "medium" | "low" | "list"`
  - `tierSettings: Record<Exclude<QualityTier, "list">, { particles: number; maxDpr: number }>` = high 9000/2, medium 5000/1.5, low 2500/1
  - `initialTier(hints: { reducedMotion: boolean; cores?: number; memory?: number; width: number }): QualityTier`
  - `nextTier(current: QualityTier, averageFps: number): QualityTier`
  - `leanWeights(scores: Readonly<Record<string, number>>, order: readonly string[]): number[]`

- [ ] **Step 1: Write failing tests in `scripts/test-wheel.mjs`**

```js
test('every source emotion has a distinct hue pair', () => {
  assert.deepEqual(Object.keys(emotionHues).sort(), emotions.map(e => e.id).sort());
  for (const { night, day } of Object.values(emotionHues)) { assert.match(night, /^#[\da-f]{6}$/i); assert.match(day, /^#[\da-f]{6}$/i); }
  assert.equal(new Set(Object.values(emotionHues).map(h => h.night)).size, 8);
});
test('initial tier respects motion and capability hints', () => {
  assert.equal(initialTier({ reducedMotion: true, cores: 8, width: 1440 }), 'list');
  assert.equal(initialTier({ reducedMotion: false, cores: 2, width: 1440 }), 'list');
  assert.equal(initialTier({ reducedMotion: false, cores: 8, memory: 8, width: 1440 }), 'high');
  assert.equal(initialTier({ reducedMotion: false, cores: 8, memory: 8, width: 390 }), 'medium');
  assert.equal(initialTier({ reducedMotion: false, cores: 4, width: 390 }), 'low');
  assert.equal(initialTier({ reducedMotion: false, memory: 2, width: 1440 }), 'low');
  assert.equal(initialTier({ reducedMotion: false, width: 1440 }), 'high');
});
test('measured fps steps down one tier and falls back only from low', () => {
  assert.equal(nextTier('high', 58), 'high');
  assert.equal(nextTier('high', 40), 'medium');
  assert.equal(nextTier('medium', 40), 'low');
  assert.equal(nextTier('low', 40), 'low');
  assert.equal(nextTier('low', 20), 'list');
  assert.equal(nextTier('high', 20), 'medium');
  assert.equal(nextTier('list', 60), 'list');
});
test('lean weights normalize to the strongest emotion and ignore junk', () => {
  const order = emotions.map(e => e.id);
  assert.deepEqual(leanWeights({}, order), order.map(() => 0));
  const w = leanWeights({ anxious: 2, sad: 1, angry: -3, tired: Number.NaN, unknown: 9 }, order);
  assert.equal(w[order.indexOf('anxious')], 1); assert.equal(w[order.indexOf('sad')], .5);
  assert.equal(w[order.indexOf('angry')], 0); assert.equal(w[order.indexOf('tired')], 0);
  assert.equal(w.length, order.length);
});
```
Keep the existing `wrapIndex` test unchanged.

- [ ] **Step 2: Run `node --test scripts/test-wheel.mjs`.** Expected: FAIL (module exports missing).
- [ ] **Step 3: Implement `lib/constellation.ts`.** `initialTier`: list if reduced motion or cores ≤ 2; low if memory ≤ 2 or cores ≤ 4; medium if width < 640; else high (missing hints never lower the tier). `nextTier`: list stays list; fps < 24 at low gives list; fps < 50 steps down one (low stays low); otherwise unchanged.
- [ ] **Step 4: Run `node --test scripts/test-wheel.mjs`.** Expected: PASS (old waveform tests stay until Task 5 deletes that code).
- [ ] **Step 5: `npm run check` passes; commit** `Add pure constellation hue, tier and lean logic`.

### Task 2: Tokens, type, theme and text-size foundation

**Files:**
- Create: `app/styles/tokens.css`
- Modify: `lib/theme.ts`, `app/layout.tsx`, `scripts/test-theme.mjs` (rewrite token assertions), `next.config.ts` only if CSP needs nothing new (it should not)
- Test: `scripts/test-theme.mjs`

**Interfaces:**
- Produces:
  - CSS custom properties on `:root` (Night) and `:root[data-theme="light"]` (Daylight): `--canvas --ink --ink-2 --ink-3 --action --on-action --spark --hairline --veil` with the spec's values; `--font-sans`, `--font-scripture`; type scale `--text-display --text-heading-lg --text-heading --text-heading-sm --text-body --text-caption` (phone values on `:root`, desktop values in `@media (min-width: 900px)`); space `--space-1..9` = 6,12,18,24,30,36,60,96,120px; `--radius-pill: 9999px; --radius-panel: 24px`; motion `--motion-fast 150ms --motion-base 220ms --motion-slow 420ms --motion-scene 900ms --ease-out cubic-bezier(.16,1,.3,1) --ease-move cubic-bezier(.65,0,.35,1)`; `--scripture-scale` set by `[data-text-size="large"]` 1.15 and `"larger"` 1.3 (default 1); `[data-emotion="<id>"] { --emotion: <night hex> }` and Daylight overrides with day hex.
  - `lib/theme.ts`: `type ThemeChoice = "dark" | "light" | "system"`, `type TextSize = "default" | "large" | "larger"`, `resolveTextSize(value: string | null | undefined): TextSize`, `THEME_KEY = "verselight-theme"`, `TEXT_SIZE_KEY = "verselight-text-size"`, and `themeScript` extended to also set `document.documentElement.dataset.textSize`.
  - Daylight keeps `color-scheme: only light`.

- [ ] **Step 1: Rewrite `scripts/test-theme.mjs`** to read `app/styles/tokens.css` and assert, for both palettes: `--ink`, `--ink-2`, `--ink-3`, `--spark` and `--action` each ≥ 4.5:1 on `--canvas`; `--on-action` ≥ 4.5:1 on `--action`; `--ink` ≥ 4.5:1 on `--canvas` mixed with `--veil`; all 8 `--emotion` values ≥ 3:1 on `--canvas` (they are used as dots and particles, never body text); Daylight contains `color-scheme: only light`; `--canvas` is `#000000` Night and `#f6f4f1` Daylight. Keep the pre-paint script tests and add: `resolveTextSize('large') === 'large'`, `resolveTextSize('huge') === 'default'`, `resolveTextSize(null) === 'default'`, and the emitted script sets `dataset.textSize` from storage and survives blocked storage.
- [ ] **Step 2: Run `node --test scripts/test-theme.mjs`.** Expected: FAIL.
- [ ] **Step 3: Implement tokens and `lib/theme.ts`.** Adjust any hue that fails its contrast assertion within the spec's rule (one distinct vivid hue per emotion) and update `emotionHues` in Task 1 to the same values.
- [ ] **Step 4: Update `app/layout.tsx`:** keep `Geist` and `Lora` `next/font` loads; `viewport.themeColor` `#000000` (dark) / `#f6f4f1` (light); body uses `--font-sans`.
- [ ] **Step 5: Run tests; `npm run check`; commit** `Add Constellation tokens, type scale and text-size preference`.

### Task 3: Stylesheet rewrite, shell, logo and footer

**Files:**
- Create: `app/styles/base.css`, `layout.css`, `components.css`, `screens.css`
- Modify: `app/globals.css` (imports only), `components/site-shell.tsx`, `components/site-nav.tsx`, `components/brand-mark.tsx`, `scripts/generate-brand-assets.mjs`, `app/icon.svg`, `app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `components/quiet-dialog.tsx` (class names only)
- Test: visual check via `impeccable shot` (no unit test; covered by Task 13 snapshots)

**Interfaces:**
- Produces class vocabulary used by every later task: `.pill` (filled violet), `.ghost` (text button/link), `.chip` (+ `[aria-pressed="true"]`), `.icon-button`, `.display`, `.heading-lg`, `.heading`, `.heading-sm`, `.lede` (body 300), `.caption`, `.scripture`, `.hairline-list`, `.stack-*` spacing utilities only if needed, `.dialog` (native `<dialog>` styling), `.toast`, `.site-header`, `.site-nav` (desktop top / phone bottom), `.site-footer`.
- `SiteShell({ children, ambient = true }: { children: ReactNode; ambient?: boolean })`: header = `BrandMark` + wordmark link, desktop nav, gear `.icon-button` opening `SettingsSheet` (Task 4 supplies it; until then render the button disabled), no translation select, no theme toggle; one-line footer "About and privacy · Sources and copyright notices".
- `BrandMark({ size = 28 }: { size?: number })`: four-point star inside an open ring, gradient `#8052ff` to `#15846e`, unique gradient id via `useId`.

- [ ] **Step 1:** Move every rule still needed by components from the old `globals.css` into the new partials using the new tokens, delete the rest (no override chains, no `!important` except reduced-motion resets). Keep `.sr-only`, focus-visible rings (2px `--action` outline, 3px offset), selection color (`--action` at 35%), scrollbar colors, `color-scheme`.
- [ ] **Step 2:** Rebuild `SiteShell`, `SiteNav` (active: `--ink` plus 4px violet dot; inactive `--ink-3`), footer, `BrandMark`; regenerate icons with `node scripts/generate-brand-assets.mjs`.
- [ ] **Step 3:** `npm run check`; `impeccable shot http://localhost:3000/ --viewport 390x844,1440x900` in both themes: header single row at 390px, no overflow.
- [ ] **Step 4: Commit** `Rewrite stylesheet on Constellation tokens; new shell and logo`.

### Task 4: Settings sheet and theme sync

**Files:**
- Create: `components/settings-sheet.tsx`, `components/theme-sync.tsx`, `lib/translation-client.ts`
- Modify: `components/translation-selector.tsx` (use `setTranslationCookie`), `components/site-shell.tsx` (mount sheet), delete `components/theme-toggle.tsx`, `components/preferred-translation-selector.tsx` usage in headers (Results and Compare stop passing `translationControl`)
- Test: `scripts/test-theme.mjs` (choice application), e2e in Task 13

**Interfaces:**
- Consumes: `THEME_KEY`, `TEXT_SIZE_KEY`, `resolveTextSize` (Task 2); `getPersonalStore().setPreferences` (existing).
- Produces:
  - `setTranslationCookie(id: TranslationId): void` (cookie string identical to today's: `translation=<id>; Path=/; Max-Age=31536000; SameSite=Lax` plus `; Secure` on https) and dispatches `translation-change`.
  - `applyThemeChoice(choice: ThemeChoice, systemLight: boolean): { theme: "dark" | "light"; source: "stored" | "system" }` in `lib/theme.ts` (pure; the component writes dataset and storage).
  - `SettingsSheet()` client component: native `<dialog>` (bottom sheet under 640px, right panel otherwise) with three labelled groups: Translation (chips NLT, KJV, WEB, ASV, BSB, disabled "NIV · Coming soon"; `router.refresh()` after change), Theme (Night, Daylight, System), Text size (Default, Large, Larger). Escape closes and focus returns to the gear.
  - `ThemeSync()`: the theme-color meta sync, page-hidden flag and live system-theme follow from the old `ThemeToggle`, rendered once in `SiteShell`.

- [ ] **Step 1: Failing test:** `applyThemeChoice('system', true)` → `{ theme: 'light', source: 'system' }`; `applyThemeChoice('dark', true)` → `{ theme: 'dark', source: 'stored' }`.
- [ ] **Step 2: Run, see FAIL; implement; run, see PASS.**
- [ ] **Step 3:** Build the sheet and sync; System removes `THEME_KEY` from localStorage.
- [ ] **Step 4:** `npm run check`; manual: change each setting, reload, choice persists; keyboard-only open/close.
- [ ] **Step 5: Commit** `Add settings sheet for translation, theme and text size`.

### Task 5: Constellation scene

**Files:**
- Create: `components/constellation-scene.tsx`
- Delete: `components/wheel-scene.tsx`; remove the waveform helpers, `needsSimplePicker` and `isSlowWheel` from `lib/wheel.ts` and their tests from `scripts/test-wheel.mjs`
- Test: `scripts/test-wheel.mjs` (geometry helper), manual and Task 13

**Interfaces:**
- Consumes: `emotionHues`, `tierSettings`, `nextTier`, `QualityTier` (Task 1).
- Produces:
  - `buildConstellation(count: number, sectors: number, seed?: number): { positions: Float32Array; sector: Float32Array; size: Float32Array; phase: Float32Array }` exported from `lib/constellation.ts` (pure, deterministic for a seed): outer band particles get `sector` 0..sectors-1 by angle, radius 1.25 to 1.6 with noise; 12% are halo particles with `sector = -1` at radius 1.6 to 2.1.
  - `default export function ConstellationScene(props: { order: readonly string[]; selected: number; inner: boolean; innerCount: number; intensity: "low" | "medium" | "high"; rotation: number; lean?: readonly number[]; tier: Exclude<QualityTier, "list">; onTierChange: (tier: QualityTier) => void })`.
- Rendering rules: one `THREE.Points` with `ShaderMaterial`; uniforms `uTime, uRotation, uSelected, uInner (0..1 eased), uIntensity (0.6/1/1.4), uPointer (vec2, -1 when none), uLean (float[8]), uColors (vec3[8]), uDaylight`; vertex shader does rotation, inner contraction (outer band radius × 0.55 and fade to 0.25 alpha), swell for selected sector and lean weight; on fine pointers `uPointer` also tilts the field up to 4 degrees (desktop parallax) and brightens particles near it; fragment shader draws a soft round sprite with a faint four-point glint when size is in the top 3%. Additive blending in Night, normal in Daylight. Colors re-read from `emotionHues` and `uDaylight` toggled by a `MutationObserver` on `data-theme` within the same frame. Inner ring: when `inner`, `innerCount` sub-sectors bloom from center in the selected emotion's hue (lighter and darker shades). DPR capped by tier. Average fps measured over the first 2 seconds after mount and after each tier change; call `onTierChange(nextTier(tier, fps))` when it differs. Pause on hidden; dispose geometry, material, renderer and force context loss on unmount; `webglcontextlost` calls `onTierChange("list")`.

- [ ] **Step 1: Failing test:** `buildConstellation(1000, 8, 7)` returns arrays of length 3000/1000/1000/1000; identical output for the same seed; every non-halo `sector` in 0..7; ~12% (±3%) halo; all radii within 1.2..2.2.
- [ ] **Step 2: FAIL → implement helper → PASS.**
- [ ] **Step 3:** Implement the component. Review Focus 2: add a test-mode hook `window.__constellation` (only when `process.env.NODE_ENV !== "production"`) exposing `{ daylight: boolean, tier }` for Task 13 to assert the theme swap.
- [ ] **Step 4:** `npm run check`; run dev, confirm 60fps on desktop in the Performance panel and that Daylight swap is immediate.
- [ ] **Step 5: Commit** `Render the emotion wheel as a particle constellation`.

### Task 6: Wheel picker and Home

**Files:**
- Modify: `components/wheel-picker.tsx`, `app/page.tsx`, `components/feeling-link.tsx`, `components/daily-verse.tsx` (trigger styling only)
- Test: e2e in Task 13

**Interfaces:**
- Consumes: `ConstellationScene` (Task 5), `initialTier` (Task 1), `.chip`, `.pill`, `.display`, `.lede` (Task 3).
- Produces: `WheelPicker({ emotions, corner, children }: { emotions: readonly Emotion[]; corner?: ReactNode; children: ReactNode })` where `children` is the server-rendered List view (all 8 emotions as large type rows linking to `/emotions/[id]`). Mode state `"wheel" | "list"`: starts `list` on the server and on `initialTier() === "list"`, otherwise `wheel` after mount; a `Wheel / List` segmented control (two `aria-pressed` chips) switches; tier `list` from the scene switches to List and moves focus to the List heading if focus was inside the dial (Review Focus 1). Intensity chips (Low, Medium, High) appear in the inner step under the feeling chips and in the List view of the inner step is not needed (List links go to the feeling page).
- Home layout per spec: desktop two columns (headline column max 560px, wheel column up to 640px square), phone stacked; headline `How is your heart today?` in `.display`; lede `A quiet moment. A little light. Room for all you carry.`; daily verse trigger as ghost "Morning star" next to the switch.

- [ ] **Step 1:** Restructure picker and Home; keep all existing keyboard behavior (arrows rotate, Enter on center chooses, live status, `aria-describedby` help), chips choose in one tap, "All feelings" back control in the inner step.
- [ ] **Step 2:** `npm run check`; `impeccable shot /` at 390x844 and 1440x900, both themes; on 390x844 the wheel center is inside the first viewport.
- [ ] **Step 3: Commit** `Rebuild Home as a split hero with the constellation wheel and List view`.

### Task 7: Ambient sky

**Files:**
- Create: `components/ambient-sky.tsx`
- Modify: `components/site-shell.tsx` (render when `ambient`), `app/page.tsx` (`ambient={false}`)

**Interfaces:**
- Produces: `AmbientSky()`: a fixed, `aria-hidden`, `pointer-events: none` layer behind content using CSS only: 3 layers of `radial-gradient` dots (total ≤ 120 visible stars) in `--emotion` hues at 15 to 35% opacity, slow `transform` drift (60 to 120s loops); `animation-play-state: paused` when `[data-page-hidden="true"]`; removed under `prefers-reduced-motion`. Effective opacity behind the reading column ≤ 6% (mask the center column with a radial mask).

- [ ] **Step 1:** Implement; **Step 2:** check Lighthouse locally on `/journal` (no regression > 2 points vs before Task 7); **Step 3:** `npm run check`; commit `Add ambient star field to secondary pages`.

### Task 8: Undo toast

**Files:**
- Modify: `lib/storage.ts` (`recordMood(emotionId: string, specificEmotionId: string, id: string = crypto.randomUUID())`), `lib/dawn.ts`, `components/feeling-link.tsx`, `app/emotions/[emotion]/[sub]/page.tsx`
- Create: `components/undo-toast.tsx`
- Test: `scripts/test-storage.mjs`, `scripts/test-dawn.mjs`

**Interfaces:**
- Produces:
  - `prepareUndo(path: string, moodId: string): void` and `consumeUndo(path: string): string | undefined` in `lib/dawn.ts` (one-use, memory only, same semantics as the dawn intent).
  - `UndoToast({ path }: { path: string })`: on mount consumes the undo intent; if present shows `.toast` with "Noted in your journal" and a ghost "Undo" button, in a polite live region, for 6 seconds (paused while hovered or focused). Undo calls `getPersonalStore().removeMood(id)` once (button disabled while pending and after success), then shows "Removed from your journal" for 3 seconds; on `{ ok: false }` shows the store's error text and keeps the entry.
- `FeelingLink` passes its own `crypto.randomUUID()` to `recordMood` and calls `prepareUndo(href, id)` before navigating.

- [ ] **Step 1: Failing tests:** storage: `recordMood('anxious','overwhelmed','fixed-id')` creates an entry with id `fixed-id`; `removeMood('fixed-id')` twice leaves zero entries and the second call still returns `{ ok: true }` (idempotent); activity day for that date remains after removal. Dawn: `prepareUndo('/a','x'); consumeUndo('/b')` → `undefined` and clears; `prepareUndo('/a','x'); consumeUndo('/a')` → `'x'`, then `undefined`.
- [ ] **Step 2: FAIL → implement → PASS.**
- [ ] **Step 3:** Toast UI; conflict mode (Review Focus 4): Undo disabled with "Your journal is open in another tab" as the toast text.
- [ ] **Step 4:** `npm run check`; commit `Show an undo toast when a feeling is noted in the journal`.

### Task 9: Results and the particle dawn

**Files:**
- Modify: `app/emotions/[emotion]/[sub]/page.tsx`, `components/dawn-reveal.tsx`, `components/verse-carousel.tsx`, `components/save-verse-button.tsx`, `components/passage-attribution.tsx`, `app/styles/screens.css`

**Interfaces:**
- Consumes: tokens, `.scripture`, `.ghost`, `.pill`, `UndoToast` (Task 8).
- Produces: dawn horizon replaced by `<div class="dawn-burst" aria-hidden>` containing 16 absolutely positioned `<i>` stars with CSS custom properties `--x --y --d` (deterministic from the reference string via a tiny hash in `lib/dawn.ts`: `burstStars(reference: string, count = 16): { x: number; y: number; delay: number }[]`, tested for determinism and bounds 0..100), animated with Web Animations by the existing `DawnReveal` run (rise and settle over 1.2s in `--emotion`), cancelled by the same finish paths. Ending block after the carousel: ghost "Try another feeling" → `/emotions/[emotion]`, pill "Back to the wheel" → `/`.

- [ ] **Step 1: Failing test** for `burstStars` (same input → same output; 16 items; all coordinates within 0..100; different references differ).
- [ ] **Step 2: FAIL → implement → PASS.**
- [ ] **Step 3:** Restyle per spec; Scripture sizes from Global Constraints times `--scripture-scale`; reference line in `--spark` uppercase caption with the translation tag.
- [ ] **Step 4:** `impeccable shot /emotions/anxious/overwhelmed` 390x844 and 1440x900 both themes; reference, first two verse lines and pager inside the first viewport at 390x844.
- [ ] **Step 5:** `npm run check`; commit `Restyle Results with a particle dawn and an ending block`.

### Task 10: Feeling list and live Compare

**Files:**
- Modify: `app/emotions/[emotion]/page.tsx`, `app/compare/page.tsx`
- Create: `components/compare-toggles.tsx`
- Test: e2e Task 13

**Interfaces:**
- Consumes: `setTranslationCookie` is NOT used here (Compare selection is per page, not a preference); `translations` from `lib/translations.ts`.
- Produces: `CompareToggles({ reference, from, selected }: { reference: string; from?: string; selected: readonly TranslationId[] })`: chips with `aria-pressed`; toggling builds the same query the GET form builds (`ref`, `translations` repeated, `from`, `submitted=1`) and calls `router.replace(url, { scroll: false })`; prevents dropping below 2 or above 4 with an inline polite message. The original `<form method="get">` stays inside `<noscript>`-safe markup: render the form with its submit button visible only when JavaScript is off (`.js-hidden` toggled by a `data-js` attribute set in the pre-paint script).
- Feeling list: emotion name in `.heading-lg` with a 24px still particle cluster (CSS) in `--emotion`, lede line, 4 rows in `.hairline-list` at heading-sm with an arrow.

- [ ] **Step 1:** Implement; **Step 2:** `npm run check`; **Step 3:** commit `Restyle feeling list and make Compare update live`.

### Task 11: My Verses, Journal, About, Licenses and system states

**Files:**
- Modify: `components/my-verses.tsx`, `components/journal.tsx`, `app/my-verses/page.tsx`, `app/journal/page.tsx`, `app/about/page.tsx`, `app/licenses/page.tsx`, `app/not-found.tsx`, `app/error.tsx`, `components/content-notice.tsx`, `components/constellation.tsx` (still constellation art), `components/storage-notice.tsx`

**Interfaces:** class vocabulary from Task 3 only; no behavior changes. Journal calendar cells render as soft dots: `data-level` 0..3 maps to dot size 6/10/14/18px in `--emotion` of that day's latest reflection (pass `data-emotion` on the cell), grace days as a ring.

- [ ] **Step 1:** Restyle each screen per spec "Screens"; empty states use the still constellation and one pill.
- [ ] **Step 2:** `impeccable shot` each route 390 and 1440, both themes.
- [ ] **Step 3:** `npm run check`; commit `Restyle library, journal, reading pages and system states`.

### Task 12: Share, daily verse and social images

**Files:**
- Modify: `components/share-card-controls.tsx`, `components/daily-verse.tsx`, `app/share/route.tsx`, `lib/social-image.tsx`, `lib/share-card.ts` (height rule if layout changes; keep tests green)
- Test: `scripts/test-daily-share.mjs` (existing must pass; add one for `shareFileName(reference: string): string` if introduced)

**Interfaces:**
- Produces: Share dialog shows `<img>` preview of `/share?ref=…&translation=web` (lazy, fixed aspect from `shareCardHeight`), then actions: pill "Share" when `navigator.canShare?.({ files: [file] })` (fetch PNG as today, `navigator.share({ files, title: reference })`), ghost "Download" and ghost "Open in a new tab". Card image: `#000` canvas, ring of 64 small circles in the emotion hue (daily verse: `--spark`), WEB text in Lora 36px, reference and "World English Bible · Public domain" line, small `BrandMark`. Social image: same canvas, logo, "Verselight" in sans 96px, line "A little light for wherever you are."; no Scripture.

- [ ] **Step 1:** Implement; **Step 2:** visit `/share?ref=Psalm%2061:2&translation=web` and the OG routes; **Step 3:** `npm run check`; commit `Redesign share cards, social images and the share dialog`.

### Task 13: Playwright end-to-end and visual tests

**Files:**
- Create: `playwright.config.ts`, `e2e/flows.spec.ts`, `e2e/visual.spec.ts`, `e2e/fixtures.ts`
- Modify: `package.json` (dev dep `@playwright/test`; scripts `"e2e": "playwright test --grep-invert @visual"`, `"e2e:visual": "playwright test --grep @visual"`), `.github/workflows/ci.yml` (job `e2e` after build: `npx playwright install --with-deps chromium`, `npm run build`, `npm run e2e`; job `visual` same with `npm run e2e:visual`), new workflow `.github/workflows/visual-baselines.yml` (`workflow_dispatch`, runs `--update-snapshots`, uploads `e2e/__screenshots__` as an artifact), `.gitignore` (`test-results/`, `playwright-report/`)

**Interfaces:**
- `fixtures.ts` exports a `test` with a context that sets cookie `translation=web` and an init script fixing `Date` to 2026-11-20T09:00:00 local.
- `playwright.config.ts`: `webServer: { command: "npm run start -- -p 3200", port: 3200, reuseExistingServer: !process.env.CI }`, projects `phone` (390x844, touch) and `desktop` (1440x900), `expect.toHaveScreenshot` with `mask` of `canvas` and `animations: "disabled"`.

- [ ] **Step 1: Flows (`flows.spec.ts`):** Home chip "Anxious" → inner chip "Overwhelmed" → URL `/emotions/anxious/overwhelmed`, heading "Overwhelmed", toast "Noted in your journal"; keyboard: focus center, ArrowRight, Enter, Tab to first feeling chip, Enter → results; List view: switch to List, open "Sad" → "Lonely"; Save then My Verses lists "Psalm 61:2"; Undo removes the Journal entry (Journal shows one fewer reflection); Compare: toggle KJV on, URL contains `translations=kjv`, a "King James Version" heading appears without a full reload; Settings: choose Daylight, `html[data-theme=light]`, reload persists; Text size Larger sets `data-text-size="larger"`; Backup export triggers a download named `verselight-backup-*.json`.
- [ ] **Step 2: Review Focus tests:** (1) `page.addInitScript` making `HTMLCanvasElement.prototype.getContext` return `null` → Home shows the List view and no console errors; (2) dev-only: after toggling theme, `window.__constellation.daylight === true` within 100ms (skip in production builds); (3) 320x640 viewport, Text size Larger, results for the longest WEB passage among curated references (compute in fixture from `data/verses/web.json` + `data/emotions.json`) and Compare and daily dialog: `document.documentElement.scrollWidth <= 320`; (4) choose feeling, click Undo twice quickly → exactly one fewer reflection; (5) `javaScriptEnabled: false` context: Home has 8 emotion links, results has 4 `article` elements each with attribution text, Compare form submit works.
- [ ] **Step 3: Visual (`visual.spec.ts`, tag `@visual`):** screenshots of `/`, `/emotions/anxious`, `/emotions/anxious/overwhelmed`, `/compare?ref=Psalm%2061:2`, `/my-verses` (seeded with one save via UI), `/journal` (seeded), `/about`, a 404 route; both themes; both projects.
- [ ] **Step 4:** Run `npm run e2e` locally (Windows) until green; run the `visual-baselines` workflow on the branch, download the artifact with `gh run download`, commit the baselines.
- [ ] **Step 5:** Commit `Add Playwright flows, regression checks and visual baselines`.

### Task 14: Lighthouse budgets in CI

**Files:**
- Create: `lighthouserc.json`
- Modify: `package.json` (dev dep `@lhci/cli`; script `"lighthouse": "lhci autorun"`), `.github/workflows/ci.yml` (job `lighthouse` after build)

**Interfaces:** `lighthouserc.json`: `collect.startServerCommand` `npm run start -- -p 3300`, urls `http://localhost:3300/` and `http://localhost:3300/emotions/anxious/overwhelmed`, `numberOfRuns: 3`, `settings.extraHeaders: { "Cookie": "translation=web" }`, mobile preset; `assert.assertions` `categories:performance|accessibility|best-practices|seo` `["error", { "minScore": 0.9 }]`; `upload.target` `temporary-public-storage` is NOT used (privacy of preview URLs is fine, but keep reports as CI artifacts only: `upload.target: "filesystem"`).

- [ ] **Step 1:** Add config and job; **Step 2:** `npm run build && npm run lighthouse` locally; fix any category under 90 (likely LCP: ensure the headline is the LCP element and the scene loads after idle); **Step 3:** commit `Enforce Lighthouse 90+ budgets in CI`.

### Task 15: Docs, README and verification

**Files:**
- Modify: `docs/DESIGN.md` (replace with the Constellation world, keep the checklist format), `PRODUCT.md` (Brand Commitments: new mark, palette, imagery; note AI is planned for Project 3), `AGENTS.md` (remove "AI free-text" from out of scope per owner, keep audio/notifications/memorize as owner decides later; update Impeccable modes and the test/e2e/lighthouse commands; workflow step 5 adds `npm run e2e`), `docs/ARCHITECTURE.md` (particle engine, tiers, settings sheet, undo intent, ambient sky), `docs/wheel-ui-plan.md` (header: historical, superseded by the spec for visuals), `docs/PROGRESS.md` (Steps 10 and 11 move to Project 2; dated log entry), `README.md` (screenshots, demo video, "How it is built")
- Create: `docs/screenshots/*.png` (from Playwright with WEB), `docs/media/demo.webm` (Playwright `recordVideo` of turning the wheel to a verse, ≤ 3 MB)

- [ ] **Step 1:** Update docs. Run `impeccable context` and confirm no `CONTEXT_STALE` for DESIGN.md.
- [ ] **Step 2:** Capture screenshots and the demo with a small Playwright script `e2e/capture.spec.ts` tagged `@capture` (excluded from CI), WEB cookie set.
- [ ] **Step 3:** Impeccable `critique` (target ≥ 32/40, no P0/P1), `audit`, then `polish`; fix findings.
- [ ] **Step 4:** Manual: keyboard-only and NVDA (or VoiceOver) on Home, Results, Settings; reduced motion; WebGL disabled; record outcomes and the real-device fps request for the owner in PROGRESS.
- [ ] **Step 5:** `npm run check`, `npm run e2e`; push; open the PR (body lists the two new dev dependencies with one-line reasons); commit `Document the Constellation world and refresh the README`.
