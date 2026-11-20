# Verselight

Emotion-based Scripture, reflection, and prayer. Stack: Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, npm, Vercel. Production: https://verselight-app.vercel.app. Everyone uses the app as a guest. Personal data stays in the visitor's browser with JSON Export and Import backups. No server persistence for personal data.

## Status
Steps 1 to 9 are shipped. Steps 10 and 11 are optional and start only when the owner asks. Most work is now an owner-requested task (fix, polish, docs, audit, feature). Do exactly the requested task; never start another step or add unrequested features.

## Read first
Always read `docs/SPEC.md` and `docs/PROGRESS.md` (short: status, checklist, active decisions, open items, log). Then read what the task touches:

| Task touches | Read |
| --- | --- |
| Any UI or copy | `docs/DESIGN.md` (design authority; follow its checklist) |
| Wheel picker or dawn reveal | `docs/wheel-ui-plan.md` |
| Structure, routes, data flow, storage | `docs/ARCHITECTURE.md` |
| Translations, verse display, caching, sharing | `docs/TRANSLATION-LICENSES.md` |
| Headers, API routes, secrets, dependencies | `docs/SECURITY.md` |
| Env vars, domains, deploys | `docs/OPERATIONS.md` |
| Any Next.js API | The matching guide in `node_modules/next/dist/docs/` |
| Why something was built a certain way | `docs/archive/progress-history.md` (search it, do not read it whole) |

## Workflow
Match process to size. This file outranks skill defaults where they differ.

| Size | Path |
| --- | --- |
| Tiny: copy, docs, config, one-file tweak | Branch, edit, verify, PR. No spec or plan. |
| Bug | `superpowers:systematic-debugging` to find the root cause, then `superpowers:test-driven-development`: failing test, fix, verify. |
| Feature or multi-file change | `superpowers:brainstorming` (spec) → owner approves → `superpowers:writing-plans` → owner approves → `superpowers:subagent-driven-development` for 3+ tasks, else `superpowers:executing-plans` → `superpowers:requesting-code-review` → PR. |
| Any UI change | Add the Impeccable steps below to whichever path applies. |

Always:
1. Branch from up-to-date `main`: `step-N-short-name` for checklist steps, otherwise `fix/`, `feat/`, `docs/`, `chore/`, or `ci/` plus a short name. Never commit to `main`. If the session already runs in a worktree, use it; otherwise `superpowers:using-git-worktrees` uses `.worktrees/` (ignored).
2. If unclear, ask one short question. Otherwise choose the simplest option and log it in the PROGRESS decisions log.
3. Touch only files the task needs. No new dependency without a one-line reason in the PR.
4. Tests are `node:test` suites in `scripts/test-*.mjs` (`node --test scripts/test-<name>.mjs` for one). Keep pure logic in `lib/` so it stays testable.
5. `superpowers:verification-before-completion`: run `npm run check` (typecheck, lint, tests, build) and quote the result before claiming done. In PowerShell use `npm.cmd` and `npx.cmd` if script launchers are blocked.
6. Add a dated `docs/PROGRESS.md` entry of at most 5 lines: what changed, why, how it was verified. Do not rewrite past entries.
7. `superpowers:finishing-a-development-branch`: always choose push and open a PR to `main`; never merge locally. CI runs the same checks and Vercel builds a preview. The owner approves every merge. Never deploy production independently. Handle PR feedback with `superpowers:receiving-code-review`.
8. Reply in under 10 lines: what changed, check results, how to try it. Then stop.

Specs go in `docs/superpowers/specs/` and plans in `docs/superpowers/plans/`, committed on the feature branch. Copy the Privacy and Translation licensing rules below into each plan's Global Constraints. Use `superpowers:dispatching-parallel-agents` for independent investigations.

## Impeccable (UI work)
- Once per session run `~/.claude/skills/impeccable/scripts/impeccable.cmd context` (PowerShell) or the `impeccable` script (bash). It resolves `docs/DESIGN.md`; keep it there. `PRODUCT.md` at the root holds product truth once created with `/impeccable init`.
- Modes: app screens (Home, Results, Compare, My Verses, Journal) are Operate; About and Licenses are Read. Refine the incumbent design; never redesign or replace the visual world unless the owner asks.
- New screen or flow: `shape` after brainstorming settles scope. Fixes and refinements: `layout`, `typeset`, `clarify` (copy), `adapt` (360 to 1920px), `harden` (loading, empty, error, edge cases), `animate` (DESIGN.md motion tokens, reduced motion), `onboard` (empty states), `optimize` (Lighthouse 90+).
- Review: `critique` for UX, `audit` for accessibility, performance and responsiveness. Run `polish` as the last pass before any UI PR, and verify with `impeccable shot <page>` in both themes.
- `bolder`, `overdrive`, `colorize`, `delight`, `generate` and `live` only when the owner asks; the brand is calm and restrained. `document` and `extract` only when asked, and they merge into `docs/DESIGN.md` instead of overwriting it.
- Commit `PRODUCT.md`, `.impeccable/config.json`, `.impeccable/surfaces/`, `.impeccable/design.json` and `.impeccable/critique/ignore.md`. Impeccable follows every rule in this file: no new fonts or dependencies without a reason, exact Scripture, no em dashes.

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
