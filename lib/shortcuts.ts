export interface ShortcutEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  /** Tag name of the event target, upper case. */
  targetTag?: string;
  targetEditable?: boolean;
  /** True when the target sits inside an open dialog. */
  inOpenDialog?: boolean;
}

/** Whether a single-key shortcut may fire: never while typing, with a modifier, or over an open dialog. */
export function shortcutAllowed(event: ShortcutEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (event.targetEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.targetTag ?? "")) return false;
  return !event.inOpenDialog;
}

export function isShortcut(event: ShortcutEvent, key: string): boolean {
  return event.key.toLowerCase() === key.toLowerCase() && shortcutAllowed(event);
}

export function toShortcutEvent(event: KeyboardEvent): ShortcutEvent {
  const target = event.target instanceof Element ? event.target : null;
  return {
    key: event.key, ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey,
    targetTag: target?.tagName, targetEditable: target instanceof HTMLElement && target.isContentEditable,
    inOpenDialog: Boolean(target?.closest("dialog[open]")) || Boolean(document.querySelector("dialog[open]")),
  };
}

export const SHORTCUTS: readonly { keys: readonly string[]; does: string }[] = [
  { keys: ["?"], does: "Open this list" },
  { keys: ["F"], does: "Focus on the passage while reading a feeling's verses" },
  { keys: ["Esc"], does: "Leave Focus, or close a dialog" },
  { keys: ["←", "→"], does: "Move between verses, or turn the wheel" },
  { keys: ["↑", "↓"], does: "Turn the wheel" },
  { keys: ["Enter"], does: "Choose the highlighted feeling" },
];
