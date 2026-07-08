---
name: /book-direct lazy-route LCP fix
description: Why /book-direct needed its own static hero placeholder + chunk preload, distinct from the homepage hero-placeholder system
---

`/book-direct`'s hero `<img>` is a genuine LCP element (unlike the homepage, where LCP falls to text) because the hero is NOT full-viewport — it sits inside a flex column below two top bars (`min-h-[520px]`, not `100vh`), so Chrome's "full-viewport image = background" LCP-exclusion heuristic does not apply.

Because `BookDirectPage` is `React.lazy()`-loaded, the hero `<img>` doesn't exist in the DOM until: main bundle executes → mounts React → router resolves → the lazy chunk itself downloads/parses/executes. That whole chain was inflating real-user LCP (P50 ~4.4s, P75+ ~7s, "poor").

**Fix has two independent parts, both required:**
1. A build-time Vite plugin (`vite-plugin-preload-route-chunks.js`) injects a route-conditional inline `<head>` script that adds `<link rel="modulepreload">` for the `BookDirectPage` chunk (+ its non-shared static imports like `bookingStrings`) only when `location.pathname === '/book-direct'`. This shortens the chunk fetch, it doesn't eliminate the wait.
2. A second, fully independent static placeholder `#bd-hero-placeholder` in `index.html` (own CSS/script pair, own markup after `<div id="root">`) paints the real hero image from raw HTML before React even mounts. Removed via `useLayoutEffect` (not `useEffect`) in `BookDirectPage.jsx` on mount, to avoid a one-frame flash of both placeholder and real hero stacked in the DOM.

**Why not reuse/extend the homepage's `#hero-placeholder`:** that system is a fragile, timer-driven full-viewport overlay with documented regressions (see `hero-overlay-lcp.md`, `hero-cls-fix.md`). `#bd-hero-placeholder` is deliberately a separate, simpler, normal-in-flow (non-overlay) block, hidden by default, shown only via its own route-check script — zero shared state or CSS with the homepage placeholder.

**Approximation, not pixel-perfect:** the placeholder mirrors real layout via flexbox (topbar + white bar + flex-1 hero) closely enough to avoid meaningful CLS, but isn't byte-for-byte identical (e.g. topbar min-height is ~4px off real rendered height) — acceptable since it's swapped out within one paint cycle.
