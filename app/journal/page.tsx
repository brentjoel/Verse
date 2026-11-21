import { SiteShell } from "@/components/site-shell";
import { Journal } from "@/components/journal";
import { getVerseText } from "@/lib/verses";

const GRACE_REFERENCE = "Lamentations 3:22-23";

export const metadata = { title: "Journal | Verselight", description: "A quiet place for your reflections, calendar and small milestones. Your journal stays in this browser." };
export default function JournalPage() {
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><h1>Your journal</h1><p>A quiet place to notice how you feel. Reflections and notes stay in this browser.</p></div>
    <Journal graceVerse={{ reference: GRACE_REFERENCE, text: getVerseText(GRACE_REFERENCE, "web") }} />
  </div></SiteShell>;
}
