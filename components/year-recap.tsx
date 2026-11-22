"use client";

import Link from "next/link";
import { useState } from "react";
import { Constellation, QuietLoading } from "@/components/constellation";
import { getEmotionById, getSpecificEmotionByIds } from "@/lib/emotions";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { localClock } from "@/lib/streaks";
import { buildYearRecap, recapYears } from "@/lib/year-recap";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** A look back over a year, read from this device only. Nothing is sent or stored. */
export function YearRecap() {
  const snapshot = usePersonalStorage();
  const [chosen, setChosen] = useState("");
  if (!snapshot.ready) return <QuietLoading>Gathering your year in light.</QuietLoading>;
  if (snapshot.mode === "blocked") return <p className="content-notice">Your saved data needs care. <Link href="/my-verses#backups">Open backup and recovery</Link> first.</p>;
  const data = snapshot.envelope.data;
  const years = recapYears(data);
  const current = localClock().localDate.slice(0, 4);
  const year = chosen || years[0] || current;
  const recap = buildYearRecap(data, year);
  const locked = getPersonalStore().isLocked();
  const busiest = Math.max(1, ...recap.months);
  if (recap.daysVisited === 0) return <div className="empty-state"><Constellation /><p>Your year in light is just beginning. Each day you choose a feeling or save a verse becomes part of it.</p><Link href="/" className="pill">Choose a feeling</Link></div>;
  return <>
    {years.length > 1 && <div className="segmented year-picker" role="group" aria-label="Choose a year">{years.map(item => <button key={item} type="button" className="chip" aria-pressed={item === year} onClick={() => setChosen(item)}>{item}</button>)}</div>}
    <section className="library-section" aria-labelledby="year-heading">
      <div className="section-heading"><h2 id="year-heading">{year} in light</h2></div>
      <ul className="year-numbers">
        <li><strong>{recap.daysVisited}</strong> {recap.daysVisited === 1 ? "day you came" : "days you came"}</li>
        <li><strong>{recap.reflections}</strong> {recap.reflections === 1 ? "feeling named" : "feelings named"}</li>
        <li><strong>{recap.longestRun}</strong> {recap.longestRun === 1 ? "day in a row, at most" : "days in a row, at most"}</li>
        <li><strong>{recap.saved}</strong> {recap.saved === 1 ? "verse saved" : "verses saved"}</li>
      </ul>
      <ol className="year-months" aria-label="Days you came, by month">{recap.months.map((count, index) => <li key={MONTHS[index]} style={{ "--glow": (count / busiest).toFixed(2) } as React.CSSProperties} data-empty={count === 0 || undefined}>
        <span className="year-star" aria-hidden="true" /><span className="year-month">{MONTHS[index]}</span><span className="sr-only">: {plural(count, "day", "days")}</span>
      </li>)}</ol>
    </section>
    {recap.feelings.length > 0 && <section className="library-section" aria-labelledby="year-feelings">
      <div className="section-heading"><h2 id="year-feelings">What you carried most</h2></div>
      <ul className="reflection-list">{recap.feelings.map(item => {
        const parent = getEmotionById(item.emotionId);
        const feeling = getSpecificEmotionByIds(item.emotionId, item.specificId);
        if (!parent || !feeling) return null;
        return <li key={`${item.emotionId}/${item.specificId}`} className="reflection-item" data-emotion={item.emotionId}>
          <h3><span className="emotion-dot" aria-hidden="true" />{feeling.name} <span className="reflection-parent">{parent.name}</span></h3>
          <p className="local-help">{plural(item.count, "time", "times")} this year. <Link className="quiet-link" href={`/emotions/${item.emotionId}/${item.specificId}`} prefetch={false}>Read its verses again</Link></p>
        </li>;
      })}</ul>
      <p className="local-help">Every feeling you named was welcome. None of them was too much.</p>
    </section>}
    <section className="library-section" aria-labelledby="year-kept">
      <div className="section-heading"><h2 id="year-kept">What you kept</h2></div>
      {locked ? <p className="local-help">Your journal is locked, so prayers and letters are not counted here. <Link className="quiet-link" href="/journal">Open your journal</Link> to include them.</p>
        : <p>{plural(recap.prayersAnswered, "prayer", "prayers")} marked answered and {plural(recap.lettersWritten, "letter", "letters")} written to your future self.</p>}
      <p className="local-help">This look back is made on your device from your own journal. Nothing is sent or saved.</p>
    </section>
  </>;
}
