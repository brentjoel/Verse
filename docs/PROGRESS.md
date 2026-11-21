# Progress

Live: Steps 1 to 9 (picker, translations, Compare, storage, journal, share cards, launch checks, wheel, dawn), motion polish, security audit and CI checks. Older detail is in git history.

## Now

- Project 2: night sky journal (PR #10), focus reading (PR #11) and Breathe (PR #12) merged. More verses with daily rotation on `feat/more-verses`.

## Roadmap (owner decision 2026-11-21: ship all, one session per phase, auto-merge on green CI)

Each phase runs in its own session, as small PRs merged when every CI check passes. It ends with `/impeccable audit` on the phase's UI, and the material fixes go in a final PR. Check items off here as they merge.

**In flight:** return check-in ("How is your heart now?"), branch `feat/return-check-in`.

**Phase A: quick wins**
- [x] Crisis resources: a quiet help link on Sad, Anxious, Doubtful and Tired results (international directory, local emergency number first)
- [x] README that sells: autoplay demo GIF at the top, CI and Lighthouse badges, Built with
- [x] Bedtime mode: extra dim, warm, low-violet theme option in Settings
- [x] Remember the last verse you were reading per feeling (session only, no storage schema change)
- [x] Keyboard shortcuts sheet on `?`

**Phase B: showcase**
- [x] "How it's built" case study page `/craft` with real numbers and a small architecture diagram
- [x] Decision records in `docs/decisions/` (accounts, NLT and fallback, local-first storage, WebGL tiers, on-device AI)
- [x] Per-feeling Open Graph and Twitter images in the emotion hue (brand copy only, no Scripture)
- [x] Live engineering overlay `?debug` (fps, tier, particles, draw calls)
- [x] Accessibility checks in CI with `@axe-core/playwright`, plus an Accessibility page
- [x] Sky share card: month constellation plus a WEB verse as a client-side PNG

**Phase C: companion**
- [x] Anchor verse pinned on Home
- [x] Letter to your future self, shown in Journal on a chosen date
- [x] Seven-day gentle path for a feeling, built from its curated verses
- [ ] Readable journal export to print or save as PDF
- [ ] "This spoke to me" marks that favor a verse in the rotation
- [ ] Time-of-day sky on Home
- [ ] "Not sure what I feel?" three-question path
- [ ] Offline reading: a service worker caching the app shell and public-domain data only, never NLT, no notifications

**Phase D: storage (one schema migration, version 2)**
- [ ] Saved intensity and the check-in answer
- [ ] Prayer list with answered dates
- [x] Optional journal passcode (Web Crypto, on-device; warn that a forgotten passcode means the data is lost)
- [ ] Year in light recap

**Phase E**
- [ ] Project 3: on-device AI feeling finder (suggests feelings, never generates Scripture, never trains on NLT; rules out NIV's no-AI license)
- [ ] Performance pass: skip the first ~500 ms of the fps probe, reserve space for the List-to-wheel swap, no-JS Results and Compare, real-device fps

**Owner actions:** buy a custom domain if wanted; publish the write-up (drafted in `docs/writeup.md` during Phase B).

## Active decisions

- Everyone is a guest; personal data stays in the browser. The translation cookie is the only documented exception. Strictly noncommercial.
- NLT default via the server-only provider; WEB is the labeled fallback; NIV disabled pending licensed access.
- Daily verse, share cards, tests, screenshots, README media and Lighthouse use WEB only.
- NLT quota guards are per instance; the owner rejected a shared store (2026-10-15).
- Monitoring logs only fixed warning codes.
- Wheel intensity is not persisted; storage stays on schema 1 until Project 2.
- Constellation is the visual world (2026-11-20): violet is the only action color, emotion hues live only in particles, Apple fonts come from the system stack.
- AI only as Project 3, on-device.
- Lighthouse 90+ CI gate stays on; fix only what is needed to pass it.

## Open items

- Real-device 60fps on mid-range Android and iPhone not measured (needs the owner's devices).
- Screen-reader pass not done.
- Phase D to fold into JSON Export/Import: personal keys outside schema 1 (`verselight-anchor`, `verselight-letters`, `verselight-path`).
- Results and Compare need JavaScript to show passages.

## Gotchas

- Windows: use `npm.cmd` / `npx.cmd`. Run e2e through `npm.cmd run e2e`; `npx.cmd playwright --grep "a|b"` breaks on the `|`.
- The dev warning "params accessed outside Suspense" on emotion routes predates the redesign; ignore unless asked.
- A hidden browser pane freezes animations, so screenshots look washed out.
- `next build` sometimes stops once with a security-upgrade nudge; rerun. Never run `npm ci` while a dev server is up (corrupts `node_modules` on Windows).
- Do not kill a dev server you did not start; ask the owner.

## Log

Newest last. At most 3 lines each.

### Constellation redesign (2026-11-20)
Project 1: tokens and stylesheet split, settings sheet, particle wheel with quality tiers, Wheel/List Home, ambient sky, undo toast, particle dawn, live Compare, new share cards, Playwright and visual and Lighthouse CI. LCP 3.0s to 0.9s, Journal CLS 0.23 to 0.

### Docs cleanup (2026-11-21)
Removed SPEC, wheel-ui-plan, archive and superpowers docs (in git history). Rewrote ARCHITECTURE as a current-state map, merged HANDOFF into this file, condensed translation terms.

### UI polish batch (2026-11-21)
Phones start in List under a small constellation ring; quieter Remove; current chip ring; larger prayer starter; phone toast moved under the header; Daylight ambient sky; wheel labels clear the edge; lighter backdrop; backup text at 62ch; About self-link removed. List focus after WebGL loss now moves in an effect (was flaky).

### Night sky journal (2026-11-21)
Journal month opens as a sky: visited days are emotion-colored stars, consecutive days join, grace days bridge with a dim dashed line and Lamentations 3:22-23 (WEB). Sky / Calendar toggle; stars filter reflections; reflections link back to their verses. Pure `lib/night-sky.ts` with 6 tests; no storage change.

### Focus reading mode (2026-11-21)
Results gain a Focus button: only the passage, attribution and pager remain, centered and larger; Exit focus or Escape leaves. Transient root `data-focus`, nothing stored. New e2e flow.

### Breathe (2026-11-21)
New `/breathe` page and nav tab: a paced guide with Calm (4-4-6) and Steady (4-4-4-4) patterns, a growing orb, a text cue and live status. Pure `lib/breathe.ts` with 5 tests; nothing stored, no Scripture shown, reduced motion drops the orb animation.

### More verses with daily rotation (2026-11-21)
Each feeling now has 8 curated references (128 added, 211 unique), with drafted reflection and prayer prompts for owner review. Results show 4 a day on a rolling window by UTC day, with Read 4 more verses. Public-domain text fetched by `fetch:verses`; pure `lib/rotation.ts` with tests; Playwright pins the day.

### Crisis resources (2026-11-21)
Results for Sad, Anxious, Doubtful and Tired gain a quiet "If you are struggling" disclosure: local emergency services first, then the findahelpline.com directory (no tracking). Hidden in Focus mode. Pure `lib/help.ts` with tests; new e2e flow.

### Return check-in (2026-11-21)
Home greets a returning visitor whose latest reflection is from an earlier local day: "Last time you felt X. How is your heart now?" with Lighter, About the same and Heavier, each pointing onward; Not now hides it for the day in its own localStorage key (schema stays 1). Pure `lib/check-in.ts` with tests. The answer is not saved: a candidate for the saved intensity migration.

### README that sells (2026-11-21)
README opens with CI, Lighthouse and privacy badges, an inline 1.4 MB demo GIF (made from `demo.webm` with ffmpeg via the `imageio-ffmpeg` Python package) and a Built with line.

### Bedtime theme (2026-11-21)
Third theme in Settings: warm, extra-dim `[data-theme="bedtime"]` tokens with a softened violet, chosen before paint and kept in the theme key. The data schema stays on dark/light (Bedtime saves as dark). Contrast test covers it; emotion hues are unchanged for now.

### Remember the last verse (2026-11-21)
Reopening a feeling's Results in the same browser session returns to the passage last viewed (per feeling and Read 4 more page). `sessionStorage`, validated in `lib/last-verse.ts` with tests; first paint and no-JS still show the first verse; no storage schema change.

### Keyboard shortcuts (2026-11-21)
`?` (or the footer link on non-touch devices) opens a shortcuts dialog; F toggles Focus on Results. Single keys never fire while typing, with a modifier, or over an open dialog. Pure `lib/shortcuts.ts` with tests; new e2e flow.

### Phase A audit (2026-11-21)
Audit of Results, Settings, shortcuts and footer: help-note summary now meets the 44px touch target. Known and accepted: Bedtime keeps Night's emotion hues, so the particles and dots stay as blue as Night; a warm-shifted hue set is a later option. The automated detector could not launch a browser here, so rendered contrast came from the token tests only.

### How it's built (2026-11-21)
New `/craft` case study with the real numbers (LCP 3.0s to 0.9s, Journal CLS 0.23 to 0, Lighthouse 90+ gate, 100+ unit tests), an inline SVG architecture diagram, linked from the footer. New e2e flow; `/craft` joins the visual routes.

### Decision records (2026-11-21)
Five short ADRs in `docs/decisions/` (guest-only, NLT with WEB fallback, local-first storage, WebGL tiers, on-device AI) with an index. Docs only.

### Per-feeling social images (2026-11-21)
Each feeling page now has its own Open Graph and Twitter image in its hue (name, short description, Verselight; no Scripture), prebuilt for the 8 feelings via `lib/social-image.tsx`. The proxy matcher now skips the image routes, which it had been treating as unknown Results paths.

### Engineering overlay (2026-11-21)
`?debug` shows a small readout of fps, quality tier, particle count and draw calls (the wheel publishes draw calls in a data attribute every 30 frames). Client-only, read per page load, never stored; pure `lib/debug.ts` with tests and an e2e flow.

### Accessibility (2026-11-21)
`e2e/a11y.spec.ts` runs `@axe-core/playwright` (WCAG 2.1 A and AA) over ten pages in dark and light on phone and desktop, inside the normal e2e job. New `/accessibility` page states supported features, the checks and the known gaps, linked from the footer. Dependency added so CI can catch regressions automatically.

### Sky share card (2026-11-21)
Journal's Sky view gains "Save this sky as a card": the month's stars and links (from `lib/night-sky.ts`, laid out by pure `lib/sky-card.ts`) plus the WEB grace verse, drawn to a PNG on a canvas in the browser and shared or downloaded. WEB only, no notes, nothing uploaded; unit tests and an e2e download check.

x

### Write-up draft (2026-11-21)
`docs/writeup.md` is a portfolio post draft built from real numbers in the repo, ready for the owner to edit. Not published anywhere; publishing stays an owner action.

### Phase B audit (2026-11-21)
Audit of /craft, /accessibility, footer links, the ?debug overlay and the sky card button: detector clean, footer targets 44px, no horizontal overflow at phone width, axe clean. One material fix: the /craft headline numbers sat 3+1 on desktop, now a balanced 2x2. Not run: a screen-reader pass, and the wheel's draw-call readout on a real GPU (headless uses List view).

### Anchor verse (2026-11-21)
Pin a verse from Results or the Morning star; Home shows it in WEB under the greeting with Unpin. Stored as a reference only in its own key `verselight-anchor`, validated by `lib/anchor.ts`; shared `lib/local-key.ts` hook for later Phase C keys. Not in Export yet (Phase D).

### Letter to your future self (2026-11-21)
Journal gains "Letters to your future self": write a letter, pick a day after today, and it stays sealed (only the date shows) until that local day, then opens in the list. Own key `verselight-letters`, validated and capped by pure `lib/letters.ts` with tests; plain text, not encrypted, not in Export yet (Phase D).

### Seven-day gentle path (2026-11-21)
Results gains "Walk a seven-day path": `/path/[emotion]/[sub]` (16 prebuilt pages) shows one curated verse a day in WEB with its question and prayer; later days stay closed until their local date. Start date lives in `verselight-path` (one active path), validated by pure `lib/gentle-path.ts` with tests; without JavaScript all days show.
