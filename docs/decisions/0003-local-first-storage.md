# 0003 Local-first storage

Status: accepted (2026-11)

## Decision
Saved verses, collections, journal notes, streaks and badges live in the browser's `localStorage` under one validated, versioned key. Backups are a JSON file the person exports and imports.

## Why
- It follows from [0001](0001-guest-only.md): no accounts means no place for a server database.
- One key with a schema version and migrations lets the format grow safely. Everything read from storage is validated, since users and extensions can edit it.
- The app works offline for personal data and never sends it anywhere.

## Consequences
- Storage can be evicted or blocked (private mode); the app falls back to the current tab and says so.
- Records are not encrypted. An optional passcode is a later roadmap item.
- Each deployment origin has its own storage.

## Revisit when
Data outgrows `localStorage`, at which point IndexedDB behind the same module is the next step.
