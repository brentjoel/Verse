"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { CHECK_IN_DISMISS_KEY, parseDismissed, pickCheckIn } from "@/lib/check-in";
import { getSpecificEmotionByIds } from "@/lib/emotions";
import { localClock } from "@/lib/streaks";

import type { CheckInAnswer as Answer } from "@/lib/storage-schema";

const answers: { id: Answer; label: string }[] = [{ id: "lighter", label: "Lighter" }, { id: "same", label: "About the same" }, { id: "heavier", label: "Heavier" }];

// Today's local date and the dismissal are read from the browser as one snapshot ("" on the server).
const listeners = new Set<() => void>();
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function snapshot() {
  let dismissed = "";
  try { dismissed = parseDismissed(localStorage.getItem(CHECK_IN_DISMISS_KEY)) ?? ""; } catch { /* Without storage the card simply returns next visit. */ }
  const date = localClock().localDate;
  return `${date}|${dismissed || (hiddenToday === date ? date : "")}`;
}
let hiddenToday = "";
function hideForToday(today: string) {
  hiddenToday = today;
  try { localStorage.setItem(CHECK_IN_DISMISS_KEY, today); } catch { /* The card hides for this visit anyway. */ }
  listeners.forEach(listener => listener());
}

export function ReturnCheckIn() {
  const snapshot_ = usePersonalStorage();
  const [now, stored] = useSyncExternalStore(subscribe, snapshot, () => "|").split("|");
  const [picked, setPicked] = useState<Answer>();
  const [error, setError] = useState("");
  const today = now || undefined;
  const dismissedOn = stored || undefined;
  if (!today || !snapshot_.ready || (snapshot_.mode !== "persistent" && snapshot_.mode !== "memory")) return null;
  const mood = pickCheckIn(snapshot_.envelope.data.moodEntries, today, dismissedOn);
  const feeling = mood && getSpecificEmotionByIds(mood.emotionId, mood.specificEmotionId);
  if (!mood || !feeling) return null;
  const answer = picked ?? mood.checkIn?.answer;
  const choose = (value: Answer) => {
    setPicked(value); setError("");
    void getPersonalStore().answerCheckIn(mood.id, value).then(result => { if (!result.ok) setError("Your answer could not be kept, but it still counts here."); });
  };
  const back = `/emotions/${mood.emotionId}/${mood.specificEmotionId}`;
  const dismiss = () => hideForToday(today);
  const reply = answer === "lighter" ? "I'm glad. Hold on to that light for a moment."
    : answer === "same" ? "That is okay. Steady is its own kind of grace."
    : answer === "heavier" ? "Thank you for being honest. You do not have to carry it alone." : "";

  return <section className="check-in" aria-labelledby="check-in-title">
    <h2 id="check-in-title" className="check-in-title">Last time you felt {feeling.name}. How is your heart now?</h2>
    <div className="chip-row">
      {answers.map(item => <button key={item.id} type="button" className="chip" aria-pressed={answer === item.id} onClick={() => choose(item.id)}>{item.label}</button>)}
    </div>
    <p role="status" className="check-in-reply">{reply}{answer && !error && <span className="local-help"> Kept with that reflection in your journal.</span>}</p>
    {error && <p className="local-help">{error}</p>}
    {answer && <div className="check-in-links">
      {answer === "lighter" && <><Link className="compare-link" href="/emotions/grateful">Thank God for it</Link><Link className="compare-link" href="#choose-a-feeling">Choose a feeling</Link></>}
      {answer === "same" && <Link className="compare-link" href={back}>Return to {feeling.name}</Link>}
      {answer === "heavier" && <><Link className="compare-link" href={back}>Return to {feeling.name}</Link><Link className="compare-link" href="/breathe">Breathe for a minute</Link></>}
    </div>}
    <button type="button" className="quiet-link" onClick={dismiss}>Not now</button>
  </section>;
}
