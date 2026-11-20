# Verselight

Emotion-based Scripture, reflection, and prayer. Stack: Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, npm, Vercel. Production: https://verselight-app.vercel.app. Everyone uses the app as a guest. Personal data stays in the visitor's browser with JSON Export and Import backups. No server persistence for personal data.

## Status
Steps 1 to 9 are shipped. Steps 10 and 11 are optional and start only when the owner asks. Most work is now an owner-requested task (fix, polish, docs, audit, feature). Do exactly the requested task; never start another step or add unrequested features.

## Read first
Read `docs/PROGRESS.md` (short). Then read only what the task touches:

| Task touches | Read |
| --- | --- |
| UI or copy | `docs/DESIGN.md` |
| Structure, routes, data flow, storage | `docs/ARCHITECTURE.md` |
| Translations, verse display, caching, sharing | `docs/TRANSLATION-LICENSES.md` |
| Headers, API routes, secrets, dependencies | `docs/SECURITY.md` |
| Env vars, domains, deploys | `docs/OPERATIONS.md` |
| An unfamiliar Next.js API | The matching guide in `node_modules/next/dist/docs/` |

Search large files instead of reading them whole. `docs/archive/` and `docs/superpowers/` are history; open them only when asked.

## Workflow (lean, owner decision 2026-11-20)
Keep token use low. Work directly; no skill workflows (superpowers), spec or plan documents, or subagents unless the owner asks.

1. Branch from `main`: `fix/`, `feat/`, `docs/`, `chore/` plus a short name. Never commit to `main`.
2. Make the smallest change that does the job. Touch only the files it needs. No new dependency without a one-line reason.
3. Ask one short question only when blocked; otherwise pick the simplest option.
4. Add or update a `node:test` (`scripts/test-*.mjs`) for logic changes and bug fixes when practical.
5. Verify with `npm run check`. For UI changes also run `npm run e2e`. CI runs the visual and Lighthouse checks; do not run Lighthouse locally. Check a UI change by eye once, at phone and desktop size.
6. Add a `docs/PROGRESS.md` log entry of at most 3 lines for features and notable fixes only.
7. Commit, push, open a PR. The owner approves every merge; never deploy production yourself.
8. Reply in under 10 lines, then stop.

## Impeccable (UI work)
Use only when the owner asks for design work, and run only the command asked for (for example `polish` or `audit`). Skip `critique` and its subagents unless requested. `docs/DESIGN.md` is the design authority; keep the calm Constellation world.

## Code and UI
- Strict TypeScript; no `any` without a comment. Server Components by default; `"use client"` only when needed.
- Use `app/`, `components/` (`ui/` for shadcn), `lib/`, and `data/`. Validate external input and browser storage. Keep streak logic in pure `lib/` functions.
- Calm, clean, mobile-first. Dark default with working light mode, semantic HTML, labels, contrast, visible focus, reduced-motion support, and loading, empty, and error states. Warm plain copy, no em dashes.
- Never commit secrets. Keep values in ignored `.env.local` and hosting secrets; keep `.env.example` current.

## Privacy
- Never send user data to any server. The translation preference cookie is the sole documented preference exception; never put personal records in cookies, URLs, requests, or logs.
- Never add analytics or tracking without asking.
- Out of scope: notifications or PWA reminders, memorize mode and audio. AI belongs only to Project 3 (on-device feeling finder, owner decision 2026-11-20); it may suggest feelings and curated verses but never generate Scripture, and NLT text is never used for training.

## Translation licensing
- Strictly noncommercial: no ads, payments, subscriptions, donations, or paid features. Do not introduce any of these without re-checking translation licenses.
- NLT default via official Tyndale API, server-side `NLT_API_KEY` only. Never log credentials or persist NLT verse text in browser storage, backups, files, framework caches, or the repository. Preserve wording and attribution; never invent Bible text.
- KJV, WEB, ASV, BSB use static public-domain files; KJV has special UK rights. WEB is the labeled fallback. Keep providers extensible and the existing disabled NIV Coming soon option pending licensed access. Never scrape or copy NIV text.
- Re-check publisher terms in `docs/TRANSLATION-LICENSES.md` before changing usage, caching, display, or sharing.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
