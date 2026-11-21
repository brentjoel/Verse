# Progress

Live: Steps 1 to 9 (picker, translations, Compare, storage, journal, share cards, launch checks, wheel, dawn), motion polish, security audit and CI checks. Older detail is in git history.

## Now

- Project 2: night sky journal (PR #10), focus reading (PR #11) and Breathe (PR #12) merged. More verses with daily rotation on `feat/more-verses`.

## Roadmap (owner decision 2026-11-21: ship all, one session per phase, auto-merge on green CI)

Each phase runs in its own session, as small PRs merged when every CI check passes. It ends with `/impeccable audit` on the phase's UI, and the material fixes go in a final PR. Check items off here as they merge.

**In flight:** return check-in ("How is your heart now?"), branch `feat/return-check-in`.

**Phase A: quick wins**
- [x] Crisis resources: a quiet help link on Sad, Anxious, Doubtful and Tired results (international directory, local emergency number first)
- [ ] README that sells: autoplay demo GIF at the top, CI and Lighthouse badges, Built with
- [ ] Bedtime mode: extra dim, warm, low-violet theme option in Settings
- [ ] Remember the last verse you were reading per feeling (session only, no storage schema change)
- [ ] Keyboard shortcuts sheet on `?`

**Phase B: showcase**
- [ ] "How it's built" case study page `/craft` with real numbers and a small architecture diagram
- [ ] Decision records in `docs/decisions/` (accounts, NLT and fallback, local-first storage, WebGL tiers, on-device AI)
- [ ] Per-feeling Open Graph and Twitter images in the emotion hue (brand copy only, no Scripture)
- [ ] Live engineering overlay `?debug` (fps, tier, particles, draw calls)
- [ ] Accessibility checks in CI with `@axe-core/playwright`, plus an Accessibility page
- [ ] Sky share card: month constellation plus a WEB verse as a client-side PNG

**Phase C: companion**
- [ ] Anchor verse pinned on Home
- [ ] Letter to your future self, shown in Journal on a chosen date
- [ ] Seven-day gentle path for a feeling, built from its curated verses
- [ ] Readable journal export to print or save as PDF
- [ ] "This spoke to me" marks that favor a verse in the rotation
- [ ] Time-of-day sky on Home
- [ ] "Not sure what I feel?" three-question path
- [ ] Offline reading: a service worker caching the app shell and public-domain data only, never NLT, no notifications

**Phase D: storage (one schema migration, version 2)**
- [ ] Saved intensity and the check-in answer
- [ ] Prayer list with answered dates
- [ ] Optional journal passcode (Web Crypto, on-device; warn that a forgotten passcode means the data is lost)
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
