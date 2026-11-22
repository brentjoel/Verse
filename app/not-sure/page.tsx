import { SiteShell } from "@/components/site-shell";
import { FeelingFinder } from "@/components/feeling-finder";
import { FeelingWords } from "@/components/feeling-words";
import { getAllEmotions } from "@/lib/emotions";

export const metadata = { title: "Not sure what I feel? | Selah Sky", description: "Describe it in a few words or answer three gentle questions to find a feeling. Everything stays on your device." };
export default function NotSurePage() {
  const all = getAllEmotions();
  const emotions = all.map(({ id, name, description }) => ({ id, name, description }));
  const withSpecifics = all.map(({ id, name, description, specifics }) => ({ id, name, description, specifics: specifics.map(({ id: subId, name: subName }) => ({ id: subId, name: subName })) }));
  return <SiteShell><div className="library-wrap">
    <div className="results-heading"><h1>Not sure what I feel?</h1><p>That is okay. Tell me in a few words, or answer three quick questions, and we will find a place to begin. Nothing is saved.</p></div>
    <FeelingWords emotions={withSpecifics} />
    <p className="finder-or">Or answer three quick questions.</p>
    <FeelingFinder emotions={emotions} />
  </div></SiteShell>;
}
