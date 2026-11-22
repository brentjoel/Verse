"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, ViewTransition } from "react";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import { prepareDawn, prepareUndo } from "@/lib/dawn";
import { feelingTitleName } from "@/lib/motion";
import type { Intensity } from "@/lib/storage-schema";

/** `intensity` is passed only when the visitor chose one on the wheel; it is kept with the reflection.
 * `morph` marks the one link per page whose title travels to Results (names must be unique on a page). */
export function FeelingLink({ emotionId, specificId, name, dawn = false, className = "emotion-link specific-link", intensity, morph = false, onChoose }: { emotionId: string; specificId: string; name: string; dawn?: boolean; className?: string; intensity?: Intensity; morph?: boolean; onChoose?: () => void }) {
  const snapshot = usePersonalStorage();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const href = `/emotions/${emotionId}/${specificId}`;
  const label = busy ? "Opening..." : name;
  return <>
    <Link href={href} className={className} aria-disabled={busy} onNavigate={event => {
      event.preventDefault();
      if (busy) return;
      onChoose?.();
      const go = () => { if (dawn) prepareDawn(href); router.push(href); };
      // Reaching the verses always wins: if the journal cannot record right now, go anyway without a note.
      if (!snapshot.ready) { go(); return; }
      setBusy(true);
      const id = crypto.randomUUID();
      void getPersonalStore().recordMood(emotionId, specificId, id, intensity).then(result => {
        if (result.ok) prepareUndo(href, id);
        go();
      }, go).finally(() => setBusy(false));
    }}>{morph ? <ViewTransition name={feelingTitleName(emotionId, specificId)} share="feeling-title" default="none"><span>{label}</span></ViewTransition> : label}<span aria-hidden="true">&#8594;</span></Link>
  </>;
}
