"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCompanion } from "@/lib/browser-storage";
import { toggleMark } from "@/lib/spoke";
import { useState } from "react";
import { StarBurst } from "@/components/star-burst";

export function useMarks() {
  const { ready, marks, set } = useCompanion();
  return { ready, marks: ready ? marks : [], set: (next: string[]) => void set({ marks: next }) };
}

/** "This spoke to me": a private mark that brings the verse back now and then. Only the reference is kept. */
export function SpokeButton({ reference }: { reference: string }) {
  const { ready, marks, set } = useMarks();
  const marked = marks.includes(reference);
  // Only marking plays the burst; unmarking stays quiet.
  const [burst, setBurst] = useState(0);
  return <button type="button" className="compare-link spoke-button" data-tooltip={marked ? "Marked. Tap to unmark" : "This spoke to me"} disabled={!ready} aria-pressed={marked} onClick={() => { if (!marked) setBurst(value => value + 1); set(toggleMark(marks, reference)); }}>
    {burst > 0 && marked && <StarBurst key={burst} />}<span key={`icon-${burst}`} className="burst-icon" data-pop={(burst > 0 && marked) || undefined}><Heart size={17} aria-hidden="true" fill={marked ? "currentColor" : "none"} /></span>{marked ? "It spoke to me" : "This spoke to me"}<span className="sr-only"> {reference}</span>
  </button>;
}

/** On Results: points to a marked verse that sits in the other four. */
export function MarkedNote({ others, moreHref }: { others: readonly string[]; moreHref: string }) {
  const { marks } = useMarks();
  const waiting = others.filter(reference => marks.includes(reference));
  if (waiting.length === 0) return null;
  return <p className="local-help marked-note">You marked {waiting.join(", ")} for this feeling. <Link className="quiet-link" href={moreHref} scroll={false}>Read it with the other four</Link></p>;
}
