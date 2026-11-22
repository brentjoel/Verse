"use client";

import { useId, useState, type ReactNode } from "react";
import { Ellipsis } from "lucide-react";

/** Secondary verse actions wait one tap away so the passage and its two main actions lead.
 * Without JavaScript the group is simply shown (CSS keys off data-js), so its links still work. */
export function MoreActions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <>
    <button type="button" className="compare-link more-toggle" aria-label="More actions" data-tooltip={open ? "Fewer actions" : "More actions"} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <Ellipsis size={20} aria-hidden="true" />
    </button>
    <div id={id} className="verse-more" data-open={open || undefined} role="group" aria-label="More actions">{children}</div>
  </>;
}
