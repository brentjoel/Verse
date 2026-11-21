"use client";

import { Sparkle } from "lucide-react";
import { QuietDialog } from "@/components/quiet-dialog";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { dailyReference, localDayOfYear } from "@/lib/daily-verse";
import { dailyWithMarks } from "@/lib/rotation";
import { SpokeButton, useMarks } from "@/components/spoke-mark";
import { ShareCardControls } from "@/components/share-card-controls";
import { SaveVerseButton } from "@/components/save-verse-button";
import { AnchorButton, AnchorVerse } from "@/components/anchor-verse";

function localDateSnapshot() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => { window.clearInterval(timer); window.removeEventListener("focus", onChange); document.removeEventListener("visibilitychange", onChange); };
}

export function DailyVerse({ verses }: { verses: Readonly<Record<string, string>> }) {
  const { marks } = useMarks();
  const date = useSyncExternalStore(subscribe, localDateSnapshot, () => "");
  if (!date) return <div><p role="status">Finding today&apos;s verse on your device...</p><noscript><p>Today&apos;s local verse needs JavaScript. <Link className="quiet-link" href="/emotions/hopeful" prefetch={false}>Find a hopeful passage</Link></p></noscript></div>;
  const [year, month, day] = date.split("-").map(Number);
  const today = new Date(year, month - 1, day);
  const reference = dailyWithMarks(localDayOfYear(today), dailyReference(today, Object.keys(verses).sort()), marks);
  if (!reference || !verses[reference]?.trim()) return <p>Today&apos;s verse is resting for a moment. <Link className="quiet-link" href="/emotions/hopeful">Find a hopeful passage</Link></p>;
  return <><AnchorVerse verses={verses} /><QuietDialog key={reference} label="Morning star" title="A little light for your day" className="morning-star" icon={<Sparkle size={20} strokeWidth={1.5} aria-hidden="true" />}><div className="daily-verse">
    <div className="verse-heading-row"><h3 className="verse-reference">{reference}</h3><span className="translation-tag">WEB</span></div>
    <p className="verse-text">{verses[reference]}</p>
    <p className="local-help">World English Bible, public domain. A new passage each local day. <Link href={`/compare?${new URLSearchParams({ ref: reference })}`} className="quiet-link" prefetch={false}>Read in other translations</Link></p>
    <div className="verse-actions"><SaveVerseButton reference={reference} translationId="web" /><SpokeButton reference={reference} /><AnchorButton reference={reference} /><ShareCardControls reference={reference} /></div>
  </div></QuietDialog></>;
}
