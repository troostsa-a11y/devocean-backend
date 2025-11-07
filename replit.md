# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele, ensuring legal compliance (GDPR, cookies, privacy policies), and offering a seamless user experience across various devices and 17 languages.

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

## System Architecture

### Frontend Architecture
- **Framework & Build System:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI & Styling:** shadcn/ui components, Tailwind CSS (New York variant), Radix UI primitives, custom color palette, responsive mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Routing:** Wouter-based routing system with Switch/Route components for multi-page navigation. **Experience Detail Pages (Nov 7, 2025):** Complete internal experience pages created for all 7 activities (scuba diving, dolphin swimming, lighthouse walk, seafaris, game safaris, fishing, surfing) with comprehensive content including pricing, seasons, operators, highlights, safety tips, and what's included. Pages accessible at `/experiences/:key` routes (e.g., `/experiences/diving`). Test page available at `/test-experiences.html`. **IMPORTANT:** Pages NOT YET linked from main website - awaiting user approval before replacing external experience links with internal pages.
- **Internationalization:** React-based i18n with lazy-loaded translations for 17 languages (unified Hotelrunner locale codes). Language persistence via localStorage. Multi-tier language detection (localStorage → browser → IP). Currency based on visitor's IP. Critical translations bundle includes hero title/subtitle (English only) for instant rendering with minimal JavaScript overhead. Non-English visitors see brief English fallback (<1s) until full translations load. **Language-Region Synchronization (Nov 7, 2025):** Added automatic region adjustment when language changes via URL parameters or detection. Selectors now properly reflect current language/region state, fixing issue where selectors showed incorrect continent/language after navigation from booking.html.
- **Performance Optimizations:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load (3s or first interaction), CookieYes consent banner (defer). **Static Hero HTML Pattern (Nov 4, 2025):** Hero image and text render instantly in HTML before React loads, eliminating 3.2s+ element render delay. Combines `<link rel="preload">` (downloads hero01-mobile.webp 27KB / hero01.webp 144KB immediately) with static `<picture>` element in HTML body. Placeholder automatically hides when React hydrates. Targets LCP <2.5s for real mobile users (Microsoft Clarity field data showed 4.3s before optimization). Uses English fallback text in HTML, replaced by localized content when i18n loads. **INP Optimization (Nov 4, 2025):** Heavy i18n detection logic (language/region/timezone) deferred to `requestIdleCallback` to prevent main thread blocking during React hydration. Early interaction handler provides instant visual feedback for clicks before React is ready, improving perceived responsiveness. Targets INP <200ms (Clarity showed 1000ms before optimization). **Translation Race Condition Fix (Nov 4, 2025):** Fixed bug where experiences section displayed in English for non-English languages. Issue was `useMemo` dependency array in `App.jsx` only included `[lang]`, causing experiences to be memoized with English fallback during initial render when L10N cache was empty. Added `ui` to dependency arrays for both `units` and `experiences` to ensure recomputation after translations load.

### Backend Architecture
- **Server Framework:** Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation).
- **Storage Layer:** In-memory storage (`MemStorage`) for future database integration.
- **Database Schema:** Drizzle ORM configured for PostgreSQL with Zod schemas.
- **Email Automation System:** Node.js (TypeScript) service processing Beds24 booking notifications via IMAP and sending multi-language automated emails using Resend API. **Check Intervals (Nov 7, 2025):** Incoming email check runs every 30 minutes at :00 and :30 of each hour. Scheduled email sending runs every 30 minutes at :15 and :45 of each hour (15-minute offset ensures bookings are processed before emails are sent). **Email Scheduling (Nov 7, 2025):** Post-booking emails sent 1 hour after processing; Cancellation emails sent 1 hour after processing (standalone cancellations sent immediately). Scheduling operates in Central African Time (CAT/UTC+2) for pre-arrival (10 days before @ 09:00 CAT, or 70% of remaining days if < 10 days), arrival (3 days before @ 09:00 CAT, or 50% of remaining hours if < 3 days), and post-departure (1 day after @ 10:00 CAT) emails. Supports 17 languages with template-based system, cancellation handling, and modification handling. **Modification Handling (Nov 5, 2025):** System detects modification emails, deletes old booking records and scheduled emails, then processes the modification as a fresh booking with updated data. **Email Template Translations (Nov 5, 2025):** All email templates (post_booking, pre_arrival, arrival, post_departure, cancellation) now have complete 17-language translations stored in JSON files (`email_templates/translations/`). **IMPORTANT:** Emoji are REQUIRED in email template translations for engagement and visual appeal (e.g., 🌴 in subjects, 🐬 🍴 💆 🌤 ⭐ in section titles). The "no emoji" design guideline applies ONLY to website UI, NOT to email templates.
- **Contact Form System:** Dual-environment setup (Express.js for dev, Cloudflare Pages Function for prod) with comprehensive security (input sanitization, reCAPTCHA v3, HTML escaping) and localized auto-reply emails via Resend API.

### Project Structure
- **Dual Project Setup:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template placeholder).
- **Design System:** Inter font family, card-based layouts, image-first design, expandable detail sections, hover states, focus-visible outlines, smooth scroll, sticky header.

### DNS & Domain Configuration
- **Primary Domain:** devoceanlodge.com (canonical domain used in all email templates)
- **DNS Setup (Cloudflare):**
  - `@ (devoceanlodge.com)` → CNAME → `devocean-lodge.pages.dev` (uses CNAME flattening)
  - `www.devoceanlodge.com` → CNAME → `devocean-lodge.pages.dev`
- **Cloudflare Pages:** Both root domain and www subdomain registered as custom domains in Pages project settings
- **Email Deliverability:** All email templates use canonical domain (https://devoceanlodge.com) to avoid 552 errors and improve deliverability

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager (GTM-532W3HH2) with Consent Mode v2, CookieYes (ID: f0a2da84090ecaa3b37f74af), Microsoft Clarity.
- **Trust & Verification:** Trustindex Floating Certificate widget (ID: a73b26308ab90c8e6ce30cb).
- **Booking Integration:** Beds24 booking engine (propid=297012).
- **Maps & Location:** Google Maps.
- **Security:** Google reCAPTCHA v3.
- **Email Service:** Resend API for transactional emails, IMAP for parsing booking notifications.
- **SEO & Search Indexing:** IndexNow protocol via Cloudflare Pages Functions.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.