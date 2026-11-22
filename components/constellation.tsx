/** The one mark for quiet moments: empty, loading, not found and error states all use it. */
export function Constellation({ twinkle = false }: Readonly<{ twinkle?: boolean }>) {
  return <svg className="constellation" data-twinkle={twinkle || undefined} width="112" height="56" viewBox="0 0 112 56" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="m8 40 28-24 26 20 30-26 12 30" opacity=".35" />
    <circle cx="8" cy="40" r="2" /><circle cx="36" cy="16" r="2" /><circle cx="62" cy="36" r="2" /><circle cx="104" cy="40" r="2" />
    <path d="m92 4 1.5 4.5L98 10l-4.5 1.5L92 16l-1.5-4.5L86 10l4.5-1.5Z" />
  </svg>;
}

/** Loading: the same constellation, softly twinkling, with one kind line. Still under reduced motion. */
export function QuietLoading({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="empty-state" role="status"><Constellation twinkle /><p>{children}</p></div>;
}
