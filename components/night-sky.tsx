"use client";

import type { CSSProperties } from "react";
import type { NightSky as Sky } from "@/lib/night-sky";

export interface GraceVerse { reference: string; text: string }

// Decorative background specks, fixed so the sky never shifts between renders.
const DUST = [[8, 12], [22, 88], [31, 30], [44, 9], [52, 70], [63, 22], [71, 91], [79, 48], [88, 15], [94, 76], [15, 58], [38, 52], [58, 40], [84, 62]];

export function NightSky({ sky, selected, onSelect, label, graceVerse }: { sky: Sky; selected: string; onSelect: (date: string) => void; label: (date: string) => string; graceVerse: GraceVerse }) {
  const position = new Map(sky.stars.map(star => [star.date, star]));
  // Stars twinkle in by date; the whole month arrives within about a second, however full it is.
  const step = Math.min(45, 900 / Math.max(1, sky.stars.length));
  const delay = new Map(sky.stars.map((star, index) => [star.date, `${Math.round(index * step)}ms`]));
  return <div className="night-sky-wrap">
    <div className="night-sky">
      <span className="night-dust" aria-hidden="true">{DUST.map(([x, y], index) => <i key={index} style={{ left: `${x}%`, top: `${y}%`, "--d": `${index * 0.7}s` } as CSSProperties} />)}</span>
      <svg className="night-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {sky.links.map(link => {
          const from = position.get(link.from)!, to = position.get(link.to)!;
          return <line key={`${link.from}-${link.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} data-grace={link.grace || undefined} vectorEffect="non-scaling-stroke" style={{ transformOrigin: `${from.x}px ${from.y}px`, "--d": delay.get(link.from) } as CSSProperties} />;
        })}
      </svg>
      <ul className="night-stars" aria-label="Days you visited this month">
        {sky.stars.map(star => <li key={star.date} style={{ left: `${star.x}%`, top: `${star.y}%`, "--d": delay.get(star.date) } as CSSProperties}>
          <button type="button" className="night-star" data-emotion={star.emotionId} data-level={star.reflections > 1 ? 3 : star.reflections ? 2 : 1} aria-pressed={selected === star.date} aria-label={label(star.date)} data-tooltip={label(star.date)} onClick={() => onSelect(selected === star.date ? "" : star.date)}><span aria-hidden="true" /></button>
        </li>)}
      </ul>
      {sky.stars.length === 0 && <p className="night-empty">Your sky fills as you return. Each visit becomes a star.</p>}
    </div>
    {sky.graceDates.length > 0 && <figure className="night-grace">
      <blockquote><p>{graceVerse.text}</p></blockquote>
      <figcaption>{graceVerse.reference} (WEB). A dim line marks a grace day: your rhythm waited for you.</figcaption>
    </figure>}
  </div>;
}
