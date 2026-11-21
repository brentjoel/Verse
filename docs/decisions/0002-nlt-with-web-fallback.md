# 0002 NLT by default, WEB as the fallback

Status: accepted (2026-11)

## Decision
NLT is the default translation, fetched server-side from the official Tyndale API. If it fails or the quota guard trips, the app shows the World English Bible (WEB) with a visible note. KJV, WEB, ASV and BSB come from static public-domain files. NIV stays a disabled "Coming soon" option.

## Why
- NLT is warm and readable, which fits the product. Its license allows display through the official API but not storage or reuse.
- The API key must stay secret, so the call lives on the server.
- WEB is public domain and modern enough to be a gentle, honest fallback. Showing a labeled fallback beats showing nothing.

## Consequences
- NLT text is never cached, stored in the browser, written to backups, put in share cards or committed. Share cards, the daily verse, tests and screenshots use WEB.
- Quota protection is best effort and per server instance.
- The provider layer stays extensible so a licensed NIV could be added.

## Revisit when
Publisher terms change, or licensed NIV access is granted.
