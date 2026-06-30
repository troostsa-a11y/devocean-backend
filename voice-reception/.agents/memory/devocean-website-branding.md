---
name: DEVOCEAN website branding
description: External brand facts for devoceanlodge.com — used to keep the embeddable Mia widget visually consistent with the lodge site.
---

# devoceanlodge.com branding (for the embedded Mia widget)

The lodge website is a separate codebase (maintained by its own agent). The Mia voice
widget is embedded into it via iframe/loader, so the widget's look should match the site.

- **Font:** the site's brand font is **Inter** (Google Fonts, weights 400/500/600/700).
  Headings 700, emphasis 600, body 400–500. Load it in the widget app's `index.html` `<head>`
  and apply `'Inter', system-ui, …` as the fallback stack.
  - (Earlier this was believed to be system-sans-only; the user later confirmed Inter is the brand font — trust the user.)
- **Accent colour:** terracotta / burnt orange **#b65a1a** ≈ `hsl(25 75% 41%)` (buttons, CTAs).
  Secondary deep teal `#1a4a5a`; background warm white/sand.

**Why:** the widget previously used a serif (Playfair Display) heading and a slightly darker
terracotta (#9E4B13), which looked off next to the site. Matched to Inter + #b65a1a so the
widget blends in.

**How to apply:** when the site's branding changes, re-sync the widget's font, theme accent,
and floating-button colours to match. Grep the receptionist artifact for the current accent
hex / font stack to find the exact spots.
