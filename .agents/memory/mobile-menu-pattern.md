---
name: Mobile menu pattern
description: Always-in-DOM + CSS transform/opacity pattern used in Header.jsx for pre-hydration responsiveness
---

# Mobile menu pattern

**The rule:** The mobile dropdown and backdrop in `Header.jsx` must remain in the DOM at all times. Visibility is controlled by CSS `transform: scale(0.95)` + `opacity: 0` + `pointerEvents: none` when closed, flipping to `scale(1)` + `opacity: 1` + `pointerEvents: auto` when open. `willChange: 'transform, opacity'` promotes the element to a GPU compositor layer.

**Why:** Mount/unmount (`{menuOpen && <div>...`) requires a React state update, a VDOM diff, and a DOM insertion — all on the main thread. On slow mobile hardware this is perceptibly laggy especially during initial hydration. The compositor handles CSS transform/opacity transitions independently of the main thread, completing in under 16 ms regardless of JS load.

**Icon rotation:** The hamburger icon uses `<Menu className={transition-transform ${menuOpen ? 'rotate-90' : ''}} />` — one element rotated via CSS. Do NOT swap between `<Menu>` and `<X>` on state change; that remounts the SVG path and causes a visual flicker.

**Accessibility:** `aria-hidden={!menuOpen}` and `tabIndex={menuOpen ? 0 : -1}` on all links inside the drawer ensure the always-in-DOM elements are invisible to screen readers and keyboard navigation when closed.

**How to apply:** Any future overlay/drawer component (e.g. region picker, notification panel) should follow this pattern instead of conditional rendering.
