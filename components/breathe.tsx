"use client";

import { useEffect, useState } from "react";
import { breathePatterns, findPattern, momentAt, phaseLabels } from "@/lib/breathe";

// A paced breathing guide. Transient: nothing is stored, sent or put in the URL.
export function Breathe() {
  const [patternId, setPatternId] = useState(breathePatterns[0].id);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pattern = findPattern(patternId);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const timer = setInterval(() => setElapsed(performance.now() - start), 100);
    return () => clearInterval(timer);
  }, [running]);

  const moment = running ? momentAt(pattern, elapsed) : null;
  const label = moment ? phaseLabels[moment.step.phase] : "Ready";

  function toggle() {
    setElapsed(0);
    setRunning(value => !value);
  }

  return <div className="breathe">
    <div className="breathe-stage" data-running={running}>
      <div className="breathe-orb" aria-hidden="true" data-level={moment ? moment.step.level : 0} style={{ transitionDuration: moment ? `${moment.step.seconds}s` : undefined }} />
      <div className="breathe-cue">
        <p className="breathe-label">{label}</p>
        <p className="breathe-count" aria-hidden="true">{moment ? moment.secondsLeft : ""}</p>
      </div>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{moment ? `${label}, round ${moment.round}` : "Stopped"}</p>
    <p className="caption breathe-round">{moment ? `Round ${moment.round}` : pattern.blurb}</p>
    <div className="chip-row" role="group" aria-label="Breathing pattern">
      {breathePatterns.map(option => <button key={option.id} type="button" className="chip" aria-pressed={option.id === patternId} disabled={running} onClick={() => setPatternId(option.id)}>{option.name}</button>)}
    </div>
    <button type="button" className="pill" onClick={toggle}>{running ? "Stop" : "Begin"}</button>
  </div>;
}
