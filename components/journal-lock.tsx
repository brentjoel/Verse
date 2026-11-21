"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { getPersonalStore } from "@/lib/browser-storage";
import { MIN_PASSCODE_LENGTH } from "@/lib/journal-lock";

/** Shown instead of the journal while a passcode protects it. */
export function JournalLockGate() {
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  async function open(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    const result = await getPersonalStore().unlockJournal(passcode);
    setBusy(false);
    if (!result.ok) setError(result.error); else setPasscode("");
  }
  async function erase() {
    setBusy(true);
    const result = await getPersonalStore().eraseLockedText();
    setBusy(false);
    if (!result.ok) setError(result.error);
  }
  return <section className="library-section journal-lock" aria-labelledby="lock-heading">
    <div className="section-heading"><h2 id="lock-heading"><LockKeyhole size={20} aria-hidden="true" /> Your journal is locked</h2></div>
    <p className="local-help">Your notes, letters and prayers are encrypted on this device. Enter your passcode to open them in this tab.</p>
    <form className="local-form" onSubmit={open}>
      <label htmlFor="unlock-passcode">Passcode</label>
      <input id="unlock-passcode" type="password" autoComplete="current-password" value={passcode} onChange={event => setPasscode(event.target.value)} disabled={busy} />
      <div className="local-actions"><button className="compare-link" disabled={busy || !passcode}>{busy ? "Opening..." : "Open my journal"}</button></div>
      {error && <p className="local-error" role="alert">{error}</p>}
    </form>
    {!forgot ? <button type="button" className="quiet-link" onClick={() => setForgot(true)}>Forgot your passcode?</button> : <div className="inline-confirm">
      <p>There is no way to recover a forgotten passcode, not even for us: it never leaves this device. If a backup from before the passcode exists, you can import it from My Verses. Otherwise you can remove the lock and start fresh. Your feelings, dates and saved verses stay; the locked notes, letters and prayers are erased for good.</p>
      {!confirmErase ? <button type="button" className="compare-link" onClick={() => setConfirmErase(true)}>Remove the lock and erase locked text</button> : <>
        <p>This cannot be undone. Erase the locked notes, letters and prayers?</p>
        <div className="local-actions"><button type="button" className="compare-link" disabled={busy} onClick={() => void erase()}>Yes, erase them</button><button type="button" className="compare-link" onClick={() => { setConfirmErase(false); setForgot(false); }}>Keep trying my passcode</button></div>
      </>}
    </div>}
  </section>;
}

/** Set, use or remove the optional passcode. */
export function PasscodeSettings({ hasLock, disabled }: { hasLock: boolean; disabled: boolean }) {
  const [opening, setOpening] = useState(false);
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  async function lock(event: React.FormEvent) {
    event.preventDefault();
    if (first.length < MIN_PASSCODE_LENGTH) { setError(`Use at least ${MIN_PASSCODE_LENGTH} characters.`); return; }
    if (first !== second) { setError("The two passcodes do not match."); return; }
    if (!understood) { setError("Please confirm you understand a forgotten passcode cannot be recovered."); return; }
    setBusy(true); setError("");
    const result = await getPersonalStore().setPasscode(first);
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    setFirst(""); setSecond(""); setUnderstood(false); setOpening(false);
    setStatus("Your journal is locked. It stays open in this tab until you lock it or leave.");
  }
  async function remove() {
    setBusy(true); setError("");
    const result = await getPersonalStore().removePasscode();
    setBusy(false); setConfirmRemove(false);
    if (!result.ok) setError(result.error); else setStatus("The passcode is removed. Your journal is stored without encryption again.");
  }
  return <section className="library-section" aria-labelledby="passcode-heading">
    <div className="section-heading"><h2 id="passcode-heading">Journal passcode</h2></div>
    {hasLock ? <>
      <p className="local-help">Your notes, letters and prayers are encrypted on this device with your passcode. Backups keep them encrypted too, so you will need the passcode after importing one.</p>
      <div className="local-actions">
        <button type="button" className="compare-link" disabled={disabled || busy} onClick={() => { getPersonalStore().lockJournal(); }}><LockKeyhole size={17} aria-hidden="true" />Lock now</button>
        {!confirmRemove && <button type="button" className="quiet-link" disabled={disabled || busy} onClick={() => setConfirmRemove(true)}>Remove the passcode</button>}
      </div>
      {confirmRemove && <div className="inline-confirm"><p>Remove the passcode? Your notes, letters and prayers will be stored on this device without encryption, and backups will include them as plain text.</p><div className="local-actions"><button type="button" className="compare-link" disabled={busy} onClick={() => void remove()}>Yes, remove it</button><button type="button" className="compare-link" onClick={() => setConfirmRemove(false)}>Keep the passcode</button></div></div>}
    </> : <>
      <p className="local-help">Optional. A passcode encrypts your notes, letters and prayers on this device. Feelings and dates stay visible so your sky and rhythm keep working.</p>
      {!opening ? <div className="local-actions"><button type="button" className="compare-link" disabled={disabled} onClick={() => setOpening(true)}><LockKeyhole size={17} aria-hidden="true" />Set a passcode</button></div> : <form className="local-form" onSubmit={lock}>
        <p className="lock-warning" id="passcode-warning"><strong>Please read this first.</strong> If you forget this passcode, your locked notes, letters and prayers are lost. No one can recover them, because the passcode never leaves this device. Consider exporting a backup before you start.</p>
        <label htmlFor="new-passcode">New passcode</label>
        <input id="new-passcode" type="password" autoComplete="new-password" minLength={MIN_PASSCODE_LENGTH} value={first} onChange={event => setFirst(event.target.value)} aria-describedby="passcode-warning passcode-help" disabled={busy} />
        <p id="passcode-help" className="local-help">At least {MIN_PASSCODE_LENGTH} characters. A short phrase is easier to remember.</p>
        <label htmlFor="repeat-passcode">Type it again</label>
        <input id="repeat-passcode" type="password" autoComplete="new-password" value={second} onChange={event => setSecond(event.target.value)} disabled={busy} />
        <label className="lock-consent"><input type="checkbox" checked={understood} onChange={event => setUnderstood(event.target.checked)} disabled={busy} /> I understand that a forgotten passcode means this text is lost.</label>
        <div className="local-actions"><button className="compare-link" disabled={busy}>{busy ? "Locking..." : "Lock my journal"}</button><button type="button" className="quiet-link" onClick={() => { setOpening(false); setError(""); }}>Cancel</button></div>
      </form>}
    </>}
    {error && <p className="local-error" role="alert">{error}</p>}
    <p role="status" className="local-help">{status}</p>
  </section>;
}
