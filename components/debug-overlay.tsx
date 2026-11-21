"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { debugRequested, fpsFromFrames } from "@/lib/debug";
import { tierSettings, type RenderTier } from "@/lib/constellation";

interface Readout { fps: number | null; tier: string; particles: string; draws: string }

// Engineering overlay for `?debug`. Client-only, reads the wheel's data attributes, stores nothing.
export function DebugOverlay() {
  // False on the server and during hydration, then read once from the URL.
  const on = useSyncExternalStore(() => () => {}, () => debugRequested(window.location.search), () => false);
  const [read, setRead] = useState<Readout>({ fps: null, tier: "-", particles: "-", draws: "-" });
  useEffect(() => {
    if (!on) return;
    let frame = 0, last = 0;
    const times: number[] = [];
    const loop = (now: number) => {
      times.push(now);
      if (times.length > 60) times.shift();
      if (now - last > 500) {
        last = now;
        const wheel = document.querySelector<HTMLElement>(".wheel-canvas");
        const tier = wheel?.dataset.tier ?? "list";
        const settings = tierSettings[tier as RenderTier];
        setRead({ fps: fpsFromFrames(times), tier, particles: settings ? String(settings.particles) : "-", draws: wheel?.dataset.draws ?? "-" });
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [on]);
  if (!on) return null;
  return <dl className="debug-overlay" aria-label="Engineering overlay">
    <div><dt>fps</dt><dd>{read.fps ?? "-"}</dd></div>
    <div><dt>tier</dt><dd>{read.tier}</dd></div>
    <div><dt>particles</dt><dd>{read.particles}</dd></div>
    <div><dt>draw calls</dt><dd>{read.draws}</dd></div>
  </dl>;
}
