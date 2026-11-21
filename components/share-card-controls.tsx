"use client";

import { Share2 } from "lucide-react";
import { QuietDialog } from "@/components/quiet-dialog";
import { useEffect, useRef, useState } from "react";

export function ShareCardControls({ reference }: { reference: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [preview, setPreview] = useState<string>();
  const card = useRef<Promise<Blob> | null>(null);
  const url = `/share?${new URLSearchParams({ ref: reference, translation: "web" })}`;
  const fileName = `verselight-${reference.replace(/[^a-z0-9]+/gi, "-")}-web.png`;

  // One fetch per dialog: only the public reference and fixed translation leave the browser, without cookies.
  function loadCard(): Promise<Blob> {
    card.current ??= fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", signal: AbortSignal.timeout(20_000) })
      .then(async response => {
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error("Card unavailable.");
        return response.blob();
      })
      .catch(error => { card.current = null; throw error; });
    return card.current;
  }

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function open() {
    if (preview) return;
    loadCard().then(blob => setPreview(URL.createObjectURL(blob))).catch(() => setMessage("The preview could not load. You can still try to download the card."));
  }

  async function deliver(mode: "share" | "download") {
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const blob = await loadCard();
      const file = new File([blob], fileName, { type: "image/png" });
      if (mode === "share" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: reference });
        setMessage("Shared.");
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl; link.download = fileName;
        document.body.append(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        setMessage(mode === "share" ? "Sharing is not available here, so the card was downloaded instead." : "Your card is downloaded. Share it wherever you like.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError" && mode === "share") { setMessage(""); return; }
      setFailed(true); setMessage("The card could not be prepared. Try again, or open the card in a new tab and save the image.");
    } finally { setBusy(false); }
  }

  return <QuietDialog label="Share" title="Share a little light" icon={<Share2 size={17} aria-hidden="true" />} onOpen={open}><div className="share-controls">
    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview; next/image cannot optimize object URLs */}
    {preview ? <img className="share-preview" src={preview} alt={`Preview of the World English Bible card for ${reference}`} /> : <div className="share-preview share-preview-loading" role="status">Preparing your card...</div>}
    <p className="caption">Public-domain text only. Cards use WEB (World English Bible), even when you read another translation.</p>
    <div className="local-actions">
      <button className="pill" type="button" disabled={busy} onClick={() => void deliver("share")}>{busy ? "Preparing..." : "Share card"}</button>
      <button className="compare-link" type="button" disabled={busy} onClick={() => void deliver("download")}>Download</button>
      <a className="quiet-link" href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open in a new tab</a>
    </div>
    <p className="caption" role={failed ? "alert" : "status"}>{message}</p>
  </div></QuietDialog>;
}
