# Building Selah Sky: a quiet app with hard rules

Draft for the owner. Not published anywhere. Edit freely; every number below comes from the repo.

## The idea

Selah Sky is a small web app for the moment you do not know what to say to God. You pick a feeling, and it offers Scripture, a reflection question and a short prayer starter. Everyone is a guest. There are no accounts, no ads and no tracking, and it is strictly noncommercial.

Those constraints turned out to be the interesting part. Most of the engineering is about what the app refuses to do.

## Rule 1: your heart stays in your browser

Journal notes are some of the most private text a person writes, so the safest copy is the one that does not exist on a server. Saved verses, collections, notes and streaks live in `localStorage` under one versioned, validated key, with JSON Export and Import as the backup. Everything read back is validated, because storage can be edited or corrupted.

The cost is honest: no sync, and clearing browser data erases records. The app says so plainly instead of hiding it.

## Rule 2: licensed text is handled like a loan

The default translation, NLT, is licensed. It is fetched on the server through the publisher's API with a secret key, shown, and never stored. It is not cached, not written to backups, not put in share cards and not committed. If the API fails or a quota guard trips, the reader sees the public-domain World English Bible with a clear note. Share cards, tests and screenshots use WEB only, so licensed text cannot leak into an image by accident.

## Rule 3: stay fast on a modest phone

The home screen is a wheel of eight feelings drawn as about 9,000 glowing particles. It is a single Three.js points mesh with a custom shader, so it costs one draw call. Quality tiers (high, medium, low) are chosen from device hints, and a two-second fps probe steps the tier down if the device struggles, falling back to a plain List view. The List view is server rendered, so it also serves no-JavaScript visitors and anyone who prefers reduced motion.

Results from the performance work:

- Largest Contentful Paint on Home went from 3.0s to 0.9s, mostly by letting the headline paint first instead of fading the page in.
- Layout shift on Journal went from 0.23 to 0 by reserving the viewport while browser records load.
- Lighthouse 90 or more in every category is a CI gate, not a goal.

## Rule 4: prove it on every pull request

Each change runs typecheck, lint, more than 100 unit tests, a production build, Playwright flows on phone and desktop, visual regression screenshots, axe accessibility checks in dark and light themes, and the Lighthouse gate. Nothing merges on red. A `?debug` overlay shows fps, tier, particle count and draw calls when I need to look inside.

## Small things I enjoyed

- A night sky journal: each day you visit becomes a star, consecutive days join into a constellation, and a grace day bridges the gap with a dimmer line. The same data draws a client-side PNG card for sharing, with a public-domain verse and no notes.
- Per-feeling social images that glow in each feeling's color, with brand copy only.
- Short decision records in `docs/decisions/` for the choices above, so the reasons survive the memory of making them.

## What I would do differently

I would measure on real mid-range phones sooner. Everything above was checked in emulation and CI, and real-device frame rates are still unmeasured. A full screen-reader pass is also still ahead of me.

## Links

- Live app: https://selah-sky.vercel.app
- Case study: /craft in the app
- Code: https://github.com/brentjoel/Verse
