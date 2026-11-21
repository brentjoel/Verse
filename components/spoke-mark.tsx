"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import web from "@/data/verses/web.json";
import { useLocalKey } from "@/lib/local-key";
import { SPOKE_KEY, parseMarks, toggleMark } from "@/lib/spoke";

const known = new Set(Object.keys(web));

export function useMarks() {
  const { ready, raw, set } = useLocalKey(SPOKE_KEY);
  return { ready, marks: ready ? parseMarks(raw, known) : [], set };
}

/** "This spoke to me": a private mark that brings the verse back now and then. Only the reference is kept. */
export function SpokeButton({ reference }: { reference: string }) {
  const { ready, marks, set } = useMarks();
  const marked = marks.includes(reference);
  return <button type="button" className="compare-link" data-tooltip={marked ? "Marked. Tap to unmark" : "This spoke to me"} disabled={!ready} aria-pressed={marked} onClick={() => set(toggleMark(marks, reference))}>
    <Heart size={17} aria-hidden="true" fill={marked ? "currentColor" : "none"} />{marked ? "It spoke to me" : "This spoke to me"}<span className="sr-only"> {reference}</span>
  </button>;
}

/** On Results: points to a marked verse that sits in the other four. */
export function MarkedNote({ others, moreHref }: { others: readonly string[]; moreHref: string }) {
  const { marks } = useMarks();
  const waiting = others.filter(reference => marks.includes(reference));
  if (waiting.length === 0) return null;
  return <p className="local-help marked-note">You marked {waiting.join(", ")} for this feeling. <Link className="quiet-link" href={moreHref} scroll={false}>Read it with the other four</Link></p>;
}
