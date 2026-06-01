---
name: Hero overlay LCP timing
description: Why the #hero-placeholder animation delay must be longer than the hero image load time, and what breaks if it isn't
---

# Hero overlay LCP timing

**The rule:** The CSS animation delay on `#hero-placeholder` must be longer than the time it takes the preloaded hero image to download and paint. On Lighthouse Slow 4G, that is ~1.5 s (matching FCP). Current setting: `animation: heroDismiss 0.4s cubic-bezier(0.25,1,0.5,1) 5s forwards`.

**Why:** Chrome does not count `opacity:0` elements as LCP candidates. If the overlay fades before the image finishes loading, the image is invisible when it paints and Chrome skips it. Chrome then waits for the React hero image instead, which arrives at ~8 s on 4× CPU throttle (Slow 4G). Changing the delay from 0.5 s to 5 s moved the expected LCP from 8,160 ms to ~1.5 ms (matching FCP).

**How to apply:** If the preloaded image size or CDN changes and FCP shifts, the animation delay must be adjusted to stay above the new FCP value. The JS cleanup `setTimeout` must also match: `delay_ms + 400 + 100`.

**Do not:** Set the delay below ~2 s. Do not reintroduce `html.hero-active #root { opacity: 0 }` — it hides React content and delays LCP by blocking Chrome from recording any paint candidate.
