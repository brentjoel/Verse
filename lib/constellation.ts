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

// How Home opens: phones start in the List under a small peek ring, larger screens on the wheel.
// Self-contained so the pre-paint script can inline it and reserve the space before first paint.
export type WheelStart = "wheel" | "peek" | "list";
export function wheelStart(tier: QualityTier, width: number): WheelStart {
  return tier === "list" ? "list" : width < 640 ? "peek" : "wheel";
}

// The first frames after mount pay for shader compiles and uploads, so the probe skips them.
export const PROBE_WARMUP_MS = 500;
export const PROBE_WINDOW_MS = 2000;
export interface FpsProbe { readonly first: number; readonly from: number; readonly frames: number }
export const freshProbe: FpsProbe = { first: 0, from: 0, frames: 0 };

/** Feeds one frame time. Returns the average fps once a full window after the warm-up has passed, else null. */
export function stepProbe(probe: FpsProbe, now: number): { probe: FpsProbe; fps: number | null } {
  if (!probe.first) return { probe: { first: now, from: 0, frames: 0 }, fps: null };
  if (now - probe.first < PROBE_WARMUP_MS) return { probe, fps: null };
  if (!probe.from) return { probe: { ...probe, from: now, frames: 0 }, fps: null };
  const next = { ...probe, frames: probe.frames + 1 };
  const span = now - probe.from;
  return { probe: next, fps: span >= PROBE_WINDOW_MS ? next.frames / (span / 1000) : null };
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

function seeded(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Particle layout for the wheel. Sector s is centered at angle s / sectors * 2π,
 * measured clockwise from the top (x = sin, y = cos), matching the DOM labels.
 * About 12% of particles form a sparse halo (sector -1).
 */
export function buildConstellation(count: number, sectors: number, seed = 1) {
  const random = seeded(seed);
  const positions = new Float32Array(count * 3);
  const sector = new Float32Array(count);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const span = (Math.PI * 2) / sectors;
  const gauss = () => (random() + random() + random() - 1.5) / 1.5;
  for (let i = 0; i < count; i++) {
    const halo = random() < 0.12;
    let angle: number, radius: number;
    if (halo) {
      angle = random() * Math.PI * 2;
      radius = 1.72 + random() * 0.55;
      sector[i] = -1;
    } else {
      const s = Math.floor(random() * sectors);
      // Leave a soft gap between sectors so each emotion reads as its own cloud.
      angle = s * span + (random() - 0.5) * span * 0.86;
      radius = Math.min(1.72, Math.max(0.98, 1.36 + gauss() * 0.34 + Math.sin(angle * 3 + seed) * 0.05));
      sector[i] = s;
    }
    positions[i * 3] = Math.sin(angle) * radius;
    positions[i * 3 + 1] = Math.cos(angle) * radius;
    positions[i * 3 + 2] = (random() - 0.5) * 0.3;
    const roll = random();
    size[i] = roll > 0.97 ? 2.2 + random() * 1.2 : 0.55 + random() * 1.05;
    phase[i] = random() * Math.PI * 2 * 0.999999;
  }
  return { positions, sector, size, phase };
}
