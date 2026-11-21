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

export function writeTextSize(size: TextSize): void {
  document.documentElement.dataset.textSize = size;
  try { if (size === "default") localStorage.removeItem(TEXT_SIZE_KEY); else localStorage.setItem(TEXT_SIZE_KEY, size); }
  catch { /* Size still applies for this visit. */ }
}
