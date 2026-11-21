/* Verselight offline reading. Caches the app shell and public-domain pages only.
 * Never caches Results (/emotions/<feeling>/<sub>), Compare or Share, which can carry NLT text.
 * No notifications, no push, no analytics. */
"use strict";

const CACHE = "verselight-v1";
const PAGES = ["/", "/journal", "/my-verses", "/breathe", "/not-sure", "/about", "/licenses", "/craft", "/accessibility", "/offline"];
const ICONS = ["/icon-192.png", "/icon-512.png", "/icon.svg", "/apple-icon.png", "/favicon.ico"];

/** "page" may be cached as HTML, "asset" is immutable build output, "never" must never touch the cache. */
function classify(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (PAGES.includes(path)) return "page";
  if (/^\/emotions\/[a-z-]+$/.test(path)) return "page"; // the feeling index lists feelings, no verse text
  if (/^\/path\/[a-z-]+\/[a-z-]+$/.test(path)) return "page"; // seven-day paths use public-domain WEB text only
  if (path.startsWith("/_next/static/") || ICONS.includes(path)) return "asset";
  return "never";
}

function assetUrls(html) {
  return [...new Set(html.match(/\/_next\/static\/[^"'\s)<>\\]+/g) || [])];
}

if (typeof module !== "undefined") module.exports = { classify, assetUrls, PAGES };

if (typeof self !== "undefined" && typeof self.addEventListener === "function" && typeof caches !== "undefined") {
  self.addEventListener("install", event => {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const assets = new Set(ICONS);
      for (const page of PAGES) {
        try {
          const response = await fetch(page, { cache: "reload" });
          if (!response.ok || response.redirected) continue;
          const copy = response.clone();
          await cache.put(page, response);
          assetUrls(await copy.text()).forEach(url => assets.add(url));
        } catch { /* An unreachable page is simply not available offline. */ }
      }
      await Promise.all([...assets].map(url => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })());
  });

  self.addEventListener("activate", event => {
    event.waitUntil((async () => {
      for (const key of await caches.keys()) if (key.startsWith("verselight-") && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })());
  });

  self.addEventListener("fetch", event => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin) return;
    const kind = classify(url.pathname);
    if (request.mode === "navigate") {
      event.respondWith((async () => {
        try {
          const response = await fetch(request);
          if (kind === "page" && !url.search && response.ok && !response.redirected) (await caches.open(CACHE)).put(url.pathname, response.clone());
          return response;
        } catch {
          if (kind === "page") { const hit = await caches.match(url.pathname); if (hit) return hit; }
          // Anything else (Results, Compare) is not stored; point to the offline reader with the feeling it asked for.
          const target = new URL("/offline", url.origin);
          if (kind === "never") target.searchParams.set("to", url.pathname);
          return Response.redirect(target.href, 302);
        }
      })());
    } else if (kind === "asset") {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(url.pathname);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(url.pathname, response.clone());
        return response;
      })());
    }
  });
}
