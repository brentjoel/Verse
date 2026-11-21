"use client";

import { addTransitionType, createContext, startTransition, useContext, ViewTransition, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { readLastVerse, writeLastVerse } from "@/lib/last-verse";
import { ArrowLeft, ArrowRight, List, BookOpen } from "lucide-react";

const subscribe = () => () => {};
export const ActiveVerseContext = createContext(false);

type Pager = { index: number; count: number; move: (offset: number) => void; select: (item: number) => void };
const PagerContext = createContext<Pager | null>(null);

export function VerseCarousel({ children, memoryKey }: { children: ReactNode[]; memoryKey?: string }) {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  // Come back to the passage you were on earlier in this browser session (server and first paint show the first).
  const count = children.length;
  const remembered = useSyncExternalStore(subscribe, () => (memoryKey ? readLastVerse(memoryKey, count) : 0), () => 0);
  const [chosen, setIndex] = useState<number | null>(null);
  const index = chosen ?? remembered;
  const [list, setList] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState(1);
  const activeIndex = useRef(0);
  useEffect(() => { activeIndex.current = index; }, [index]);
  const select = (item: number, travel: number) => {
    if (item === activeIndex.current) return;
    activeIndex.current = item;
    if (memoryKey) writeLastVerse(memoryKey, item);
    startTransition(() => {
      addTransitionType(travel > 0 ? "verse-next" : "verse-previous");
      setDirection(travel > 0 ? 1 : -1);
      setIndex(item);
    });
  };
  const move = (offset: number) => {
    if (children.length === 0) return;
    // Keep keyboard focus available when its current slide becomes hidden.
    if (region.current?.querySelector(".verse-list")?.contains(document.activeElement)) region.current.focus({ preventScroll: true });
    select((activeIndex.current + offset + children.length) % children.length, offset);
  };
  const pager: Pager | null = enhanced && !list && children.length > 1 ? { index, count: children.length, move, select: item => select(item, item - activeIndex.current) } : null;
  return <div ref={region} tabIndex={enhanced && !list ? 0 : undefined} className="verse-carousel" role="region" aria-label="Scripture passages. Use left and right arrows to move between verses." aria-roledescription={enhanced && !list ? "carousel" : undefined} onKeyDown={event => {
    if (list || event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof Element && event.target.closest("input, select, textarea, dialog"))) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
  }}>
    {enhanced && <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{list ? `${children.length} verses` : `Verse ${index + 1} of ${children.length}`}</p>}
    <ViewTransition default="none" share={{ "verse-next": "verse-next", "verse-previous": "verse-previous", default: "none" }} update={{ "verse-next": "verse-next", "verse-previous": "verse-previous", default: "none" }}><ul data-direction={direction} className={`verse-list${enhanced && !list ? " carousel-single" : ""}`} onTouchStart={event => { const touch = event.touches[0]; start.current = { x: touch.clientX, y: touch.clientY }; }} onTouchEnd={event => {
      const touch = event.changedTouches[0];
      if (start.current && !list && !(event.target instanceof Element && event.target.closest("button, a, input, summary, dialog"))) {
        const dx = touch.clientX - start.current.x, dy = touch.clientY - start.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !window.getSelection()?.toString()) move(dx > 0 ? -1 : 1);
      }
      start.current = null;
    }}>
      {children.map((child, item) => <li key={item} hidden={enhanced && !list && index !== item} aria-label={`Verse ${item + 1} of ${children.length}`}><ActiveVerseContext.Provider value={enhanced && !list && index === item}><PagerContext.Provider value={pager}>{child}</PagerContext.Provider></ActiveVerseContext.Provider></li>)}
    </ul></ViewTransition>
    {enhanced && children.length > 1 && <p className="carousel-mode"><button type="button" className="quiet-link" onClick={() => setList(value => !value)}>{list ? <BookOpen size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}{list ? "One verse at a time" : "View all verses"}</button></p>}
  </div>;
}

/** Previous/next and dots, rendered inside the active verse so they sit right under its attribution. */
export function VersePager() {
  const pager = useContext(PagerContext);
  if (!pager) return null;
  return <div className="verse-pagination">
    <button type="button" className="icon-button verse-arrow" aria-label="Previous verse" data-tooltip="Previous verse" onClick={() => pager.move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
    <div className="verse-dots" aria-label="Choose a verse">{Array.from({ length: pager.count }, (_, item) => <button key={item} type="button" aria-label={`Show verse ${item + 1}`} aria-current={pager.index === item ? "true" : undefined} onClick={() => pager.select(item)}><span /></button>)}</div>
    <button type="button" className="icon-button verse-arrow" aria-label="Next verse" data-tooltip="Next verse" onClick={() => pager.move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
  </div>;
}
