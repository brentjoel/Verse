import { NextResponse, type NextRequest } from "next/server";
import { validResultsPath } from "@/lib/compare";

// Reject unknown parent/feeling pairs before the personalized page starts
// streaming, so its existing not-found screen retains HTTP 404 status.
export function proxy(request: NextRequest) {
  let path: string;
  try { path = decodeURIComponent(request.nextUrl.pathname).replace(/\/$/, ""); }
  catch { return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 }); }
  if (!validResultsPath(path)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

// Social image routes (opengraph-image, twitter-image) share this shape and are not Results pages.
export const config = { matcher: "/emotions/:emotion/((?!opengraph-image|twitter-image$)[^/]+)" };
