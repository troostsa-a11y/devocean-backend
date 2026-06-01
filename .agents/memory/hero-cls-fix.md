---
name: Hero section CLS fix
description: How the hero placeholder and React hero section are aligned to avoid CLS — critical constraints to preserve
---

## Rule

The `#hero-placeholder` (position:fixed, top:0) uses `padding-top: calc(var(--stack-h) + 4rem)`.
The React `HeroSection` content div uses `paddingTop: calc(var(--header-h) + 4rem)`.

These two formulas produce the same absolute viewport Y position:
- Placeholder: `--stack-h` px from viewport top  (e.g. 104 + 64 = 168 on desktop)
- React hero:  topbar (40px in flow) + `--header-h` px = same result (40 + 64 + 64 = 168 desktop)

**Why:**
The topbar is `position: static` (in document flow, not fixed). The hero section therefore starts at y:40 in the document, not y:0. If you mistakenly give the React hero `calc(var(--stack-h) + 4rem)` padding (as the placeholder uses), the React content lands at y:40+168 = y:208, 40px below the placeholder content at y:168. On overlay fade Chrome sees a 40px (or larger, due to flex-centering amplification) position jump — contributing to CLS.

**How to apply:**
- HeroSection.jsx `paddingTop` must use `var(--header-h)`, never `var(--stack-h)`
- HeroSection section must use `items-start`, never `items-center` — flex vertical centering shifts ALL hero text whenever content height changes (criticalUI→ui transition, description appearing, etc.)
- index.html `#hero-placeholder` content div correctly keeps `var(--stack-h)` — do not change it

## Rule 2 — Translation double-load

`useLocale.js` translation loading effect had `[lang, initialLoadDone]` as deps. Since `setInitialLoadDone(true)` is called inside the effect, changing `initialLoadDone` re-triggered the effect — causing a second full `setUi(null)` → translate → `setUi` cycle. This caused the hero to flash: `criticalUI → full ui → criticalUI → full ui` (CLS + visual flash).

**Fix:** dependency array is `[lang]` only. `initialLoadDone` must NOT be in the array.
