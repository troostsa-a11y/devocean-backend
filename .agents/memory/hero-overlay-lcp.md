---
name: Hero overlay LCP (homepage)
description: The full-viewport hero image is FCP-only and never an LCP candidate; the LCP element is the static hero title text vs the late CookieYes consent paragraph
---

# Hero overlay LCP (homepage)

**The truth (corrected):** The full-bleed `#hero-placeholder` `<img>` (position:fixed, 100% × 100vh, object-fit:cover) is **never an LCP candidate** — Chrome excludes elements that cover the full viewport as likely "background" (web.dev/articles/lcp). It still counts toward **FCP**. So no image change (resolution, aspect ratio, asset swap) can ever make the hero image the LCP. An earlier version of this note (and replit.md) wrongly claimed the 5 s overlay delay existed "so Chrome registers the image as the LCP candidate" — that premise is false.

**What the LCP element actually is:** the largest *text* block painted. Competitors: the static `#hero-title` (paints ~1.2 s, in raw HTML) vs. the CookieYes consent `<p>` (a long IAB-TCF "we and our N partners…" paragraph that paints late, ~9.7 s on Slow 4G). Whichever has the larger bounding box wins; in the lab the late banner is NOT discarded (no user interaction), so a larger late banner supersedes the early text.

**The in-code "make hero out-size the banner" fix FAILED in production.** `#hero-title` was enlarged to `clamp(3.5rem, 14vw, 3.75rem)` (React `HeroSection` h1 mirrors the **exact** clamp to avoid a shrink-jump at the 5 s fade) and the CookieYes paragraph was type-compacted (`.cky-notice-des` 13px / lh 1.4). Both were deployed to devocean-lodge.pages.dev and verified live — LCP stayed at ~10 s. **Lesson: a near-full-screen IAB-TCF consent modal of dense legal text is structurally the largest + latest-painting element; a single h1 line cannot out-area it, and font compaction barely dents the paragraph's bounding box.** Don't keep iterating on hero size / font px — it's a dead end.

**The real lever is CookieYes config, not code — and it was applied (Jun 2026).** The ~10 s render delay is CookieYes fetching the ~118 KiB IAB GVL JSON then painting a huge "we and our N partners…" paragraph. Fix applied: in the CookieYes dashboard, "Support IAB TCF v2.3" + Google's Additional/Advertiser Consent Mode were turned OFF (DEVOCEAN runs GA4/GTM analytics, not programmatic ad exchanges, so TCF is overkill) → standard GDPR banner, no GVL fetch, small fast banner → LCP collapses to the hero (~1.7–2.5 s). Compliance-safe (still a real consent banner). **Do NOT advise re-enabling TCF** unless they actually serve programmatic display ads. The enlarged `#hero-title` (`clamp(3.5rem, 14vw, 3.75rem)`, React h1 mirrors it) was **kept by owner preference for looks**, not reverted — don't "clean it up". Deterministic code-only fallback (not needed now) = defer the banner until first interaction (never paints in a no-interaction Lighthouse run), but TCF wants prominent immediate display, so that'd be the owner's compliance call.

**Why the 5 s delay still exists:** FCP / intro UX only — it keeps the preloaded image visible so FCP paints fast and the intro reads as instant. It is not an LCP lever.

**Watch out:** Lighthouse Slow-4G / Moto-G is worst-case synthetic; real-user (CrUX) LCP is much better — confirm the field metric before treating the ~10 s lab number as the real problem. Do NOT reintroduce `html.hero-active #root { opacity: 0 }` — it hides paint candidates and delays the metrics.
