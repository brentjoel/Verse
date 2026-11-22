"use client";

import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPersonalStore, usePersonalStorage } from "@/lib/browser-storage";
import type { SavedVerse } from "@/lib/storage-schema";
import { StarBurst } from "@/components/star-burst";

export function SaveVerseButton(props: Omit<SavedVerse, "id" | "createdAt">) {
  const snapshot = usePersonalStorage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);
  const [burst, setBurst] = useState(0);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(false), 2000); return () => clearTimeout(timer); }, [notice]);
  const router = useRouter();
  const saved = snapshot.envelope.data.savedVerses.some(verse => verse.reference === props.reference && verse.translationId === props.translationId);
  async function save() {
    setBusy(true); setError("");
    const result = await getPersonalStore().save(props);
    if (!result.ok) setError(result.error);
    else { setNotice(true); setBurst(value => value + 1); }
    setBusy(false);
  }
  return <div className="save-control">
    <button type="button" className="compare-link save-button" data-saved={saved} data-tooltip={saved ? "View My Verses" : "Save"} disabled={!snapshot.ready || busy || (!saved && (snapshot.mode === "blocked" || snapshot.mode === "conflict"))} onClick={() => saved ? router.push("/my-verses") : void save()} aria-label={saved ? `Saved ${props.reference} ${props.translationId.toUpperCase()}. View My Verses` : `Save ${props.reference} ${props.translationId.toUpperCase()}`}>
      {burst > 0 && <StarBurst key={burst} />}<span key={`icon-${burst}`} className="burst-icon" data-pop={burst > 0 || undefined}><Bookmark size={17} aria-hidden="true" /></span>{saved ? "Saved" : !snapshot.ready ? "Opening..." : busy ? "Saving..." : "Save"}
    </button>
    {/* The label and the star burst show the save; screen readers hear it here. */}
    <span role="status" aria-live="polite" className="sr-only">{notice ? "Saved" : ""}</span>
    {error && <p className="local-error" role="alert">{error}</p>}
  </div>;
}
