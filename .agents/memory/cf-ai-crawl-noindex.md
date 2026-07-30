---
name: CF AI Crawl Control Training=Block breaks Google indexing
description: Why GSC reported X-Robots-Tag noindex that the origin never sends
---
Cloudflare **AI Crawl Control → Training = Block** serves `X-Robots-Tag: noindex` to Googlebot/Inspection Tool (Google uses one crawler for Search + training, so CF can't hard-block it and noindexes instead). Origin curls — even with Googlebot UAs — show NO such header; only verified Google IPs get it, so it's invisible from the workspace.

**Why:** July 30, 2026 — GSC reported "Page cannot be indexed: 'noindex' in X-Robots-Tag" on devoceanlodge.com/story while every origin response was clean (`meta robots index,follow`, no header). Fixed by setting Training to "Block on pages with ads" (site has no ads → nothing blocked).

**How to apply:** if GSC reports a robots header the origin doesn't send, check CF Security → AI Crawl Control settings first, not code. Live-test HTML being the real page (no challenge markup) rules out SBFM. `content-signal: ai-train=no` remains the standards-based training refusal.
