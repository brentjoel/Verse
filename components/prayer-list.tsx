"use client";

import { useState } from "react";
import { useCompanion } from "@/lib/browser-storage";
import { formatDay } from "@/lib/dates";
import { MAX_PRAYER_LENGTH, addPrayer, removePrayer, setAnswered, splitPrayers, type Prayer } from "@/lib/prayers";
import { localClock } from "@/lib/streaks";

/** A private prayer list on this device. Answered prayers keep the day they were marked. */
export function PrayerList() {
  const { ready, prayers, set } = useCompanion();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState("");
  if (!ready) return null;
  const today = localClock().localDate;
  const { open, answered } = splitPrayers(prayers);
  async function save(next: Prayer[], message: string) {
    const result = await set({ prayers: next });
    if (!result.ok) { setError(result.error); return false; }
    setError(""); setStatus(message); return true;
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addPrayer(prayers, text, today, crypto.randomUUID());
    if (!result.ok) { setError(result.error); return; }
    if (await save(result.prayers, "Added to your prayers.")) setText("");
  }
  const remove = (prayer: Prayer) => confirm === prayer.id
    ? <span className="inline-confirm"><span>Remove this prayer for good?</span><button type="button" className="compare-link" onClick={() => { void save(removePrayer(prayers, prayer.id), "Prayer removed."); setConfirm(""); }}>Yes, remove</button><button type="button" className="compare-link" onClick={() => setConfirm("")}>Keep it</button></span>
    : <button type="button" className="remove-link" onClick={() => setConfirm(prayer.id)}>Remove</button>;
  return <section className="library-section" aria-labelledby="prayers-heading">
    <div className="section-heading"><h2 id="prayers-heading">Your prayers</h2></div>
    {open.length === 0 && answered.length === 0 && <p className="local-help">Keep the things you are praying for here, and mark the day each one is answered.</p>}
    {open.length > 0 && <ul className="reflection-list" aria-label="Still praying">{open.map(prayer => <li key={prayer.id} className="reflection-item prayer-item">
      <p className="reflection-date">Praying since <time dateTime={prayer.addedOn}>{formatDay(prayer.addedOn, undefined, true)}</time></p>
      <p className="reflection-note">{prayer.text}</p>
      <div className="reflection-actions"><button type="button" className="quiet-link" onClick={() => void save(setAnswered(prayers, prayer.id, true, today), "Marked as answered today.")}>Mark answered</button>{remove(prayer)}</div>
    </li>)}</ul>}
    {answered.length > 0 && <>
      <h3 className="prompt-label">Answered</h3>
      <ul className="reflection-list" aria-label="Answered prayers">{answered.map(prayer => <li key={prayer.id} className="reflection-item prayer-item" data-answered>
        <p className="reflection-date">Answered <time dateTime={prayer.answeredOn}>{formatDay(prayer.answeredOn!, undefined, true)}</time>, prayed since <time dateTime={prayer.addedOn}>{formatDay(prayer.addedOn, undefined, true)}</time></p>
        <p className="reflection-note">{prayer.text}</p>
        <div className="reflection-actions"><button type="button" className="quiet-link" onClick={() => void save(setAnswered(prayers, prayer.id, false, today), "Moved back to still praying.")}>Not yet answered</button>{remove(prayer)}</div>
      </li>)}</ul>
    </>}
    <form className="local-form" onSubmit={submit}>
      <label htmlFor="prayer-text">Something to bring to God</label>
      <textarea id="prayer-text" rows={2} maxLength={MAX_PRAYER_LENGTH} value={text} onChange={event => setText(event.target.value)} aria-describedby="prayer-help" />
      <p id="prayer-help" className="local-help">{text.length} of {MAX_PRAYER_LENGTH} characters. It stays on this device and in your backup file.</p>
      <div className="local-actions"><button className="compare-link" disabled={!text.trim()}>Add to my prayers</button></div>
      {error && <p className="local-error" role="alert">{error}</p>}
      <p role="status" className="local-help">{status}</p>
    </form>
  </section>;
}
