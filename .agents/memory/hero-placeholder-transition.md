---
name: Hero placeholder → React hero transition rules
description: Three constraints that must stay in sync to prevent flashes between the static #hero-placeholder and the React hero on first load
---

## Rule 1 — hero-active body/root background must match #hero-placeholder background

`html.hero-active body { background: <X> }` and `html.hero-active #root { background: <X> }` must always use the **same colour** as `#hero-placeholder { background: <X> }`. If they differ, the CSS `heroDismiss` animation (5 s delay + 0.4 s fade) bleeds the mismatched body/root colour through the semi-transparent placeholder during the fade-out, producing a visible colour-shift flash. Current value: `#9e4b13` (brand rust) for all three.

**Why:** On connections slow enough that React takes > 5 s to mount, the CSS animation plays before App.jsx's useEffect can override it with `display:none`. During the fade the placeholder's opacity drops below 1 and the body/root colour shows through composited. If those colours don't match the placeholder's own background, there's a perceptible hue shift mid-fade.

**How to apply:** whenever you change `#hero-placeholder`'s background colour, change `html.hero-active body` and `html.hero-active #root` to the same value in the same edit.

## Rule 2 — Double-rAF in App.jsx before dismissing the placeholder

App.jsx's `location='/'` useEffect wraps the `display:none` + `classList.remove('hero-active')` call in `requestAnimationFrame(() => requestAnimationFrame(() => { … }))`. This gives the React hero's LCP `<picture>` (slide 0, `decoding="async"`) two paint frames to finish async-decoding before the placeholder is pulled. Without this, there can be a 1-frame gap where the placeholder is gone but the hero image hasn't composited yet, briefly showing the `bg-[#9e4b13]` brand fallback div behind the still-transparent `<img>`.

**Why:** `decoding="async"` tells the browser to decode off the main thread. Even from the preload cache, the decoded pixels may not be available for the first paint after React's commit. Two rAFs guarantee the image has passed through at least one full paint cycle before the placeholder is removed.

## Rule 3 — new Image() preload must NOT set resolvedRef

The `new Image()` objects used for cache-warming slides 1 & 2 must have **no** `onload` handler. `resolvedRef` is only updated by the actual DOM `<img>`'s `onLoadComplete` callback. Setting `resolvedRef` from `new Image().onload` caused the interval to advance the slide wrapper before LazyImage's `imageLoaded` transitioned, revealing the brand fallback behind the still-transparent inner img. This also breaks on WKWebView (Facebook/Instagram in-app) where `new Image()` has a separate cache partition from DOM `<picture>`/`<img>` elements.
