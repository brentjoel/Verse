import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";
import { brandFont } from "@/lib/brand-font";

export async function socialImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "#000000", color: "#ffffff", fontFamily: "sans-serif", position: "relative" }}>
      {["#2dd4bf", "#4f8cff", "#ff5a5f", "#a78bfa", "#22d3ee", "#facc15", "#ffb829", "#f472b6"].flatMap((hue, sector) => Array.from({ length: 14 }, (_, index) => {
        const angle = (sector + index / 14 * .82) / 8 * Math.PI * 2, radius = 250 + (index * 29 % 9) * 6;
        return <div key={`${sector}-${index}`} style={{ display: "flex", position: "absolute", left: 600 + Math.sin(angle) * radius, top: 315 - Math.cos(angle) * radius, width: 4 + index % 3, height: 4 + index % 3, borderRadius: 99, background: hue, opacity: .45 + (index % 4) * .15 }} />;
      }))}
      <div style={{ display: "flex", marginBottom: 28 }}><BrandMark size={96} /></div>
      <div style={{ display: "flex", fontSize: 96, letterSpacing: -4 }}>Verselight</div>
      <div style={{ display: "flex", fontSize: 30, color: "#bdbdbd", marginTop: 20 }}>A little light for wherever you are.</div>
    </div>,
    { width: 1200, height: 630, fonts: [await brandFont()] },
  );
}
