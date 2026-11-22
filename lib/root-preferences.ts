"use client";

import { TEXT_SIZE_KEY, THEME_KEY, type TextSize, type ThemeName } from "./theme";

// DOM and storage writes for presentation preferences live outside components.
export function writeTheme(theme: ThemeName, source: "stored" | "system"): void {
  const root = document.documentElement;
  root.dataset.themeSource = source;
  root.dataset.theme = theme;
  try { if (source === "system") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, theme); }
  catch { /* Theme still applies for this visit. */ }
}

/** Runs a theme write inside a view transition so the page crossfades (CSS keys off data-theme-shift).
 * Skipped for reduced motion, unsupported browsers, a hidden page, or when the theme does not change. */
export function crossfadeTheme(theme: ThemeName, write: () => void): void {
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || document.hidden || root.dataset.theme === theme || typeof document.startViewTransition !== "function" || root.dataset.themeShift) { write(); return; }
  root.dataset.themeShift = "true";
  try {
    document.startViewTransition(write).finished.finally(() => { delete root.dataset.themeShift; });
  } catch { delete root.dataset.themeShift; write(); }
}

export function writeTextSize(size: TextSize): void {
  document.documentElement.dataset.textSize = size;
  try { if (size === "default") localStorage.removeItem(TEXT_SIZE_KEY); else localStorage.setItem(TEXT_SIZE_KEY, size); }
  catch { /* Size still applies for this visit. */ }
}
