"use client";

import Link from "next/link";
import { Anchor } from "lucide-react";
import { useCompanion } from "@/lib/browser-storage";

/** Pin or unpin a verse as the anchor shown on Home. Only the reference is stored. */
export function AnchorButton({ reference }: { reference: string }) {
  const { ready, anchor, set } = useCompanion();
  const pinned = ready && anchor === reference;
  return <button type="button" className="compare-link" data-tooltip={pinned ? "Unpin from Home" : "Pin to Home"} disabled={!ready} aria-pressed={pinned} onClick={() => void set({ anchor: pinned ? undefined : reference })}>
    <Anchor size={17} aria-hidden="true" />{pinned ? "Pinned" : "Pin"}<span className="sr-only"> {reference} to Home as my anchor verse</span>
  </button>;
}

/** The anchor on Home, in the public-domain WEB text. Hidden until one is pinned. */
export function AnchorVerse({ verses }: { verses: Readonly<Record<string, string>> }) {
  const { ready, anchor, set } = useCompanion();
  const reference = ready ? anchor : undefined;
  if (!reference || !verses[reference]?.trim()) return null;
  return <section className="anchor-verse" aria-labelledby="anchor-title">
    <h2 id="anchor-title" className="anchor-label"><Anchor size={16} aria-hidden="true" />Your anchor</h2>
    <p className="verse-text">{verses[reference]}</p>
    <p className="local-help">{reference}, WEB, public domain.</p>
    <div className="check-in-links">
      <Link className="compare-link" href={`/compare?${new URLSearchParams({ ref: reference })}`} prefetch={false}>Read in other translations</Link>
      <button type="button" className="quiet-link" onClick={() => void set({ anchor: undefined })}>Unpin</button>
    </div>
  </section>;
}
