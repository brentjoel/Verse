// Preserve every source character, including newlines and nonbreaking spaces.
export function passageTokens(text: string): string[] {
  return text.split(/(\s+)/u).filter(Boolean);
}

export function wordDelay(index: number): number {
  return 600 + Math.max(0, index) * 260;
}

// One disposable run per visible verse. A skipped/cancelled run cannot accept
// late effects; the next verse always gets a fresh run with the full cadence.
export function createDawnRun() {
  let running = true;
  const effects = new Set<{ cancel(): void }>();
  return {
    get running() { return running; },
    add(effect: { cancel(): void }) {
      if (running) effects.add(effect);
      else effect.cancel();
    },
    cancel() {
      running = false;
      effects.forEach(effect => effect.cancel());
      effects.clear();
    },
  };
}

// One navigation intent in memory only. No verse text, persistence or URL fields.
let pendingPath: string | undefined;
export function prepareDawn(path: string): void { pendingPath = path; }
export function consumeDawn(path: string): boolean {
  const matches = pendingPath === path;
  pendingPath = undefined;
  return matches;
}

// One undo intent for the journal entry a feeling choice just created. Memory only.
let pendingUndo: { path: string; id: string } | undefined;
export function prepareUndo(path: string, moodId: string): void { pendingUndo = { path, id: moodId }; }
export function consumeUndo(path: string): string | undefined {
  const id = pendingUndo?.path === path ? pendingUndo.id : undefined;
  pendingUndo = undefined;
  return id;
}

// A small, stable star burst behind each reference: same reference, same sky.
export function burstStars(reference: string, count = 16): { x: number; y: number; delay: number; size: number }[] {
  let hash = 2166136261;
  for (const char of reference) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const next = () => { hash = Math.imul(hash ^ (hash >>> 13), 0x5bd1e995); hash ^= hash >>> 15; return (hash >>> 0) / 4294967296; };
  return Array.from({ length: count }, () => {
    const angle = next() * Math.PI * 2, spread = Math.sqrt(next());
    return {
      x: Math.round((50 + Math.cos(angle) * spread * 46) * 10) / 10,
      y: Math.round((50 + Math.sin(angle) * spread * 44) * 10) / 10,
      delay: Math.round(next() * 600),
      size: Math.round((2 + next() * 3) * 10) / 10,
    };
  });
}
