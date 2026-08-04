---
name: SPA route LCP placeholders (guide + experience pages)
description: Why visually-hidden pre-render content is invisible to LCP, and the per-route-type fixes
---

# SPA route LCP placeholders

**Core lesson:** the `#static-content` pre-render block uses the 1×1px clip pattern (`width:1px;height:1px;clip-path:inset(50%)`) — great for crawlers, but Chrome cannot use clipped/hidden elements as LCP candidates. Any page relying on it still has its LCP gated on React lazy-chunk execution. "Content is in the HTML" ≠ "content is an LCP candidate" — it must be *visible*.

**Guide pages fix:** the CF Pages middleware appends an unhide `<style>` right after the injected `#static-content` block (only for routes with real staticHtml, gated on `!includes('aria-hidden')`). Text paints straight from HTML as the LCP element; the index.html MutationObserver still hides it when React mounts. The style is injected middleware-side so it never affects the homepage (which keeps the block hidden under its hero overlay).

**Experience pages fix:** `#exp-hero-placeholder` — third instance of the static fixed-overlay placeholder pattern (after homepage `#hero-placeholder` and `#bd-hero-placeholder`). Head script gates on an allowlisted key regex, injects an image preload + display style; body script sets the img src; `ExperienceDetailPage` removes it via `useLayoutEffect`; an **8s fail-safe timeout removes it if React bootstrap stalls** (code review caught that a stalled locale/UI load would otherwise cover the page forever — any future fixed-overlay placeholder needs a bounded fail-safe, since removal owned solely by the target component is a liveness bug).

**Static-phase font parity:** the unhide style must mimic the React page's hero (Inter stack, centered clamp() h1, gray lead) or the React handoff reads as a chaotic flash. Because Inter loads async (display=swap), the static phase paints in the system fallback and reflows when Inter lands — fix with a metric-matched `'Inter Fallback'` @font-face (`local('Arial')`, size-adjust:107.4%, ascent-override:90.2%, descent-override:22.48%). Never "fix" the flash by coloring text to match the background — that's classic cloaking on exactly the pages being tuned for Google.

**Chunk preload:** `vite-plugin-preload-route-chunks` supports `pathPrefix` (e.g. `/experiences/`) alongside exact `path` matching for parameterised lazy routes.

**Why:** 27 URLs flagged in GSC with mobile LCP > 2.5s (Aug 2026) — all lazy routes whose only pre-React content was invisible to LCP.
