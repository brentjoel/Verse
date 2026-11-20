"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { translations, type TranslationId } from "@/lib/translations";

// Live translation chips. Builds the same query the no-JS GET form submits.
export function CompareToggles({ reference, from, selected }: { reference: string; from?: string; selected: readonly TranslationId[] }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<TranslationId[]>([...selected]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(id: TranslationId) {
    const next = chosen.includes(id) ? chosen.filter(item => item !== id) : [...chosen, id];
    if (next.length < 2) { setMessage("Keep at least two translations to compare."); return; }
    if (next.length > 4) { setMessage("Compare up to four translations at a time."); return; }
    setMessage("");
    setChosen(next);
    const query = new URLSearchParams({ submitted: "1", ref: reference });
    if (from) query.set("from", from);
    next.forEach(item => query.append("translations", item));
    startTransition(() => router.replace(`/compare?${query}`, { scroll: false }));
  }

  return <div className="compare-toggles js-only" aria-busy={pending}>
    <div className="chip-row" role="group" aria-label="Translations to compare">
      {translations.map(item => <button key={item.id} type="button" className="chip" aria-pressed={chosen.includes(item.id)} title={item.fullName} onClick={() => toggle(item.id)}>{item.shortName}</button>)}
      <button type="button" className="chip" disabled>NIV · Coming soon</button>
    </div>
    <p className="caption" role="status" aria-live="polite">{message || (pending ? "Updating..." : "Choose two to four.")}</p>
  </div>;
}
