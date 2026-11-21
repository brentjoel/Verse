// Cards deliberately support WEB only. Never accept arbitrary text or personal fields.
export function parseShareReference(query: URLSearchParams, references: readonly string[]): string | undefined {
  if ([...query.keys()].some(key => key !== "ref" && key !== "translation")) return;
  if (query.getAll("ref").length !== 1 || query.getAll("translation").length !== 1) return;
  if (query.get("translation") !== "web") return;
  const reference = query.get("ref");
  return reference && references.includes(reference) ? reference : undefined;
}

export function shareCardHeight(text: string): number {
  // 40px Lora at 1.45 line height: one 60px line per 45 characters (source breaks included), plus header, reference and attribution.
  const lines = text.split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(line.length / 45)), 0);
  return Math.max(630, 420 + lines * 60);
}
