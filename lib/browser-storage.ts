"use client";

import { useSyncExternalStore } from "react";
import { PersonalStore, serverStorageSnapshot } from "./storage";
import { LEGACY_KEYS, type LegacyValues } from "./storage-migrations";
import { STORAGE_KEY, type Preferences } from "./storage-schema";
import { resolveTranslation } from "./translations";
import { setTranslationCookie } from "./translation-client";
import { THEME_KEY, storedBaseTheme } from "./theme";

let store: PersonalStore | undefined;
let connected = false;
export function readBrowserPreferences(): Partial<Preferences> {
  const preferences: Partial<Preferences> = {};
  try {
    const cookie = document.cookie.split("; ").find(value => value.startsWith("translation="))?.slice(12);
    preferences.preferredTranslation = resolveTranslation(cookie);
  } catch { /* Preferences still work in memory when cookies are unavailable. */ }
  preferences.theme = storedBaseTheme(document.documentElement.dataset.theme);
  return preferences;
}
export function applyBrowserPreferences(preferences: Preferences) {
  const previous = readBrowserPreferences();
  if (previous.theme !== preferences.theme) document.documentElement.dataset.themeSource = "stored";
  // Bedtime is stored as dark; do not let the stored value undo it.
  if (!(document.documentElement.dataset.theme === "bedtime" && preferences.theme === "dark")) document.documentElement.dataset.theme = preferences.theme;
  try {
    if (document.documentElement.dataset.themeSource !== "system") localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme === "bedtime" ? "bedtime" : preferences.theme);
  } catch { /* The in-memory theme still works. */ }
  if (previous.preferredTranslation !== preferences.preferredTranslation) setTranslationCookie(preferences.preferredTranslation);
}
export function getPersonalStore() {
  if (!store) store = new PersonalStore({
    read: () => localStorage.getItem(STORAGE_KEY),
    write: value => localStorage.setItem(STORAGE_KEY, value),
    exclusive: async work => navigator.locks ? navigator.locks.request(STORAGE_KEY, work) : work(),
  }, applyBrowserPreferences);
  return store;
}
function connect() {
  const current = getPersonalStore();
  if (connected) return;
  connected = true;
  current.initialize(readBrowserPreferences());
  current.refreshProgress();
  adoptLegacyKeys(current);
  window.setInterval(() => current.refreshProgress(), 60000);
  if (current.getSnapshot().mode !== "blocked") applyBrowserPreferences(current.getSnapshot().envelope.data.preferences);
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY || event.key === null) current.checkExternal();
  });
  window.addEventListener("focus", () => {
    current.checkExternal();
    current.refreshProgress();
    const snapshot = current.getSnapshot();
    const preferences = readBrowserPreferences();
    if (snapshot.mode === "persistent" && preferences.preferredTranslation !== snapshot.envelope.data.preferences.preferredTranslation) void current.setPreferences(preferences);
  });
}
/** One-time move of the old separate keys into the main record; each key is removed only after it is saved. */
function adoptLegacyKeys(current: PersonalStore) {
  const legacy: LegacyValues = {};
  try { for (const key of LEGACY_KEYS) legacy[key] = localStorage.getItem(key); } catch { return; }
  if (!Object.values(legacy).some(value => value !== null)) return;
  void current.adoptLegacy(legacy).then(clear => {
    try { for (const key of clear) localStorage.removeItem(key); } catch { /* Kept; folding again is harmless. */ }
  });
}
function subscribe(listener: () => void) {
  const unsubscribe = getPersonalStore().subscribe(listener);
  connect();
  return unsubscribe;
}
export function usePersonalStorage() {
  return useSyncExternalStore(subscribe, () => getPersonalStore().getSnapshot(), () => serverStorageSnapshot);
}
export function reloadPersonalStorage() {
  const current = getPersonalStore();
  current.reload(readBrowserPreferences());
  if (current.getSnapshot().mode !== "blocked") applyBrowserPreferences(current.getSnapshot().envelope.data.preferences);
}
/** Anchor, letters, path and marks from the main record. Not ready while loading or when the data is blocked. */
export function useCompanion() {
  const snapshot = usePersonalStorage();
  const { anchor, letters, path, marks } = snapshot.envelope.data;
  return { ready: snapshot.ready && snapshot.mode !== "blocked", anchor, letters, path, marks, set: getPersonalStore().setCompanion.bind(getPersonalStore()) };
}
