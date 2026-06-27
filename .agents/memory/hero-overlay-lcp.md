---
name: Hero overlay LCP (homepage)
description: The full-viewport hero image is FCP-only and never an LCP candidate; the LCP element is the static hero title text vs the late CookieYes consent paragraph
---

# Hero overlay LCP (homepage)

**The truth (corrected):** The full-bleed `#hero-placeholder` `<img>` (position:fixed, 100% × 100vh, object-fit:cover) is **never an LCP candidate** — Chrome excludes elements that cover the full viewport as likely "background" (web.dev/articles/lcp). It still counts toward **FCP**. So no image change (resolution, aspect ratio, asset swap) can ever make the hero image the LCP. An earlier version of this note (and replit.md) wrongly claimed the 5 s overlay delay existed "so Chrome registers the image as the LCP candidate" — that premise is false.

**What the LCP element actually is:** the largest *text* block painted. Competitors: the static `#hero-title` (paints ~1.2 s, in raw HTML) vs. the CookieYes consent `<p>` (a long IAB-TCF "we and our N partners…" paragraph that paints late, ~9.7 s on Slow 4G). Whichever has the larger bounding box wins; in the lab the late banner is NOT discarded (no user interaction), so a larger late banner supersedes the early text.

**The fix:** make the early hero title out-size the consent paragraph. `#hero-title` is `clamp(3.5rem, 14vw, 3.75rem)` (wraps to 2 lines on mobile); the React `HeroSection` h1 mirrors that **exact** clamp (no shrink-jump at the 5 s fade); and the CookieYes paragraph is type-compacted (`.cky-notice-des` 13px / lh 1.4, copy preserved on-screen — compliance-safe). Verifiable only on the deployed site (CookieYes is dev-guarded, skipped on localhost/replit.dev).

**Why the 5 s delay still exists:** FCP / intro UX only — it keeps the preloaded image visible so FCP paints fast and the intro reads as instant. It is not an LCP lever.

**How to apply / watch out:** If you shrink the hero title, the consent copy grows, or CookieYes renames its `.cky-notice-des` class, the consent `<p>` can reclaim LCP. The deterministic fallback (if the title approach ever stops winning) is to defer the CookieYes banner until first interaction — but that is a GDPR/compliance decision for the owner (replit.md mandates the banner load immediately, Consent Mode already denies tracking until consent). Do NOT reintroduce `html.hero-active #root { opacity: 0 }` — it hides paint candidates and delays the metrics.
