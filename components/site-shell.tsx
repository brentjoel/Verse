import { Suspense, ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { BrandMark } from "@/components/brand-mark";
import { StorageNotice } from "@/components/storage-notice";

export function SiteShell({ children, settings }: Readonly<{ children: ReactNode; settings?: ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" aria-label="Verselight home" className="brand">
          <BrandMark />
          <span>Verselight</span>
        </Link>
        <div className="header-controls">
          {settings ?? <button type="button" className="icon-button" aria-label="Settings" disabled><Settings2 size={20} strokeWidth={1.5} aria-hidden="true" /></button>}
        </div>
      </header>
      <Suspense><SiteNav /></Suspense>
      <StorageNotice />
      <ViewTransition default="none" enter="page-arrival" exit="page-arrival"><main id="main-content" className="site-main">{children}</main></ViewTransition>
      <footer className="site-footer">
        <span>Come as you are. Take your time.</span>
        <nav aria-label="About and sources"><Link href="/about">About and privacy</Link><Link href="/licenses">Sources and copyright notices</Link></nav>
      </footer>
    </div>
  );
}
