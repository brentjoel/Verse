# 0005 On-device AI only

Status: accepted (2026-11), built in Phase E as an on-device word scorer

## Decision
AI in Verselight is a feeling finder that runs on the device. It may suggest feelings and point to curated verses. It never writes or paraphrases Scripture, and nothing a person types is sent to a server, logged or stored.

The first version is a lexical scorer (`lib/feeling-words.ts`), not a neural model: a hand-written lexicon of plain phrases built from the feeling names, their descriptions and everyday words, with light stemming, negation ("not hopeful") and intensifiers. It lives on `/not-sure`, loads only when the visitor focuses or uses the text box (a few kB), and suggests one to three feelings with their closest specific. If the code cannot load, the three-question path on the same page still works.

## Why
- Typed feelings are private; sending them to a model API would break [0001](0001-guest-only.md) and [0003](0003-local-first-storage.md).
- Generated Scripture would be invented text. Every verse shown must come from a real translation.
- NLT text is never used for training, and NIV's license rules out AI use, so the curated references drive suggestions, not licensed text. The lexicon contains no Bible text at all.
- A small embedding model (around 20 to 30 MB plus a WebAssembly runtime) would add a large download and a dependency for eight feelings. The scorer is tiny, explainable, unit-tested for every feeling and specific, and needs no dependency.

## Consequences
- Suggestions are only as good as the lexicon. Unknown words find nothing, and the page then points to the questions or the wheel. New phrases go in `GROUPS` with a test.
- Any future neural model must stay self-hosted under `public/`, opt-in and lazy, keep this scorer as its fallback, and stay inside the Lighthouse gate.
- NIV stays out while any AI feature exists.
- The wheel already has a `uLean` uniform ready to lean toward suggested feelings.

## Revisit when
Visitors' words often find nothing, or a small on-device model becomes clearly better at the same size, and the owner approves the download cost.
