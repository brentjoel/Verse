import { SiteShell } from "@/components/site-shell";
import { OfflineReader } from "@/components/offline-reader";

export const metadata = { title: "Offline | Selah Sky", description: "You are offline. Public-domain verses and pages you have visited still open.", robots: { index: false } };
export default function OfflinePage() {
  return <SiteShell><div className="library-wrap"><OfflineReader /></div></SiteShell>;
}
