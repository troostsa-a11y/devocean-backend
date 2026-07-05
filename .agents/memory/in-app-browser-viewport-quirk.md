---
name: In-app browser transient tiny viewport height
description: Facebook/Instagram/Messenger in-app browsers briefly report a near-zero viewport height on first paint, breaking fixed-position UI
---

Facebook's (and Instagram's/Messenger's) in-app browser (WKWebView with their own animated toolbar chrome) can report a real but transient tiny `window.innerHeight` on first paint — observed via Microsoft Clarity: `390x135` on iOS 18, `FacebookApp`. The browser corrects itself to the real device height (typically 700-900px) within about a second once its own chrome finishes collapsing.

**Why it matters:** any `position: fixed` element anchored with `bottom: Npx` computes against whatever height is reported *at that moment*. At 135px, a fixed bottom-right button (e.g. a floating widget launcher) lands on top of a fixed top header instead of near the real bottom of the screen — this is a real rendering defect for actual visitors coming from Facebook/Instagram link taps, not a Clarity dashboard artifact (that was our first, wrong guess — always double check the actual Clarity device/viewport metadata before assuming a screenshot is a thumbnail-rendering artifact).

**How to apply:** guard fixed-position UI that's anchored near the bottom of the screen with a visibility check against `window.innerHeight` / `visualViewport.height`, re-evaluated on `resize`. A safety floor around 250px cleanly separates this pathological in-app-browser case from every real device viewport, including landscape phones (~320px+ tall) — don't set the floor higher than that or it'll wrongly hide the element on real landscape phones.
