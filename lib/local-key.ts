"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Small personal records that live outside the main storage envelope (schema 1), one localStorage key each.
 * Values are untrusted: this hook only parses JSON; each feature validates the result with a pure function.
 */
const SERVER = "\u0000server";
const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function readRaw(key: string): string {
  try { return localStorage.getItem(key) ?? memory.get(key) ?? ""; } catch { return memory.get(key) ?? ""; }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

export function useLocalKey(key: string): { ready: boolean; raw: unknown; set: (value: unknown) => void } {
  const text = useSyncExternalStore(subscribe, () => readRaw(key), () => SERVER);
  const raw = useMemo(() => {
    if (text === SERVER || !text) return undefined;
    try { return JSON.parse(text) as unknown; } catch { return undefined; }
  }, [text]);
  const set = useCallback((value: unknown) => {
    const next = value === undefined || value === null ? "" : JSON.stringify(value);
    if (next) memory.set(key, next); else memory.delete(key);
    try { if (next) localStorage.setItem(key, next); else localStorage.removeItem(key); } catch { /* Kept in memory for this tab. */ }
    listeners.forEach(listener => listener());
  }, [key]);
  return { ready: text !== SERVER, raw, set };
}
