import { ImageResponse } from "next/og";
import { cacheLife } from "next/cache";
import web from "@/data/verses/web.json";
import { parseShareReference, shareCardHeight } from "@/lib/share-card";
import { BrandMark } from "@/components/brand-mark";
import { brandFont } from "@/lib/brand-font";
import emotions from "@/data/emotions.json";
import { emotionHues } from "@/lib/constellation";

// The card glows in the hue of the first feeling that lists this passage; amber for the daily verse.
function emotionHue(reference: string): string {
  const owner = emotions.find(emotion => emotion.specifics.some(specific => specific.references.includes(reference)));
  return (owner && emotionHues[owner.id]?.night) ?? "#ffb829";
}

const verses: Readonly<Record<string, string>> = web;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };

// Only a validated canonical reference enters this cache, never request metadata.
// WEB is public domain. Never import a licensed provider here.
async function renderCard(reference: string) {
  "use cache";
  cacheLife("max");
  const text = verses[reference];
  if (!text?.trim()) throw new Error("Passage unavailable.");
  const hue = emotionHue(reference);
  const ring = Array.from({ length: 64 }, (_, index) => {
    const angle = index / 64 * Math.PI * 2, wobble = (index * 37 % 11) / 11;
    return { x: 110 + Math.sin(angle) * (78 + wobble * 18), y: 110 - Math.cos(angle) * (78 + wobble * 18), size: 3 + (index * 53 % 7) * .6, alpha: .35 + wobble * .65 };
  });
  const image = new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, background: "#000000", color: "#ffffff", fontFamily: "Lora", position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", top: -36, right: -36, width: 220, height: 220 }}>
        {ring.map((dot, index) => <div key={index} style={{ display: "flex", position: "absolute", left: dot.x, top: dot.y, width: dot.size, height: dot.size, borderRadius: 99, background: hue, opacity: dot.alpha }} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontFamily: "sans-serif", color: "#ffffff" }}><BrandMark size={40} />Selah Sky</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 40, marginBottom: 40 }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#ffb829", fontFamily: "sans-serif", marginBottom: 28 }}>{reference.toUpperCase()}</div>
        <div style={{ display: "flex", fontSize: 40, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{text}</div>
      </div>
      <div style={{ display: "flex", fontSize: 20, color: "#9a9a9a", fontFamily: "sans-serif" }}>World English Bible · Public domain · eBible.org</div>
    </div>,
    { width: 1200, height: shareCardHeight(text), fonts: [await brandFont()] },
  );
  // Cache bytes after rendering completes, so failures reach GET's safe error.
  return new Uint8Array(await image.arrayBuffer());
}

export async function GET(request: Request) {
  const reference = parseShareReference(new URL(request.url).searchParams, Object.keys(verses));
  if (!reference) return new Response("Choose a known reference and WEB translation. Return to Selah Sky to try again.", { status: 400, headers });
  try {
    return new Response(await renderCard(reference), { headers: {
      ...headers, "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
    } });
  } catch {
    return new Response("The card could not be prepared. Please return to Selah Sky and try again.", { status: 503, headers });
  }
}
