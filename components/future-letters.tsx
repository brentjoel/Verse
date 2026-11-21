"use client";

import { useState } from "react";
import { formatDay } from "@/lib/dates";
import { useCompanion } from "@/lib/browser-storage";
import { MAX_LETTER_LENGTH, addLetter, removeLetter, splitLetters } from "@/lib/letters";
import { localClock, shiftDate } from "@/lib/streaks";

/** Letters to your future self. They live only in this browser, in the backup, and open on the chosen day. */
export function FutureLetters() {
  const { ready, letters, set } = useCompanion();
  const today = localClock().localDate;
  const [text, setText] = useState("");
  const [openOn, setOpenOn] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState("");
  if (!ready) return null;
  const { opened, sealed } = splitLetters(letters, today);
  const tomorrow = shiftDate(today, 1);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addLetter(letters, text, openOn || shiftDate(today, 30), today, crypto.randomUUID());
    if (!result.ok) { setError(result.error); return; }
    const saved = await set({ letters: result.letters });
    if (!saved.ok) { setError(saved.error); return; }
    setText(""); setOpenOn(""); setError("");
    setStatus("Your letter is sealed until it is time.");
  }
  const discard = (id: string, label: string) => confirm === id
    ? <span className="inline-confirm"><span>Remove this letter for good?</span><button type="button" className="compare-link" onClick={() => { void set({ letters: removeLetter(letters, id) }); setConfirm(""); }}>Yes, remove</button><button type="button" className="compare-link" onClick={() => setConfirm("")}>Keep it</button></span>
    : <button type="button" className="remove-link" onClick={() => setConfirm(id)}>{label}</button>;
  return <section className="library-section" aria-labelledby="letters-heading">
    <div className="section-heading"><h2 id="letters-heading">Letters to your future self</h2></div>
    {opened.length > 0 && <ul className="reflection-list">{opened.map(letter => <li key={letter.id} className="reflection-item">
      <p className="reflection-date">Written <time dateTime={letter.writtenOn}>{formatDay(letter.writtenOn, undefined, true)}</time>, opened <time dateTime={letter.openOn}>{formatDay(letter.openOn, undefined, true)}</time></p>
      <p className="reflection-note letter-text">{letter.text}</p>
      <div className="reflection-actions">{discard(letter.id, "Remove letter")}</div>
    </li>)}</ul>}
    {sealed.length > 0 && <ul className="letter-sealed" aria-label="Sealed letters">{sealed.map(letter => <li key={letter.id}>
      <span>A letter waits for <time dateTime={letter.openOn}>{formatDay(letter.openOn, undefined, true)}</time>.</span>
      {discard(letter.id, "Discard")}
    </li>)}</ul>}
    <form className="local-form" onSubmit={submit}>
      <label htmlFor="letter-text">Write to the person you will be</label>
      <textarea id="letter-text" rows={4} maxLength={MAX_LETTER_LENGTH} value={text} onChange={event => setText(event.target.value)} aria-describedby="letter-help" />
      <label htmlFor="letter-date">Open it on</label>
      <input id="letter-date" type="date" min={tomorrow} value={openOn || shiftDate(today, 30)} onChange={event => setOpenOn(event.target.value)} />
      <p id="letter-help" className="local-help">{text.length} of {MAX_LETTER_LENGTH} characters. It stays on this device, hidden here until that day. It is not encrypted, and your backup file includes it.</p>
      <div className="local-actions"><button className="compare-link" disabled={!text.trim()}>Seal this letter</button></div>
      {error && <p className="local-error" role="alert">{error}</p>}
      <p role="status" className="local-help">{status}</p>
    </form>
  </section>;
}
