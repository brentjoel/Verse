// A four-point star inside an open ring. Gradients live only in the mark and the particles.
// Identical gradient ids are safe here: every instance defines the same gradient.
export function BrandMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={"vl-mark"} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#8052ff" />
        <stop offset="1" stopColor="#15846e" />
      </linearGradient>
    </defs>
    <path d="M27.3 11.2A12 12 0 1 1 20.8 4.9" stroke={"url(#vl-mark)"} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 7.5 17.9 14.1 24.5 16 17.9 17.9 16 24.5 14.1 17.9 7.5 16 14.1 14.1Z" fill={"url(#vl-mark)"} />
    <circle cx="25.2" cy="7.2" r="1.6" fill="#ffb829" />
  </svg>;
}
