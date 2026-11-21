# 0004 WebGL quality tiers

Status: accepted (2026-11)

## Decision
The feeling wheel is a single Three.js points mesh with a custom shader. A tier (high, medium, low) is chosen from device hints and reduced-motion, then a two-second fps probe steps it down. If it still struggles, or WebGL fails, the app falls back to the List view.

## Why
- One draw call keeps the wheel cheap, and particle count is the only real dial.
- Phones vary widely. Measuring beats guessing, and stepping down quietly protects a modest device.
- The List view is server-rendered, so it also serves no-JavaScript visitors and reduced-motion users, and it keeps Lighthouse honest.

## Consequences
- The probe runs on real frames, so the first moments can be slightly uneven; skipping the first ~500 ms is a planned improvement.
- Real-device fps on mid-range Android and iPhone is still unmeasured.
- Pure functions (`initialTier`, `nextTier`) are unit tested; the canvas exposes its tier for e2e.

## Revisit when
Real-device numbers say the thresholds are wrong.
