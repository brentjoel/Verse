import { SiteShell } from "@/components/site-shell";
import { YearRecap } from "@/components/year-recap";

export const metadata = { title: "Year in light | Verselight", description: "A gentle look back over your year: the days you came, the feelings you named and what you kept. Made on your device." };
export default function YearPage() {
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><h1>Your year in light</h1><p>A quiet look back at the days you came and the feelings you named. It is made from this browser&apos;s journal and stays here.</p></div>
    <YearRecap />
  </div></SiteShell>;
}
