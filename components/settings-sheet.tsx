"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { Settings2, X } from "lucide-react";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { applyThemeChoice, resolveTextSize, resolveTheme, storedBaseTheme, type TextSize, type ThemeChoice } from "@/lib/theme";
import { crossfadeTheme, writeTextSize, writeTheme } from "@/lib/root-preferences";
import { readTranslationCookie, setTranslationCookie } from "@/lib/translation-client";
import { translations, type TranslationId } from "@/lib/translations";

const themes: { id: ThemeChoice; label: string }[] = [{ id: "dark", label: "Night" }, { id: "light", label: "Daylight" }, { id: "bedtime", label: "Bedtime" }, { id: "system", label: "System" }];
const sizes: { id: TextSize; label: string }[] = [{ id: "default", label: "Default" }, { id: "large", label: "Large" }, { id: "larger", label: "Larger" }];

export function SettingsSheet() {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const storage = usePersonalStorage();
  const [translation, setTranslation] = useState<TranslationId>("nlt");
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [size, setSize] = useState<TextSize>("default");

  function open() {
    const root = document.documentElement;
    // Settle the chips before the sheet appears, so only the sheet moves while it opens.
    flushSync(() => {
      setTranslation(readTranslationCookie());
      setTheme(root.dataset.themeSource === "stored" ? resolveTheme(root.dataset.theme, false) : "system");
      setSize(resolveTextSize(root.dataset.textSize));
    });
    dialog.current?.showModal();
  }
  function chooseTranslation(id: TranslationId) {
    setTranslation(id);
    setTranslationCookie(id);
    if (storage.ready) void getPersonalStore().setPreferences({ preferredTranslation: id });
    router.refresh();
  }
  function chooseTheme(choice: ThemeChoice) {
    const next = applyThemeChoice(choice, matchMedia("(prefers-color-scheme: light)").matches);
    setTheme(choice);
    // Like the sky changing: one slow crossfade between themes. Reduced motion switches at once.
    crossfadeTheme(next.theme, () => writeTheme(next.theme, next.source));
    if (storage.ready) void getPersonalStore().setPreferences({ theme: storedBaseTheme(next.theme) });
  }
  function chooseSize(next: TextSize) {
    setSize(next);
    writeTextSize(next);
  }

  return <>
    <button type="button" className="icon-button" aria-label="Settings" data-tooltip="Settings" aria-haspopup="dialog" onClick={open}><Settings2 size={20} strokeWidth={1.5} aria-hidden="true" /></button>
    <dialog ref={dialog} className="sheet" aria-labelledby="settings-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="dialog-heading"><h2 id="settings-title">Settings</h2><button type="button" className="icon-button" aria-label="Close settings" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button></div>
      <section className="sheet-group" aria-labelledby="settings-translation">
        <h3 id="settings-translation">Translation</h3>
        <div className="chip-row" role="group" aria-labelledby="settings-translation">
          {translations.map(item => <button key={item.id} type="button" className="chip" aria-pressed={translation === item.id} title={item.fullName} onClick={() => chooseTranslation(item.id)}>{item.shortName}</button>)}
          <button type="button" className="chip" disabled aria-disabled="true">NIV · Coming soon</button>
        </div>
        <p className="caption" style={{ marginTop: 12 }}>Verses use this translation where it is available. WEB is shown, with a note, when NLT cannot load.</p>
      </section>
      <section className="sheet-group" aria-labelledby="settings-theme">
        <h3 id="settings-theme">Theme</h3>
        <div className="segmented" role="group" aria-labelledby="settings-theme">
          {themes.map(item => <button key={item.id} type="button" className="chip" aria-pressed={theme === item.id} onClick={() => chooseTheme(item.id)}>{item.label}</button>)}
        </div>
        <p className="caption" style={{ marginTop: 12 }}>Bedtime is dimmer and warmer, with less blue light, for reading in a dark room.</p>
      </section>
      <section className="sheet-group" aria-labelledby="settings-size">
        <h3 id="settings-size">Text size</h3>
        <div className="segmented" role="group" aria-labelledby="settings-size">
          {sizes.map(item => <button key={item.id} type="button" className="chip" aria-pressed={size === item.id} onClick={() => chooseSize(item.id)}>{item.label}</button>)}
        </div>
        <p className="caption" style={{ marginTop: 12 }}>Changes Scripture and reading text on this device.</p>
      </section>
    </dialog>
  </>;
}
