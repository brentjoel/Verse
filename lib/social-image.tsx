import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";
import { brandFont } from "@/lib/brand-font";
import { emotionHues } from "@/lib/constellation";

const hues = ["#2dd4bf", "#4f8cff", "#ff5a5f", "#a78bfa", "#22d3ee", "#facc15", "#ffb829", "#f472b6"];

/** Brand copy only: the feeling's name and description, never Scripture. */
export async function socialImage(feeling?: { id: string; name: string; description: string }) {
  const hue = feeling ? emotionHues[feeling.id]?.night : undefined;
  const dots = hue ? Array.from({ length: 112 }, () => hue) : hues.flatMap((h) => Array.from({ length: 14 }, () => h));
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", background: hue ? `radial-gradient(ellipse at 50% 50%, ${hue}33 0%, #000000 62%)` : "#000000", color: "#ffffff", fontFamily: "sans-serif", position: "relative" }}>
      {dots.map((color, n) => {
        const sector = Math.floor(n / 14), index = n % 14;
        const angle = (sector + index / 14 * .82) / 8 * Math.PI * 2, radius = 250 + (index * 29 % 9) * 6;
        return <div key={n} style={{ display: "flex", position: "absolute", left: 600 + Math.sin(angle) * radius, top: 315 - Math.cos(angle) * radius, width: 4 + index % 3, height: 4 + index % 3, borderRadius: 99, background: color, opacity: .45 + (index % 4) * .15 }} />;
      })}
      <div style={{ display: "flex", marginBottom: 28 }}><BrandMark size={96} /></div>
      <div style={{ display: "flex", fontSize: 96, letterSpacing: -4, color: hue ?? "#ffffff" }}>{feeling ? feeling.name : "Selah Sky"}</div>
      <div style={{ display: "flex", fontSize: 30, color: "#bdbdbd", marginTop: 20 }}>{feeling ? `${feeling.description}.` : "A little light for wherever you are."}</div>
      {feeling && <div style={{ display: "flex", fontSize: 24, color: "#8a8a8a", marginTop: 18 }}>Selah Sky</div>}
    </div>,
    { width: 1200, height: 630, fonts: [await brandFont()] },
  );
}
