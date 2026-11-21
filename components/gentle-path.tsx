"use client";

import Link from "next/link";
import { formatDay } from "@/lib/dates";
import { useCompanion } from "@/lib/browser-storage";
import { dateOfDay, dayOfPath, pathComplete } from "@/lib/gentle-path";
import { localClock } from "@/lib/streaks";

interface Day { reference: string; text: string; reflect?: string; prayer?: string }

export function GentlePath({ emotionId, specificId, name, days }: { emotionId: string; specificId: string; name: string; days: Day[] }) {
  const { ready, path, set } = useCompanion();
  const active = ready ? path : undefined;
  const here = active?.emotionId === emotionId && active.specificId === specificId ? active : undefined;
  if (!ready) return <noscript><DayList days={days} open={days.length} /></noscript>;
  const today = localClock().localDate;
  const start = () => void set({ path: { emotionId, specificId, startedOn: today } });
  if (!here) return <>
    <div className="path-intro">
      {active && <p className="local-help">You are already on another path. Starting this one replaces it.</p>}
      <button type="button" className="pill" onClick={start}>Begin this path today</button>
    </div>
    <ol className="path-days" aria-label="The seven days">{days.map((day, index) => <li key={day.reference} className="path-day"><h2>Day {index + 1}</h2><p className="local-help">{day.reference}</p></li>)}</ol>
  </>;
  const day = dayOfPath(here.startedOn, today);
  return <>
    <p role="status" className="path-status">{pathComplete(here.startedOn, today) ? "You have walked all seven days. Stay with any day as long as you like." : `Day ${day} of ${days.length}. Tomorrow a new verse opens.`}</p>
    <DayList days={days} open={Math.min(day, days.length)} startedOn={here.startedOn} current={day} />
    <div className="local-actions"><button type="button" className="quiet-link" onClick={() => void set({ path: undefined })}>Leave this path</button>{pathComplete(here.startedOn, today) && <Link className="compare-link" href={`/emotions/${emotionId}/${specificId}`}>Return to {name}</Link>}</div>
  </>;
}

function DayList({ days, open, startedOn, current }: { days: Day[]; open: number; startedOn?: string; current?: number }) {
  return <ol className="path-days" aria-label="The seven days">{days.map((day, index) => {
    const number = index + 1;
    if (number > open) return <li key={day.reference} className="path-day" data-locked><h2>Day {number}</h2><p className="local-help">Opens {startedOn ? formatDay(dateOfDay(startedOn, number)) : "later"}.</p></li>;
    return <li key={day.reference} className="path-day" data-today={number === current || undefined}>
      <h2>Day {number}{number === current && <span className="local-help"> · today</span>}</h2>
      <div className="verse-heading-row"><h3 className="verse-reference">{day.reference}</h3><span className="translation-tag">WEB</span></div>
      <p className="verse-text">{day.text}</p>
      {day.reflect && <div><h3 className="prompt-label">A question to sit with</h3><p className="reflect-copy">{day.reflect}</p></div>}
      {day.prayer && <div className="prayer-block"><h3 className="prompt-label">A prayer to begin</h3><p className="prayer-copy">{day.prayer}</p></div>}
      <p className="local-help">World English Bible, public domain. <Link href={`/compare?${new URLSearchParams({ ref: day.reference })}`} className="quiet-link" prefetch={false}>Read in other translations</Link></p>
    </li>;
  })}</ol>;
}
