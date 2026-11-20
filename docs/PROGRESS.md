# Progress

Steps 1 to 9, motion polish, the security audit and automated checks are done and live. Steps 10 and 11 are optional and start only on an owner request. Detailed records for all finished work are in [archive/progress-history.md](archive/progress-history.md).

## Checklist

- [x] 1. Setup and first deploy
- [x] 2. Content and two-step emotion picker
- [x] 3. Translations, NLT default, compare view
- [x] 4. Local storage layer, saved verses, collections, My Verses page, Export and Import
- [x] 5. Mood journal with calendar heatmap, streaks with grace day, badges
- [x] 6. Share cards (ImageResponse), verse of the day, polish, empty and error states, accessibility pass
- [x] 7. Launch checks: privacy note and About page with translation credits, rate limit and quota handling for the NLT route, error monitoring basics, README
- [x] 8. Wheel picker
- [x] 9. Dawn reveal
- [ ] 10. Night sky journal (optional, not started)
- [ ] 11. Polish and delight (optional, not started)

## Optional steps

These follow [wheel-ui-plan.md](wheel-ui-plan.md). Each needs its own branch, Vercel preview and owner approval before merge.

**Acceptance criteria shared by Steps 8 to 11:** Preserve existing emotion data/routes, translation providers and NLT API logic, browser-only storage and all working features. No accounts, backend, tracking, audio, notifications or AI free-text. Verse text stays real, selectable DOM text from the existing translation layer, readable immediately without waiting for animation; no API verse text drawn into canvas/images. Generated images use public-domain text only, WEB by default and explicitly labeled when replacing an active NLT preference; Scripture UI quotes use WEB with a reference. Retain the existing picker and heatmap as accessible alternatives; reduced motion means no spinning/particles and instant verse display. Support keyboard arrows/Enter, screen-reader emotion lists/labels, AA contrast, visible focus and 44px touch targets. Lazy-load 3D so unrelated routes retain their JavaScript size; instance the bar ring into one draw call, cap DPR at 2, limit particles, pause hidden-tab rendering and dispose GPU resources. Target steady 60fps on mid-range Android and mobile Home Lighthouse Performance, Accessibility, Best Practices and SEO scores of at least 90. Put pure logic in lib/ with unit tests. Stored-data changes require a schema bump, migration, validation, older-backup compatibility and tests. Explain each dependency in one line; expected three, @react-three/fiber if React, and at most one small helper. Preserve calm dark/light styling, restrained colors, one warm accent and generous spacing; limit imagery to light, stars and wheels, without faces, angels, figures or denomination-specific symbols. Update docs/DESIGN.md tokens each phase. Typecheck, lint, build and tests pass; no new environment variables or unrelated restructuring. Stop after each phase with a summary under 10 lines and 3 to 5 screens for owner review.

### 10. Night sky journal (optional, not started)

**Goal:** Offer a night sky view of private check-ins and streaks alongside the accessible calendar heatmap.

**Acceptance criteria:** Each check-in becomes a mood-colored star; streaks connect stars into constellations. Tapping a star opens that day's verse and note. Grace days dim the glow rather than breaking the line; use the Lamentations 3:22-23 phrase in exact WEB wording with its reference. Read the existing journal browser store and preserve Export/Import. Keep the calendar heatmap with an accessible view toggle. Put constellation building in pure lib/ functions with tests; apply schema safeguards if stored shapes change. Meet all shared criteria above.

**Files likely touched:** `app/journal/page.tsx`, `components/journal.tsx`, `components/` night sky/star detail/view toggle (proposed), `lib/` constellation helpers and tests (proposed), `app/globals.css`, journal/storage/backup tests as needed, `docs/DESIGN.md`, `docs/PROGRESS.md`.

### 11. Polish and delight (optional, not started)

**Goal:** Add gentle discovery, a growing personal sky, local-time atmosphere, shareable sky cards and adaptive quality.

**Acceptance criteria:** One item per commit. On first-ever load, slowly rotate the dial once with a faint Turn to begin hint that disappears on interaction; remember locally with storage safeguards. Blend dawn/day/dusk/night tint using local time while retaining AA contrast. Add depth, subtle twinkle and 7/30/100-check-in milestones with soft nebula glow/named constellations, never guilt or loss for time away. Show the daily verse as the brightest morning star at the sky's top, opening on tap. Render constellation plus verse into a PNG fully client-side with translation name/reference; use public-domain text only, WEB with an explicit label when NLT is active, and Web Share with download fallback. Measure frame time for the first two seconds, reduce particles/glow/DPR as needed or fall back to 2D. Test pure time blending, milestone and quality-tier logic in lib/. Meet all shared criteria above, including reduced-motion behavior and storage migrations for new persisted fields.

**Files likely touched:** `components/` wheel/night sky/first-visit/sky-card controls (proposed), `components/daily-verse.tsx`, `lib/daily-verse.ts`, `lib/` time blending/milestone/quality/sky-card helpers and tests (proposed), storage schema/migrations/validation/backup tests if needed, `app/globals.css`, `docs/DESIGN.md`, `docs/PROGRESS.md`.

## Active decisions

- Everyone is a guest. Personal data stays in the browser; the translation preference cookie is the only documented exception. Strictly noncommercial.
- NLT is the default through the official server-only provider; WEB is the labeled fallback; NIV stays disabled pending licensed access.
- Daily verse and share cards use WEB only. Any licensed-text artwork needs a new terms review and permission first.
- NLT burst, quota and cooldown guards are best effort per server instance. The owner rejected Redis or a shared quota store (2026-10-15); revisit only if traffic grows.
- Monitoring logs only fixed operational warning codes, with no payloads and no remote reporting.
- Wheel intensity is not persisted. Personal data stays on storage schema 1; any stored-shape change needs a schema bump, migration, validation and backup tests.
- On this Windows machine use `npm.cmd` and `npx.cmd` when PowerShell blocks script launchers.

## Open items

- Real-device 60fps and measured mobile Lighthouse 90+ have not been recorded; earlier checks were source and automated only.
- README screenshots in `docs/screenshots/` are still placeholders.
- `PRODUCT.md` for Impeccable is not written yet (`/impeccable init`).

## Log

Newest last. Keep each entry to 5 lines or fewer.

## Dependency and CI health (2026-11-20)
Patched Next.js and eslint-config-next 16.4.2 to 16.4.6, closing seven moderate Next.js advisories (production npm audit now 0). Applied in-range minor updates, moved @types/node to 24 and pinned Node 24 with engines and .nvmrc. CI reads .nvmrc and fails on moderate production advisories; Dependabot opens grouped weekly npm and monthly Actions PRs, majors excluded. Verified: npm run check (57 tests, 65 pages) and a production-server smoke of Home, a feeling list and a results page.

## Agent workflow refresh (2026-11-20)
Reorganized AGENTS.md with current status, a task-based reading table, a workflow that routes work by size through superpowers skills and an Impeccable command map for UI. Specs and plans live in docs/superpowers/. Ignored .worktrees/; DESIGN.md token path is now a working link. Slimmed this file from 290 lines and archived its history verbatim; removed stale DONE markers from ARCHITECTURE and SPEC. Privacy, licensing and code rules are unchanged.
