"use client";

import { useEffect } from "react";
import { getPersonalStore } from "@/lib/browser-storage";
import { resolveTheme, storedBaseTheme } from "@/lib/theme";

// Keeps browser chrome color, the page-hidden flag and system theme following in sync.
export function ThemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    const syncChrome = () => {
      const color = root.dataset.theme === "light" ? "#f6f4f1" : root.dataset.theme === "bedtime" ? "#0d0805" : "#000000";
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => { meta.content = color; });
    };
    const visibility = () => { root.dataset.pageHidden = String(document.hidden); };
    const system = matchMedia("(prefers-color-scheme: light)");
    const followSystem = () => {
      if (root.dataset.themeSource !== "system") return;
      const theme = resolveTheme(null, system.matches);
      root.dataset.theme = theme;
      void getPersonalStore().setPreferences({ theme: storedBaseTheme(theme) });
    };
    const observer = new MutationObserver(syncChrome);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", visibility);
    system.addEventListener("change", followSystem);
    syncChrome(); visibility();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); system.removeEventListener("change", followSystem); };
  }, []);
  return null;
}
