import { SiteShell } from "@/components/site-shell";
import { FeelingFinder } from "@/components/feeling-finder";
import { getAllEmotions } from "@/lib/emotions";

export const metadata = { title: "Not sure what I feel? | Verselight", description: "Three gentle questions that point to a feeling. Nothing is saved or sent anywhere." };
export default function NotSurePage() {
  const emotions = getAllEmotions().map(({ id, name, description }) => ({ id, name, description }));
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><h1>Not sure what I feel?</h1><p>That is okay. Three quick questions can help you find a place to begin. Nothing is saved.</p></div>
    <FeelingFinder emotions={emotions} />
  </div></SiteShell>;
}
