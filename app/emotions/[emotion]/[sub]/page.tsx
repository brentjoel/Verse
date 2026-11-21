import { FocusToggle } from "@/components/focus-toggle";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
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
import { HelpNote } from "@/components/help-note";
import { showsHelpNote } from "@/lib/help";
import { UndoToast } from "@/components/undo-toast";
import { passageTokens } from "@/lib/dawn";
import { dayNumber, serverToday, todaysReferences } from "@/lib/rotation";

export async function generateMetadata({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion, sub } = await params;
  const feeling = getSpecificEmotionByIds(emotion, sub);
  return { title: `${feeling?.name ?? "A moment to reflect"} | Verselight`, description: "Take your time with four curated Scripture passages, a reflection question and a prayer starter." };
}

export function generateStaticParams() {
  return getAllEmotions().flatMap((emotion) => emotion.specifics.map((specific) => ({ emotion: emotion.id, sub: specific.id })));
}

export default async function ResultsPage({ params, searchParams }: { params: Promise<{ emotion: string; sub: string }>; searchParams: Promise<{ more?: string | string[] }> }) {
  const { emotion: emotionId, sub } = await params;
  const emotion = getEmotionById(emotionId);
  const specific = getSpecificEmotionByIds(emotionId, sub);
  if (!emotion || !specific) notFound();
  return <SiteShell><Suspense fallback={<ContentNotice loading>Finding your verses...</ContentNotice>}><ResultsContent emotion={emotion} specific={specific} searchParams={searchParams} /></Suspense></SiteShell>;
}

async function ResultsContent({ emotion, specific, searchParams }: { emotion: Emotion; specific: SpecificEmotion; searchParams: Promise<{ more?: string | string[] }> }) {
  const translation = await getPreferredTranslation();
  const more = (await searchParams).more !== undefined;
  // The daily window depends on the request time, so wait for a real request before reading the clock.
  await connection();
  // Four passages a day from the feeling's eight, shifting by one daily; "more" shows the other four.
  const references = todaysReferences(specific.references, dayNumber(serverToday()), more);
  const passages = await Promise.all(references.map(reference => getVersePassage(reference, translation)));
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
            <VerseCarousel key={returnTo + (more ? "?more" : "")} memoryKey={returnTo + (more ? "?more" : "")}>
              {references.map((reference, index) => {
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
          {references.length === 0 && <ContentNotice>References for this feeling are being prepared with care. Please visit again soon.</ContentNotice>}
        </section>
        {showsHelpNote(emotion.id) && <HelpNote />}
        <nav className="results-ending" aria-label="What next">
          <p>Stay as long as you like. When you are ready:</p>
          {references.length > 0 && <Link href={more ? returnTo : `${returnTo}?more`} className="compare-link">{more ? "Back to today's verses" : "Read 4 more verses"}</Link>}
          <Link href={`/emotions/${emotion.id}`} className="compare-link">Try another feeling</Link>
          <Link href="/" className="pill">Back to the wheel</Link>
        </nav>
      </div>
    </>
  );
}
