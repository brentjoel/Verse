"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Constellation } from "@/components/constellation";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <SiteShell>
      <div className="state-panel" role="alert">
        <Constellation />
        <h1>A little pause.</h1>
        <p className="lede">This page could not open just now. Take a breath, then try again when you are ready.</p>
        <div className="local-actions">
          <button type="button" onClick={() => retry()} className="pill">Try again</button>
          <Link href="/" className="compare-link">Return to all feelings</Link>
        </div>
      </div>
    </SiteShell>
  );
}
