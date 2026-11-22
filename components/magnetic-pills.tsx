"use client";

import { useEffect } from "react";
import { magnetOffset } from "@/lib/motion";

/** Fine pointers only: the pill under the mouse leans a few pixels toward it. Touch, pens and reduced motion never see it. */
export function MagneticPills() {
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let current: HTMLElement | null = null;
    let frame = 0;
    const release = () => { current?.style.removeProperty("--mx"); current?.style.removeProperty("--my"); current = null; };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches || still.matches) return;
      const pill = event.target instanceof Element ? event.target.closest<HTMLElement>(".pill:not(:disabled)") : null;
      if (pill !== current) release();
      if (!pill) return;
      current = pill;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Measure without the current lean so the pull stays centred on the pill's resting place.
        const rect = pill.getBoundingClientRect();
        const lean = { x: parseFloat(pill.style.getPropertyValue("--mx")) || 0, y: parseFloat(pill.style.getPropertyValue("--my")) || 0 };
        const offset = magnetOffset(event.clientX, event.clientY, { left: rect.left - lean.x, top: rect.top - lean.y, width: rect.width, height: rect.height });
        pill.style.setProperty("--mx", `${offset.x}px`);
        pill.style.setProperty("--my", `${offset.y}px`);
      });
    };
    const leave = () => { cancelAnimationFrame(frame); release(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => { leave(); document.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); window.removeEventListener("blur", leave); };
  }, []);
  return null;
}
