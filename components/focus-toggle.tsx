"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isShortcut, toShortcutEvent } from "@/lib/shortcuts";

// Focus reading hides everything but the passage, its attribution and the pager. Transient: never stored.
export function FocusToggle() {
  const [focus, setFocus] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!focus) { delete root.dataset.focus; return; }
    root.dataset.focus = "true";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setFocus(false); };
    addEventListener("keydown", escape);
    return () => { removeEventListener("keydown", escape); delete root.dataset.focus; };
  }, [focus]);

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (!isShortcut(toShortcutEvent(event), "f")) return;
      setFocus(value => !value);
    };
    addEventListener("keydown", toggle);
    return () => removeEventListener("keydown", toggle);
  }, []);

  return <button ref={button} type="button" className="compare-link focus-toggle" aria-pressed={focus} onClick={() => { setFocus(value => !value); requestAnimationFrame(() => button.current?.focus({ preventScroll: true })); }}>
    {focus ? <Minimize2 size={17} aria-hidden="true" /> : <Maximize2 size={17} aria-hidden="true" />}
    {focus ? "Exit focus" : "Focus"}
  </button>;
}
