# Verselight architecture

Current-state map. History lives in git; this file says how things work now.

## Flow

```text
Browser -> Home (constellation wheel or server-rendered List) -> feeling page -> Results
Results / Compare -> Server Components inside Suspense (read the translation cookie)
  -> data/emotions.json + data/prompts.json (curated references and prompts)
  -> lib/verse-passage.ts (server-only dispatcher)
       -> KJV / WEB / ASV / BSB: data/verses/*.json
       -> NLT: official Tyndale API with NLT_API_KEY
            -> any failure or quota: local WEB with a visible fallback note
Browser -> lib/storage.ts -> localStorage "verselight-data" (saves, collections, journal, streaks, badges)
Browser <-> local JSON Export / Import (never uploaded)
```

No personal record reaches the server. The translation cookie is the one documented preference exception.

## Folder map

| Path | Responsibility |
| --- | --- |
| `app/` | Routes, root layout, error and not-found screens. `app/styles/` holds `tokens`, `base`, `layout`, `components`, `screens` CSS; `globals.css` only imports them |
| `app/emotions/[emotion]/[sub]/` | Results: carousel, dawn reveal, Save, Compare, Share, Reflect |
| `app/compare/`, `app/my-verses/`, `app/journal/`, `app/about/`, `app/licenses/`, `app/share/` | Compare, personal notebooks, credits, WEB share-card route |
| `components/` | Client and server UI; `ui/` is shadcn |
| `lib/` | Pure logic and services (see below) |
| `data/` | Emotions, prompts, public-domain verses, translation notices |
| `scripts/` | `test-*.mjs` unit tests, data validator, verse fetcher, brand-asset generator |
| `e2e/` | Playwright flows, fixes, visual (`@visual`) and README capture (`@capture`) |
| `proxy.ts` | Rejects unknown emotion/feeling pairs before streaming so they return HTTP 404 |
| `instrumentation.ts` | `onRequestError` emits only the fixed `server_error` code |

Key `lib/` modules: `night-sky.ts` (pure month-to-stars-and-links builder for the Journal sky), `constellation.ts` (hues, tiers, `buildConstellation`, `leanWeights`), `wheel.ts`, `dawn.ts` (one-use dawn and undo intents), `theme.ts` (pre-paint script, text size, `data-js`), `root-preferences.ts`, `translation-client.ts`, `translations.ts`, `translation-preference.ts`, `verse-passage.ts`, `bible-api.ts` (NLT fetch and parse), `nlt-quota.ts`, `storage*.ts`, `browser-storage.ts`, `streaks.ts`, `badges.ts`, `dates.ts`, `daily-verse.ts`, `share-card.ts`, `social-image.tsx`, `operational-monitor.ts`, `site-url.ts`.

## Rendering

Next.js 16 App Router with Cache Components. Server Components by default.

| Route | Rendering |
| --- | --- |
| `/`, `/about`, `/licenses` | Static, with client controls |
| `/emotions/[emotion]` | Eight prebuilt routes |
| `/emotions/[emotion]/[sub]`, `/compare` | Static shell; passages stream inside Suspense because they read the cookie |

Daily rotation: each feeling has 8 curated references. `lib/rotation.ts` shows a window of 4 that shifts by one per server (UTC) day; `?more` shows the other 4. Only 4 passages render per view, so NLT use per view is unchanged. `VERSELIGHT_TODAY` pins the day for Playwright only.
| `/my-verses`, `/journal` | Static shell; client reads storage after hydration with loading, empty and error states |
| `/share` | WEB-only `ImageResponse`, strict inputs, cached by canonical reference |

Known limitation: without JavaScript, Results and Compare show only their loading line.

## Constellation wheel

- `components/constellation-scene.tsx`: one `THREE.Points` draw call with a custom shader. Geometry from the seeded `buildConstellation`. Rotation, selection, bloom, intensity, pointer glow and `uLean` (Project 3 hook) are uniforms eased on the CPU.
- Night uses additive blending; Daylight uses normal blending with deeper hues, switched by a `data-theme` observer.
- Quality tiers: `initialTier` picks high, medium, low or list from device hints; a two-second fps probe steps down with `nextTier` or falls back to List. WebGL failure or context loss also falls back. The List view is the server and no-JavaScript picker.
- `.wheel-canvas` exposes `data-daylight` and `data-tier` for e2e.
- Intensity is component state only; it is never stored, sent or put in URLs.

## Translations

- `lib/translations.ts`: active NLT, KJV, WEB, ASV, BSB; NIV is disabled Coming soon. A new provider needs metadata, validation, dispatch, attribution, fallback, tests and licensed access.
- Cookie `translation`: one year, path `/`, SameSite=Lax, Secure on HTTPS. Missing or unknown resolves to NLT.
- Compare accepts a known reference and two to four deduplicated translations.
- NLT: `cache: "no-store"`, 8 s timeout, no redirects, body capped at 200,000 bytes, parse5 checks reference and verse range and strips notes. Remote HTML is never injected. Per-instance guard: 20 attempts per minute, 5,000 per day (500 for `TEST`), Retry-After honored with a 60 s minimum, 401/403 pause for a day. Counters are not shared across instances (owner accepted, 2026-10-15).
- No NLT text in storage, backups, images, files or framework caches.

## Storage

- `lib/storage-schema.ts` validates; `lib/storage.ts` is a browser-independent store with injected I/O and a clock; `lib/storage-migrations.ts` runs pure migrations; `lib/browser-storage.ts` is the client singleton, hook and Web Locks adapter.
- Envelope: `schemaVersion: 2`, `revision`, `updatedAt`, `data`. Unknown versions are rejected without touching stored data. Version 1 data and backups migrate on read (`migrate1to2`); the original stays stored until the next successful save. Any stored-shape change needs a schema bump, migration, validation, older-backup import and tests.
- Validation: exact keys, active translations, curated references, UUIDs, dates, unique records and valid links. Limits: 5 MiB, 10,000 items per list, 80-character collection names, 2,000-character notes. Verse text fields are rejected.
- Writes re-read and compare before replacing; tabs coordinate with a Web Lock and block edits on conflict until reload. Storage failure keeps edits in memory for the tab with an Export prompt. Unreadable data is blocked, never erased, with a raw recovery download.
- Backup: `format: "verselight-backup"`, schema version, `exportedAt`, validated data. Import previews counts and needs confirmation before full replacement.
- `recordMood(emotion, specific, id?)` is called by `FeelingLink` on ordinary navigation; navigation always proceeds even if recording fails. The id is handed to Results for Undo.

| Shape | Fields |
| --- | --- |
| `Preferences` | `theme`, `preferredTranslation` |
| `SavedVerse` | `id`, `reference`, `translationId`, optional `emotionId`/`specificEmotionId`, `createdAt` |
| `Collection` | `id`, `name`, `savedVerseIds`, `createdAt`, `updatedAt` |
| `MoodEntry` | `id`, `emotionId`, `specificEmotionId`, optional `note`, `localDate`, `createdAt`, optional `intensity` (`low`, `medium`, `high`, only when chosen on the wheel), optional `checkIn` (`answer`: `lighter`, `same`, `heavier`; `on`: a later local date) |
| `ActivityDay` | `localDate`, `firstActivityAt`, `utcOffsetMinutes`, `sources` (`emotion`, `save`) |
| `StreakState` | `currentStreak`, `longestStreak`, `lastActiveDate?`, `graceDates`, `maxObservedLocalDate?`, `maxObservedAt?` |
| `Badge` | `key`, `earnedAt` |
| Companion (v2) | `anchor?` (reference), `letters` (`id`, `writtenOn`, `openOn`, `text`), `path?` (`emotionId`, `specificId`, `startedOn`), `marks` (references), optional `prayers` (`id`, `text` up to 500 characters, `addedOn`, `answeredOn?`), optional `lock` (`version`, `salt`, `iterations`, `iv`, `data`) |

Journal passcode (`lib/journal-lock.ts`): PBKDF2-SHA-256 (600,000 iterations) derives an AES-GCM key from the passcode on the device. With a lock, notes, letters and prayers are stored only inside `lock.data`; feelings, dates and everything else stay plain. The key lives in the tab's memory after Unlock and is never stored. Export writes the sealed form, so locked text stays encrypted in backups; importing one starts locked. A stored lock alongside plain private text is rejected. No recovery: a forgotten passcode can only be cleared with "erase locked text".

Saves deduplicate by reference plus translation. Deleting a save removes its memberships; deleting a collection keeps its saves.

Before version 2, anchor, letters, path and marks lived in their own keys (`verselight-anchor`, `verselight-letters`, `verselight-path`, `verselight-spoke`). On first load `foldLegacy` merges them into the envelope (stored values win, lists merge) and each key is removed only after the merged data is saved. `verselight-check-in-dismissed` stays its own key.

## Offline reading

`public/sw.js` (registered by `components/service-worker.tsx` in production) caches the app shell pages, `/emotions/<feeling>` indexes, `/path/*` and `/_next/static` assets. `classify()` in the worker is the allowlist; Results (`/emotions/<feeling>/<sub>`), Compare, Share and everything else are never cached. Offline, a Results request redirects to `/offline?to=...`, which shows that feeling's WEB verses bundled in the app. Playwright blocks the worker by default; `e2e/offline.spec.ts` enables it.

## Streaks and badges

Pure functions in `lib/streaks.ts` and `lib/badges.ts`, tested in `scripts/test-progress.mjs`.

- A day is the device's local calendar date. Choosing a feeling or saving a verse counts once per day. Recorded dates never change after travel.
- One grace day per Monday to Sunday week bridges exactly one missed date; it keeps continuity but adds no active day.
- Backward clock changes freeze accrual until time catches up; forward jumps are real gaps.
- Totals are rebuilt from the activity ledger on load and Import.
- Badges: `streak-3`, `streak-7`, `streak-30`, `streak-100`, `first-save`, `saved-10`, `first-collection`, `first-mood`. Earned once, kept when content is removed.

## Daily verse and sharing

- Daily verse: WEB only, `(localDayOfYear - 1) % N` over the N sorted unique curated references (211), computed on the device. Dates are never sent.
- `GET /share?ref=<reference>&translation=web` rejects anything else. Successful PNGs are cached (1 day browser, 30 days shared); errors are `no-store`. The share dialog fetches without cookies and reuses the blob for preview, native share and download.
- Social images contain brand copy only.

## Settings and theme

`components/settings-sheet.tsx` sets translation, theme (Night, Daylight, System) and text size. The pre-paint script in `lib/theme.ts` applies theme and text size before first paint (the only `dangerouslySetInnerHTML`).

## Monitoring

Server logs emit only `[verselight] nlt_fallback` and `[verselight] server_error`, at most once per code per minute per instance, with no payloads. No client error upload, analytics or tracking.
