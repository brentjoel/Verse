// Pure pacing for the Breathe exercise. Nothing here is stored or sent anywhere.
export type BreathePhase = "in" | "hold" | "out";
export type BreatheStep = { phase: BreathePhase; seconds: number; level: 0 | 1 };
export type BreathePattern = { id: string; name: string; blurb: string; steps: BreatheStep[] };

export const breathePatterns: BreathePattern[] = [
  { id: "calm", name: "Calm", blurb: "In for 4, hold 4, out for 6", steps: [
    { phase: "in", seconds: 4, level: 1 }, { phase: "hold", seconds: 4, level: 1 }, { phase: "out", seconds: 6, level: 0 },
  ] },
  { id: "box", name: "Steady", blurb: "In, hold, out, hold, each for 4", steps: [
    { phase: "in", seconds: 4, level: 1 }, { phase: "hold", seconds: 4, level: 1 }, { phase: "out", seconds: 4, level: 0 }, { phase: "hold", seconds: 4, level: 0 },
  ] },
];

export const phaseLabels: Record<BreathePhase, string> = { in: "Breathe in", hold: "Hold", out: "Breathe out" };

export function findPattern(id: string): BreathePattern {
  return breathePatterns.find(pattern => pattern.id === id) ?? breathePatterns[0];
}

export function cycleSeconds(pattern: BreathePattern): number {
  return pattern.steps.reduce((total, step) => total + step.seconds, 0);
}

export type BreatheMoment = { step: BreatheStep; index: number; round: number; secondsLeft: number };

// Where the exercise is after `elapsedMs`. Negative or invalid time counts as the start.
export function momentAt(pattern: BreathePattern, elapsedMs: number): BreatheMoment {
  const ms = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  const cycleMs = cycleSeconds(pattern) * 1000;
  const round = Math.floor(ms / cycleMs) + 1;
  let into = ms % cycleMs;
  for (let index = 0; index < pattern.steps.length; index++) {
    const step = pattern.steps[index];
    const stepMs = step.seconds * 1000;
    if (into < stepMs) return { step, index, round, secondsLeft: Math.ceil((stepMs - into) / 1000) };
    into -= stepMs;
  }
  const last = pattern.steps.length - 1;
  return { step: pattern.steps[last], index: last, round, secondsLeft: 1 };
}
