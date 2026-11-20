// Visual identity and rendering decisions for the constellation wheel. Pure, so it stays testable.
// Labels, order and routes always come from data/emotions.json.

export const emotionHues: Readonly<Record<string, { night: string; day: string }>> = {
  anxious: { night: "#2dd4bf", day: "#0f8f80" },
  sad: { night: "#4f8cff", day: "#2457c5" },
  angry: { night: "#ff5a5f", day: "#c62f35" },
  tired: { night: "#a78bfa", day: "#6d4fd6" },
  guilty: { night: "#22d3ee", day: "#0e7f93" },
  grateful: { night: "#facc15", day: "#9a7a00" },
  hopeful: { night: "#ffb829", day: "#a35f00" },
  doubtful: { night: "#f472b6", day: "#b8357a" },
};

export type QualityTier = "high" | "medium" | "low" | "list";
export type RenderTier = Exclude<QualityTier, "list">;

export const tierSettings: Readonly<Record<RenderTier, { particles: number; maxDpr: number }>> = {
  high: { particles: 9000, maxDpr: 2 },
  medium: { particles: 5000, maxDpr: 1.5 },
  low: { particles: 2500, maxDpr: 1 },
};

// Missing hints never lower the tier; the frame-rate probe corrects optimism.
export function initialTier(hints: { reducedMotion: boolean; cores?: number; memory?: number; width: number }): QualityTier {
  if (hints.reducedMotion || (hints.cores !== undefined && hints.cores > 0 && hints.cores <= 2)) return "list";
  if ((hints.memory !== undefined && hints.memory <= 2) || (hints.cores !== undefined && hints.cores <= 4)) return "low";
  return hints.width < 640 ? "medium" : "high";
}

export function nextTier(current: QualityTier, averageFps: number): QualityTier {
  if (current === "list") return "list";
  if (current === "low") return averageFps < 24 ? "list" : "low";
  if (averageFps < 50) return current === "high" ? "medium" : "low";
  return current;
}

// Project 3 hook: model scores become 0..1 pull weights in wheel order.
export function leanWeights(scores: Readonly<Record<string, number>>, order: readonly string[]): number[] {
  const raw = order.map(id => {
    const value = scores[id];
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
  });
  const max = Math.max(0, ...raw);
  return raw.map(value => (max > 0 ? value / max : 0));
}
