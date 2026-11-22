import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { GentlePath } from "@/components/gentle-path";
import { getAllEmotions, getEmotionById, getPromptForReference, getSpecificEmotionByIds } from "@/lib/emotions";
import { pathReferences } from "@/lib/gentle-path";
import web from "@/data/verses/web.json";

export async function generateMetadata({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion, sub } = await params;
  const feeling = getSpecificEmotionByIds(emotion, sub);
  return { title: `${feeling?.name ?? "A gentle path"}: seven days | Selah Sky`, description: "One verse, one question and one prayer a day for seven days. Your progress stays on your device." };
}

export function generateStaticParams() {
  return getAllEmotions().flatMap(emotion => emotion.specifics.map(specific => ({ emotion: emotion.id, sub: specific.id })));
}

export default async function PathPage({ params }: { params: Promise<{ emotion: string; sub: string }> }) {
  const { emotion: emotionId, sub } = await params;
  const emotion = getEmotionById(emotionId);
  const specific = getSpecificEmotionByIds(emotionId, sub);
  if (!emotion || !specific) notFound();
  const verses = web as Record<string, string | undefined>;
  const days = pathReferences(specific.references).map(reference => ({ reference, text: verses[reference] ?? "", ...getPromptForReference(reference) }));
  return <SiteShell><div className="library-wrap">
    <Link href={`/emotions/${emotion.id}/${specific.id}`} className="back-link" transitionTypes={["nav-back"]}>&#8592; {specific.name} verses</Link>
    <div className="results-heading"><h1>{specific.name}: a gentle path</h1><p>One verse, one question and one prayer a day for seven days. Go at your own pace; nothing is scored.</p></div>
    <GentlePath emotionId={emotion.id} specificId={specific.id} name={specific.name} days={days} />
  </div></SiteShell>;
}
