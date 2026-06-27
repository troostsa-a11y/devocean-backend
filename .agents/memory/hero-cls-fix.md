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
- HeroSection.jsx top padding must use `var(--header-h)`, never `var(--stack-h)`
- HeroSection section must use `items-start`, never `items-center` — flex vertical centering shifts ALL hero text whenever content height changes (criticalUI→ui transition, description appearing, etc.)
- index.html placeholder content div (`#hero-placeholder-content`) correctly uses `var(--stack-h)` — do not change which var it uses
- The "+4rem" extra is now breakpoint-dependent: small phones (`<640px`) use `-1rem` instead, on BOTH sides. React: base `pt-[calc(var(--header-h)_-_1rem)]` + `sm:pt-[calc(var(--header-h)_+_4rem)]`. Placeholder: base rule `+4rem`, `@media (max-width:639.98px)` rule `-1rem`. The placeholder query MUST be `639.98px` (not `639px`) to exactly complement Tailwind `sm:` = `min-width:640px` — `639px` leaves a `(639,640)px` fractional band where they diverge by 80px (fade jump). Whatever you set the React mobile extra to, set the placeholder `max-width:639.98px` rule to the same number — they must match per breakpoint band or the title jumps on fade.

## Rule 2 — Translation double-load

`useLocale.js` translation loading effect had `[lang, initialLoadDone]` as deps. Since `setInitialLoadDone(true)` is called inside the effect, changing `initialLoadDone` re-triggered the effect — causing a second full `setUi(null)` → translate → `setUi` cycle. This caused the hero to flash: `criticalUI → full ui → criticalUI → full ui` (CLS + visual flash).

**Fix:** dependency array is `[lang]` only. `initialLoadDone` must NOT be in the array.

## Rule 3 — Hero review-block overlap on small phones

The hero review block (stars + badge + "Click the reviews!" + Trustindex widget) is `absolute`, anchored to the **section bottom** (`bottom-20` mobile). The CTA grid flows from the top. The enlarged title (2 lines on mobile) + a large top gap pushed the CTAs down into the bottom-anchored block.

**Fix:** reduce the **top gap** on small phones, not the bottom padding. Content div top padding is `pt-[calc(var(--header-h)_-_1rem)] sm:pt-[calc(var(--header-h)_+_4rem)]` — mobile shifts the whole content block up 80px (5rem) vs the old `+4rem`, freeing bottom space so the block clears the CTAs. Where content < viewport (`min-h-screen`, viewport-driven) the bottom-anchored block stays put, so moving content up directly buys clearance. To dial it, make the `-1rem` term more negative.

**Why scope by WIDTH only, not height:** the earlier hack scoped the fix to narrow AND short (`[@media(max-width:639px)_and_(max-height:800px)]` → `pb-60`/`bottom-6`). It NEVER triggered on phones taller than 800px (modern Androids ~915px) — which is exactly where the overlap was reported. Small phone = `<640px`, full stop.

**How to apply:**
- Change the top gap (`-1rem` term), not the bottom padding/`bottom-` offset.
- Scope to `<640px` (Tailwind base + `sm:` for desktop), never by viewport height.
- **CLS lockstep:** mirror any mobile top-padding change in the placeholder's `#hero-placeholder-content` `@media (max-width:639.98px)` rule by the same amount (see Rule 1) or the title jumps on fade.
- Desktop/tablet (`sm:`+) keeps the original `+4rem` — do not touch it.
