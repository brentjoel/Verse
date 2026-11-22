"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import type { NightSky } from "@/lib/night-sky";
import { emotionHues } from "@/lib/constellation";
import { planSkyCard, wrapText, SKY_CARD } from "@/lib/sky-card";
import type { GraceVerse } from "@/components/night-sky";

// Draws this month's sky and a public-domain WEB verse to a PNG, entirely in the browser.
// Nothing is uploaded; the card holds shapes and colors only, never notes.
async function drawCard(sky: NightSky, month: string, verse: GraceVerse): Promise<Blob> {
  const { width, pad } = SKY_CARD;
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-lora").trim();
  const serif = `${family ? `${family}, ` : ""}Georgia, serif`;
  try { await document.fonts.load(`32px ${serif}`); } catch { /* falls back to Georgia */ }
  const canvas = document.createElement("canvas");
  // Measure first so a long verse grows the card instead of crowding the footer.
  const probe = canvas.getContext("2d");
  if (probe) probe.font = `34px ${serif}`;
  const verseLines = wrapText(verse.text, width - pad * 2, text => probe?.measureText(text).width ?? text.length * 16);
  const verseTop = SKY_CARD.skyTop + SKY_CARD.skyHeight + 90;
  const height = Math.max(SKY_CARD.height, verseTop + verseLines.length * 50 + 150);
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width / 2, 300, 20, width / 2, 400, 700);
  glow.addColorStop(0, "rgba(139,92,246,0.22)"); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff"; ctx.textBaseline = "alphabetic";
  ctx.font = `54px ${serif}`; ctx.fillText(month, pad, 100);
  const { stars, lines } = planSkyCard(sky);
  ctx.lineCap = "round"; ctx.lineWidth = 2;
  for (const line of lines) {
    ctx.strokeStyle = line.grace ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.6)";
    ctx.setLineDash(line.grace ? [6, 10] : []);
    ctx.beginPath(); ctx.moveTo(line.x1, line.y1); ctx.lineTo(line.x2, line.y2); ctx.stroke();
  }
  ctx.setLineDash([]);
  for (const star of stars) {
    const hue = (star.emotionId && emotionHues[star.emotionId]?.night) || "#ffffff";
    ctx.shadowColor = hue; ctx.shadowBlur = star.r * 3; ctx.fillStyle = hue;
    ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#e6e6e6"; ctx.font = `34px ${serif}`;
  let y = verseTop;
  for (const line of verseLines) { ctx.fillText(line, pad, y); y += 50; }
  ctx.fillStyle = "#bdbdbd"; ctx.font = `26px ${serif}`;
  ctx.fillText(`${verse.reference} (World English Bible, public domain)`, pad, y + 20);
  ctx.fillStyle = "#8a8a8a"; ctx.fillText("Selah Sky", pad, height - 50);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("No image.")), "image/png"));
}

export function SkyCardButton({ sky, month, verse }: { sky: NightSky; month: string; verse: GraceVerse }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save() {
    setBusy(true); setMessage("");
    try {
      const blob = await drawCard(sky, month, verse);
      const name = `verselight-sky-${month.replace(/\s+/g, "-").toLowerCase()}.png`;
      const file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `Selah Sky, ${month}` }); setMessage("Shared."); }
      else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = name;
        document.body.append(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        setMessage("Your sky card is downloaded. It is made on your device and shows no notes.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setMessage("The card could not be made. Please try again.");
    } finally { setBusy(false); }
  }
  return <div className="sky-card-action">
    <button type="button" className="quiet-link" onClick={save} disabled={busy}><ImageDown size={16} aria-hidden="true" /> Save this sky as a card</button>
    <span role="status" className="caption">{message}</span>
  </div>;
}
