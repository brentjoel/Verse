# Verselight design: Constellation

Redesign of 2026-11-20. It replaces the night-and-gold world. Light on a void: pure black, huge light type, one violet action color, an amber spark, and eight emotion colors that live only in particles. One primary task per screen. Data, routes, storage, providers and features are unchanged.

## Tokens

All tokens live in [app/styles/tokens.css](../app/styles/tokens.css). Night is the default; Daylight is `[data-theme="light"]` and declares `color-scheme: only light`. Bedtime is `[data-theme="bedtime"]`: canvas `#0d0805`, warm dim ink (`#e6d3bc`, `#bba58e`, `#a08b75`), amber spark `#d9a45a`, and a softened lavender action `#9a78b5` with dark `--on-action`. It keeps Night's particle hues and passes the same AA contrast tests.

| Token | Night | Daylight | Role |
| --- | --- | --- | --- |
| `--canvas` | `#000000` | `#f6f4f1` | The only surface |
| `--ink` | `#ffffff` | `#0b0b0f` | Headlines, Scripture, primary text |
| `--ink-2` | `#bdbdbd` | `#3d3d45` | Body copy |
| `--ink-3` | `#9a9a9a` | `#5c5c66` | Labels, inactive nav, captions |
| `--action` | `#8052ff` | `#6a3cf0` | Filled pill, current dot, active nav dot, focus ring |
| `--spark` | `#ffb829` | `#9a5b00` | Links, reference lines, small highlights |
| `--hairline` | white 10% | ink 12% | The only divider |
| `--veil` | white 6% | ink 5% | Hover, pressed and field fills |

Emotion hues (`--emotion` under `[data-emotion]`, and `emotionHues` in `lib/constellation.ts`): anxious `#2dd4bf`/`#0f8f80`, sad `#4f8cff`/`#2457c5`, angry `#ff5a5f`/`#c62f35`, tired `#a78bfa`/`#6d4fd6`, guilty `#22d3ee`/`#0e7f93`, grateful `#facc15`/`#9a7a00`, hopeful `#ffb829`/`#a35f00`, doubtful `#f472b6`/`#b8357a`. They color particles, dots and glows only, never body text. Contrast for every token pair is enforced in `scripts/test-theme.mjs`.

No cards, no shadows, no gradients on components. Gradients appear only in the logo and particles.

## Typography

- UI and display: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"`, then Geist (`next/font`). Apple devices render SF Pro; others render Geist. Apple fonts are never self-hosted.
- Scripture: `"New York", ui-serif`, then Lora, weight 400. 26px phone, 32px desktop, 24px in Compare columns, multiplied by the Text size setting (1, 1.15, 1.3).
- Scale (phone / desktop): display 52 / 104, heading-lg 40 / 72, heading 32 / 48, heading-sm 26 / 32, body 17 / 18 at weight 300, caption 13. Headlines weight 400 with -0.04em tracking at 40px and up. Hierarchy comes from scale, never weight.
- No eyebrow or kicker labels above headings. Dates and counts use tabular numbers.

## Space and shape

6px base: 6, 12, 18, 24, 30, 36, 60, 96, 120. Pills and chips are fully round; panels, sheets and dialogs 24px; fields 14px. Shell 1280px, reading column 720px. Targets at least 44px.

## Components

- **Pill:** the one filled violet button per view (Back to the wheel, Share card, Try again, empty-state actions).
- **Ghost (`.compare-link`):** text button with a veil on hover; Save, Compare, Share, Try another feeling.
- **Link (`.quiet-link`):** amber, underlined.
- **Remove (`.remove-link`):** quiet `--ink-3` text with a veil on hover, for remove and delete triggers. Confirm steps stay ghost buttons.
- **Chip:** outlined pill; pressed is an inverted fill. Used for wheel options, intensity, translation and settings choices.
- **Settings sheet:** gear in the header. Translation, Theme (Night, Daylight, Bedtime, System) and Text size. Bottom sheet on phones, side panel on desktop.
- **Toast:** inverted pill at the bottom, portaled to `body`. "Noted in your journal · Undo".
- **Navigation:** phone bottom tab bar with a blurred canvas; desktop links float in the header. Active item in `--ink` with a 4px violet dot.
- **Logo:** four-point star inside an open ring, violet to teal, with a small amber spark.

## Screens

- **Home:** split hero on desktop (huge left-aligned headline, light line, Morning star; constellation wheel on the right), stacked on phones. The wheel is thousands of particles in eight emotion clouds; drag, scroll, arrows or a chip turn it, the center chooses, and the inner ring blooms in that emotion's hue with intensity chips. Phones start in List with a small rotating ring of eight emotion dots above it ("Turn the constellation") that opens the wheel; desktop starts in the wheel. The current emotion chip has an inset ink ring. A Wheel / List switch; List is also the server, no-JavaScript, no-WebGL, reduced-motion and slow-device picker.
- **Return check-in:** on Home, a small bordered card under the light line for a returning visitor ("Last time you felt X. How is your heart now?"), three chips, a polite reply with onward links, and a quiet Not now that hides it for the local day. Never shown on first visits, same-day reflections or blocked storage.
- **Feeling list:** emotion name beside a still star cluster, then four large rows with hairlines.
- **Results:** verse first. Back link, feeling name, a small particle burst in the emotion hue, the amber reference line, the verse, attribution directly under it, pager, Save / Compare / Share, Reflect, and an ending block (Read 4 more verses or Back to today's verses, Try another feeling, Back to the wheel). Four passages show per day from eight per feeling, shifting by one each day. Tapping the glowing passage finishes the dawn; Skip remains for keyboards. A Focus ghost button hides everything but the passage, attribution and pager, centers the verse at a larger size, and leaves with Exit focus or Escape; it is never stored.
- **Compare:** reference in the Scripture face, live translation chips (a GET form remains for no-JavaScript), stacked or columned passages with attribution.
- **Journal sky:** the month opens as a night sky above the reflections: each visited day is a star in its latest emotion hue (size by reflection count), consecutive days join with hairline strokes, and a grace day bridges with a dashed, dimmer line plus Lamentations 3:22-23 (WEB). A Sky / Calendar switch keeps the calendar one tap away; choosing a star or day filters the reflections below.
- **Breathe:** a quiet page with a violet-ringed orb that grows and shrinks with the cue (Breathe in, Hold, Breathe out) and a seconds count. Calm and Steady chips, one Begin / Stop pill. Transient and never stored; reduced motion removes the orb animation and keeps the text cue.
- **My Verses, Journal:** notebooks, not settings. Saved verses with feeling and date; reflections first with readable dates and notes behind Add a note; a borderless calendar whose days glow in the latest reflection's emotion; a gentle "Your rhythm" summary with the rules in a disclosure.
- **About, Licenses:** reading pages with display headings and a 720px measure.
- **404, error, empty states:** a still constellation, one heading, one sentence, one pill.
- **Share:** a cookie-less preview of the WEB card, then Share card (native share sheet with the PNG when supported), Download and Open. Cards and social images use the void canvas, an emotion-hued constellation ring, and public-domain text only.
- **Ambient sky:** faint drifting stars behind secondary pages, masked away from the reading column, paused when hidden, absent for reduced motion.

## Motion

Tokens: fast 150ms, base 220ms, slow 420ms, scene 900ms; ease-out `cubic-bezier(.16, 1, .3, 1)`, moves `cubic-bezier(.65, 0, .35, 1)`. One authored moment per screen: the wheel on Home, the dawn on Results. Route changes animate through View Transitions; the first page load does not fade, so the headline counts for LCP. Reduced motion shows the List view, removes drift and parallax, and shows Scripture instantly.

## Accessibility and verification checklist

- [ ] Night, Daylight and Bedtime pass the token contrast tests; emotion hues reach 3:1 as dots.
- [ ] Wheel: keyboard arrows and Enter, live "N of 8" status, chip equivalents, List view always reachable.
- [ ] Results: reference, first verse lines and pager fit 375 by 812 at Default text size; attribution under every quotation.
- [ ] No horizontal scroll at 320px with Larger text (enforced by `npm run e2e`).
- [ ] Dialogs and the settings sheet trap focus, close with Escape and return focus.
- [ ] Loading, empty, error, conflict and no-WebGL states designed and reachable.
- [ ] Lighthouse 90+ in all four categories on Home and Results (enforced in CI).
- [ ] No new runtime dependencies, analytics, NLT text in images, or production deploy without approval.

Warm, plain copy. No em dashes in app text.
