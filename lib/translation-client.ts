"use client";

import { resolveTranslation, type TranslationId } from "./translations";

// The translation cookie is the one documented preference sent to the server.
export function readTranslationCookie(): TranslationId {
  try {
    return resolveTranslation(document.cookie.split("; ").find(value => value.startsWith("translation="))?.slice("translation=".length));
  } catch { return resolveTranslation(undefined); }
}

export function setTranslationCookie(id: TranslationId): void {
  try { document.cookie = `translation=${id}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
  catch { /* Cookie access can be blocked by browser privacy settings. */ }
  window.dispatchEvent(new Event("translation-change"));
}
