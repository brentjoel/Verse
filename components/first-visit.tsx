"use client";

import { useEffect, type CSSProperties } from "react";
import { INTRO_KEY } from "@/lib/motion";

// A fixed scatter of stars: the same sky for every first visit. A few carry emotion hues; the rest are ink.
const HUES = ["#2dd4bf", "#4f8cff", "#a78bfa", "#facc15", "#f472b6"];
const STARS = Array.from({ length: 30 }, (_, index) => {
  const seed = Math.sin(index * 12.9898 + 4.1) * 43758.5453;
  const a = seed - Math.floor(seed), b = (seed * 7.31) - Math.floor(seed * 7.31);
  return { x: Math.round(a * 96 + 2), y: Math.round(b * 70 + 4), size: index % 5 === 0 ? 4 : index % 3 === 0 ? 3 : 2, delay: Math.round((index * 37) % 760), hue: index % 4 === 0 ? HUES[(index / 4) % HUES.length] : undefined };
});

/**
 * First visit to Home: the sky fades in around the one line (the headline, painted at once),
 * then the light line, tools and picker rise. It never blocks: any key, tap, scroll or wheel
 * fast-forwards it, and it is gone within three seconds. The pre-paint script decides
 * (data-intro), so returning visitors, reduced motion, tests and deep links never see it.
 */
export function FirstVisit() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") return;
    try { localStorage.setItem(INTRO_KEY, "seen"); } catch { /* Without storage it may play again; it never blocks. */ }
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    let finished = false;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const end = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer); clearTimeout(settle);
      events.forEach(type => removeEventListener(type, skip));
      document.removeEventListener("visibilitychange", hidden);
      delete root.dataset.intro;
    };
    // Skipping speeds the remaining motion up instead of cutting it, so nothing jumps.
    const skip = () => {
      if (finished || settle) return;
      document.getAnimations().forEach(animation => {
        if (animation instanceof CSSAnimation && animation.animationName.startsWith("intro-")) animation.updatePlaybackRate(10);
      });
      settle = setTimeout(end, 280);
    };
    const hidden = () => { if (document.hidden) end(); };
    const timer = setTimeout(end, 3000);
    events.forEach(type => addEventListener(type, skip, { passive: true }));
    document.addEventListener("visibilitychange", hidden);
    return end;
  }, []);

  return <div className="intro-sky" aria-hidden="true">
    {STARS.map((star, index) => <i key={index} style={{ "--x": `${star.x}%`, "--y": `${star.y}%`, "--s": `${star.size}px`, "--d": `${star.delay}ms`, ...(star.hue ? { "--c": star.hue } : {}) } as CSSProperties} />)}
  </div>;
}
