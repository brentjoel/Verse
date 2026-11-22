# Progress

Name: Selah Sky (formerly Verselight; internal keys keep `verselight-*`). Live: Steps 1 to 9, the Constellation redesign and roadmap Phases A to E. Older detail is in git history.

## Now

- The roadmap (Phases A to E) is complete and merged. Nothing is queued; open items below are the owner's.

## Roadmap (complete; owner decision 2026-11-21)

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
- [x] Readable journal export to print or save as PDF
- [x] "This spoke to me" marks that favor a verse in the rotation
- [x] Time-of-day sky on Home
- [x] "Not sure what I feel?" three-question path
- [x] Offline reading: a service worker caching the app shell and public-domain data only, never NLT, no notifications

**Phase D: storage (one schema migration, version 2)**
- [x] Schema 2: anchor, letters, path and marks folded into the envelope and backups
- [x] Saved intensity and the check-in answer
- [x] Prayer list with answered dates
- [x] Optional journal passcode (Web Crypto, on-device; warn that a forgotten passcode means the data is lost)
- [x] Year in light recap

**Phase E**
- [x] Project 3: on-device AI feeling finder (suggests feelings, never generates Scripture, never trains on NLT; rules out NIV's no-AI license)
- [x] Performance pass (real-device fps stays an open item): skip the first ~500 ms of the fps probe, reserve space for the List-to-wheel swap, no-JS Results and Compare, real-device fps

## Active decisions

- Everyone is a guest; personal data stays in the browser. The translation cookie is the only documented exception. Strictly noncommercial.
- NLT default via the server-only provider; WEB is the labeled fallback; NIV disabled pending licensed access.
- Daily verse, share cards, tests, screenshots, README media and Lighthouse use WEB only.
- NLT quota guards are per instance; the owner rejected a shared store (2026-10-15).
- Monitoring logs only fixed warning codes.
- Storage is on schema 2 (Phase D). Later Phase D fields are optional additions to version 2, so no further bump.
- Constellation is the visual world (2026-11-20): violet is the only action color, emotion hues live only in particles, Apple fonts come from the system stack.
- AI only as Project 3, on-device.
- Lighthouse 90+ CI gate stays on; fix only what is needed to pass it.

## Open items

- Real-device 60fps on mid-range Android and iPhone not measured (needs the owner's devices).
- Screen-reader pass not done.
- Owner actions: a custom domain if wanted; publish the write-up (`docs/writeup.md`).

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

### Printable journal (2026-11-21)
Journal gains "Print or save as PDF": `window.print()` with a print stylesheet that hides the app and prints only a plain black-on-white list of reflections, notes and opened letters (no verse text, sealed letters excluded). Pure `lib/journal-export.ts` with tests; no dependency.

### This spoke to me (2026-11-21)
Results and the Morning star gain a private mark. Every third local day the daily verse is a marked one; Results notes a marked verse sitting in the other four. Client-side only (the server never learns marks); pure `favorFirst` and `dailyWithMarks` in `lib/rotation.ts` with tests; own key `verselight-spoke`.

### Time-of-day sky (2026-11-21)
Home gets a faint sky wash that follows the device's local hour (dawn 5-8, day 8-17, dusk 17-20, night). Decorative and client-only; pure `lib/time-sky.ts` with tests; Playwright sets the clock to check each phase.

### Not sure what I feel (2026-11-21)
Home links to `/not-sure`: three questions (where, what about, what would help) scored by fixed rules in pure `lib/feeling-finder.ts` point to one or two feelings. Tests prove every option names a real feeling and every feeling is reachable. Nothing stored; a hook point for the later on-device finder.

### Offline reading (2026-11-21)
`public/sw.js` caches the app shell, feeling indexes, seven-day paths and build assets, never Results, Compare or Share (so never NLT); no push or notifications. Offline Results requests open `/offline`, which reads the bundled WEB verses. Allowlist unit-tested; Playwright covers offline navigation and that no Results URL is stored.

### Phase C audit (2026-11-21)
Audit of Home, /not-sure, /path, /offline, Journal and Results additions: detector clean, no horizontal overflow, axe extended to the new pages with their stored states. Fixed: light-theme contrast on the anchor card, path day labels and Unpin; locked path days no longer fade (dashed instead); Unpin target 44px wide. Not run: screen-reader pass, offline behavior on a real phone.

### Schema 2 (2026-11-21)
Storage moves to version 2: anchor, letters, path and marks join the main record, so Export and Import carry them; version 1 data and backups migrate on read. Old keys fold in on load and are removed only after the merged record saves. Pure `migrate1to2` and `foldLegacy` with tests for round trip, corrupted input and failed writes.

### Saved intensity and check-in answer (2026-11-21)
A wheel intensity the visitor actually chose is kept on the reflection; the return check-in answer is kept on the reflection it asked about, dated, and the card stays answered for that day only. Journal shows both ("Felt strongly. Later: lighter."). Optional schema 2 fields, validated and tested.

### Prayer list (2026-11-21)
Journal gains "Your prayers": add a prayer in your own words, mark it answered (the local day is kept, never before it was added), or move it back. Optional `prayers` in schema 2, in Export and Import, capped at 200; pure `lib/prayers.ts` with tests and an e2e flow.

### Journal passcode (2026-11-21)
Optional passcode on Journal: PBKDF2 plus AES-GCM via Web Crypto seals notes, letters and prayers on the device; feelings and dates stay plain so streaks and the check-in work. The key lives only in tab memory; Export keeps the sealed form (tested), and a clear warning plus a consent box say a forgotten passcode means the text is lost, with an erase path.

### Year in light (2026-11-21)
New `/year`, linked from Journal: days you came, feelings named, longest run, verses saved, a twelve-star month row, the three feelings carried most, and answered prayers and letters (hidden while the journal is locked). Built on the device by pure `lib/year-recap.ts` with tests; nothing stored or sent; added to the offline shell and axe routes.

### Phase D audit (2026-11-21)
Audit of Journal (prayers, passcode, lock screen, reflection line), Home check-in, import preview and /year: 44px targets, AA contrast in both themes, no overflow at phone width. Fixed: focus now lands on the lock heading after Lock now and on the journal after unlock; axe covers populated Phase D states and the passcode screens. Not run: the detector (browser would not launch here), a screen-reader pass.

### On-device feeling finder (2026-11-21)
`/not-sure` gains "In your own words": a few typed words are scored on the device by pure `lib/feeling-words.ts` (a plain-phrase lexicon with stemming and negation, no Bible text, no model download) into one to three feelings with their closest specific. Loads only on use; nothing sent or stored; the three questions stay as the fallback. Tests reach every feeling and specific; ADR 0005 updated.

### Performance pass (2026-11-21)
The fps probe skips its first 500 ms (pure `stepProbe`). The pre-paint script marks how Home's picker opens (`data-wheel`), so CSS holds the wheel's footprint and the phone peek from first paint; Home CLS is now 0 at phone and desktop. Results and Compare render passages in the first HTML (`instant = false`, no Suspense), so they read without JavaScript.

### Phase E audit (2026-11-21)
Audit of /not-sure (both result states), Home first paint and no-JS Results and Compare: axe clean in dark and light at default and larger text, no overflow at 320px, Home CLS 0. Fixed: without JavaScript, Save, mark, Pin, Share and Focus no longer show as dead buttons; the word finder drops a live region that doubled the focused heading. Not run: the detector (browser would not launch here), a screen-reader pass.

### Vercel builds main only (2026-11-21)
The free plan's daily build limit stalled Phase E, so `vercel.json` turns off branch previews; GitHub Actions stays the PR gate and Vercel builds production from `main` only.

### Bedtime emotion hues (2026-11-23)
Bedtime now has its own warm-shifted emotion hues for the particles and dots (sage, plum, coral, copper, teal-green, yellow, amber, rose), lower in blue than Night. Tests check 4.5:1 on the Bedtime canvas, low blue, and a minimum distance between every pair; violet stays the only action color.

### Docs and code health (2026-11-23)
AGENTS, ARCHITECTURE (new pages, schema 2, offline, finder), README and this file brought current. Removed unused CSS selectors, `EmotionIcon`, `lib/utils.ts`, the `cn` dependency and a few needless exports. Build output: JS 1,551,142 to 1,551,131 bytes, CSS 78,426 to 77,735.

### Prompt review (2026-11-23)
Reviewed the 127 drafted prompts for the passages added in "More verses with daily rotation" against their WEB text and feeling. Rewrote 46 (mostly prayers that recited the verse, plus a few that pressed or over-promised); the table and a short "consider swapping" list are in `docs/prompt-review.md`.

### UI pass 1: Tighten Constellation (2026-11-23)
One token type scale (iOS steps) and two weights, body at 400; amber only on the Scripture reference; hairline rows replace the cards on path, finder, check-in, anchor and craft.
Home: Morning star and Not sure share one quiet row, a compact constellation row puts feelings above the fold on phones, wheel chips sit 4 by 4. New theme tests enforce the scale and the amber rule.

### Rename to Selah Sky (2026-11-23)
Every user-facing name (titles, metadata, manifest, wordmark, OG images, share and sky cards, print journal, README, docs) now says Selah Sky. Storage keys, the cookie, the backup format, repo and Vercel URL keep `verselight`.

### Quiet states (2026-11-23)
Loading and empty states share one shape: the constellation mark (softly twinkling while loading, still under reduced motion), one kind line, at most one action. Secondary empties are a plain line, ghost-button rows align to the text edge, and before/after shots live in `docs/screenshots/ui-pass/`.

### UI pass 2a: Night-sky motion system (2026-11-23)
Shared tokens (fast, base, slow, scene, stagger, a damped spring); `<main>` is its own view-transition snapshot that rises on forward routes and settles on back links, and a feeling's title travels from its row or the wheel to Results. The wheel gathers toward the chosen light, Results settles in around a readable verse, the Journal sky twinkles in and draws its lines, sheets spring, themes crossfade.
Results: Save and This spoke to me lead with Pin, Compare and Share behind More; the ending aligns to the text edge; the dawn glow has no visible edge. Reduced motion drops every stagger and transition.
