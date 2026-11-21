# 0005 On-device AI only

Status: accepted (2026-11), feature not yet built

## Decision
If AI is added, it is a feeling finder that runs on the device. It may suggest feelings and point to curated verses. It never writes Scripture, and nothing a person types is sent to a server.

## Why
- Typed feelings are private; sending them to a model API would break [0001](0001-guest-only.md) and [0003](0003-local-first-storage.md).
- Generated Scripture would be invented text. Every verse shown must come from a real translation.
- NLT text is never used for training, and NIV's license rules out AI use, so the curated references drive suggestions, not licensed text.

## Consequences
- A smaller on-device model means simpler suggestions and a download cost, so it must be optional and lazy loaded.
- The wheel already has a `uLean` uniform ready to lean toward suggested feelings.

## Revisit when
On-device models are small and good enough to be worth shipping, and the owner approves the download cost.
