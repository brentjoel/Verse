import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ContentNotice } from "@/components/content-notice";
import { getAllEmotions } from "@/lib/emotions";
import { DailyVerse } from "@/components/daily-verse";
import web from "@/data/verses/web.json";
import { ReturnCheckIn } from "@/components/return-check-in";
import { TimeSky } from "@/components/time-sky";
import { WheelPicker } from "@/components/wheel-picker";

export const metadata = { title: "Selah Sky | A moment of peace", description: "Choose a feeling and find a quiet moment with Scripture, reflection, and prayer." };

export default function Home() {
  const emotions = getAllEmotions();
  return (
    <SiteShell ambient={false}>
      <TimeSky />
      <div className="home-stage">
        <div className="home-hero">
          <h1 className="display">How is your heart today?</h1>
          <p className="lede">A quiet moment. A little light. Room for all you carry.</p>
          <ReturnCheckIn />
          <div className="home-tools"><DailyVerse verses={web} /><Link className="home-link" href="/not-sure">Not sure what I feel?</Link></div>
        </div>
        <section id="choose-a-feeling" aria-label="Choose a feeling">
          <WheelPicker emotions={emotions}>
            <ul className="emotion-grid">
              {emotions.map((emotion) => (
                <li key={emotion.id}>
                  <Link href={`/emotions/${emotion.id}`} data-emotion={emotion.id} className="emotion-link">
                    <span className="emotion-dot" aria-hidden="true" />
                    <span className="emotion-name">{emotion.name}</span>
                    <ArrowRight size={20} strokeWidth={1.5} className="card-arrow" aria-hidden="true" />
                    <span className="emotion-desc">{emotion.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </WheelPicker>
          {emotions.length === 0 && <ContentNotice>Our feelings library is resting for a moment. Please visit again soon.</ContentNotice>}
        </section>
      </div>
    </SiteShell>
  );
}
