"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { consumeUndo } from "@/lib/dawn";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";

const noop = () => () => {};

type State = { kind: "noted"; id: string } | { kind: "removed" } | { kind: "error"; message: string } | null;

// "Noted in your journal · Undo" after a feeling choice. Visible 6 seconds, paused while hovered or focused.
export function UndoToast({ path }: { path: string }) {
  const storage = usePersonalStorage();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [state, setState] = useState<State>(null);
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const id = consumeUndo(path);
    if (id) queueMicrotask(() => setState({ kind: "noted", id }));
  }, [path]);

  useEffect(() => {
    if (!state || paused) return;
    const timer = window.setTimeout(() => setState(null), state.kind === "noted" ? 7200 : 3500);
    return () => clearTimeout(timer);
  }, [state, paused]);

  async function undo(id: string) {
    if (done.current || busy) return;
    setBusy(true);
    const result = await getPersonalStore().removeMood(id);
    setBusy(false);
    if (result.ok) {
      done.current = true;
      setPaused(false);
      setState({ kind: "removed" });
      // The Undo button is gone; keep keyboard focus inside the page.
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
    else setState({ kind: "error", message: result.error });
  }

  const conflict = storage.mode === "conflict";
  // Portaled to body: the animated main column would otherwise trap the fixed toast under the tab bar.
  if (!mounted) return null;
  return createPortal(<div className="toast-region" role="status" aria-live="polite" onPointerEnter={event => { if (event.pointerType === "mouse") setPaused(true); }} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    {state?.kind === "noted" && <div className="toast toast-after-dawn">
      <span>{conflict ? "Your journal is open in another tab" : "Noted in your journal"}</span>
      <button type="button" className="compare-link" disabled={busy || conflict} onClick={() => void undo(state.id)}>Undo</button>
    </div>}
    {state?.kind === "removed" && <div className="toast"><span>Removed from your journal</span></div>}
    {state?.kind === "error" && <div className="toast"><span>{state.message}</span></div>}
  </div>, document.body);
}
