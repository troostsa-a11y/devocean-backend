# DEVOCEAN Lodge Website Design Guidelines

## Design Approach
Premium coastal hospitality — image-led, warm, and earthy. Not minimal tech. Generous whitespace, authentic Mozambican Indian Ocean feel. Reference aesthetic: high-end Airbnb listings / Booking.com editorial tier. Light-mode only; no dark mode.

## Core Design Elements

### Color Palette

**Brand anchor (implemented — use these as source of truth):**
- **Terracotta** `#9e4b13` — the primary brand colour. Used for the sticky topbar background, link hover states, focus rings, and select option backgrounds. This is the single most important colour in the system.
- **Warm Gold** `#f0ca30` — the primary accent/highlight. Used for CTA button hover/active text and topbar link hover states. Always used as a highlight or text-on-dark, never as a fill.
- **Body background** `#f8fafc` — Tailwind slate-50, near-white. The base surface for all content sections.
- **Hero text** `#ffffff` — white, rendered over a dark gradient overlay on all hero images.

**Supporting palette (design intent, used in components and gradients):**
- Ocean Blue `hsl(210 85% 45%)` — coastal accent, used in section accents and some CTAs
- Warm Sand `hsl(45 25% 85%)` — card surfaces, soft section backgrounds, dividers
- Deep Teal `hsl(190 75% 35%)` — secondary accent elements
- Charcoal `hsl(0 0% 20%)` — body text and high-contrast headings

### Typography
- **Primary Font:** Inter (Google Fonts, weights 400/500/600/700), loaded non-render-blocking with `display=swap`
- **Fallback stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Hero H1:** `clamp(3.5rem, 14vw, 3.75rem)`, weight 700, white, left-aligned (not centred)
- **Hero subtitle:** `1.25rem`, weight 600, white
- **Section headings:** Bold (700) for accommodation names and section headers
- **Body text:** Regular (400) and medium (500) weights
- **Accent text:** Light italic for descriptive/secondary elements

### Layout System
- **Spacing scale:** Tailwind units — p-4, m-8, gap-12, py-16/py-24 for section vertical rhythm
- **Max content width:** `max-w-7xl` (80rem) centred with horizontal padding
- **Mobile-first:** responsive breakpoints at `sm` (640px), `md` (768px), `lg` (1024px)

### Header Structure
Two-tier fixed stack, total height ~96–104px:
1. **Topbar** (~40px) — terracotta background (`#9e4b13`), white text; holds language selector, contact info/phone
2. **Nav bar** (~56px mobile / 64px desktop) — white or semi-transparent depending on scroll position; holds logo, primary nav links, and Book Now CTA

CSS custom properties: `--topbar-h`, `--header-h`, `--stack-h` (sum of both). All in-page anchors use `scroll-margin-top: var(--stack-h)` to offset correctly.

### Component Library

**Navigation:**
- Two-tier fixed header (topbar + nav — see above)
- Primary CTA buttons with terracotta or ocean-blue background depending on context
- Hover/active: gold `#f0ca30` text on dark surfaces; brand hover-elevate on light surfaces
- Secondary nav links with subtle underline states

**Accommodation Cards:**
- Image-first layout, rounded corners, soft shadows
- Dark gradient overlay on card hero images
- Expandable "More details" sections with smooth transitions

**Forms & Booking:**
- Clean, minimal input fields; focus rings use `--brand` (`#9e4b13`)
- Primary booking/CTA buttons in terracotta or ocean blue
- Contact forms: generous spacing, clear hierarchy, `max-w-lg` constrained on mobile

**Gallery & Images:**
- Masonry-style layout
- Lazy loading for performance
- Hover: subtle zoom effect

### Images

**Hero Section:** Full-viewport rotating carousel of 5 images (lodge exterior, divers, dolphins, game/wildlife, coastal hike). Dark gradient overlay covers the bottom half. White text + `variant="outline"` CTA buttons with frosted/blurred backgrounds. Title is left-aligned, not centred.

**Accommodation Images:** High-quality photos for each unit type — Safari Tent, Comfort Tent, Garden Cottage, Thatched Chalet — consistent aspect ratios per card.

**Activity Images:** Lifestyle photography — diving, dolphin encounters, lighthouse walks, seafari, fishing, surfing.

**Gallery:** Mix of property, location, and guest experience photos in varied sizes for visual interest.

### Visual Treatments
- **Dark wash:** Full-width dark gradient overlay on all hero/banner images so white text is always legible regardless of image content
- **Gradients:** Ocean-to-sand (hsl 210 85% 45% → hsl 45 25% 85%) for subtle section dividers
- **Shadows:** Soft, low-elevation shadows on cards and interactive elements
- **Animations:** Performance-focused — subtle parallax on hero carousel, smooth accordion expand/collapse; no heavy motion

## Key Design Principles
1. **Image-Led Storytelling:** Every section leads with compelling photography
2. **Breathing Room:** Generous whitespace between sections for a premium feel
3. **Mobile-First:** Optimised for booking on mobile; desktop enhances rather than leads
4. **Trust & Transparency:** Clear pricing, policies, and contact information always visible
5. **Local Authenticity:** Warm, earthy palette and photography that reflects Mozambican coastal culture — not a generic "beach resort" template
