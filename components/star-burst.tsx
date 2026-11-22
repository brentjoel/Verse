import type { CSSProperties } from "react";
import { burstRays } from "@/lib/motion";

const RAYS = burstRays();

/** A one-shot ring of tiny stars from the icon. Remount it (change `key`) to play it again. Hidden for reduced motion. */
export function StarBurst() {
  return <span className="star-burst" aria-hidden="true">
    {RAYS.map((ray, index) => <i key={index} style={{ "--angle": `${ray.angle}deg`, "--distance": `${ray.distance}px`, "--size": `${ray.size}px`, animationDelay: `${index * 12}ms` } as CSSProperties} />)}
  </span>;
}
