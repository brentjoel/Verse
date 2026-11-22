export type SkyPhase = "dawn" | "day" | "dusk" | "night";

/** The sky's mood for a local hour (0 to 23): dawn 5-8, day 8-17, dusk 17-20, night otherwise. */
export function skyPhase(hour: number): SkyPhase {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return "night";
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

