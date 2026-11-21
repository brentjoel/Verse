"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import web from "@/data/verses/web.json";
import { getSpecificEmotionByIds } from "@/lib/emotions";

const subscribe = () => () => {};
const verses = web as Record<string, string | undefined>;

/** Shown when a Results page cannot load. Reads only the public-domain WEB text bundled with the app. */
export function OfflineReader() {
  const target = useSyncExternalStore(subscribe, () => new URLSearchParams(location.search).get("to") ?? "", () => "");
  const [, , emotionId = "", subId = ""] = target.split("/");
  const feeling = getSpecificEmotionByIds(emotionId, subId);
  return <>
    <div className="results-heading">
      <h1>{feeling ? `${feeling.name}, offline` : "You are offline"}</h1>
      <p>{feeling ? "Your usual translation needs a connection, so here is the World English Bible, public domain, saved in this app." : "Pages you have visited and the seven-day paths still open. Other translations need a connection."}</p>
    </div>
    {feeling && <ul className="path-days" aria-label="Verses">{feeling.references.map(reference => verses[reference] && <li key={reference} className="path-day">
      <div className="verse-heading-row"><h2 className="verse-reference">{reference}</h2><span className="translation-tag">WEB</span></div>
      <p className="verse-text">{verses[reference]}</p>
    </li>)}</ul>}
    <p className="check-in-links"><Link className="pill" href="/">Home</Link><Link className="compare-link" href="/journal">Journal</Link><Link className="compare-link" href="/breathe">Breathe</Link>{feeling && <Link className="compare-link" href={`/path/${emotionId}/${subId}`}>Seven-day path</Link>}</p>
    <p className="local-help">Your journal and saved verses stay on this device and work offline too.</p>
  </>;
}
