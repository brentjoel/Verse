// Live engineering overlay helpers. The overlay is opt-in per page load (`?debug`) and stores nothing.

/** True only when the URL carries a `debug` flag that is bare, `1` or `true`. */
export function debugRequested(search: string): boolean {
  const value = new URLSearchParams(search).get("debug");
  return value !== null && (value === "" || value === "1" || value === "true");
}

/** Frames per second over a window of frame timestamps in ms, or null until there is enough to measure. */
export function fpsFromFrames(times: readonly number[]): number | null {
  if (times.length < 2) return null;
  const span = times[times.length - 1] - times[0];
  return span > 0 ? Math.round(((times.length - 1) / span) * 1000) : null;
}
