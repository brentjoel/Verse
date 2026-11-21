"use client";

import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { formatDay, formatMonth } from "@/lib/dates";
import { getSpecificEmotionByIds, getEmotionById } from "@/lib/emotions";
import { printMonths, printableLetters } from "@/lib/journal-export";
import { useCompanion } from "@/lib/browser-storage";
import { localClock } from "@/lib/streaks";
import type { MoodEntry } from "@/lib/storage-schema";

function describe(emotionId: string, specificId: string) {
  const parent = getEmotionById(emotionId);
  const feeling = getSpecificEmotionByIds(emotionId, specificId);
  return parent && feeling ? { feeling: feeling.name, parent: parent.name } : undefined;
}

export function PrintButton({ disabled }: { disabled: boolean }) {
  return <div className="print-control">
    <button type="button" className="compare-link" disabled={disabled} onClick={() => window.print()}><Printer size={17} aria-hidden="true" />Print or save as PDF</button>
    <p className="local-help">Opens your browser&apos;s print dialog. Choose Save as PDF there to keep a copy. Reflections, notes and opened letters are included; verses are not.</p>
  </div>;
}

/** Rendered only while printing; the only thing printed. Plain black on white, no verse text. */
export function PrintJournal({ moods }: { moods: readonly MoodEntry[] }) {
  const { letters: stored } = useCompanion();
  // Only mounted while the browser is printing (button or Ctrl+P), so it never duplicates text on screen.
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => { window.removeEventListener("beforeprint", before); window.removeEventListener("afterprint", after); };
  }, []);
  if (!printing) return null;
  const today = localClock().localDate;
  const months = printMonths(moods, describe);
  const letters = printableLetters(stored, today);
  return <article className="print-journal" aria-hidden="true">
    <h1>My Verselight journal</h1>
    <p>Printed {formatDay(today, undefined, true)}. Kept on my own device.</p>
    {months.map(group => <section key={group.month}>
      <h2>{formatMonth(group.month)}</h2>
      <ul>{group.entries.map(entry => <li key={entry.id}><strong>{formatDay(entry.date)}</strong>: {entry.feeling} ({entry.parent}){entry.note && <p>{entry.note}</p>}</li>)}</ul>
    </section>)}
    {letters.length > 0 && <section><h2>Letters to myself</h2>{letters.map(letter => <div key={letter.id}><p><strong>Written {formatDay(letter.writtenOn, undefined, true)}, opened {formatDay(letter.openOn, undefined, true)}</strong></p><p className="letter-text">{letter.text}</p></div>)}</section>}
  </article>;
}
