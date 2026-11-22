import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { siteUrl } from "@/lib/site-url";

const title = "Accessibility | Selah Sky";
const description = "What Selah Sky supports for keyboard, screen reader, low vision, motion and touch users, how it is checked, and what is not verified yet.";

export const metadata = {
  title,
  description,
  alternates: { canonical: new URL("/accessibility", siteUrl).href },
  openGraph: { title, description, url: new URL("/accessibility", siteUrl).href },
};

export default function AccessibilityPage() {
  return <SiteShell>
    <div className="results-wrap license-copy">
      <Link href="/" className="back-link">&#8592; Home</Link>
      <h1>Accessibility</h1>
      <p>Selah Sky aims to meet WCAG 2.1 level AA. This page says what is supported, how it is checked, and what has not been verified yet.</p>
      <section aria-labelledby="supported">
        <h2 id="supported">What is supported</h2>
        <ul>
          <li><strong>Keyboard.</strong> Every control can be reached and used without a mouse, with a visible focus ring. Press <kbd>?</kbd> for the shortcuts.</li>
          <li><strong>Screen readers.</strong> Pages use real headings, landmarks, labels and live status messages. The feeling wheel has a plain List view that is always available.</li>
          <li><strong>Low vision.</strong> Dark, Daylight and Bedtime themes, a larger text size, and colors checked for contrast in tests.</li>
          <li><strong>Motion.</strong> If your device asks for reduced motion, the app starts in List view, removes drift and parallax, and shows Scripture instantly.</li>
          <li><strong>Touch.</strong> Tap targets are at least 44 pixels, and layouts hold at narrow widths with the largest text.</li>
          <li><strong>No JavaScript.</strong> Home and the feeling pages still work. Scripture on Results and Compare needs JavaScript.</li>
        </ul>
      </section>
      <section aria-labelledby="checks">
        <h2 id="checks">How it is checked</h2>
        <p>Every pull request runs automated axe checks for WCAG A and AA issues on the main pages in dark and light themes, plus contrast tests on the color tokens and Lighthouse accessibility at 90 or more. Automated tools find only part of the problems, so they do not replace testing with people.</p>
      </section>
      <section aria-labelledby="gaps">
        <h2 id="gaps">Known gaps</h2>
        <ul>
          <li>A full screen-reader pass with VoiceOver, TalkBack and NVDA has not been done.</li>
          <li>The wheel is a visual canvas; the List view is the accessible equivalent.</li>
          <li>Bedtime keeps Night&apos;s emotion colors, which are not warm-shifted.</li>
        </ul>
        <p>If something blocks you, please open an issue on <a href="https://github.com/brentjoel/Verse/issues">GitHub</a>. See also <Link href="/about">About and privacy</Link>.</p>
      </section>
    </div>
  </SiteShell>;
}
