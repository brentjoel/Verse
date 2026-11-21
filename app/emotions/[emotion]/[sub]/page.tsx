import { FocusToggle } from "@/components/focus-toggle";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { VerseCarousel, VersePager } from "@/components/verse-carousel";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions, getEmotionById, getPromptForReference, getSpecificEmotionByIds, type Emotion, type SpecificEmotion } from "@/lib/emotions";
import { getPreferredTranslation } from "@/lib/translation-preference";
import { getVersePassage } from "@/lib/verse-passage";
import { PassageAttribution } from "@/components/passage-attribution";
import { SaveVerseButton } from "@/components/save-verse-button";
import { ShareCardControls } from "@/components/share-card-controls";
import { DawnReveal } from "@/components/dawn-reveal";
import { UndoToast } from "@/components/undo-toast";
import { passageTokens } from "@/lib/dawn";

export async function generateMetadata({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion, sub } = await params;
  const feeling = getSpecificEmotionByIds(emotion, sub);
  return { title: `${feeling?.name ?? "A moment to reflect"} | Verselight`, description: "Take your time with four curated Scripture passages, a reflection question and a prayer starter." };
}

export function generateStaticParams() {
  return getAllEmotions().flatMap((emotion) => emotion.specifics.map((specific) => ({ emotion: emotion.id, sub: specific.id })));
}

export default async function ResultsPage({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion: emotionId, sub } = await params;
  const emotion = getEmotionById(emotionId);
  const specific = getSpecificEmotionByIds(emotionId, sub);
  if (!emotion || !specific) notFound();
  return <SiteShell><Suspense fallback={<ContentNotice loading>Finding your verses...</ContentNotice>}><ResultsContent emotion={emotion} specific={specific} /></Suspense></SiteShell>;
}

async function ResultsContent({ emotion, specific }: { emotion: Emotion; specific: SpecificEmotion }) {
  const translation = await getPreferredTranslation();
  const passages = await Promise.all(specific.references.map(reference => getVersePassage(reference, translation)));
  const returnTo = `/emotions/${emotion.id}/${specific.id}`;

  return (
    <>
      <UndoToast path={returnTo} />
      <div data-emotion={emotion.id} className="results-wrap">
        <Link href={`/emotions/${emotion.id}`} className="back-link">&#8592; {emotion.name} feelings</Link>
        <div className="results-heading">
          <h1><span className="emotion-dot" aria-hidden="true" />{specific.name}</h1>
          <p>Take your time. Let a question or a prayer be a place to begin.</p>
        </div>
        <FocusToggle />
        <section aria-label={`Verse references for ${specific.name.toLowerCase()}`}>
            <VerseCarousel key={returnTo}>
              {specific.references.map((reference, index) => {
                const prompt = getPromptForReference(reference);
                const passage = passages[index];
                return (
                  <DawnReveal key={reference} reference={reference} path={returnTo + reference + translation}><article className="verse-card reading-verse">
                    <div className="verse-heading-row"><h2 className="verse-reference">{reference}</h2><span className="translation-tag">{passage.translationId.toUpperCase()}</span></div>
                    <p className="verse-text">{passageTokens(passage.text).map((token, tokenIndex) => /^\s+$/u.test(token) ? token : <span key={tokenIndex} data-dawn-word="">{token}</span>)}</p>
                    <PassageAttribution passage={passage} />
                    <VersePager />
                    <div className="verse-actions">
                      <SaveVerseButton reference={reference} translationId={passage.translationId} emotionId={emotion.id} specificEmotionId={specific.id} />
                      <Link className="compare-link" data-tooltip="Compare translations" href={`/compare?${new URLSearchParams({ ref: reference, from: returnTo })}`} aria-label={`Compare translations of ${reference}`}><ArrowUpRight size={17} aria-hidden="true" />Compare</Link>
                      <ShareCardControls reference={reference} />
                    </div>
                    <details className="reflect-section"><summary>Reflect</summary>
                      {prompt ? <>
                        <div><h3 className="prompt-label">A question to sit with</h3><p className="reflect-copy">{prompt.reflect}</p></div>
                        <div className="prayer-block"><h3 className="prompt-label">A prayer to begin</h3><p className="prayer-copy">{prompt.prayer}</p></div>
                      </> : <p className="text-sm leading-7 text-muted-foreground">The reflection for this reference is unavailable right now. You can still bring what is on your heart to God.</p>}
                    </details>
                  </article></DawnReveal>
                );
              })}
            </VerseCarousel>
          {specific.references.length === 0 && <ContentNotice>References for this feeling are being prepared with care. Please visit again soon.</ContentNotice>}
        </section>
        <nav className="results-ending" aria-label="What next">
          <p>Stay as long as you like. When you are ready:</p>
          <Link href={`/emotions/${emotion.id}`} className="compare-link">Try another feeling</Link>
          <Link href="/" className="pill">Back to the wheel</Link>
        </nav>
      </div>
    </>
  );
}
