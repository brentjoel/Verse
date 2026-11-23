"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FeelingLink } from "@/components/feeling-link";
import { Constellation } from "@/components/constellation";
import type { Emotion } from "@/lib/emotions";
import { wrapIndex } from "@/lib/wheel";
import { initialTier, wheelStart, type QualityTier, type RenderTier } from "@/lib/constellation";

const Scene = dynamic(() => import("@/components/constellation-scene"), { ssr: false, loading: () => <span className="wheel-loading" role="status"><Constellation twinkle /><span>Gathering the stars.</span></span> });

class SceneRecovery extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type Intensity = "low" | "medium" | "high";

export function WheelPicker({ emotions, children }: { emotions: readonly Emotion[]; children: ReactNode }) {
  const [mode, setMode] = useState<"list" | "wheel">("list");
  const [tier, setTier] = useState<QualityTier>("list");
  // Capable devices keep the Wheel option even after a runtime fallback, so the wow is one tap away.
  const [capable, setCapable] = useState(false);
  // False until the effect below decides; until then CSS holds the room the pre-paint script predicted.
  const [decided, setDecided] = useState(false);
  const returning = useRef(false);
  const [idle, setIdle] = useState(false);
  const [turn, setTurn] = useState(0);
  const [broad, setBroad] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [intensityChosen, setIntensityChosen] = useState(false);
  // Choosing a feeling gathers the sky into one point of light while the verses load.
  const [dawning, setDawning] = useState(false);
  const gather = useCallback(() => setDawning(true), []);
  // Coming back (router state is kept while hidden, or the browser's back-forward cache) shows the wheel as it was, not mid-gather.
  useEffect(() => {
    const shown = (event: PageTransitionEvent) => { if (event.persisted) setDawning(false); };
    addEventListener("pageshow", shown);
    // Cleanup runs when the router hides this page, so it is reset before it shows again.
    return () => { removeEventListener("pageshow", shown); setDawning(false); };
  }, []);
  const kept = intensityChosen ? intensity : undefined;
  const drag = useRef<number | null>(null);
  const wheelDelta = useRef(0);
  const wheelTime = useRef(0);
  const dial = useRef<HTMLDivElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const focusList = useRef(false);

  // After a fallback commits the List, move focus to its heading if the dial had it.
  useEffect(() => {
    if (mode === "list" && focusList.current) { focusList.current = false; listHeading.current?.focus(); }
  }, [mode]);

  const rotate = useCallback((steps: number) => {
    setTurn(value => value + steps);
  }, []);

  // Decide once after hydration; the server and no-JS view is always the List.
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      const start = initialTier({ reducedMotion: motion.matches, cores: navigator.hardwareConcurrency, memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory, width: innerWidth });
      setTier(start);
      setCapable(start !== "list");
      // Phones start in the quick List with a small constellation above; the full wheel is one tap away.
      const opening = wheelStart(start, innerWidth);
      // The pre-paint script set this already; keep it true if reduced motion changes later.
      document.documentElement.dataset.wheel = opening;
      setMode(opening === "wheel" ? "wheel" : "list");
      setDecided(true);
    };
    decide();
    motion.addEventListener("change", decide);
    // Paint the headline and DOM dial before loading WebGL.
    const idleId = "requestIdleCallback" in window ? window.requestIdleCallback(() => setIdle(true), { timeout: 900 }) : undefined;
    const timer = idleId === undefined ? window.setTimeout(() => setIdle(true), 300) : undefined;
    return () => { motion.removeEventListener("change", decide); if (idleId !== undefined) window.cancelIdleCallback(idleId); if (timer !== undefined) clearTimeout(timer); };
  }, []);

  const onTierChange = useCallback((next: QualityTier) => {
    setTier(next);
    if (next === "list") {
      const hadFocus = dial.current?.contains(document.activeElement) ?? false;
      focusList.current = hadFocus;
      setMode("list");
    }
  }, []);

  useEffect(() => {
    if (mode !== "wheel") return;
    if (broad !== null) dial.current?.querySelector<HTMLAnchorElement>(".wheel-center a")?.focus({ preventScroll: true });
    else if (returning.current) { returning.current = false; dial.current?.querySelector<HTMLButtonElement>(".wheel-lock")?.focus({ preventScroll: true }); }
  }, [broad, mode]);

  useEffect(() => {
    const element = dial.current;
    if (!element || mode !== "wheel") return;
    const scroll = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      // Vertical scrolling moves the page; only sideways gestures or a focused dial turn the wheel.
      const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!sideways && !element.contains(document.activeElement)) return;
      event.preventDefault();
      wheelDelta.current += sideways ? event.deltaX : event.deltaY;
      if (Math.abs(wheelDelta.current) >= 40 && event.timeStamp - wheelTime.current > 140) {
        rotate(Math.sign(wheelDelta.current)); wheelDelta.current = 0; wheelTime.current = event.timeStamp;
      }
    };
    element.addEventListener("wheel", scroll, { passive: false });
    return () => element.removeEventListener("wheel", scroll);
  }, [mode, rotate]);

  const emotion = emotions[broad ?? wrapIndex(turn, emotions.length)];
  const openWheel = () => { if (tier === "list") setTier("low"); setMode("wheel"); };

  const toggle = capable ? <div className="segmented" role="group" aria-label="Choose how to browse feelings">
    <button type="button" className="chip" aria-pressed={mode === "wheel"} onClick={openWheel}>Wheel</button>
    <button type="button" className="chip" aria-pressed={mode === "list"} onClick={() => setMode("list")}>List</button>
  </div> : null;

  if (!emotion || mode === "list") return <div className="wheel-picker" data-decided={decided || undefined}>
    {/* Always rendered so its room exists at first paint; CSS shows it when data-wheel says the device can turn the wheel. */}
    <button key="peek" type="button" className="wheel-peek" onClick={openWheel}>
      <span className="wheel-peek-ring" aria-hidden="true">{emotions.map((item, index) => <i key={item.id} data-emotion={item.id} style={{ "--i": index } as CSSProperties} />)}</span>
      <span>Turn the constellation</span>
    </button>
    <div key="topbar" className="wheel-topbar"><h2 ref={listHeading} tabIndex={-1} className="caption">All feelings</h2>{toggle}</div>
    {children}
  </div>;

  const options = broad === null ? emotions : emotion.specifics;
  const selected = wrapIndex(turn, options.length);
  const choice = options[selected];
  const choose = (index: number) => { setBroad(index); setTurn(0); };

  return <div className="wheel-picker" data-emotion={emotion.id} data-dawning={dawning || undefined}>
    {/* Keys keep React from reusing the List's nodes as the stage, which would count as a layout shift. */}
    <div key="topbar" className="wheel-topbar">
      {broad === null ? <p id="wheel-help" className="wheel-help">Turn the dial, then press the center.</p>
        : <div className="wheel-context"><button type="button" className="back-link wheel-back" onClick={() => { returning.current = true; setBroad(null); setTurn(broad); }}>&#8592; All feelings</button><span className="heading-sm"><span className="emotion-dot" aria-hidden="true" /> {emotion.name}</span></div>}
      {toggle}
    </div>
    <div key="stage" className="wheel-stage">
      <div ref={dial} className={`wheel-dial${broad !== null ? " wheel-inner" : ""}`} onPointerDown={event => {
        if (event.target instanceof Element && event.target.closest("button, a")) return;
        drag.current = event.clientX; event.currentTarget.dataset.dragging = "true"; event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={event => {
        if (drag.current === null) return;
        const steps = Math.trunc((drag.current - event.clientX) / 34);
        if (steps) { rotate(steps); drag.current -= steps * 34; }
      }} onPointerUp={event => { drag.current = null; event.currentTarget.dataset.dragging = "false"; }} onPointerCancel={event => { drag.current = null; event.currentTarget.dataset.dragging = "false"; }}>
        {idle && <SceneRecovery onUnavailable={() => onTierChange("list")}><Scene order={emotions.map(item => item.id)} selected={broad ?? selected} inner={broad !== null} innerCount={emotion.specifics.length} intensity={intensity} dawning={dawning} rotation={-turn * Math.PI * 2 / options.length} tier={tier as RenderTier} onTierChange={onTierChange} /></SceneRecovery>}
        <div className="wheel-ring-labels" aria-hidden="true">{options.map((item, index) => {
          const angle = (index - selected) / options.length * Math.PI * 2;
          const radius = broad === null ? "var(--label-r-outer)" : "var(--label-r-inner)";
          return <span key={item.id} style={{ left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(calc(${Math.sin(angle).toFixed(4)} * ${radius}), calc(${(-Math.cos(angle)).toFixed(4)} * ${radius}))` }} data-selected={selected === index}>{item.name}</span>;
        })}</div>
        <div className="wheel-center" onKeyDown={event => {
          if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
            event.preventDefault(); rotate(event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1);
          }
        }}>
          {broad === null
            ? <button type="button" className="wheel-lock" aria-describedby="wheel-help" onClick={() => choose(selected)}>{choice.name}<span>Press to choose</span></button>
            : <FeelingLink dawn morph onChoose={gather} emotionId={emotion.id} specificId={choice.id} name={choice.name} intensity={kept} />}
        </div>
      </div>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{selected + 1} of {options.length}: {choice.name}</p>
    <ul className="wheel-options" aria-label={broad === null ? "Feelings" : `Feelings within ${emotion.name}`}>
      {broad === null
        ? emotions.map((option, index) => <li key={option.id}><button type="button" className={index === selected ? "chip is-current" : "chip"} onClick={() => choose(index)}>{option.name}</button></li>)
        : emotion.specifics.map(option => <li key={option.id}><FeelingLink dawn onChoose={gather} className={option.id === choice.id ? "chip is-current" : "chip"} emotionId={emotion.id} specificId={option.id} name={option.name} intensity={kept} /></li>)}
    </ul>
    {broad !== null && <>
      <fieldset className="wheel-intensity"><legend>How strong does it feel?</legend>
        {(["low", "medium", "high"] as const).map(value => <button key={value} type="button" className="chip" aria-pressed={intensity === value} onClick={() => { setIntensity(value); setIntensityChosen(true); }}>{value[0].toUpperCase() + value.slice(1)}</button>)}
      </fieldset>
      <p className="caption wheel-intensity-note">Intensity shapes the light. When you choose one, it is kept with this reflection in your journal.</p>
    </>}
  </div>;
}
