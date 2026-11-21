# Progress

Live: Steps 1 to 9 (picker, translations, Compare, storage, journal, share cards, launch checks, wheel, dawn), motion polish, security audit and CI checks. Older detail is in git history.

## Now

- Branch `feat/constellation-redesign`, draft PR #8 (Project 1: Constellation redesign).
- To finish PR #8:
  1. `npm.cmd run check` and `npm.cmd run e2e`, then commit and push the review fixes.
  2. Visual baselines are stale (Journal ones missing). Delete `e2e/__screenshots__/`, push, and let the CI "Visual regression" job regenerate them.
  3. `gh run download <run-id> -n visual-baselines-and-diffs`, copy only `e2e/__screenshots__/`, commit, push.
  4. Update the PR description and mark it ready. The owner merges.

## Roadmap (owner order: features and UI first, performance last)

1. Finish PR #8.
2. UI polish batch: more prominent prayer starter in Reflect; phones default to List with a small constellation above; quieter Remove style; Daylight colors for `.ambient-sky`; undo toast overlaps the action row on phones; highlight the current emotion chip; mobile wheel labels touch the screen edge; lighter settings backdrop; About "Visit Verselight" links to itself; My Verses backup paragraph too wide (about 99 characters per line).
3. Project 2: night sky journal, Breathe, focus reading mode, sky share card, prayer list, time-of-day sky, saved intensity (needs a storage schema migration).
4. Project 3: on-device AI feeling finder. A small in-browser embedding model suggests the top 3 feelings and the person confirms. Crisis text shows resources first. Never generates Scripture, never trains on NLT. Hook: `leanWeights()` and the `uLean` uniform.
5. Performance pass: skip the first ~500 ms in the fps probe; reserve space for the List-to-wheel swap on Home; no-JS fallback for Results and Compare; real-device fps.

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
