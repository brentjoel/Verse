import Link from "next/link";
import { Constellation } from "@/components/constellation";

export function ContentNotice({ children, loading = false }: Readonly<{ children: React.ReactNode; loading?: boolean }>) {
  return (
    <div className={`content-notice${loading ? " skeleton" : ""}`} role={loading ? "status" : undefined}>
      {!loading && <Constellation />}
      <p>{children}</p>
      {!loading && <Link href="/" className="compare-link">Choose another feeling</Link>}
    </div>
  );
}
