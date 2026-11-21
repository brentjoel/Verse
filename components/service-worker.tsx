"use client";

import { useEffect } from "react";

/** Registers the offline reader in production. It caches app pages and public-domain data only; see public/sw.js. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => { /* Offline reading is optional. */ });
  }, []);
  return null;
}
