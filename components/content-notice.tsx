import Link from "next/link";
import { Constellation, QuietLoading } from "@/components/constellation";

export function ContentNotice({ children, loading = false }: Readonly<{ children: React.ReactNode; loading?: boolean }>) {
  if (loading) return <QuietLoading>{children}</QuietLoading>;
  return (
    <div className="content-notice">
      <Constellation />
      <p>{children}</p>
      <Link href="/" className="compare-link">Choose another feeling</Link>
    </div>
  );
}
