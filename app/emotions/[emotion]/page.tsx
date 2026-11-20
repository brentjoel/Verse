import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { FeelingLink } from "@/components/feeling-link";
import { getAllEmotions, getEmotionById } from "@/lib/emotions";

export const ensureStatic = "navigation";

// A still, hand-placed cluster of stars beside each emotion name.
const cluster: [number, number, number][] = [[10, 30, 4], [34, 12, 3], [52, 44, 5], [78, 22, 3], [66, 74, 4], [24, 70, 3], [88, 58, 2]];

export async function generateMetadata({ params }: { params: Promise<{ emotion: string }> }) {
  const emotion = getEmotionById((await params).emotion);
  return { title: `${emotion?.name ?? "Find a feeling"} | Verselight`, description: `Find a feeling that fits and take a quiet moment with Scripture, reflection, and prayer.` };
}

export function generateStaticParams() {
  return getAllEmotions().map((emotion) => ({ emotion: emotion.id }));
}

export default async function EmotionPage({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion: emotionId } = await params;
  const emotion = getEmotionById(emotionId);
  if (!emotion) notFound();

  return (
    <SiteShell>
      <div data-emotion={emotion.id} className="detail-wrap">
        <Link href="/" className="back-link">&#8592; All feelings</Link>
        <div className="detail-heading">
          <h1><span className="cluster" aria-hidden="true">{cluster.map(([x, y, size], index) => <i key={index} style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }} />)}</span>{emotion.name}</h1>
          <p className="lede">{emotion.description}.</p>
        </div>
        <section aria-labelledby="specifics-heading">
          <h2 id="specifics-heading" className="caption">What feels closest? There is no perfect label.</h2>
          <ul className="specific-grid">
            {emotion.specifics.map((specific) => (
              <li key={specific.id}>
                <FeelingLink emotionId={emotion.id} specificId={specific.id} name={specific.name} />
              </li>
            ))}
          </ul>
          {emotion.specifics.length === 0 && <ContentNotice>We are preparing more ways to explore this feeling. Please visit again soon.</ContentNotice>}
        </section>
      </div>
    </SiteShell>
  );
}
