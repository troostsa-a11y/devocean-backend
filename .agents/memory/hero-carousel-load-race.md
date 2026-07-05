---
name: Hero carousel reveal must gate on image-load, not just a timer
description: Timer-driven crossfade carousels can reveal a slide before its own <img> has finished downloading, showing whatever is behind it
---

`HeroSection.jsx`'s slide rotation used a fixed 6s `setInterval` plus a "mount N ticks ahead" preload heuristic, assuming that lead time was always enough for the image to finish downloading before its slide's wrapper div flipped to `opacity: 1`. It usually was, but on slower mobile connections (seen via Clarity: Maputo, Mozambique, Android ChromeMobile) the later/larger slides in rotation (hero04/hero05, whose mobile WebP files are 2-4x the byte size of the first couple of slides) sometimes hadn't loaded yet when their turn came up.

**Symptom:** the outer slide wrapper (timer-driven) goes visible, but the `<img>`/`<picture>` inside is a separate component with its own load-gated opacity state — if the image hasn't loaded, the *inner* element is still effectively invisible, revealing the flat solid-color fallback background + dark overlay underneath. Easy to misdiagnose as a missing asset or a Clarity rendering artifact; the actual files were present, only slow/incomplete on the client at reveal time.

**Why it matters generally:** any two-layer crossfade (outer visibility driven by a timer/index, inner visibility driven by a load event) has this race whenever the lead time isn't provably longer than the slowest possible download on the slowest realistic connection for your audience. Bigger images and slower/further-away audiences make it worse, and it gets *systematically* worse for later items in a rotation if each one only gets the same fixed lead time regardless of file size.

**How to apply:** don't advance the visible index until the target slide's image has actually resolved (loaded or errored — always treat error as resolved too, or a broken image can freeze the rotation forever). Track resolution with a `useRef` Set updated from the image's `onLoad`/`onError`, checked (not depended-on) inside the timer callback, so checking it doesn't reset/restart the timer. Cap how many ticks you're willing to wait before forcing the advance anyway, so a truly stuck image can't hang the carousel.
