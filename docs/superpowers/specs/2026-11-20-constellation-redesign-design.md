# Constellation redesign (Project 1 of 3)

Status: draft for owner approval, 2026-11-20. Branch `feat/constellation-redesign`.

## Intent and why

Verselight is the owner's flagship portfolio project. The owner wants a full visual reinvention with a strong wow factor, inspired by a dark "constellation on black velvet" reference style the owner supplied. The current night-and-gold identity is retired; the name, domain, content, features, routes, data, privacy and Scripture licensing stay.

Success for the owner: a reviewer is stopped by the first screen within 10 seconds, and the work holds up under inspection (measured performance, accessibility, tests). Success for a real visitor: they still reach a fitting verse in two taps, and the verse is easier to read than before.

This is Project 1. Project 2 (night sky journal and experience features) and Project 3 (on-device AI feeling finder) follow as separate branches and PRs. Nothing from them is built here, but the particle engine is designed so both can reuse it.

## Goals

1. A new visual world, "Constellation": a void canvas, huge light display type, one violet action color, an amber spark, and emotion colors living only in particles.
2. The emotion wheel rebuilt as an interactive particle constellation: the signature visual and the primary picker.
3. Every screen re-laid out in the new world: Home, feeling list, Results (with dawn reveal), Compare, My Verses, Journal, About, Licenses, 404, error, share dialog, daily verse dialog.
4. A working light mode ("Daylight") of the same world.
5. Seven additions and improvements (see Scope).
6. Engineering proof a reviewer can check: Playwright end-to-end tests, visual regression screenshots, Lighthouse budgets in CI, a real-device frame-rate note, and a README with real screenshots and a demo GIF.
7. Rewrite the 753-line layered `app/globals.css` into a clean, token-driven stylesheet.

## Non-goals (later projects)

- Night sky journal, Breathe, Focus mode, sky share card, prayer list, time-of-day sky, first-visit hint, saved intensity, sky milestones, backup nudge (Project 2).
- Any AI or free-text emotion input (Project 3). The wheel engine exposes a hook for Project 3's "particles lean toward predicted emotions" but no model work happens here.

## Anti-goals (failure even if it technically works)

- A slower first screen. The headline and an accessible picker must paint before any WebGL loads.
- Scripture that is harder to read, smaller, lighter or dimmer than today, or attribution that becomes hard to find.
- A copy of the reference brand: no Dala name, logo, triangle brain, copy, or the paid PP Neue Montreal font. We borrow the mood and principles only.
- Jank on a mid-range phone, or a wheel that only works with a mouse.
- Losing any keyboard, screen-reader, reduced-motion, no-JavaScript or no-WebGL path that exists today.
- A violet-everything page. Violet is for actions only.

## Constraints

- Publisher terms (unchanged and not negotiable): NLT text never stored, cached, drawn into images or used for training; attribution under every quotation; WEB is the labeled fallback; share and social images use public-domain text only.
- Privacy: personal records stay in the browser. No analytics.
- Accessibility: WCAG AA text and control contrast in both themes, visible focus, 44px targets, full keyboard paths, reduced motion (no particles moving, instant text), screen-reader names and live regions.
- Performance budgets: mobile Lighthouse Performance, Accessibility, Best Practices and SEO all 90 or higher on Home and Results; Home LCP under 2.5s on a simulated mid-range phone; wheel at 60fps on a mid-range Android, with automatic quality reduction before fallback.
- Dependencies: `three` stays. New dev dependencies allowed with a one-line reason each: `@playwright/test` (end-to-end and screenshot tests) and `@lhci/cli` (Lighthouse budgets in CI). No new runtime dependencies and no font files.
- No em dashes in app copy. Warm, plain voice.

## Approaches considered

- **A. Particle constellation wheel (chosen by the owner).** The wheel itself becomes thousands of emotion-colored particles; it stays the picker. Most distinctive, keeps one primary interaction, highest engineering cost.
- B. Constellation as decorative hero art with a separate big-type list picker. Easier, but loses the wheel, today's signature interaction.
- C. Restyle the current bar wheel and add drifting background particles. Least risk, least transformation; does not meet "full UI upgrade".

Build approach: keep all logic, data, routes and components' behavior; replace tokens and CSS, rebuild the WebGL scene, and re-lay out each screen. A from-scratch rewrite was rejected because it risks features and accessibility work for no visual gain.

## Decisions made with the owner

- Full visual reinvention; gold and the current identity are retired.
- Option A: the wheel becomes the particle constellation.
- "Apple font": SF Pro via the system font stack on Apple devices, Geist (already loaded) elsewhere. Scripture in New York via `ui-serif` where supported, Lora elsewhere. Apple fonts are never self-hosted (Apple's license forbids web embedding).
- Violet is the single action color; amber is the spark.
- Three projects in sequence; this is the first.

## The visual world

### Color tokens

| Token | Night (default) | Daylight (`data-theme="light"`) | Role |
| --- | --- | --- | --- |
| `--canvas` | `#000000` | `#f6f4f1` | Page background, the only surface |
| `--ink` | `#ffffff` | `#0b0b0f` | Headlines, Scripture, primary text |
| `--ink-2` | `#bdbdbd` | `#3d3d45` | Body copy |
| `--ink-3` | `#9a9a9a` | `#5c5c66` | Secondary labels, inactive nav (must pass AA on canvas) |
| `--action` | `#8052ff` | `#6a3cf0` | Filled pill buttons, current dot, focus ring |
| `--on-action` | `#ffffff` | `#ffffff` | Text on violet |
| `--spark` | `#ffb829` | `#9a5b00` | Links, small highlights, the reference line (AA on canvas) |
| `--hairline` | `rgb(255 255 255 / 10%)` | `rgb(11 11 15 / 12%)` | The only divider, used sparingly |
| `--veil` | `rgb(255 255 255 / 4%)` | `rgb(11 11 15 / 4%)` | Pressed and selected fills, form field fills |

Emotion particle colors (vivid, particles and small dots only, never text on canvas unless they pass AA):

| Emotion | Night | Daylight |
| --- | --- | --- |
| Anxious | `#2dd4bf` | `#0f8f80` |
| Sad | `#4f8cff` | `#2457c5` |
| Angry | `#ff5a5f` | `#c62f35` |
| Tired | `#a78bfa` | `#6d4fd6` |
| Guilty | `#22d3ee` | `#0e7f93` |
| Grateful | `#facc15` | `#9a7a00` |
| Hopeful | `#ffb829` | `#a35f00` |
| Doubtful | `#f472b6` | `#b8357a` |

Builder may tune exact hues for harmony and contrast; the rule is one distinct vivid hue per emotion, deeper in Daylight.

Retire: gold, cream, the `--scene-*` gold tokens, card surfaces, shadows, gradients on components.

### Typography

- Sans stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", var(--font-geist), system-ui, sans-serif`. Keep the Geist `next/font` load; drop nothing a fallback needs.
- Serif stack (Scripture only): `"New York", ui-serif, var(--font-lora), Georgia, serif`. Keep the Lora load for non-Apple devices and the share image.
- Weights: display and headings 400; body 300 at 17 to 18px; labels 500 or 600 at 13 to 14px. Never 200 (too faint on Windows).
- Scale (desktop / phone): display 104 / 52px, heading-lg 72 / 40px, heading 48 / 32px, heading-sm 32 / 26px, body 18 / 17px, caption 13px (minimum 12px). Tracking -0.04em at 42px and above, -0.02em for 24 to 41px, normal for body, +0.02em uppercase labels. Line height 1.0 to 1.1 for display, 1.5 body, 1.65 Scripture.
- Scripture: 32px desktop / 26px phone at the Default text size (Compare columns 24px, as today), serif, weight 400, `--ink`. Never smaller or lighter than today. Text size Large and Larger scale Scripture by 1.15 and 1.3.
- `font-feature-settings: "ss01"` is not used (Geist and SF do not share it); use `font-variant-numeric: tabular-nums` for dates and counts.

### Space, shape, depth

- Base unit 6px; scale 6, 12, 18, 24, 30, 36, 60, 96, 120.
- Radius: 24px for sheets, dialogs, fields and focus outlines on large targets; 9999px for pill buttons and chips.
- No shadows, no cards. Grouping by whitespace; a hairline only where a list needs separation.
- Max widths: shell 1280px; reading column 720px; Scripture measure 32 to 38 characters per line on desktop.

### Components

- **Pill button (primary):** violet fill, white 14px weight 600 label, 44px+ height, 24px horizontal padding. At most one per view.
- **Ghost button / link:** no container; `--ink` or `--ink-3`, amber for inline links; underline on hover and focus.
- **Chip:** pill outline in `--hairline`, fills with `--veil` when pressed; used for wheel options and translation toggles.
- **Navigation:** transparent top bar on desktop (logo left, Feel / Verses / Journal centered, settings icon right); fixed bottom tab bar on phones with a hairline top and blurred canvas behind. Active item `--ink` with a 2px violet dot under it; inactive `--ink-3`.
- **Settings sheet (new):** opened from a gear icon. Contains Translation (chips for NLT, KJV, WEB, ASV, BSB, disabled NIV Coming soon), Theme (Night / Daylight / System), Text size (Default / Large / Larger, applied to Scripture and body via a root variable). Native `<dialog>`, bottom sheet on phones, right panel on desktop. Replaces the header translation `<select>` and theme toggle. Text size is a browser preference stored with the existing theme preference mechanism; if it needs a stored field, use the existing preferences envelope with schema validation and a migration test.
- **Logo:** a new mark. A small four-point star inside an open ring, drawn as SVG, filled with a violet-to-teal gradient (gradients allowed only in the logo and particles). Wordmark "Verselight" in the sans at weight 500. Regenerate favicon, Apple touch and manifest icons from it (`scripts/generate-brand-assets.mjs`).
- **Dialogs:** canvas-colored panel with a hairline border and 24px radius, title in heading-sm, close as a ghost icon button.
- **Undo toast (new):** bottom-center pill, "Noted in your journal · Undo", 6 seconds, polite live region, pauses on hover and focus.

### Imagery and the particle system

The only imagery is light: particles, stars and rings. No photography, figures, faces, or religious symbols. Reference brand shapes (triangles forming a brain) are not used; Verselight's particles are soft round stars with a faint four-point glint on the brightest few.

**Constellation wheel (Home):**
- Rendering: one `THREE.Points` draw call with a custom `ShaderMaterial` (soft round sprite with optional glint), additive blending on Night, normal blending with deeper hues on Daylight. Positions and colors in typed attributes; animation in the vertex shader driven by uniforms (time, rotation, selection, intensity, pointer). No per-frame CPU loop over particles.
- Shape: two concentric rings. The outer ring holds 8 emotion sectors, each a dense band of particles in that emotion's hue with organic noise in radius and thickness so it reads as a living constellation, not a donut. A sparse halo of drifting particles surrounds it.
- Selected sector: brightens, particles gently swell and drift outward; others dim to about 45%.
- Turning: drag, wheel scroll, arrow keys and chip taps rotate with the existing detents (`lib/wheel.ts` wrap logic). Inertia with a short settle.
- Choosing: press the center (or a chip) and the outer ring contracts while the inner ring of 4 feelings blooms from the center, in the chosen emotion's hue family. Feeling chips go straight to the verses (current behavior).
- Pointer: a soft brightening near the pointer on fine pointers; subtle parallax tilt (max 4 degrees) on desktop only.
- Labels: DOM text placed around the ring (as today), never drawn in WebGL, with a canvas-colored backing for legibility.
- Project 3 hook: a `lean(weights: Record<emotionId, number>)` uniform path that can pull and brighten sectors by weight. Implemented and unit-tested as a pure mapping, unused in the UI for now.
- Quality tiers (pure function in `lib/`, unit tested): High 9000 particles at DPR up to 2; Medium 5000 at DPR 1.5; Low 2500 at DPR 1; Fallback to the List view. Start from device hints (cores, device memory, screen size), measure frame time over the first 2 seconds and step down a tier when the average is under 50fps; fall back to List under 24fps at Low. Hidden tabs pause; unmount disposes everything.
- Loading: headline and the List picker render on the server; the scene loads after first paint and idle (as today). The List view is the no-JS, no-WebGL, reduced-motion and low-capability experience.

**Ambient field (all other pages):** a fixed, low-cost CSS layer (or a tiny 2D canvas capped at 120 dots) of faint stars in mixed emotion hues at low opacity, slowly drifting. Paused when hidden and absent under reduced motion. Never behind Scripture text at more than 6% opacity.

**Dawn reveal (Results):** keep the word-by-word emphasis mechanics and timing. Replace the gold horizon with a small burst of particles in the feeling's emotion hue rising behind the reference, then settling into 12 to 20 still stars. Tap to finish stays; Skip stays for keyboards.

### Motion

- Tokens: fast 150ms, base 220ms, slow 420ms, scene 900ms; ease-out exponential `cubic-bezier(.16, 1, .3, 1)` for entrances, `cubic-bezier(.65, 0, .35, 1)` for moves. Drop the bouncy press easing.
- One authored moment per screen: Home is the wheel; Results is the dawn; other screens get a single staggered fade-up of the heading and first content (max 3 steps, 60ms apart).
- Reduced motion: no particle movement (render a still frame or the List view), no parallax, no stagger; color and opacity changes only; Scripture instant.

## Screens

Text sketches show phone (left) and desktop (right) intent.

**Home.** Desktop split: left column has the display headline "How is your heart today?" (three lines, left-aligned), one 17 to 18px light line ("A quiet moment. A little light. Room for all you carry."), and the Wheel / List switch plus "Morning star" ghost link; right column is the constellation at up to 640px. Phone: headline (2 to 3 lines) above, wheel full-width below, chips under the wheel, switch at the top right of the wheel. Footer is a single quiet line with About and Licenses.

```
PHONE                         DESKTOP
[logo]            [gear]      [logo]   Feel Verses Journal   [gear]
How is your                   How is            .  ·:*:·  .
heart today?                  your heart      ·*  ANXIOUS  *·
A quiet moment...             today?          ·*  press    *·
   [Wheel|List]  ★            A quiet...        '·:*:·'
   .·:*:·.                    [Wheel|List] ★ Morning star
  :  Anxious  :               
   '·:*:·'                    
 (chips: Anxious Sad ...)     
[Feel] [Verses] [Journal]     
```

**Feeling list** (`/emotions/[emotion]`): back link, the emotion name in heading-lg with a small particle cluster in its hue, one light line, then the 4 feelings as large type rows (heading-sm, 72px rows, hairlines between) with an arrow on the right.

**Results.** Top: back link, feeling name in heading-sm, nothing else. Then the dawn particle burst, the reference line (amber, uppercase label with the translation tag), the verse in large serif, attribution directly under it in `--ink-3`, the pager (violet current dot), the action row (Save, Compare, Share as ghost buttons with icons), Reflect as a native disclosure, then the new ending block: "Try another feeling" (ghost) and "Back to the wheel" (pill). At the Default text size, the reference, the first two lines of the verse and the pager are in the first viewport at 375 by 812 for every passage, and the whole passage plus attribution fits for passages up to 160 characters (most curated passages). Longer passages and larger text sizes scroll; that is expected.

**Compare.** Reference in heading-lg, translation chips that update the comparison live (no submit; URL updates with `router.replace`, server re-renders the passages; no-JS keeps the GET form with a submit button). Columns on desktop, stacked on phones, each column: translation name, description in caption, verse in serif, attribution.

**My Verses.** Heading-lg, saved verses as large reference rows (serif reference, feeling and saved date in caption, Read and compare / Remove as ghost buttons), then Collections, then Backup and recovery in a quieter section. Empty state: a small still constellation and one pill "Find a verse".

**Journal.** Same structure as now (reflections first, calendar, rhythm), re-skinned: month in heading, calendar cells as soft dots of emotion color rather than boxes, rhythm summary in heading-sm. No new journal features (Project 2).

**About, Licenses.** Read mode: display heading, 720px measure, generous spacing, credits as a clean definition list.

**404, error, loading.** A small still constellation, one heading, one sentence, one pill home. Loading uses a slow shimmer of three faint stars, not skeleton boxes.

**Share dialog, daily verse dialog.** Dialog component above. Share gains a preview of the card and a native share button (`navigator.share` with the PNG file when `canShare` allows, else Download and Open). The card image itself is redesigned: black canvas, small particle ring in the verse's emotion hue (or neutral for the daily verse), WEB text in Lora, reference and "World English Bible, public domain" line, small logo. Social (Open Graph and Twitter) images get the same look with no Scripture.

## Scope: additions and improvements in this project

1. Constellation wheel with quality tiers and the Project 3 hook.
2. Wheel / List switch replacing the separate simple-picker mode (List is also the fallback).
3. Settings sheet (translation, theme, text size); header select and toggle removed.
4. "Noted in your journal · Undo" toast when a feeling is chosen. Undo removes the mood entry it just created through the existing store API; activity-day rules stay as they are.
5. Live Compare.
6. Native share with preview, and redesigned share and social cards.
7. Results ending block and designed empty, 404, error and loading states.
8. Footer shortened to one line (About and privacy, Sources and copyright notices). Attribution under each verse is unchanged.

## Engineering

- **Stylesheet:** replace `app/globals.css` with a token layer, base layer, layout layer and component sections, ordered and commented, with no override chains. Remove dead selectors. Tailwind and shadcn imports stay only if still used.
- **Tests (node:test, `scripts/`):** quality-tier selection, emotion color table completeness and contrast for both themes, `lean` weight mapping, text-size preference validation (if stored), undo behavior in the store. Rewrite `scripts/test-theme.mjs` for the new tokens: AA checks for ink levels, spark and action on canvas, on-action on action, focus ring, both themes, plus the light-mode `color-scheme: only light` guard.
- **Playwright:** `npm run e2e`. Flows: Home to verse by chip and by keyboard, List view to verse, Save then My Verses, Undo toast, Compare live toggle, Settings theme and translation, Journal shows the reflection, backup export downloads a file. Visual snapshots of each screen at 390 by 844 and 1440 by 900 in both themes, with the WebGL canvas masked and a fixed date. Runs in CI on Linux with stored baselines.
- **Lighthouse CI:** `@lhci/cli` against a production build for `/` and one results page with mobile emulation; assert 90+ in all four categories. In CI.
- **Real device:** measured fps on one mid-range Android and one iPhone, recorded in `docs/PROGRESS.md` honestly (owner may need to supply the device check).
- **README:** real screenshots (Home both themes, Results, Journal, phone), a 15 to 20 second demo GIF of turning the wheel to a verse, and a short "How it is built" section.
- **Docs:** replace `docs/DESIGN.md` with the new world (keeping its checklist format); update `PRODUCT.md` Brand Commitments (new mark, palette, AI allowed in Project 3) and `AGENTS.md` (out-of-scope list, Impeccable notes, new tests and commands); update `docs/ARCHITECTURE.md` for the particle engine and settings sheet; add a `docs/PROGRESS.md` entry.

## Verification

- `npm run check`, `npm run e2e`, Lighthouse CI all pass in CI.
- Impeccable: `critique` before the PR (target 32/40 or better, no P0 or P1), `audit` for accessibility and performance, `polish` last, `shot` at 390 and 1440 in both themes.
- Manual: keyboard-only and VoiceOver or NVDA walk of Home, Results and Settings; reduced motion; no-JavaScript Home and Results; WebGL disabled.

## Builder's calls (from the reviewer check, owner may override)

1. **Delivery:** one branch and one PR for Project 1, with phase checkpoints inside the branch (screenshots and a short note after each phase). `main` never shows a half-reskinned site; old styles are replaced wholesale when the token layer lands, so there is no long period with two token sets.
2. **Intensity stays.** It lives in the inner-ring step as three chips (Low, Medium, High) under the feeling chips. It changes particle swell and brightness in the inner ring. The List view shows it too. It stays unsaved until Project 2.
3. **CI and captures use WEB.** Playwright, Lighthouse, visual baselines, README screenshots and the GIF set the translation cookie to WEB, so no NLT text ever lands in images or the repo and no secret is added to CI. NLT server timing is not measured in CI; that is accepted.
4. **Undo** calls the existing `removeMood` for the entry just created. As with removing any reflection today, the activity day and earned milestones stay. The new entry id travels to Results in the same one-use in-memory intent already used for the dawn reveal (no URL, cookie or storage).
5. **Supersedes old wheel rules.** This spec replaces the visual rules in `docs/wheel-ui-plan.md` and the "shared criteria for Steps 8 to 11" (one warm accent, bar ring, keep the old picker, 2D fallback). Their accessibility, privacy, licensing and performance rules carry over. Steps 10 and 11 move into Project 2; the plan updates `wheel-ui-plan.md` (marked historical) and `PROGRESS.md` accordingly.

## Left to the builder

- Exact particle shader math, noise, counts within the tiers, and inertia feel.
- Exact hue values within the stated rules, after contrast tests.
- Logo geometry within the description.
- Ambient field technique (CSS or tiny canvas) as long as it meets the budget.
- Splitting `globals.css` into multiple files or one ordered file.
- Phase order inside the plan, as long as tokens and the engine land before screens.
