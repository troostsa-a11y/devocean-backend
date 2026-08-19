---
name: Hero placeholder → React hero transition rules
description: Rules that keep the static-to-React hero handoff fast and free of visual flashes.
---

## Rule 1 — hero-active body/root background must match #hero-placeholder background

`html.hero-active body { background: <X> }` and `html.hero-active #root { background: <X> }` must always use the **same colour** as `#hero-placeholder { background: <X> }`. Current value: `#9e4b13` (brand rust) for all three.

**Why:** The static hero paints before React. Matching its fallback background to the page prevents an exposed colour seam if an image decode is delayed.

**How to apply:** whenever you change `#hero-placeholder`'s background colour, change `html.hero-active body` and `html.hero-active #root` to the same value in the same edit.

## Rule 2 — dismiss on actual hero readiness, then double-rAF

App.jsx's home-route effect listens for the React hero image's `load`/`error` event, then wraps the fade-out in `requestAnimationFrame(() => requestAnimationFrame(() => { … }))`. A short 1.2-second ceiling avoids turning a failed or slow request into a startup screen.

**Why:** `decoding="async"` tells the browser to decode off the main thread. Even from the preload cache, the decoded pixels may not be available for the first paint after React's commit. Waiting for the DOM image and then allowing two paint frames avoids a one-frame brand-colour flash without imposing an arbitrary multi-second delay.

**How to apply:** Never reintroduce a fixed-duration hero intro. The placeholder must allow pointer events through, disappear when the matching React image is ready, and use only a brief bounded fallback.

## Rule 3 — new Image() preload must NOT set resolvedRef

The `new Image()` objects used for cache-warming slides 1 & 2 must have **no** `onload` handler. `resolvedRef` is only updated by the actual DOM `<img>`'s `onLoadComplete` callback. Setting `resolvedRef` from `new Image().onload` caused the interval to advance the slide wrapper before LazyImage's `imageLoaded` transitioned, revealing the brand fallback behind the still-transparent inner img. This also breaks on WKWebView (Facebook/Instagram in-app) where `new Image()` has a separate cache partition from DOM `<picture>`/`<img>` elements.

## Rule 4 — returning from static pages must skip the homepage overlay

Static legal pages mark the hero handoff as seen before navigating to Home.

**Why:** A legal-page visitor is already on the site. Showing a homepage overlay on that navigation reads as a startup flash rather than useful loading feedback.

**How to apply:** Any standalone/static page that links back to `/` or `/#…` should set the same seen marker before navigation, and its stable JavaScript URL must receive a new version query whenever that handler changes.
