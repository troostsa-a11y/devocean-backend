# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele while ensuring legal compliance and a seamless user experience across various devices and languages. The project supports internationalization for 16 languages and includes robust legal/compliance pages for GDPR, cookies, and privacy policies.

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
- **Navigation:** Mobile and desktop menus include "Our Story" link to `/story.html` page.
- **Internationalization:**
    - React-based i18n with lazy-loaded translations for 16 languages using unified Hotelrunner locale codes (e.g., `en-GB`, `pt-PT`, `pt-BR`, `af-ZA`, `zu`, `sw`).
    - Unified language codes across all systems (React app, vanilla JS i18n, JSON files, Header.jsx, booking URLs, localStorage, server-side email).
    - Vanilla JavaScript i18n for static pages (`story.html`, legal pages, accommodation detail pages).
    - Accommodation detail pages feature WebP-optimized photo galleries and full content translation across all 16 languages.
    - All navigation links to static pages preserve the current language via URL parameter (e.g., `?lang=af-ZA`).
    - Dynamic booking URLs on static pages based on localStorage preferences (language + currency).
    - Multi-tier language detection prioritizing localStorage → browser language → IP-based country mapping → region-aware English fallback.
    - **Currency System:** Currency is strictly based on visitor's IP-detected country, showing legal tender for that country. Manual language or region changes do not affect currency.
    - Full translation coverage for all legal pages and content.
    - Cloudflare IP Geolocation for accurate region and country detection (`window.__CF_COUNTRY__`).
    - US English support (`en-US`) with USD currency.
    - CCPA compliance with "Do Not Sell My Info" footer link and CookieYes integration for US visitors.
- **Performance Optimizations:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting, Framer Motion using LazyMotion, GTM with delayed load.

### Backend Architecture
- **Server Framework:** Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation).
- **Storage Layer:** In-memory storage (`MemStorage`) designed for future database integration.
- **Database Schema:** Drizzle ORM configured for PostgreSQL with Zod schemas.
- **Email Automation System:** Production-ready Node.js (TypeScript) service processing Beds24 booking notifications via IMAP and sending multi-language automated emails using Resend API.
    - Architecture: IMAP Parser → Supabase PostgreSQL → Email Scheduler → Resend Transactional Emails.
    - Cron schedule: 08:00, 14:00, 20:00 UTC daily.
    - Keepalive: Requires external ping service every 30 minutes to prevent Replit sleep (see KEEPALIVE-SETUP.md).
    - Database tables: `bookings`, `scheduled_emails`, `email_logs`, `email_check_logs`, `pending_cancellations`.
    - Email touchpoints: Post-booking confirmation, pre-arrival info, arrival reminder, post-departure thank you, cancellation confirmation, transfer notification to taxi company.
    - Features: Template-based multi-language system (6 base HTML templates + translations JSON), supports `en-GB`, `en-US`, `pt-PT`, `pt-BR` with extensibility, cancellation handling, extras management, booking status tracking, automatic language detection.
    - Runs on port 3003.

### Project Structure
- **Dual Project Setup:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template placeholder).
- **Design System:** Inter font family, card-based layouts, image-first design, expandable detail sections, hover states, focus-visible outlines, smooth scroll, sticky header.

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager (GTM-532W3HH2) with Consent Mode v2, CookieYes (ID: f0a2da84090ecaa3b37f74af) for GDPR/CCPA, Microsoft Clarity for session recording.
- **Trust & Verification:** Trustindex Floating Certificate widget (ID: a73b26308ab90c8e6ce30cb) integrated on all 5 legal pages.
- **Booking Integration:** Beds24 booking engine (propid=297012) embedded in `/booking.html`, with custom header/footer, UTM forwarding, and dynamic height adjustment. Supports language and currency integration via URL parameters (`/booking.html?lang=XX&currency=XXX`). Custom thank you page at `/thankyou.html`.
- **Maps & Location:** Google Maps embed for property location (lazy-loaded).
- **Security:** Google reCAPTCHA v3 for invisible verification on contact forms with server-side validation.
- **Email Service:** Resend API for transactional emails, IMAP for parsing incoming booking notifications.
- **SEO & Search Indexing:** IndexNow protocol via Cloudflare Pages Functions, comprehensive SEO meta tags, Cloudflare's built-in `robots.txt` management.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.

### Asset Management
- **Static Assets:** Stock images, photo gallery, logo, branding assets.
- **Accommodation Photos:** 16 unit photos optimized to WebP format in `/public/photos/units/`.
- **Legal Documents:** Static HTML pages for compliance (privacy, cookies, terms, GDPR, CRIC) with cache-busting.