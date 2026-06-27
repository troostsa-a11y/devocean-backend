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

## Rule 3 — Hero review-block overlap on short phones

The hero review block (stars + badge + "Click the reviews!" + Trustindex widget) is `absolute`, anchored to the **section bottom** (`bottom-20` mobile). The CTA grid flows from the top. On a short viewport they collide.

**Key:** on a short phone the section is content-driven, so the vertical clearance is `pb − bottom_offset − block_height`. The CTA grid's `mt`/`gap` do NOT affect it (shrinking content shrinks the section, moving the bottom-anchored block up in lockstep). Only `pb`, the review block's `bottom`, and its height matter.

**Why:** the enlarged hero title (kept by owner) pushes buttons down; with default `pb-52`/`bottom-20` clearance is ~−28px → overlap.

**How to apply:** scope overlap fixes to **narrow AND short** viewports (`[@media(max-width:639px)_and_(max-height:800px)]`), NOT all mobile — widening it shoves the review block down on tall phones that are already fine. Increase `pb` and/or shrink the review block's `bottom_offset` to buy clearance; accept that the widget may fall partly below the fold on very short phones.
