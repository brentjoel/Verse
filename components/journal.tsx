"use client";

import Link from "next/link";
import { RemovalButton } from "@/components/removal-button";
import { Constellation } from "@/components/constellation";
import { NightSky, type GraceVerse } from "@/components/night-sky";
import { PrintButton, PrintJournal } from "@/components/print-journal";
import { FutureLetters } from "@/components/future-letters";
import { PrayerList } from "@/components/prayer-list";
import { SkyCardButton } from "@/components/sky-card-button";
import { buildNightSky } from "@/lib/night-sky";
import { useState } from "react";
import emotions from "@/data/emotions.json";
import { BADGES } from "@/lib/badges";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { localClock, shiftDate } from "@/lib/streaks";
import { formatDay, formatMonth } from "@/lib/dates";
import { MAX_NOTE_LENGTH, type MoodEntry } from "@/lib/storage-schema";
import type { StorageResult } from "@/lib/storage";

const INTENSITY_LABEL = { low: "gently", medium: "moderately", high: "strongly" } as const;
const ANSWER_LABEL = { lighter: "lighter", same: "about the same", heavier: "heavier" } as const;

function Reflection({ mood, disabled, run }: { mood: MoodEntry; disabled: boolean; run: (work: () => Promise<StorageResult>) => Promise<void> }) {
  const [note, setNote] = useState(mood.note ?? "");
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const emotion = emotions.find(emotion => emotion.id === mood.emotionId)!;
  return <li className="reflection-item" data-emotion={emotion.id}>
    <p className="reflection-date"><time dateTime={mood.localDate}>{formatDay(mood.localDate)}</time></p>
    <h3><span className="emotion-dot" aria-hidden="true" />{emotion.specifics.find(s => s.id === mood.specificEmotionId)?.name} <span className="reflection-parent">{emotion.name}</span></h3>
    {(mood.intensity || mood.checkIn) && <p className="local-help reflection-meta">{[mood.intensity && `Felt ${INTENSITY_LABEL[mood.intensity]}.`, mood.checkIn && `Later: ${ANSWER_LABEL[mood.checkIn.answer]}.`].filter(Boolean).join(" ")}</p>}
    {mood.note && !editing && <p className="reflection-note">{mood.note}</p>}
    {!editing && !confirm && <div className="reflection-actions"><Link href={`/emotions/${mood.emotionId}/${mood.specificEmotionId}`} prefetch={false} className="quiet-link">Read the verses</Link><button className="quiet-link" disabled={disabled} onClick={() => setEditing(true)}>{mood.note ? "Edit note" : "Add a note"}</button><button className="remove-link" disabled={disabled} onClick={() => setConfirm(true)}>Remove</button></div>}
    {editing && <form className="local-form" onSubmit={event => { event.preventDefault(); void run(() => getPersonalStore().editMood(mood.id, note)).then(() => setEditing(false)); }}>
      <label htmlFor={`note-${mood.id}`}>A note for yourself (optional)</label>
      <textarea id={`note-${mood.id}`} rows={3} autoFocus maxLength={MAX_NOTE_LENGTH} value={note} onChange={event => setNote(event.target.value)} disabled={disabled} aria-describedby={`limit-${mood.id}`} />
      <p id={`limit-${mood.id}`} className="local-help">{note.length} of {MAX_NOTE_LENGTH} characters.</p>
      <div className="local-actions"><button className="compare-link" disabled={disabled || note === (mood.note ?? "")}>Save note</button><button type="button" className="quiet-link" onClick={() => { setNote(mood.note ?? ""); setEditing(false); }}>Cancel</button></div>
    </form>}
    {confirm && <div className="inline-confirm"><p>Remove this reflection and its note? The day stays in your calendar and your milestones stay too.</p><RemovalButton className="compare-link" disabled={disabled} onRemove={() => void run(() => getPersonalStore().removeMood(mood.id))}>Remove reflection</RemovalButton><button className="compare-link" onClick={() => setConfirm(false)}>Keep reflection</button></div>}
  </li>;
}

export function Journal({ graceVerse }: { graceVerse: GraceVerse }) {
  const snapshot = usePersonalStorage();
  const [month, setMonth] = useState("");
  const [selected, setSelected] = useState("");
  const [view, setView] = useState<"sky" | "calendar">("sky");
  const [limit, setLimit] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  async function run(work: () => Promise<StorageResult>) {
    setBusy(true); setError(""); setStatus("");
    try { const result = await work(); if (result.ok) setStatus("Your journal is saved."); else setError(result.error); }
    catch { setError("We could not save that change. Please try again."); }
    finally { setBusy(false); }
  }
  if (!snapshot.ready) return <p className="content-notice skeleton" role="status">Opening your journal...</p>;
  if (snapshot.mode === "blocked") return <p className="content-notice">Your saved data needs care. <Link href="/my-verses#backups">Open backup and recovery</Link> to keep a copy and choose your next step.</p>;
  const { moodEntries, activityDays, streakState, badges } = snapshot.envelope.data;
  const disabled = busy || snapshot.mode === "conflict";
  const first = `${month || (streakState.maxObservedLocalDate ?? localClock().localDate).slice(0, 7)}-01`;
  const next = shiftDate(first, 32).slice(0, 7) + "-01";
  const last = shiftDate(next, -1);
  const start = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(start).fill(null)];
  for (let date = first; date <= last; date = shiftDate(date, 1)) cells.push(date);
  while (cells.length % 7) cells.push(null);
  const entries = [...moodEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter(mood => !selected || mood.localDate === selected);
  const label = (date: string) => {
    const count = moodEntries.filter(mood => mood.localDate === date).length;
    const state = activityDays.some(day => day.localDate === date) ? "you visited" : streakState.graceDates.includes(date) ? "a grace day kept your streak" : "no visit";
    return `${formatDay(date, undefined, true)}: ${count === 0 ? "no reflections" : count === 1 ? "1 reflection" : `${count} reflections`}, ${state}`;
  };
  return <>
    <p role="status" aria-live="polite" className="sr-only">{busy ? "Saving..." : status}</p>
    {error && <p className="content-notice" role="alert">{error}</p>}
    <section className="library-section" aria-labelledby="calendar-heading">
      <div className="section-heading calendar-heading"><h2 id="calendar-heading">{formatMonth(first)}</h2><div className="local-actions"><div className="segmented" role="group" aria-label="Show this month as"><button type="button" className="chip" aria-pressed={view === "sky"} onClick={() => setView("sky")}>Sky</button><button type="button" className="chip" aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>Calendar</button></div><button className="icon-button" aria-label="Previous month" data-tooltip="Previous month" onClick={() => setMonth(shiftDate(first, -1).slice(0, 7))} disabled={first <= "0001-02-01"}><span aria-hidden="true">&#8592;</span></button><button className="icon-button" aria-label="Next month" data-tooltip="Next month" onClick={() => setMonth(next.slice(0, 7))} disabled={first >= "9999-11-01"}><span aria-hidden="true">&#8594;</span></button></div></div>
      {view === "sky" ? (() => { const sky = buildNightSky(first, last, activityDays, moodEntries, streakState.graceDates); return <><NightSky sky={sky} selected={selected} onSelect={date => { setSelected(date); setLimit(20); }} label={label} graceVerse={graceVerse} />{sky.stars.length > 0 && <SkyCardButton sky={sky} month={formatMonth(first)} verse={graceVerse} />}</>; })() : <>
      <div className="calendar-scroll"><table className="journal-calendar" aria-describedby="calendar-key"><caption className="sr-only">{formatMonth(first)}</caption><thead><tr>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <th scope="col" key={day}>{day}</th>)}</tr></thead><tbody>{Array.from({ length: cells.length / 7 }, (_, week) => <tr key={week}>{cells.slice(week * 7, week * 7 + 7).map((date, index) => {
        if (!date) return <td key={`blank-${index}`} />;
        const count = moodEntries.filter(mood => mood.localDate === date).length;
        const active = activityDays.some(day => day.localDate === date);
        const grace = streakState.graceDates.includes(date);
        const description = label(date);
        const latest = moodEntries.filter(mood => mood.localDate === date).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        return <td key={date}><button className="calendar-day" data-emotion={latest?.emotionId} data-tooltip={description} data-level={count > 1 ? 3 : count ? 2 : active ? 1 : 0} data-grace={grace || undefined} aria-pressed={selected === date} aria-label={description} onClick={() => { setSelected(date); setLimit(20); }}>{Number(date.slice(8))}<span className="calendar-mark" aria-hidden="true">{count > 1 ? count : " "}</span></button></td>;
      })}</tr>)}</tbody></table></div>
      <p id="calendar-key" className="local-help">Warmer days hold more reflections. A ring marks a grace day. Choose a date to read its reflections.</p>
      </>}
      {view === "sky" && <p className="local-help">Each star is a day you visited, colored by your latest feeling. Days in a row join into constellations. Choose a star to read that day.</p>}
      {selected && <p className="sr-only" role="status">{label(selected)}.</p>}
    </section>
    <section className="library-section" aria-labelledby="reflections-heading"><div className="section-heading"><h2 id="reflections-heading">{selected ? `Reflections on ${formatDay(selected)}` : "Your reflections"}</h2></div>
      {selected && <button className="compare-link" onClick={() => setSelected("")}>Show all reflections</button>}
      {entries.length ? <ul className="reflection-list">{entries.slice(0, limit).map(mood => <Reflection key={`${mood.id}:${mood.note ?? ""}`} mood={mood} disabled={disabled} run={run} />)}</ul> : <div className="empty-state"><Constellation /><p>No reflections here yet. Each feeling you choose will be noted here.</p><Link href="/" className="pill">Choose a feeling</Link></div>}
      {entries.length > limit && <button className="compare-link" onClick={() => setLimit(limit + 20)}>Show more reflections</button>}
      {entries.length > 0 && <p className="local-help">Each feeling you choose is noted here. Add a note if you like; removing one keeps that day in your calendar.</p>}
    </section>
    <PrayerList />
    <FutureLetters />
    <section className="library-section" aria-labelledby="print-heading"><div className="section-heading"><h2 id="print-heading">A copy to keep</h2></div><PrintButton disabled={moodEntries.length === 0} /></section>
    <PrintJournal moods={moodEntries} />
    <section className="library-section rhythm" aria-labelledby="progress-heading">
      <div className="section-heading"><h2 id="progress-heading">Your rhythm</h2></div>
      <p>{streakState.currentStreak === 0 ? "Whenever you are ready, a new rhythm can begin." : `${streakState.currentStreak} ${streakState.currentStreak === 1 ? "day" : "days"} in a row`}{streakState.longestStreak > 1 && <span className="local-help"> · Longest {streakState.longestStreak} days</span>}</p>
      {badges.length > 0 && <ul className="badge-list" aria-label="Your milestones">{badges.map(badge => <li key={badge.key}>{BADGES[badge.key]} <span className="local-help"><time dateTime={badge.earnedAt}>{formatDay(badge.earnedAt)}</time></span></li>)}</ul>}
      <details className="quiet-details"><summary>How your rhythm works</summary>
        <p className="local-help">A day counts when you choose a feeling or save a verse. If you miss one day in a week, your rhythm waits for you. Changing your device clock or time zone can pause counting until your date catches up. There is no pressure here; come back whenever you like.</p>
      </details>
      <p className="local-help"><Link href="/my-verses#backups">Keep a backup of your journal</Link>. Backups include your notes and are not encrypted.</p>
    </section>
  </>;
}
