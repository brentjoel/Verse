export type ThemeName = "dark" | "light" | "bedtime";
export type ThemeChoice = ThemeName | "system";
export type TextSize = "default" | "large" | "larger";

export const THEME_KEY = "verselight-theme";
export const TEXT_SIZE_KEY = "verselight-text-size";

export function resolveTheme(preference: string | null | undefined, systemLight: boolean): ThemeName {
  return preference === "light" || preference === "dark" || preference === "bedtime" ? preference : systemLight ? "light" : "dark";
}

// The personal-data schema only knows dark and light, so Bedtime is stored there as dark.
export function storedBaseTheme(theme: string | null | undefined): "dark" | "light" {
  return theme === "light" ? "light" : "dark";
}

export function resolveTextSize(value: string | null | undefined): TextSize {
  return value === "large" || value === "larger" ? value : "default";
}

export function applyThemeChoice(choice: ThemeChoice, systemLight: boolean): { theme: ThemeName; source: "stored" | "system" } {
  return choice === "system" ? { theme: resolveTheme(null, systemLight), source: "system" } : { theme: choice, source: "stored" };
}

// Shared pre-paint resolution; explicit choices win over the system preference.
// Also marks that JavaScript runs, so no-JS fallbacks can hide themselves.
export const themeScript = `(function(){var d=document.documentElement.dataset,t=null,s=null;try{t=localStorage.getItem('${THEME_KEY}');s=localStorage.getItem('${TEXT_SIZE_KEY}')}catch(e){}d.theme=(${resolveTheme.toString()})(t,matchMedia('(prefers-color-scheme: light)').matches);d.themeSource=t==='light'||t==='dark'||t==='bedtime'?'stored':'system';d.textSize=(${resolveTextSize.toString()})(s);d.js='true'})();`;
