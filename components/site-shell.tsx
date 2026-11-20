import { Suspense, ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { BrandMark } from "@/components/brand-mark";
import { StorageNotice } from "@/components/storage-notice";
import { SettingsSheet } from "@/components/settings-sheet";
import { ThemeSync } from "@/components/theme-sync";

export function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" aria-label="Verselight home" className="brand">
          <BrandMark />
          <span>Verselight</span>
        </Link>
        <div className="header-controls">
          <SettingsSheet />
        </div>
      </header>
      <ThemeSync />
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
