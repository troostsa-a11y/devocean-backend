# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele, ensuring legal compliance (GDPR, cookies, privacy policies), and offering a seamless user experience across various devices and 16 languages.

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
- **Internationalization:** React-based i18n with lazy-loaded translations for 17 languages (unified Hotelrunner locale codes). Language persistence via localStorage. Multi-tier language detection (localStorage → browser → IP). Currency based on visitor's IP. Critical translations bundle includes hero title/subtitle for all 17 languages, eliminating FOUC (flash of untranslated content) during LCP window.
- **Performance Optimizations:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load, CookieYes consent banner delayed loading (2s or first interaction). Core Web Vitals optimization includes splitting translation bundles and deferred locale detection for improved INP and hydration. LCP optimization achieved by: (1) delaying CookieYes banner to prevent consent text from blocking Largest Contentful Paint, (2) adding hero title/subtitle to critical translations bundle for instant hero text rendering, eliminating 230ms render delay from LCP element.

### Backend Architecture
- **Server Framework:** Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation).
- **Storage Layer:** In-memory storage (`MemStorage`) for future database integration.
- **Database Schema:** Drizzle ORM configured for PostgreSQL with Zod schemas.
- **Email Automation System:** Node.js (TypeScript) service processing Beds24 booking notifications via IMAP and sending multi-language automated emails using Resend API. Scheduling operates in Central African Time (CAT/UTC+2) for post-booking, pre-arrival, arrival, and post-departure emails. Supports 17 languages with template-based system and cancellation handling.
- **Contact Form System:** Dual-environment setup (Express.js for dev, Cloudflare Pages Function for prod) with comprehensive security (input sanitization, reCAPTCHA v3, HTML escaping) and localized auto-reply emails via Resend API.

### Project Structure
- **Dual Project Setup:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template placeholder).
- **Design System:** Inter font family, card-based layouts, image-first design, expandable detail sections, hover states, focus-visible outlines, smooth scroll, sticky header.

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