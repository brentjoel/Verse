/** One shared view-transition name per feeling, so its title can travel from the row (or the wheel's center) to Results. */
export const feelingTitleName = (emotionId: string, specificId: string) => `feeling-${emotionId}-${specificId}`;

/** First-visit intro: its own flag, separate from personal data and backups. */
export const INTRO_KEY = "verselight-intro";

/** The intro plays once, only on Home, only with motion allowed, and only when the flag can be read.
 * Kept self-contained: the pre-paint script inlines it with toString(). */
export function introShouldPlay(seen: string | null | undefined, path: string, reducedMotion: boolean): boolean {
  return path === "/" && (seen === null || seen === undefined) && !reducedMotion;
}

/** A magnetic pill leans a few pixels toward the pointer, never past `strength`, never outside its box. */
export function magnetOffset(pointerX: number, pointerY: number, rect: { left: number; top: number; width: number; height: number }, strength = 3): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  const nx = clamp((pointerX - (rect.left + rect.width / 2)) / (rect.width / 2));
  const ny = clamp((pointerY - (rect.top + rect.height / 2)) / (rect.height / 2));
  const round = (value: number) => Math.round(value * 100) / 100 || 0;
  return { x: round(nx * strength), y: round(ny * strength * 0.6) };
}

/** Star-burst rays: evenly spread around the icon with a stable jitter, so every burst feels the same. */
export function burstRays(count = 7): { angle: number; distance: number; size: number }[] {
  return Array.from({ length: count }, (_, index) => ({
    angle: Math.round((index / count) * 360 + (index % 2 ? 12 : -8)),
    distance: index % 3 === 0 ? 24 : index % 3 === 1 ? 19 : 28,
    size: index % 2 ? 4 : 5,
  }));
}
