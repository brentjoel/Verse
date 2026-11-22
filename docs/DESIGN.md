# Selah Sky design: Constellation

Redesign of 2026-11-20. It replaces the night-and-gold world. Light on a void: pure black, huge light type, one violet action color, an amber spark, and eight emotion colors that live only in particles. One primary task per screen. Data, routes, storage, providers and features are unchanged.

## Tokens

All tokens live in [app/styles/tokens.css](../app/styles/tokens.css). Night is the default; Daylight is `[data-theme="light"]` and declares `color-scheme: only light`. Bedtime is `[data-theme="bedtime"]`: canvas `#0d0805`, warm dim ink (`#e6d3bc`, `#bba58e`, `#a08b75`), amber spark `#d9a45a`, and a softened lavender action `#9a78b5` with dark `--on-action`. It has its own warm-shifted emotion hues (low blue, still distinct) and passes the same AA contrast tests.

| Token | Night | Daylight | Role |
| --- | --- | --- | --- |
| `--canvas` | `#000000` | `#f6f4f1` | The only surface |
| `--ink` | `#ffffff` | `#0b0b0f` | Headlines, Scripture, primary text |
| `--ink-2` | `#bdbdbd` | `#3d3d45` | Body copy |
| `--ink-3` | `#9a9a9a` | `#5c5c66` | Labels, inactive nav, captions |
| `--action` | `#8052ff` | `#6a3cf0` | Filled pill, current dot, active nav dot, focus ring |
| `--spark` | `#ffb829` | `#9a5b00` | The Scripture reference line only |
| `--hairline` | white 10% | ink 12% | The only divider |
| `--veil` | white 6% | ink 5% | Hover, pressed and field fills |

Emotion hues (`--emotion` under `[data-emotion]`, and `emotionHues` in `lib/constellation.ts`): anxious `#2dd4bf`/`#0f8f80`, sad `#4f8cff`/`#2457c5`, angry `#ff5a5f`/`#c62f35`, tired `#a78bfa`/`#6d4fd6`, guilty `#22d3ee`/`#0e7f93`, grateful `#facc15`/`#9a7a00`, hopeful `#ffb829`/`#a35f00`, doubtful `#f472b6`/`#b8357a`. They color particles, dots and glows only, never body text. Contrast for every token pair is enforced in `scripts/test-theme.mjs`.

No cards, no shadows, no gradients on components. Gradients appear only in the logo and particles. Lists of choices or days (feelings, the finder questions, the seven-day path, the anchor verse, the craft numbers) are hairline rows, never filled boxes.

## Typography

- UI and display: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"`, then Geist (`next/font`). Apple devices render SF Pro; others render Geist. Apple fonts are never self-hosted.
- Scripture: `"New York", ui-serif`, then Lora, weight 400. 26px phone, 32px desktop, 24px in Compare columns, multiplied by the Text size setting (1, 1.15, 1.3).
- One token scale on the iOS text-style steps, and every `font-size` uses it (enforced in `scripts/test-theme.mjs`). Phone / desktop: `--text-display` 52 / 104, `--text-display-2` 40 / 72, `--text-title-1` 34 / 48, `--text-title-2` 28 / 34, `--text-title-3` 22, `--text-body` 17, `--text-callout` 15 (buttons, chips, links), `--text-footnote` 13 (captions, reference line, dates), `--text-caption` 12 (tab labels, tooltips). Scripture: 26 / 32, Compare 22 / 26, Focus 30 / 38.
- Two weights: `--weight-regular` 400 for everything, including body on dark (300 was too thin to read in a hard moment), and `--weight-strong` 600 for the pill, the brand, small uppercase labels and toasts. Headlines stay 400 with -0.04em tracking at 40px and up; hierarchy comes from scale and ink level.
- No eyebrow or kicker labels above headings. Dates and counts use tabular numbers.

## Space and shape

6px base: 6, 12, 18, 24, 30, 36, 60, 96, 120. Pills and chips are fully round; panels, sheets and dialogs 24px; fields 14px. Shell 1280px, reading column 720px. Targets at least 44px. Spacing uses the 6px steps only; 2 to 4px is reserved for optical nudges inside a control.

## Color discipline

One accent per view. Violet is the only action color (pill, current dot, focus). Amber appears only on the Scripture reference line. Emotion hues stay in particles, dots and glows. Secondary actions sit one ink step down (`--ink-2`) until hovered or focused, so the passage leads.

## Components

- **Pill:** the one filled violet button per view (Back to the wheel, Share card, Try again, empty-state actions).
- **Ghost (`.compare-link`):** text button with a veil on hover; Save, Compare, Share, Try another feeling.
- **Link (`.quiet-link`):** ink, underlined with a 35% ink rule. Amber never marks a link.
- **Remove (`.remove-link`):** quiet `--ink-3` text with a veil on hover, for remove and delete triggers. Confirm steps stay ghost buttons.
- **Chip:** outlined pill; pressed is an inverted fill. Used for wheel options, intensity, translation and settings choices.
- **Settings sheet:** gear in the header. Translation, Theme (Night, Daylight, Bedtime, System) and Text size. Bottom sheet on phones, side panel on desktop.
- **Toast:** inverted pill, portaled to `body`: at the bottom on desktop, floating over the header bar on phones so it covers neither the back link nor the actions. "Noted in your journal · Undo" waits for the Results dawn to settle.
- **More:** an ellipsis ghost (44px) that reveals secondary actions inline; on Results it holds Pin, Compare and Share. Without JavaScript the group simply shows.
- **Navigation:** phone bottom tab bar with a blurred canvas; desktop links float in the header. Active item in `--ink` with a 4px violet dot.
- **Logo:** four-point star inside an open ring, violet to teal, with a small amber spark.

## Screens

- **Home:** split hero on desktop (huge left-aligned headline, light line, then one quiet row of ink-2 ghost text: Morning star and Not sure what I feel?, optically aligned to the headline; constellation wheel on the right). The eight wheel chips sit as two even rows of four, stacked on phones. The wheel is thousands of particles in eight emotion clouds; drag, scroll, arrows or a chip turn it, the center chooses, and the inner ring blooms in that emotion's hue with intensity chips. Phones start in List with a compact row above it, a 72px rotating ring of eight emotion dots beside "Turn the constellation", which opens the wheel, so the first feelings show above the fold; desktop starts in the wheel. The current emotion chip has an inset ink ring. A Wheel / List switch; List is also the server, no-JavaScript, no-WebGL, reduced-motion and slow-device picker.
- **Return check-in:** on Home, a block under the light line set off by a hairline above it (no card) for a returning visitor ("Last time you felt X. How is your heart now?"), three chips, a polite reply with onward links, and a quiet Not now that hides it for the local day. Never shown on first visits, same-day reflections or blocked storage.
- **Feeling list:** emotion name beside a still star cluster, then four large rows with hairlines.
- **Results:** verse first. Back link, feeling name, a small particle burst in the emotion hue, the amber reference line, the verse, attribution directly under it, pager, Save and This spoke to me with a quiet More (Pin, Compare, Share), Reflect, and an ending block: a quiet line, a row of ghost links whose text sits on the column edge (Read 4 more verses or Back to today's verses, Walk a seven-day path, Try another feeling), then the Back to the wheel pill on its own line. Four passages show per day from eight per feeling, shifting by one each day. Tapping the glowing passage finishes the dawn; Skip remains for keyboards. A Focus ghost button hides everything but the passage, attribution and pager, centers the verse at a larger size, and leaves with Exit focus or Escape; it is never stored.
- **Compare:** reference in the Scripture face, live translation chips (a GET form remains for no-JavaScript), stacked or columned passages with attribution.
- **Journal sky:** the month opens as a night sky above the reflections: each visited day is a star in its latest emotion hue (size by reflection count), consecutive days join with hairline strokes, and a grace day bridges with a dashed, dimmer line plus Lamentations 3:22-23 (WEB). A Sky / Calendar switch keeps the calendar one tap away; choosing a star or day filters the reflections below.
- **Breathe:** a quiet page with a violet-ringed orb that grows and shrinks with the cue (Breathe in, Hold, Breathe out) and a seconds count. Calm and Steady chips, one Begin / Stop pill. Transient and never stored; reduced motion removes the orb animation and keeps the text cue.
- **My Verses, Journal:** notebooks, not settings. Saved verses with feeling and date; reflections first with readable dates and notes behind Add a note; a borderless calendar whose days glow in the latest reflection's emotion; a gentle "Your rhythm" summary with the rules in a disclosure.
- **About, Licenses:** reading pages with display headings and a 720px measure.
- **404, error, empty and loading states:** one shape everywhere: the constellation mark, one kind line, at most one action (a pill for empty, none for loading). Loading uses `QuietLoading`, whose stars breathe in turn and stay still under reduced motion (Journal "Gathering your sky.", My Verses, Year in light, the wheel, the share card preview). One constellation per page: secondary empties (collections, prayers) are a single plain line.
- **Share:** a cookie-less preview of the WEB card, then Share card (native share sheet with the PNG when supported), Download and Open. Cards and social images use the void canvas, an emotion-hued constellation ring, and public-domain text only.
- **Ambient sky:** faint drifting stars behind secondary pages, masked away from the reading column, paused when hidden, absent for reduced motion.

## Motion

One night-sky language: light arrives quickly and settles slowly; nothing bounces. Every motion explains a change, acknowledges a touch, or is the one authored moment of its screen. Only `transform` and `opacity` animate (plus `scale`, `translate` and `rotate`), and Scripture is never hidden, faded in or delayed by motion.

**Tokens** ([tokens.css](../app/styles/tokens.css)): `--motion-fast` 150ms (feedback, exits), `--motion-base` 220ms (state), `--motion-slow` 420ms (arrivals), `--motion-scene` 900ms (the sky itself changing), `--stagger` 70ms, `--motion-spring` 520ms. Easings: `--ease-out` `cubic-bezier(.16, 1, .3, 1)` for arrivals, `--ease-move` `cubic-bezier(.65, 0, .35, 1)` for things that travel, and `--ease-spring`, a `linear()` damped spring with one 2% overshoot, for things the hand moves. Exits run faster than entrances.

**Routes.** `<main>` is its own view-transition snapshot (`page`), so the header and tab bar hold still. Forward routes rise 10px into place; back links (`transitionTypes={["nav-back"]}`) settle 8px down from above; verse switching and Compare toggles (`verse-next`, `verse-previous`, `same-page`) leave the page still. A feeling's title travels from its row on the feeling list, or the wheel's center, to the Results heading (`feelingTitleName`, `share="feeling-title"`). The first page load never fades, so the headline counts for LCP.

**Authored moments.** One per screen.
- Home, wheel: choosing a feeling gathers the particles toward the chosen light (`uDawn` in the shader) while Results loads; the surrounding labels and chips step back. It runs only while the page is loading and never delays navigation, and every quality tier draws it.
- Results, dawn: the verse is readable at once; the burst of stars rises behind the reference and the words warm from ink-3 to ink. Attribution, pager, actions and Reflect settle in after it in reading order (160ms plus a 70ms stagger), only on arrival, never when moving between verses.
- Journal sky: stars twinkle in by date (the whole month within about a second) and the lines between consecutive days draw themselves from their earlier star.
- First visit to Home: the sky fades in around the headline (painted at once), a scatter of stars twinkles and fades, then the light line, tools and picker rise. Shown once (`verselight-intro` in localStorage, its own key, never in backups), only on `/`, never under reduced motion. Any key, tap, scroll or wheel fast-forwards it; it is gone within three seconds. The pre-paint script decides (`data-intro`), so it never flashes; e2e and visual runs pin the flag as seen.

**Feedback.**
- Press: pills, ghosts, chips, icon buttons and Home's quiet links dip to 96% in 90ms and return on the spring; list rows flash the veil on touch; tab icons dip to 86%.
- Hover (fine pointers): the pill gathers a soft violet glow (a shadow on a same-size layer, opacity only) and one small four-point star spark at its corner; it leans up to 3px toward the cursor (MagneticPills, mouse only). Ghost icons lift 1px. Rows nudge their arrow. Chips brighten their outline.
- Save and This spoke to me: a ring of seven tiny stars in the emotion hue (violet outside Results) and a spring pop of the icon, only when saving or marking, never when undoing.
- More: Pin, Compare and Share slide in from behind the ellipsis in turn.
- Sheets and dialogs open on the spring (the settings sheet rises from the bottom on phones and slides from the side on wider screens) and close faster with `--ease-out`; the scrim fades.
- Theme: Night, Daylight and Bedtime crossfade the whole page over `--motion-scene`, like the sky changing (`crossfadeTheme`). Skipped for reduced motion and unsupported browsers.

**Reduced motion** is calm and static: the List picker, no wheel, no ambient drift, no intro, no theme crossfade, no stagger delays (the global rule zeroes `animation-delay`), no star bursts or magnetic lean. State still shows: fills, pressed colors, the toast and the Saved label.

**Performance.** No animation library. Loops pause when the page is hidden. The wheel keeps its quality tiers and fps probe; all CSS motion is compositor-only.

## Accessibility and verification checklist

- [ ] Night, Daylight and Bedtime pass the token contrast tests; emotion hues reach 3:1 as dots.
- [ ] Wheel: keyboard arrows and Enter, live "N of 8" status, chip equivalents, List view always reachable.
- [ ] Results: reference, first verse lines and pager fit 375 by 812 at Default text size; attribution under every quotation.
- [ ] No horizontal scroll at 320px with Larger text (enforced by `npm run e2e`).
- [ ] Dialogs and the settings sheet trap focus, close with Escape and return focus.
- [ ] Loading, empty, error, conflict and no-WebGL states designed and reachable.
- [ ] Lighthouse 90+ in all four categories on Home and Results (enforced in CI).
- [ ] No new runtime dependencies, analytics, NLT text in images, or production deploy without approval.
- [ ] Every new motion has a reduced-motion path, animates only transform and opacity, and never hides or delays Scripture.

Warm, plain copy. No em dashes in app text.
