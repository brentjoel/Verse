import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { TranslationCredits } from "@/components/translation-credits";

export const metadata = { title: "Translation sources and credits | Selah Sky", description: "Read the source, copyright and licensing notices for the Bible translations used by Selah Sky." };

export default function LicensesPage() {
  return <SiteShell>
    <div className="results-wrap license-copy">
      <Link href="/" className="back-link" transitionTypes={["nav-back"]}>&#8592; Home</Link>
      <h1>Scripture sources</h1>
      <p>Selah Sky is a strictly noncommercial personal and portfolio project, with no ads, subscriptions, donations, or paid features. NLT is the default translation. NLT is requested from the official Tyndale API; public-domain translations use local files. Selah Sky preserves the source wording and punctuation.</p>
      <TranslationCredits />
    </div>
  </SiteShell>;
}
