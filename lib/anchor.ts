export const ANCHOR_KEY = "verselight-anchor";

/** A pinned verse is only a reference; text is looked up from public-domain data when shown. */
export function parseAnchor(raw: unknown, known: ReadonlySet<string>): string | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const keys = Object.keys(raw);
  if (keys.length !== 1 || keys[0] !== "reference") return undefined;
  const reference = (raw as { reference: unknown }).reference;
  return typeof reference === "string" && known.has(reference) ? reference : undefined;
}

export const anchorValue = (reference: string) => ({ reference });
