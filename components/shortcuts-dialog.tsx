"use client";

import { QuietDialog } from "@/components/quiet-dialog";
import { SHORTCUTS } from "@/lib/shortcuts";

// Press ? anywhere (outside a text field) or use the footer link.
export function ShortcutsDialog() {
  return <QuietDialog label="Keyboard shortcuts" title="Keyboard shortcuts" className="shortcuts-trigger" openKey="?">
    <dl className="shortcut-list">
      {SHORTCUTS.map(item => <div key={item.does}><dt>{item.keys.map(key => <kbd key={key}>{key}</kbd>)}</dt><dd>{item.does}</dd></div>)}
    </dl>
  </QuietDialog>;
}
