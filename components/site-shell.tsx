import { Suspense, ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { BrandMark } from "@/components/brand-mark";
import { StorageNotice } from "@/components/storage-notice";
import { SettingsSheet } from "@/components/settings-sheet";
import { ThemeSync } from "@/components/theme-sync";
import { DebugOverlay } from "@/components/debug-overlay";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { AmbientSky } from "@/components/ambient-sky";

export function SiteShell({ children, ambient = true }: Readonly<{ children: ReactNode; ambient?: boolean }>) {
  return (
    <div className="site-shell">
      {ambient && <AmbientSky />}
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
      <DebugOverlay />
      <Suspense><SiteNav /></Suspense>
      <StorageNotice />
      <ViewTransition default="none" enter="page-arrival" exit="page-arrival"><main id="main-content" className="site-main" tabIndex={-1}>{children}</main></ViewTransition>
      <footer className="site-footer">
        <span>Come as you are. Take your time.</span>
        <nav aria-label="About and sources"><Link href="/about">About and privacy</Link><Link href="/craft">How it&apos;s built</Link><Link href="/licenses">Sources and copyright notices</Link><ShortcutsDialog /></nav>
      </footer>
    </div>
  );
}
