"use client";

import { useContext, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { burstStars, createDawnRun, wordDelay } from "@/lib/dawn";
import { ActiveVerseContext } from "@/components/verse-carousel";

export function DawnReveal({ path, reference, children }: { path: string; reference: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stop = useRef<() => void>(() => {});
  const active = useContext(ActiveVerseContext);

  useEffect(() => {
    const element = root.current;
    if (!element || !active) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const run = createDawnRun();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      run.cancel();
      clearTimeout(timer);
      element.dataset.animating = "false";
    };
    stop.current = finish;
    // Each active passage owns its effects, including Strict Mode rehearsals.
    const frame = requestAnimationFrame(() => {
      if (!run.running || motion.matches || document.hidden || !element.animate) return;
      const words = element.querySelectorAll<HTMLElement>("[data-dawn-word]");
      if (!words.length) return;
      element.dataset.animating = "true";
      const style = getComputedStyle(element);
      try {
        words.forEach((word, index) => {
          // Both colors remain readable. Animation adds emphasis without hiding text.
          run.add(word.animate([
            { color: style.getPropertyValue("--muted-foreground") },
            { color: style.getPropertyValue("--foreground") },
          ], { delay: wordDelay(index), duration: 600, fill: "backwards", easing: "ease-out" }));
        });
        // Stars rise behind the reference and settle into a still constellation.
        element.querySelectorAll<HTMLElement>(".dawn-burst i").forEach(star => run.add(star.animate([
          { opacity: 0, transform: "translateY(18px) scale(.2)" },
          { opacity: 1, transform: "translateY(-4px) scale(1.4)", offset: .45 },
          { opacity: .7, transform: "none" },
        ], { duration: 1400, delay: Number(star.dataset.delay) || 0, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" })));
        timer = setTimeout(finish, Math.max(2400, wordDelay(words.length - 1) + 600));
      } catch { finish(); } // Unsupported animation features keep instant reading.
    });
    const visibility = () => { if (document.hidden) finish(); };
    const preference = () => { if (motion.matches) finish(); };
    // Captured animation colors must never survive a theme switch.
    const theme = new MutationObserver(finish);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      finish();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
      theme.disconnect();
    };
  }, [path, active]);

  // Tapping the passage while it glows finishes the reveal; controls keep their own behavior.
  return <div ref={root} className="dawn-reveal" onClick={event => {
    if (root.current?.dataset.animating === "true" && !(event.target instanceof Element && event.target.closest("a, button, summary, input, select, dialog"))) stop.current();
  }}>
    <div className="dawn-controls">
      <p className="sr-only">The whole passage is ready to read. Take your time.</p>
      <button type="button" className="compare-link dawn-skip" onClick={() => stop.current()}>Skip animation</button>
    </div>
    <div className="dawn-burst" aria-hidden="true">{burstStars(reference).map((star, index) => <i key={index} data-delay={star.delay} style={{ "--x": star.x, "--y": star.y, "--s": `${star.size}px` } as CSSProperties} />)}</div>
    {children}
  </div>;
}
