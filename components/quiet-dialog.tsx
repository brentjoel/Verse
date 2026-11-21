"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { isShortcut, toShortcutEvent } from "@/lib/shortcuts";
import { X } from "lucide-react";

export function QuietDialog({ label, title, icon, className = "compare-link", onOpen, openKey, children }: {
  label: string; title: string; icon?: ReactNode; className?: string; onOpen?: () => void; openKey?: string; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => {
    if (!openKey) return;
    const open = (event: KeyboardEvent) => {
      if (!isShortcut(toShortcutEvent(event), openKey)) return;
      event.preventDefault(); dialog.current?.showModal(); onOpen?.();
    };
    addEventListener("keydown", open);
    return () => removeEventListener("keydown", open);
  }, [openKey, onOpen]);
  return <>
    <button type="button" className={className} data-tooltip={label} aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); onOpen?.(); }}>{icon}<span className="trigger-label">{label}</span></button>
    <dialog ref={dialog} className="quiet-dialog" aria-labelledby={heading} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
      }
    }}>
      <div className="dialog-heading"><h2 id={heading}>{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" data-tooltip="Close" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button></div>
      {children}
    </dialog>
  </>;
}
