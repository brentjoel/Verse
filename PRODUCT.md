# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary audience (owner confirmed, 2026-11-20): recruiters and portfolio reviewers judging the owner's craft, usually in a short first visit on desktop or phone. The product must also work for real people who open it in a hard or quiet moment, mostly on a phone, and want a fitting passage, a reflection question and a prayer starter. Everyone is a guest; there are no accounts.

## Product Purpose
Help someone meet what they feel with real Scripture: choose a broad emotion, then a specific feeling, and read four curated passages with reflection and prayer prompts. Save verses, keep a private mood journal with streaks and badges, compare translations and share public-domain verse cards. Success: a first-time visitor reaches a fitting verse within seconds, and a reviewer sees calm, careful, production-grade craft.

## Positioning
Emotion-first Scripture with a curated mapping (8 emotions, 32 feelings, 4 passages each), a wheel-within-a-wheel picker and a dawn verse reveal, built with strict privacy: personal records never leave the browser. Real and portfolio at once: it must genuinely help users while showing the owner's engineering and design craft.

## Operating Context
Mobile-first web app on Vercel (https://verselight-app.vercel.app). Visits are short and often emotional. Reviewers may skim several screens quickly. Data lives in browser storage with local JSON Export and Import backups.

## Capabilities and Constraints
- Routes: Home (wheel and simple picker, daily WEB verse), feeling lists, results (carousel, dawn reveal, Save, Compare, Share, Reflect), Compare, My Verses, Journal, About and privacy, Licenses, 404.
- Translations: NLT default via the official server-only Tyndale API with WEB as the labeled fallback; KJV, WEB, ASV, BSB static public domain; NIV disabled as Coming soon. Never invent or alter Scripture text; attribution stays visible under every quotation.
- No NLT text in storage, images or caches. Share cards and the daily verse use WEB only.
- Strictly noncommercial: no ads, payments, donations or paid features. No analytics or tracking. The translation cookie is the only preference sent to the server.
- Out of scope: notifications, memorize mode, audio. AI is planned only as Project 3: an on-device feeling finder that suggests feelings and curated verses and never writes Scripture.
- Project 2 (planned): night sky journal, Breathe, focus reading mode, sky share card, prayer list, time-of-day sky, saved intensity. It absorbs the old optional Steps 10 and 11.

## Brand Commitments
- Name: Verselight. Mark: a four-point star inside an open ring, violet to teal, with an amber spark (Constellation redesign, 2026-11-20).
- Voice: warm, plain, gentle copy. No em dashes in app text. Never guilt or pressure (for example about streaks or time away).
- Imagery limited to light, stars and wheels; no faces, angels, figures or denomination-specific symbols.
- Visual system lives in `docs/DESIGN.md`: the Constellation world (void canvas, light display type, violet actions, amber spark, emotion-colored particles).

## Evidence on Hand
Curated content in `data/emotions.json` and `data/prompts.json`; public-domain verse files in `data/verses/`. No testimonials, usage numbers or reviews exist; do not fabricate any. README screenshots come from `e2e/capture.spec.ts`.

## Product Principles
- Reach the verse fast: the feeling picker and the passage are the product; everything else stays quiet.
- Scripture is sacred text: exact wording, readable immediately, attribution always visible.
- Private by construction: nothing personal leaves the device.
- Calm over clever: motion and decoration serve the moment and step aside for reduced motion.
- Craft shows in details: every state (loading, empty, error, offline storage) is designed.

## Accessibility & Inclusion
WCAG AA contrast in both themes, visible focus, 44px targets, full keyboard paths (including the wheel and carousel), screen-reader labels, reduced motion with instant text, and accessible alternatives for the wheel and the calendar heatmap.
