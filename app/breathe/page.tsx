import { SiteShell } from "@/components/site-shell";
import { Breathe } from "@/components/breathe";

export const metadata = { title: "Breathe | Selah Sky", description: "A quiet, paced breathing guide. Nothing is saved or sent anywhere." };
export default function BreathePage() {
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><h1>Breathe</h1><p>Slow your breathing for a minute or two, then come back to the verses. Stop whenever you like. Nothing is saved.</p></div>
    <Breathe />
  </div></SiteShell>;
}
