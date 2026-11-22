# Translation terms

Strictly noncommercial: no ads, subscriptions, donations or paid features. Re-check publisher terms here before changing usage, caching, display, sharing or commercial status. Licensing evidence with quotes is in [SECURITY.md](SECURITY.md#licensing-evidence).

## NLT

Sources: [API terms](https://api.nlt.to/), [API docs](https://api.nlt.to/Documentation), [Tyndale permissions](https://www.tyndale.com/permissions).

- Registered key: at most 500 verses per request and 5,000 requests per day, noncommercial. Your issued license may differ; check it in the Tyndale account.
- No published cache TTL or storage allowance, so Selah Sky never persists NLT text: not in browser storage, backups, images, files, framework caches or the repo. Requests are server-only and `no-store`.
- Mark each quotation (NLT) and show the mixed-translation notice from `data/translation-notices.json` under every NLT passage and at `/licenses#nlt`.
- No NLT in generated or downloadable images: Tyndale artwork use needs a permissions request, and API access is not treated as that permission.
- The API returns HTML; only verses matching the requested reference and range are parsed. Remote HTML is never injected.

## Public domain

- [WEB](https://ebible.org/engwebp/copyright.htm): public domain; the trademark identifies unchanged text. Cards preserve wording and credit WEB, eBible.org and public domain.
- [ASV 1901](https://ebible.org/asv/copyright.htm): public domain.
- [BSB](https://berean.bible/licensing.htm): dedicated to the public domain on April 30, 2023.
- [KJV](https://ebible.org/eng-kjv/copyright.htm): UK letters-patent restrictions; disclosed at `/licenses`, never claimed as worldwide public domain.
- KJV, WEB and ASV came from bible-api.com; BSB from BereanBible.com. They live in `data/verses/`. `npm run fetch:verses` is only for deliberate updates.

## Sharing and display decisions

- Daily verse and share cards use WEB only, labeled even when another translation is preferred. The share route accepts one canonical curated reference with `translation=web` and nothing else.
- Successful public WEB card images may be cached (owner request, 2026-10-17); errors stay `no-store`.
- Dawn reveal and the carousel only style real DOM text; wording, whitespace and attribution are unchanged and readable at once. Verse text is never drawn into WebGL.
- Any new translation in images needs its own terms review.

## Feeling finder

The on-device feeling finder (`lib/feeling-words.ts`) scores a visitor's words against a lexicon of plain phrases written for this app. It contains no Bible text from any translation, was not trained or tuned on NLT or NIV, and only returns existing feelings, which link to the curated references. It never generates or paraphrases Scripture. See [ADR 0005](decisions/0005-on-device-ai.md).

## NIV

[Biblica permissions](https://www.biblica.com/permissions/) offer a noncommercial license through [API.Bible](https://api.bible/) or [YouVersion Platform](https://platform.youversion.com/) for apps **without AI/ML features**. Project 3 (the on-device feeling finder on `/not-sure`, built in Phase E) is an AI-style feature, so this condition rules NIV out while it exists; re-check before pursuing NIV. NIV stays disabled as Coming soon. Never scrape or copy NIV text.

## Setup

1. Request an [NLT key](https://api.nlt.to/Account/Register) and review its terms.
2. Put `NLT_API_KEY` in `.env.local` and in Vercel secrets. Never use a `NEXT_PUBLIC_` name. `NLT_API_KEY=TEST` selects the anonymous tier for local testing only.
3. Restart the dev server after changing it.
4. Missing key, timeout, network error, 429, server error or malformed response falls back to local WEB with a WEB tag and a note.

Last full recheck of all sources: 2026-10-17.
