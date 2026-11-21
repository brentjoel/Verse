"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FeelingMatch } from "@/lib/feeling-words";

interface Feeling { id: string; name: string; description: string; specifics: readonly { id: string; name: string }[] }
type Finder = typeof import("@/lib/feeling-words");
type State = { kind: "idle" } | { kind: "busy" } | { kind: "found"; matches: FeelingMatch[] } | { kind: "failed" };

const MAX_LENGTH = 500;
let finder: Promise<Finder> | null = null;
/** Loads the scorer only when asked. A failed load is forgotten so the next try can retry. */
function loadFinder(): Promise<Finder> {
  finder ??= import("@/lib/feeling-words").catch(error => { finder = null; throw error; });
  return finder;
}

/** Words typed here stay in this component's memory: no request, no storage, no logging. */
export function FeelingWords({ emotions }: { emotions: readonly Feeling[] }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state.kind === "found") heading.current?.focus(); }, [state]);

  async function find() {
    if (!text.trim()) return;
    setState({ kind: "busy" });
    try {
      const { findFeelings } = await loadFinder();
      setState({ kind: "found", matches: findFeelings(text) });
    } catch {
      setState({ kind: "failed" });
    }
  }

  const found = state.kind === "found" ? state.matches.flatMap(match => {
    const feeling = emotions.find(emotion => emotion.id === match.feeling);
    if (!feeling) return [];
    const specific = feeling.specifics.find(item => item.id === match.specific);
    return [{ feeling, specific }];
  }) : [];

  return <section className="finder" aria-labelledby="words-heading">
    <h2 id="words-heading">In your own words</h2>
    <div className="local-form finder-words">
      <label htmlFor="feeling-words">A few words about how you feel</label>
      <textarea id="feeling-words" rows={3} maxLength={MAX_LENGTH} value={text} autoComplete="off" placeholder="For example, I cannot sleep and my mind keeps racing"
        onFocus={() => { void loadFinder().catch(() => undefined); }}
        onChange={event => setText(event.target.value)}
        onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void find(); } }}
        aria-describedby="feeling-words-help" />
      <p id="feeling-words-help" className="local-help">This runs on your device. Nothing you type is sent anywhere or saved.</p>
      <div className="local-actions"><button type="button" className="compare-link" disabled={!text.trim() || state.kind === "busy"} onClick={() => void find()}>Find a feeling</button></div>
    </div>
    <div aria-live="polite">
      {state.kind === "failed" && <p className="local-error" role="alert">The word finder could not load here. The three questions below work the same way.</p>}
      {state.kind === "found" && <div className="finder-words-result">
        <h3 ref={heading} tabIndex={-1}>{found.length ? `This sounds like ${found[0].feeling.name}` : "I could not find a feeling in those words"}</h3>
        {found.length > 0
          ? <p className="local-help">A gentle guess from your words, not a verdict. You can change your mind at any time.</p>
          : <p className="local-help">Try a few different words, answer the three questions below, or choose from the wheel.</p>}
        <div className="check-in-links">
          {found.map(({ feeling, specific }, index) => <Link key={feeling.id} className={index === 0 ? "pill" : "compare-link"}
            href={specific ? `/emotions/${feeling.id}/${specific.id}` : `/emotions/${feeling.id}`}>
            {index === 0 ? `Find verses for ${specific ? specific.name : feeling.name}` : `Or try ${specific ? `${feeling.name}: ${specific.name}` : feeling.name}`}
          </Link>)}
          {found.length === 0 && <Link className="pill" href="/#choose-a-feeling">Choose a feeling</Link>}
        </div>
      </div>}
    </div>
  </section>;
}
