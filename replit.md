# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a lodge in Ponta do Ouro, Mozambique. The platform serves as a primary marketing tool, offering accommodation listings, showcasing experiences, providing contact forms, and supporting a multi-language interface across 17 languages. Its core purpose is to attract a global audience, ensure legal compliance (GDPR, cookies, privacy policies), and deliver a seamless user experience on all devices.

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
- **🔄 MANDATORY WORKFLOW - CONFIRM BEFORE ACTING (NO EXCEPTIONS):**
  1. ❓ **User asks for something**
  2. 🔍 **READ existing code first** - Understand what's already there
  3. 📋 **EXPLAIN what you found** - Show user what exists and what you plan to change
  4. ⏸️ **WAIT for explicit "go ahead"** - User must confirm before you proceed
  5. ✅ **Only then make changes** - After confirmation received
  - **NO EXCEPTIONS** - Even for "simple" or "obvious" requests, explain first
  - **Why**: Prevents wasting hours/days "fixing" things that aren't broken
  - **Cost**: Extra confirmation step vs. accidentally breaking working systems
  - **Rule**: If you haven't shown the user what currently exists, you haven't done step 3

## System Architecture

### Hybrid Email Architecture
Email functionality is split between Cloudflare (contact forms) and Replit (automailer) for optimal cost and reliability.
- **Contact Forms (Cloudflare Workers + Resend):** Standalone Workers handle general contact and experience inquiries, including reCAPTCHA v3, header injection prevention, HTML escaping, and localized auto-replies. All new forms must use this protocol.
- **Automailer (Replit Workspace):** An Express.js server runs 24/7 in the Replit workspace, processing Beds24 booking notifications via IMAP and sending multi-language automated emails via SMTP. It uses in-memory storage for booking state management and Drizzle ORM for PostgreSQL.

### Frontend
- **Framework & Build:** React 18, TypeScript, Vite, Wouter for routing.
- **UI & Styling:** shadcn/ui, Tailwind CSS (New York variant), Radix UI primitives, custom color palette, responsive mobile-first design. Inter font, card-based layouts, image-first, expandable sections, hover states, focus-visible outlines, smooth scroll, sticky header.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Internationalization:** React-based i18n with lazy-loaded translations for 17 languages, locale persistence, multi-tier detection, and IP-based currency. Critical translations are pre-loaded. Experience and form translations use a two-layer and three-tier fallback system respectively.
- **Performance:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver for image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load, CookieYes deferral, Static Hero HTML pattern, INP optimization.
- **Hero Placeholder:** A 5-second beach hero for first-time visitors, managed by `App.jsx`.
- **SPA Routing:** Middleware-based solution (`_middleware.js`) handles 404s, serving `index.html` for HTML navigation while preserving a custom `404.html` for truly missing assets.
- **Storage Safety Layer:** All `localStorage`/`sessionStorage` calls are wrapped with try-catch guards to prevent crashes in restricted storage environments (e.g., private/incognito mode).

### Backend
- **Server:** Express.js automailer server runs in Replit workspace (port 3003, internal only).
- **Storage:** In-memory storage (`MemStorage`) for automailer booking state management.
- **Database:** Drizzle ORM configured for PostgreSQL with Zod schemas.
- **Email Automation:** Node.js (TypeScript) service processes Beds24 booking notifications via IMAP, sending multi-language automated emails via SMTP scheduled in CAT/UTC+2.
- **Contact Forms:** Standalone Cloudflare Workers using Resend API with header injection prevention (`sanitizeHeader()`), reCAPTCHA v3 with action validation, HTML escaping, and localized auto-reply emails.

### Project Structure
- **Monorepo:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template).

### Deployment (Cloudflare Pages)
- **Platform:** Cloudflare Pages with Functions (Workers) support.
- **Build:** `npm run build` bundles the React app to `dist/` and copies static files/Workers Functions.
- **Deploy:** `npx wrangler pages deploy` pushes `dist/` to Cloudflare Pages.
- **Middleware (`functions/_middleware.js`):** Handles domain redirection, SPA routing (serving `index.html` for HTML navigation and `404.html` for missing assets), and injects country information for currency detection.
- **Static Files:** Includes `_redirects` for legacy redirects and locale routing, `_headers` for cache control, and `404.html` for custom error pages.
- **DNS & Domain:** `devoceanlodge.com` is the primary domain, with DNS configured on Cloudflare.

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager (GTM-532W3HH2) with Consent Mode v2, CookieYes (ID: f0a2da84090ecaa3b37f74af), Microsoft Clarity.
- **Trust:** Trustindex Floating Certificate widget (ID: a73b26308ab90c8e6ce30cb).
- **Booking:** Beds24 booking engine (propid=297012).
- **Maps:** Google Maps.
- **Security:** Google reCAPTCHA v3.
- **Email:** Resend API for contact forms (Cloudflare Workers), SMTP via nodemailer for automailer (Replit workspace), IMAP for booking notification parsing.
- **SEO:** IndexNow protocol via Cloudflare Pages Functions.
- **Currency Conversion:** fx-rate.net.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.