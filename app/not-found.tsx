import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Constellation } from "@/components/constellation";

export const metadata = { title: "Find your way back | Verselight", description: "This page is resting out of sight. Return to Verselight and choose a feeling." };

export default function NotFound() {
  return (
    <SiteShell>
      <div className="state-panel">
        <Constellation />
        <h1>Let us find your way back.</h1>
        <p className="lede">We could not find this page or feeling. There is still room for whatever you are carrying today.</p>
        <Link href="/" className="pill">Return to all feelings</Link>
      </div>
    </SiteShell>
  );
}
