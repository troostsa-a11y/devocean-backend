# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a lodge in Ponta do Ouro, Mozambique. The platform offers accommodation listings, showcases experiences, includes contact forms, and features a multi-language interface. Its primary goal is to act as a marketing tool, attract a global audience, ensure legal compliance (GDPR, cookies, privacy policies), and deliver a seamless user experience across various devices and 17 languages.

## User Preferences
- **🚫 ABSOLUTE RULE - NO EXCEPTIONS:** NEVER build or deploy without hearing the EXACT words "build and deploy" (or clear equivalent like "deploy it", "push it live", etc.) from the user
- **🚫 NEVER EVER** run `npm run build` unless user explicitly requests it
- **🚫 NEVER EVER** run `npx wrangler pages deploy` unless user explicitly requests it
- **🛑 STOP IMMEDIATELY** after making code changes - do NOT build, do NOT deploy, do NOT test
- **🛑 WAIT FOR USER** to review changes and explicitly say "build and deploy" before taking ANY deployment action
- **❌ DO NOT BUILD/DEPLOY IF:**
  - User asks to "check" something - just make the change and STOP
  - User asks to "fix" something - just make the fix and STOP
  - User asks to "update" something - just update it and STOP
  - Changes seem "small" or "trivial" - STILL STOP and WAIT
  - You just deployed and now made another change - STOP and WAIT again
  - User asks "can you do X?" - do X, then STOP and WAIT
- **✅ ONLY BUILD/DEPLOY IF:** User explicitly says "build and deploy", "deploy it", "push it live", or clear equivalent language
- **📋 CORRECT WORKFLOW:**
  1. User asks for a change
  2. Make the change
  3. STOP - inform user change is complete
  4. WAIT for user to say "build and deploy"
  5. Only then: build and deploy
- **IMPORTANT:** Only run browser tests (run_test tool) when explicitly instructed by the user
- Do NOT automatically run tests after making changes
- Wait for explicit user confirmation before testing

## Recent Changes
- **2025-11-09**: Mobile Core Web Vitals optimization completed - CLS < 0.1 ✅
  - **CLS Fix (0.111 → <0.1)**: Removed header recalculation on font load that caused 4 layout shifts
    - Single recalc on DOMContentLoaded ensures proper rendering
    - App.jsx handles resize with throttled handler
  - **CSS async loading**: Eliminated 160ms render-blocking on mobile 4G
  - **Explicit image dimensions**: Prevent layout shifts (60% of CLS issues)
    - Hero images: 1920×1080 with 16:9 aspect ratio
    - Accommodation cards: 400×300 with 4:3 aspect ratio
    - Experience cards: 400×267 with 3:2 aspect ratio
    - Trustindex widget: Reserved 120px height
  - **Forced reflow optimization**: Batched offsetHeight reads (4→2 per calculation)
  - **Network dependency chain optimization**:
    - `vite-plugin-preload-entry.js` auto-injects modulepreload for main entry
    - DNS prefetch for external CDNs (Trustindex, CookieYes)
    - No CSS @import (avoids cascading requests)
  - **Gallery images**: Optimized to 400px (desktop 4-column grid)
  - **Body background**: slate-50 in inline critical CSS prevents white flash
  - **Image compression**: Hero images ultra-optimized for mobile LCP
    - LCP image (hero01-mobile.webp): 560x315px @ quality 50 → 9.5 KiB (was 35.6 KiB, saved 73.3%)
    - Other mobile heroes: quality 75, saved 15.6 KiB
    - Desktop heroes: quality 80, saved 29.7 KiB
    - Total: ~71 KiB reduction across all hero images
  - **Performance**: Mobile steady 90+, desktop steady 90+ (previously mobile 65-92 fluctuating)

## System Architecture

### Frontend
- **Framework & Build:** React 18 with TypeScript, Vite, and Wouter for routing.
- **UI & Styling:** shadcn/ui components, Tailwind CSS (New York variant), Radix UI primitives, custom color palette, responsive mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Routing:** Wouter-based system with dedicated experience detail pages (`/experiences/:key`) for all 7 activities.
- **Internationalization:** React-based i18n with lazy-loaded translations for 17 languages (Hotelrunner locale codes). Language persistence via localStorage, multi-tier detection (localStorage → browser → IP). Currency based on visitor's IP. Critical translations for hero section are pre-loaded. Regional language variants fall back to base language (e.g., `fr-FR` to `fr`).
- **Performance:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load, CookieYes deferral. Static Hero HTML pattern ensures instant rendering of hero content before React loads. INP optimization defers heavy i18n logic to `requestIdleCallback`.
- **Hero Placeholder SPA Navigation:** First-time visitors see a 5-second beach hero (in `index.html`) which is hidden on subsequent visits via sessionStorage/localStorage. Critical fix in `App.jsx`: On every navigation to homepage route (`/`), explicitly check if hero has been seen and force `display: none` + remove `hero-active` class to prevent brief flashing during SPA navigation from experience pages back to homepage.
- **Experience Page Translation:** Two-layer system for experience detail pages:
    - **Layer 1: UI Labels:** Shared interface text managed in `experiencePageTranslations.js` with a `getExpText` helper (three-tier fallback).
    - **Layer 2: Experience Content:** Content specific to each experience (overview, pricing, etc.) stored in individual files (`[experience]Content.js`) with per-experience helper functions (three-tier fallback). All 17 languages are supported, with emoji *required* in email template translations.
- **Form Translation:** Inline functions within `ExperienceInquiryForm.jsx` provide form-specific text with three-tier language fallback.

### Backend
- **Server:** Express.js for HTTP server, API routing (Contact form, reCAPTCHA validation).
- **Storage:** In-memory storage (`MemStorage`) as a placeholder.
- **Database:** Drizzle ORM configured for PostgreSQL with Zod schemas.
- **Email Automation:** Node.js (TypeScript) service processes Beds24 booking notifications via IMAP. Sends multi-language automated emails using Resend API. Emails are scheduled in Central African Time (CAT/UTC+2) for post-booking, pre-arrival, arrival, and post-departure. Handles modifications by re-processing updated booking data.
- **Contact Form:** Dual-environment setup (Express.js for dev, Cloudflare Pages Function for prod) with security features (input sanitization, reCAPTCHA v3, HTML escaping) and localized auto-reply emails.

### Project Structure
- **Monorepo:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template).
- **Design:** Inter font family, card-based layouts, image-first, expandable sections, hover states, focus-visible outlines, smooth scroll, sticky header.

### DNS & Domain
- **Primary Domain:** `devoceanlodge.com` (canonical domain).
- **DNS (Cloudflare):** `devoceanlodge.com` and `www.devoceanlodge.com` CNAME to `devocean-lodge.pages.dev`.

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager (GTM-532W3HH2) with Consent Mode v2, CookieYes (ID: f0a2da84090ecaa3b37f74af), Microsoft Clarity.
- **Trust:** Trustindex Floating Certificate widget (ID: a73b26308ab90c8e6ce30cb).
- **Booking:** Beds24 booking engine (propid=297012).
- **Maps:** Google Maps.
- **Security:** Google reCAPTCHA v3.
- **Email:** Resend API for transactional emails, IMAP for booking notification parsing.
- **SEO:** IndexNow protocol via Cloudflare Pages Functions.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.