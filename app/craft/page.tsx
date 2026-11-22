import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { siteUrl } from "@/lib/site-url";

const title = "How it's built | Selah Sky";
const description = "The engineering behind Selah Sky: local-first data, a WebGL wheel with quality tiers, licensed Scripture handled server-side, and the checks that keep it fast.";

export const metadata = {
  title,
  description,
  alternates: { canonical: new URL("/craft", siteUrl).href },
  openGraph: { title, description, url: new URL("/craft", siteUrl).href },
};

const numbers = [
  { value: "3.0s to 0.9s", label: "Largest Contentful Paint on Home" },
  { value: "0.23 to 0", label: "Layout shift on Journal" },
  { value: "90+", label: "Lighthouse gate in every category, enforced in CI" },
  { value: "100+", label: "unit tests, plus Playwright flows on phone and desktop" },
];

export default function CraftPage() {
  return <SiteShell>
    <div className="results-wrap license-copy">
      <Link href="/" className="back-link" transitionTypes={["nav-back"]}>&#8592; Home</Link>
      <h1>How it&apos;s built</h1>
      <p>Selah Sky is a small app with a few hard rules: your notes never leave your browser, licensed Scripture is never stored, and the page stays fast on a modest phone. This is how those rules shaped the code.</p>

      <section aria-labelledby="numbers">
        <h2 id="numbers">Real numbers</h2>
        <dl className="craft-numbers">
          {numbers.map((n) => <div key={n.label}><dt>{n.value}</dt><dd>{n.label}</dd></div>)}
        </dl>
        <p>The LCP win came from letting the headline paint first: the first load no longer fades, and the wheel arrives after it. The Journal shift went away by reserving the viewport while browser records load.</p>
      </section>

      <section aria-labelledby="shape">
        <h2 id="shape">Shape of the system</h2>
        <figure className="craft-diagram" tabIndex={0} aria-label="Architecture diagram, scrollable">
          <svg viewBox="0 0 640 250" role="img" aria-labelledby="craft-diagram-title craft-diagram-desc">
            <title id="craft-diagram-title">Architecture diagram</title>
            <desc id="craft-diagram-desc">The browser holds personal records in local storage and sends nothing personal. A Next.js server reads public-domain files directly and asks the Tyndale API for NLT, falling back to WEB if that fails.</desc>
            <g fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="16" y="20" width="250" height="210" rx="14" />
              <rect x="380" y="20" width="244" height="210" rx="14" />
              <path d="M266 80h114M266 170h114" strokeDasharray="4 4" />
            </g>
            <g fill="currentColor" fontSize="13" fontFamily="inherit">
              <text x="34" y="48" fontWeight="600">Your browser</text>
              <text x="34" y="82">Wheel (Three.js, quality tiers)</text>
              <text x="34" y="108">Journal, saves, streaks</text>
              <text x="34" y="134">localStorage, JSON backup</text>
              <text x="34" y="170" opacity=".75">Nothing personal is sent</text>
              <text x="398" y="48" fontWeight="600">Server (Next.js)</text>
              <text x="398" y="82">Curated references</text>
              <text x="398" y="108">KJV, WEB, ASV, BSB files</text>
              <text x="398" y="134">NLT via Tyndale, key stays here</text>
              <text x="398" y="170">Any failure: WEB, clearly labeled</text>
              <text x="276" y="72" fontSize="11" opacity=".75">reference</text>
              <text x="282" y="162" fontSize="11" opacity=".75">passage</text>
            </g>
          </svg>
        </figure>
      </section>

      <section aria-labelledby="choices">
        <h2 id="choices">Decisions worth naming</h2>
        <ul>
          <li><strong>Guest only.</strong> No accounts means no server copy of anyone&apos;s heart. Backups are a JSON file you keep.</li>
          <li><strong>Licensed text stays server-side.</strong> NLT comes through the publisher&apos;s API, is never cached or put into images, and WEB is the honest fallback.</li>
          <li><strong>One draw call.</strong> The wheel is a single points mesh with a custom shader. A two-second fps probe steps the quality down, and List view is always there.</li>
          <li><strong>Quiet by default.</strong> Reduced motion shows the list, no analytics or tracking, and focus, contrast and touch targets are tested.</li>
        </ul>
      </section>

      <section aria-labelledby="gates">
        <h2 id="gates">What keeps it honest</h2>
        <p>Every pull request runs typecheck, lint, unit tests, a production build, Playwright flows on phone and desktop, visual regression screenshots and the Lighthouse gate. Nothing merges on red.</p>
        <p>The code is on <a href="https://github.com/brentjoel/Verse">GitHub</a>. See also <Link href="/about">About and privacy</Link>.</p>
      </section>
    </div>
  </SiteShell>;
}
