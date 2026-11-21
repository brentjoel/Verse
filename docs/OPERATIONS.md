# Operations

Deployment, maintenance and delivery reference for Verselight. See the [project overview](../README.md).

## Local setup

Use Node.js 24 and npm. On PowerShell, use `npm.cmd` / `npx.cmd` if script launchers are blocked.

```sh
npm ci
```

Copy `.env.example` to ignored `.env.local`, then fill in values privately:

| Variable | Purpose |
| --- | --- |
| `NLT_API_KEY` | Server-only Tyndale credential. Missing/invalid key uses labeled WEB fallback. |
| `NEXT_PUBLIC_SITE_URL` | Public, build-time HTTPS origin used by About and metadata. Set to `https://verselight-app.vercel.app` using the stable production HTTPS origin, not a deployment-specific URL. Keep this in configuration rather than hardcoding it in application code. No path, query, fragment, or credentials. Defaults to `http://localhost:3000` when omitted locally. Rebuild after changing it. |

```sh
npm run dev
```

Open http://localhost:3000. Smoke path: turn the wheel to Anxious > Worried about the future, change translation in Settings, Compare, Save, Share, then check My Verses and Journal. Never print or commit `.env.local`.

## Checks

```sh
npm run check     # typecheck, lint, unit tests, data validation, build
npm run e2e       # Playwright flows on phone and desktop
```

CI also runs the visual regression job (`npm run e2e:visual`) and Lighthouse (90+ in every category). Do not run Lighthouse locally. Provider tests use labeled synthetic fixtures and never consume NLT quota.

README screenshots and the demo video (`docs/media/demo.webm`) come from a production build with WEB only:

```sh
npm run build
npx playwright test e2e/capture.spec.ts --project=desktop --grep @capture
```

## Privacy, deletion, and backups

Export from My Verses regularly. Backups are unencrypted JSON and include private journal notes. Keep them safe; do not attach them to issues or logs. Import reads a file locally, validates it, previews counts, and asks before replacing all records. Export current data first. No upload or sync occurs. Schema 2 accepts the implemented journal, activity, badge, letter, anchor, path and mark records, and version 1 backups still import; unknown versions, unexpected fields, invalid relationships and files over 5 MiB are rejected without replacement.

Remove saves/collections in My Verses and reflections in Journal. Reflection deletion retains historical activity and milestones. Clear this site's data in browser settings to erase all records and preferences; delete backups separately. Clearing data, eviction, private browsing, and device loss can remove records. Storage failures keep ordinary edits only in the current tab; Export before leaving. A failed persistent import keeps existing data. Conflicts require explicit reload; unreadable storage offers raw recovery before confirmed reset. Preview, localhost, and production have separate storage. To move records, Export then Import on the destination origin.

The validated one-year translation cookie is the documented preference exception sent to the server. Normal hosting requests expose public page URLs and network metadata; never put personal records in requests, cookies, URLs, or logs. See `/about#privacy` and [architecture](ARCHITECTURE.md).

## NLT resilience and credits

The existing server passage path uses best-effort per-instance limits of 20 upstream attempts per rolling minute and 5,000 per rolling 24 hours for registered keys. Attempts reserve quota before fetch, including failures. Rate-limit and service errors honor numeric or HTTP-date Retry-After; authentication errors pause upstream work. Cooldowns never shorten. Exact upstream pause durations and anonymous-tier details live only in [SECURITY.md](SECURITY.md#nlt-requests-inputs-and-errors).

Memory resets on restart; serverless instances and deployments do not share counters or cooldowns. This cannot guarantee an account-wide quota or prevent availability exhaustion. Provider limits remain authoritative. The owner accepted these limits without a shared service; consider a shared operational store if traffic grows.

NLT requests use the official server-side API, `no-store`, an eight-second timeout, no redirects, bounded streamed response size, exact passage validation, and labeled WEB fallback. No automatic upstream retries or persistent NLT caching: published API pages do not specify a safe storage TTL. Backups hold references and translation ids, never Scripture text. [Translation terms and setup](TRANSLATION-LICENSES.md) include issued-key caveats.

KJV, WEB, and ASV static data come from [bible-api.com](https://bible-api.com/); BSB from [BereanBible.com](https://bereanbible.com/bsb.txt). KJV has special UK rights. WEB/ASV are public domain; BSB was dedicated to the public domain April 30, 2023. Full source links, NLT notice, and WEB trademark credit appear at `/about#credits` and `/licenses`. NIV stays disabled pending licensed access. Recheck terms before changing usage, display, sharing, caching, or noncommercial status.

## Operational monitoring

Server logs emit only `[verselight] nlt_fallback` and `[verselight] server_error`, at most once per code per minute per instance. The error hook ignores error/request/context arguments; upstream errors are replaced with fixed messages without causes or credential-bearing URLs. Sampled warnings indicate a problem; they are not precise counts, alerts, or durable monitoring. There is no client error upload, analytics, or tracking. Do not add them without approval. Inspect warning codes in Vercel Runtime Logs; do not enable request-body/cookie capture or outgoing fetch tracing that could expose the NLT key. Hosting/framework access logs are outside this logger and require a separate retention/access review.

## Vercel verification reference

Launch verification is complete per owner confirmation. Keep this checklist for future deployment reviews; the historical audit evidence is in [SECURITY.md](SECURITY.md).

- [ ] In project `verselight`, confirm Git repository `brentjoel/verselight`, production branch `main`, Next.js preset, repository-root directory, Node.js 24, lockfile install, and `npm run build`.
- [ ] Confirm Git previews are enabled and find the branch deployment. Confirm its commit matches the branch under review. Keep production unchanged until approval.
- [ ] In **both Preview and Production scopes**, confirm server-only `NLT_API_KEY`, the issued-key license, and `NEXT_PUBLIC_SITE_URL` for the intended public origin. Redeploy the preview after environment changes. Never expose the NLT key through a `NEXT_PUBLIC_` name.
- [ ] Check Domains and deployment status: confirm whether the supplied URL is stable or deployment-specific; set the intended production origin in `NEXT_PUBLIC_SITE_URL`. Check HTTPS, About's site link, and its canonical/OG URL after a build. Preview About links intentionally use the configured origin.
- [ ] On the preview, verify NLT text, attribution, cookie persistence, Compare, and WEB. With a deliberately absent/invalid **preview-only** key, verify labeled WEB fallback and fixed warnings; restore it and redeploy. Do not load-test Tyndale or alter the production key. Automated tests cover quota/timeout/Retry-After failures.
- [ ] Review Runtime Logs, access settings and retention. Confirm warning codes contain no cookies, notes, backups, keys or full provider URLs. Leave Analytics, Speed Insights, session replay and external log drains disabled unless separately approved. Confirm fetch tracing does not reveal credential query strings.
- [ ] In narrow/wide layouts and both themes, check the daily WEB passage, WEB card download/open controls, `/about`, `/licenses`, footer links, keyboard focus/skip link, headings, contrast, zoom/wrapping, and reduced motion. Verify Journal and My Verses Export/Import with disposable records; confirm no record/backup requests leave the browser in DevTools Network.
- [ ] Review security/licensing, backup recovery, diff and preview. Obtain user approval before merging to `main`. After an approved merge, verify the production deployment and repeat the read/credits/privacy smoke check. A pushed branch is not proof of hosting verification.

## Delivery workflow

Follow [AGENTS.md](../AGENTS.md). Push each branch for a Vercel preview and wait for owner approval before merging. No independent production deployment.
