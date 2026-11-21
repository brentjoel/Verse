export function wrapIndex(index: number, count: number): number {
  return count > 0 ? ((Math.round(index) % count) + count) % count : 0;
}
