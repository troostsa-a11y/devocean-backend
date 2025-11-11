# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a lodge in Ponta do Ouro, Mozambique. The platform aims to be a primary marketing tool, offering accommodation listings, showcasing experiences, providing contact forms, and supporting a multi-language interface across 17 languages. Its core purpose is to attract a global audience, ensure legal compliance (GDPR, cookies, privacy policies), and deliver a seamless user experience on all devices.

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
- **🔄 CONFIRM BEFORE ACTING:** Always explain planned changes first and wait for explicit "go ahead" confirmation before making ANY code modifications
  - Describe what you're going to change, where, and why
  - Wait for user approval before executing
  - Exception: Only proceed directly when the request is 100% clear, unambiguous, and you're certain about the scope
  - This prevents misunderstandings and unwanted changes that cause frustration

## Recent Changes
- **2025-11-11**: Restored Resend for Contact Forms - Fixed 500 errors after MailChannels shutdown
  - **Problem**: Contact forms returning "internal server error" on production
  - **Root Cause**: MailChannels shut down free email service in June 2024 - API no longer works
  - **Solution**: Restored Resend API implementation (already configured in workspace)
  - **CRITICAL NOTE**: ⚠️ NEVER use MailChannels - service is permanently discontinued. Always use Resend API for contact forms.
  - **Files Modified**: `WebsiteProject/functions/api/contact.js`, `WebsiteProject/functions/api/experience-inquiry.js`
  - **Environment Variables Required**: `RESEND_API_KEY` (Cloudflare Pages + Replit), `RECAPTCHA_SECRET_KEY`
  - **Result**: Contact forms fully functional with Resend API
- **2025-11-11**: SPA Routing Fix - Resolved 404 errors on page refresh
  - **Problem**: Refreshing `/experiences/dolphins` (and other SPA routes) returned 404 error
  - **Root Cause**: Cloudflare Pages disables auto SPA fallback when `404.html` exists
  - **Solution**: Implemented middleware-based SPA routing in `WebsiteProject/functions/_middleware.js`
  - **How It Works**: Intercepts 404s for HTML navigation requests (no file extension) and serves `index.html`, while preserving `404.html` for truly missing files/assets
  - **Files Modified**: `WebsiteProject/functions/_middleware.js`, `WebsiteProject/package.json` (optimized build script)
  - **Result**: Deep links work on refresh, custom 404 page preserved for missing assets
- **2025-11-10**: Hybrid Email Architecture implemented - Contact forms now fully standalone
  - **Problem**: Autoscale deployment incompatible with automailer cron jobs (scales to zero when idle)
  - **Solution**: Implemented Hybrid Architecture splitting responsibilities
  - **Contact Forms**: Standalone Cloudflare Workers using MailChannels (no Replit dependency)
  - **Automailer**: Runs in Replit workspace for 24/7 IMAP checks and scheduled emails
  - **Files Modified**: `WebsiteProject/functions/api/contact.js`, `WebsiteProject/functions/api/experience-inquiry.js`
  - **Cost**: FREE ($0/month - workspace + Cloudflare Workers under free tier)
  - **Result**: Forms work independently, automailer handles cron jobs reliably

## System Architecture

### 🏗️ Hybrid Email Architecture
**Design Decision**: Split email functionality between Cloudflare (contact forms) and Replit (automailer) for optimal cost and reliability.

**Contact Forms (Cloudflare Workers + Resend):**
- ✅ Standalone Workers send emails directly via Resend API
- ✅ No Replit dependency - forms work even if workspace is stopped
- ✅ `/api/contact` - General contact form with auto-reply
- ✅ `/api/experience-inquiry` - Experience inquiries forwarded to operators
- ✅ Full security: reCAPTCHA v3, header injection prevention, HTML escaping
- ✅ Cost: FREE tier (3,000 emails/month, 100/day) or $20/month for higher volume

**Automailer (Replit Workspace):**
- ✅ Runs in workspace 24/7 via "Start application" workflow
- ✅ IMAP checks every 30 minutes (at :00 and :30 of every hour)
- ✅ Processes Beds24 booking notifications
- ✅ Sends automated booking emails (post-booking, pre-arrival, arrival, post-departure)
- ✅ Cost: FREE (included in workspace plan)

### Frontend
- **Framework & Build:** React 18, TypeScript, Vite, Wouter for routing.
- **UI & Styling:** shadcn/ui components, Tailwind CSS (New York variant), Radix UI primitives, custom color palette, responsive mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Internationalization:** React-based i18n with lazy-loaded translations for 17 languages, locale persistence, multi-tier detection, and IP-based currency. Critical translations are pre-loaded.
- **Performance:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver for image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load, CookieYes deferral, Static Hero HTML pattern, INP optimization.
- **Hero Placeholder:** A 5-second beach hero for first-time visitors, managed by `App.jsx` to prevent flashing on SPA navigation.
- **Experience Page Translation:** A two-layer system for UI labels and experience-specific content, supporting 17 languages with three-tier fallbacks.
- **Form Translation:** Inline functions with three-tier language fallback.
- **SPA Routing:** Middleware-based solution (`_middleware.js`) handles 404s intelligently - serves `index.html` for HTML navigation (e.g., `/experiences/dolphins`) while preserving custom `404.html` for missing assets.

### Backend
- **Server:** Express.js automailer server runs in Replit workspace (port 3003, internal only).
- **Storage:** In-memory storage (`MemStorage`) for automailer booking state management.
- **Database:** Drizzle ORM configured for PostgreSQL with Zod schemas (used by automailer for booking data persistence).
- **Email Automation:** Node.js (TypeScript) service processes Beds24 booking notifications via IMAP, sending multi-language automated emails via SMTP scheduled in CAT/UTC+2.
- **Contact Forms:** Standalone Cloudflare Workers using Resend API with header injection prevention (`sanitizeHeader()`), reCAPTCHA v3 with action validation, HTML escaping, and localized auto-reply emails.
- **Email Form Protocol:** All new forms MUST use standalone Cloudflare Workers with Resend API. This protocol mandates header injection prevention (`sanitizeHeader()`), message sanitization (`sanitizeMessage()`), reCAPTCHA v3 verification with action-specific tokens, and HTML escaping of user inputs.

### Project Structure
- **Monorepo:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template).
- **Design:** Inter font, card-based layouts, image-first, expandable sections, hover states, focus-visible outlines, smooth scroll, sticky header.

### Deployment (Cloudflare Pages)
- **Platform:** Cloudflare Pages with Functions (Workers) support.
- **Build:** `npm run build` → Vite bundles React app to `dist/`, copies static files, Cloudflare Workers Functions.
- **Deploy:** `npx wrangler pages deploy` → Pushes `dist/` to Cloudflare Pages.
- **Middleware:** `functions/_middleware.js` handles:
  1. **Domain redirect**: `.pages.dev` → `devoceanlodge.com` (301)
  2. **SPA routing**: 404 HTML requests without file extensions → `index.html` (200)
  3. **Country injection**: IP-based geolocation → `window.__CF_COUNTRY__` for currency detection
- **Static Files:** `_redirects` (legacy redirects + locale routing), `_headers` (cache control), `404.html` (custom error page for assets).
- **SPA Routing Logic:** `isHtmlRequest && !hasFileExtension && !isApiRequest` → serve `index.html`, else serve `404.html`.

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
- **Email:** Resend API for contact forms (Cloudflare Workers), SMTP via nodemailer for automailer (Replit workspace), IMAP for booking notification parsing.
- **SEO:** IndexNow protocol via Cloudflare Pages Functions.
- **Currency Conversion:** fx-rate.net.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.