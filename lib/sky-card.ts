import type { NightSky } from "./night-sky";

export const SKY_CARD = { width: 1200, height: 1000, skyTop: 150, skyHeight: 520, pad: 90 } as const;

export interface CardStar { x: number; y: number; r: number; emotionId?: string }
export interface CardLine { x1: number; y1: number; x2: number; y2: number; grace: boolean }

/** Maps the Journal sky (percentages) onto card pixels. Pure, so the layout is testable. */
export function planSkyCard(sky: NightSky): { stars: CardStar[]; lines: CardLine[] } {
  const { width, pad, skyTop, skyHeight } = SKY_CARD;
  const place = (star: { x: number; y: number }) => ({ x: pad + star.x / 100 * (width - pad * 2), y: skyTop + star.y / 100 * skyHeight });
  const at = new Map(sky.stars.map(star => [star.date, { ...place(star), star }]));
  const stars = sky.stars.map(star => ({ ...place(star), r: star.reflections > 1 ? 11 : star.reflections ? 8 : 5, ...(star.emotionId ? { emotionId: star.emotionId } : {}) }));
  const lines = sky.links.flatMap(link => {
    const a = at.get(link.from), b = at.get(link.to);
    return a && b ? [{ x1: a.x, y1: a.y, x2: b.x, y2: b.y, grace: link.grace }] : [];
  });
  return { stars, lines };
}

/** Greedy word wrap with a caller-supplied width measure (canvas measureText in the browser). */
export function wrapText(text: string, maxWidth: number, measure: (line: string) => number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
