# Verselight

Emotion-based Scripture, reflection, and prayer. Stack: Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, npm, Vercel. Production: https://verselight-app.vercel.app. Everyone uses the app as a guest. Personal data stays in the visitor's browser with JSON Export and Import backups. No server persistence for personal data.

## Status
Steps 1 to 9 are shipped. Steps 10 and 11 are optional and start only when the owner asks. Most work is now an owner-requested task (fix, polish, docs, audit). Do exactly the requested task or the next step the owner names; never start another step or add unrequested features.

## Read first
Always read `docs/SPEC.md` and the status and checklist at the top of `docs/PROGRESS.md`, plus its newest entries. Skip older logs unless they relate to the task. Then read what the task touches:

| Task touches | Read |
| --- | --- |
| Any UI or copy | `docs/DESIGN.md`, and follow its checklist |
| Wheel picker or dawn reveal | `docs/wheel-ui-plan.md` |
| Structure, routes, data flow, storage | `docs/ARCHITECTURE.md` |
| Translations, verse display, caching, sharing | `docs/TRANSLATION-LICENSES.md` |
| Headers, API routes, secrets, dependencies | `docs/SECURITY.md` |
| Env vars, domains, deploys | `docs/OPERATIONS.md` |
| Any Next.js API | The matching guide in `node_modules/next/dist/docs/` |

## Workflow
1. Branch from up-to-date `main`: `step-N-short-name` for checklist steps, otherwise `fix/`, `feat/`, `docs/`, `chore/`, or `ci/` plus a short name. Never commit to `main`.
2. If unclear, ask one short question. Otherwise choose the simplest option and log it in the PROGRESS decisions log.
3. Touch only files the task needs. No new dependency without a one-line reason in the PR.
4. For bug fixes and `lib/` logic, add or update a `node:test` suite in `scripts/test-*.mjs` first when practical.
5. Run `npm run check` (typecheck, lint, tests, build); it must pass. In PowerShell use `npm.cmd` and `npx.cmd` if script launchers are blocked. For UI changes, also try it with `npm run dev` at 390px and desktop, in both themes and with reduced motion.
6. Add a dated `docs/PROGRESS.md` entry of at most 5 lines: what changed, why, and how it was verified. Do not rewrite past entries.
7. Commit small, push, and open a PR to `main`. CI runs the same checks and Vercel builds a preview. Wait for the owner's approval before merging. Never deploy production independently.
8. Reply in under 10 lines: what changed, check results, and how to try it. Then stop.

## Skills and plugins
- This file outranks skill and plugin workflows. Match process to task size: small fixes and docs need no brainstorm, design doc, or plan file.
- Keep generated plans and specs out of the repo unless the owner asks for them.
- `docs/DESIGN.md` is the design source of truth. Design skills may inform work but must not replace or overwrite it unless asked.

## Code and UI
- Strict TypeScript; no `any` without a comment. Server Components by default; `"use client"` only when needed.
- Use `app/`, `components/` (`ui/` for shadcn), `lib/`, and `data/`. Validate external input and browser storage. Keep streak logic in pure `lib/` functions.
- Calm, clean, mobile-first. Dark default with working light mode, semantic HTML, labels, contrast, visible focus, reduced-motion support, and loading, empty, and error states. Warm plain copy, no em dashes.
- Never commit secrets. Keep values in ignored `.env.local` and hosting secrets; keep `.env.example` current.

## Privacy
- Never send user data to any server. The translation preference cookie is the sole documented preference exception; never put personal records in cookies, URLs, requests, or logs.
- Never add analytics or tracking without asking.
- Out of scope: notifications or PWA reminders, memorize mode, AI free-text, and audio.

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
