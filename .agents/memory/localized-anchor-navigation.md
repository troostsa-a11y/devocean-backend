---
name: Localized anchor navigation
description: Reliable direct hash links to lazy homepage sections across every locale.
---

Use a bounded DOM-mount observer for direct localized homepage anchors such as
`/pt-pt/#gallery` and `/nl/#location`. Check for an existing target first, then
observe child additions until it mounts; always disconnect on success, cleanup,
or a finite timeout.

Language switching should preserve the selected section, not its old pixel
offset. A mounted anchor does not guarantee a stable position while translated
content, off-screen layout estimates, and fixed-header sizing are still settling.

**Why:** Browser native anchor scrolling happens before React's lazy
below-the-fold sections exist. Frame-count polling is tied to display refresh
rate and can expire before a locale-specific first load completes.
Guests also reported Location/Contact moving out of alignment after switching
languages, so DOM mounting alone is not sufficient for section restoration.

**How to apply:** Preserve locale prefixes in navigation helpers, but handle
the post-hydration hash target centrally in the homepage route. Add a delayed
mount regression case whenever this logic changes.
Use real layout for anchored destinations and finish alignment after translated
content is ready. Respect manual scrolling or interaction instead of pulling the
visitor back later, and never restart an expired missing-target wait.