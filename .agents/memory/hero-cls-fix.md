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

## Rule 3 — Hero review-block overlap on small phones (RETIRED — see "Rule 3+7 superseded" below)

Historical context only — do not re-apply. The hero review block used to be `absolute`, anchored to the **section bottom** (`bottom-20` mobile), while the CTA grid flowed from the top. Overlap was patched per-device-height-band (this rule, then Rule 5 knob #4, then Rule 7) by tuning top gaps and `bottom-*` offsets for specific measured viewports (iPhone SE 375×667, Samsung Galaxy 360×740, tall Android >800px).

**Why this whole approach was abandoned (Jul 2026):** real users on MS Clarity sit on a continuum of viewport heights (dynamic mobile browser chrome/address-bar collapse, differing phone models, in-app browsers) — not the 3 discrete bands that were lab-tested. Every fix here narrowed the failure window instead of closing it; Clarity kept showing the same class of overlap on untested bands. See "Rule 3+7 superseded" for the actual fix.

## Rule 4 — Mobile hides the hero title; subtitle takes its slot

On small phones (`<640px`) the large `#hero-title` repetition is dropped (the lodge name already shows in the header — owner pref). The title is **hidden, not removed**: React h1 is `hidden sm:block`; placeholder uses `@media (max-width:639.98px){ #hero-title{ display:none } }`. The h1 stays in the DOM so the SEO h1 + the localization script (which only sets `textContent` on `#hero-title`/`#hero-subtitle`) keep working, and desktop is unchanged.

The subtitle then becomes the top element and must still clear the fixed header + match across layers:
- React subtitle: `mt-14 sm:mt-4 text-xl` — mobile top margin `mt-14` (3.5rem) replaces the title's old clearance; `text-xl` (1.25rem) at **all** widths so React matches the placeholder's always-1.25rem size (removes a pre-existing 16px→20px fade-shrink on mobile).
- Placeholder subtitle: margin driven by CSS, not inline — `#hero-placeholder #hero-subtitle{ margin-top:1rem }` (two-ID selector beats `#hero-placeholder p{ margin:0 }`), overridden to `3.5rem` inside the `639.98px` query.

**Why:** both layers land the subtitle at the same absolute Y (placeholder `(--stack-h 96 − 16) + 56 = 136px`; React `topbar 40 + (--header-h 56 − 16) + 56 = 136px`) → no jump when the placeholder fades. The CTA grid reflows up by the title's freed height, which only *increases* clearance from the bottom-anchored review block (so Rule 3's overlap risk is moot on mobile).

**Consequence (LCP):** with the mobile title hidden, the mobile LCP element shifts from `#hero-title` to the static `#hero-subtitle` (still raw HTML, early paint). Desktop LCP stays `#hero-title`. Verify a mobile Lighthouse run that the late CookieYes banner doesn't reclaim LCP from the smaller subtitle (TCF disabled keeps it safe).

**How to apply:** mobile subtitle gap = `mt-[8.5rem]` in React ↔ `8.5rem` in the placeholder `@media` — change in lockstep. Keep the h1 in the DOM (display:none), never delete it.

## Rule 5 — Short-screen override (iPhone SE class, ≤639.98px × ≤700px)

On very short mobile screens (375×667 = iPhone SE / iPhone 6-8 class) the `mt-[8.5rem]` gap pushes the CTA grid into the Trustindex-widened review block. A **combined width+height** media query overrides the mobile base values ONLY for this band without touching Samsung A23 (412×915) or desktop.

**Tuning knobs (change ALL four in lockstep or the subtitle jumps on fade):**
1. React subtitle class: `[@media_(max-width:639.98px)_and_(max-height:700px)]:mt-[7rem]` — current value: `7rem`
2. React subtitle font: `[@media_(max-width:639.98px)_and_(max-height:700px)]:text-base` — reduces from 1.25rem → 1rem (fewer lines, CTA position preserved because ΔH ≈ Δmt)
3. Placeholder CSS (index.html): `@media (max-width:639.98px) and (max-height:700px) { #hero-placeholder #hero-subtitle { margin-top: 7rem; font-size: 1rem; } }` — must mirror #1 and #2
4. Review block: (RETIRED, Jul 2026) — this knob no longer exists; the review block is `static` on mobile now (see "Rule 3+7 superseded"), so it always clears the CTA grid regardless of height band.

**Why height-scope is safe here:** this is the OPPOSITE problem from Rule 3. Here the TALL phones (A23, 915px) are fine at 8.5rem; only SHORT phones have the overlap. Height-scoping correctly excludes tall phones. Do NOT apply Rule 3's "scope by width only" reasoning to this override.

## Rule 6 — iPad / medium-tablet h1 font (768–1023.98px)

`clamp(3.5rem, 14vw, 3.75rem)` at 768px resolves to 3.75rem (60px) but looks visually too large on iPad. Fix: CSS custom property `--hero-h1-size: 2.75rem` at `@media (min-width:768px) and (max-width:1023.98px)` in index.html critical CSS. Both the placeholder h1 (`font-size: var(--hero-h1-size, clamp(...))`) and the React h1 (`style={{ fontSize: 'var(--hero-h1-size, clamp(...))' }}`) consume the same variable. The fallback is the original clamp, so desktop (≥1024px) and sm-only range (640–767px) are untouched. **Lockstep**: any change to the media query bound or the `2.75rem` value must be made in ONE place (the `:root` rule in index.html) — both layers read the same variable automatically.

## Rule 7 — Samsung Galaxy class (RETIRED — see "Rule 3+7 superseded" below)

Historical context only. 360×740 sat above the 700px iPhone-SE band and needed its own `bottom-[3rem]` override — a third device-specific band patch on top of Rules 3 and 5 knob #4. This confirmed the band-by-band approach doesn't converge (there's always another real viewport between the tuned bands); superseded by the in-flow fix below.

## Rule 3+7 superseded — review block is in-flow on mobile (Jul 2026)

**Root cause of the whole family of overlap bugs:** the review block (stars + badge + "Click the reviews!" + Trustindex widget) was `position:absolute`, anchored via `bottom-*` to the **section**, independent of the CTA grid's actual rendered height above it. Two things made the gap between them unpredictable: (1) the CTA grid's rendered bottom edge depends on title/subtitle wrapping, button-label length per language, and viewport height, and (2) the review block's own top edge crept *upward* whenever the async-loaded Trustindex widget (variable height, network-dependent) mounted, because `bottom`-anchoring means added height grows the box upward, not downward. Hand-tuning both sides for a handful of Lighthouse-tested device profiles (Rules 3, 5 knob #4, 7) could never cover the real continuum of viewports MS Clarity records.

**Fix:** on mobile (`<640px`) the review block is now `static` (normal document flow), rendered as the next sibling immediately after the CTA-grid content div, with `mt-6` spacing. It always sits directly below wherever the CTA grid actually ends — for any viewport height, button wrapping, or language string length — so this class of overlap is structurally impossible now, not just tuned around. Desktop (`sm:`+) is untouched: still `absolute sm:bottom-10 sm:left-0 sm:right-0`, positioned relative to the `<section>` exactly as before (the section's `flex items-start` was removed since a plain block section produces identical top-aligned stacking for the single full-width content div — no visual change).

**Also added:** `min-h-[90px]` on the Trustindex script-mount `<div>` itself, reserving space for the async widget so it doesn't shift anything when it loads (a second, independent CLS guard, orthogonal to the flow fix).

**Side effect:** content div's mobile bottom padding dropped from `pb-52` to `pb-6` — it existed only to visually reserve room for the old bottom-anchored sibling and is no longer needed now that spacing is real margin between real siblings. `sm:pb-24` (desktop) is untouched.

**How to apply / what NOT to do:** do not reintroduce device-height-banded `bottom-[Xrem]` overrides on this block — if a future overlap is reported here, the bug is elsewhere (e.g. someone made it `absolute` again, or removed the `mt-6`/`min-h-[90px]`), not a missing band.
