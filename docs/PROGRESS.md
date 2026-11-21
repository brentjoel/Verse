# Progress

Live: Steps 1 to 9 (picker, translations, Compare, storage, journal, share cards, launch checks, wheel, dawn), motion polish, security audit and CI checks. Older detail is in git history.

## Now

- Project 2: night sky journal merged (PR #10). Focus reading mode on `feat/focus-reading`.

## Roadmap (owner order: features and UI first, performance last)

1. Project 2: focus reading mode (in review), then Breathe, sky share card, prayer list, time-of-day sky, saved intensity (needs a storage schema migration).
2. Project 3: on-device AI feeling finder. A small in-browser embedding model suggests the top 3 feelings and the person confirms. Crisis text shows resources first. Never generates Scripture, never trains on NLT. Hook: `leanWeights()` and the `uLean` uniform.
3. Performance pass: skip the first ~500 ms in the fps probe; reserve space for the List-to-wheel swap on Home; no-JS fallback for Results and Compare; real-device fps.

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
