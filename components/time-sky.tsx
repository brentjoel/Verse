"use client";

import { useSyncExternalStore } from "react";
import { skyPhase } from "@/lib/time-sky";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  return () => { window.clearInterval(timer); window.removeEventListener("focus", onChange); };
}

/** A faint wash behind Home that follows the device's local hour. Decorative; nothing is stored or sent. */
export function TimeSky() {
  const phase = useSyncExternalStore(subscribe, () => skyPhase(new Date().getHours()), () => "night");
  return <div className="time-sky" data-phase={phase} aria-hidden="true" />;
}
