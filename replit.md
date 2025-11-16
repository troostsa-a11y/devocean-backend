# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website designed to be the primary marketing tool for a lodge in Ponta do Ouro, Mozambique. It offers accommodation listings, showcases experiences, provides contact forms, and supports a multi-language interface across 17 languages. The project aims to attract a global audience, ensure legal compliance (GDPR, cookies, privacy policies), and deliver a seamless, responsive user experience.

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
- **🚫 ABSOLUTE RULE - NEVER USE BROWSER TESTS (run_test tool):**
  - **NEVER EVER** use the run_test tool or playwright browser testing
  - User can test the browser themselves - it's faster and more effective
  - Browser tests are highly ineffective and waste time
  - This includes ALL scenarios: debugging, verification, checking UI, testing forms, etc.
  - **NO EXCEPTIONS** - Even if you think "just a quick test would help"
  - If you need to verify something works, make the code change and STOP - let user test
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

### Language Code Architecture
The website uses a hybrid language code system with automatic normalization:
- **Full Locale Codes (React App/Frontend):** `en-GB`, `pt-PT`, `pt-BR`, etc. (17 variants) for precise UI/UX.
- **2-Letter ISO Codes (Workers/Email/Booking):** `en`, `pt`, `de`, etc. (15 base languages) for simpler transactional systems.
- Bidirectional normalization functions (`normalizeLangCode()`, `normalizeLang()`) ensure seamless compatibility between frontend and backend systems.

### Hybrid Email Architecture
Email functionality is split between Cloudflare and Replit:
- **Contact Forms:** Cloudflare Workers handle general contact and experience inquiries, including reCAPTCHA v3, security measures, and localized auto-replies using Resend.
- **Automailer:** An Express.js server (port 3003) in the Replit workspace processes Beds24 booking notifications via IMAP and sends multi-language automated emails via SMTP. Uses PostgreSQL with Drizzle ORM for booking state tracking.

### Automailer - Simplified Architecture (Nov 2025)
**Design Philosophy:** Track only **WHO is coming** and **WHEN they're arriving** - no pricing or room details needed.

**Email Processing:**
- Checks IMAP inbox every 30 minutes (at :00 and :30)
- Sends scheduled emails at :15 and :45
- Processes new bookings, modifications, and cancellations automatically
- Supports 15 languages with intelligent language determination

**Language Determination (3-Tier Priority):**
1. **Preferred Language** field from Beds24 (explicit guest preference)
2. **Country code mapping** (e.g., "MZ" → "PT", "ZA" → "EN") from guest location
3. **Default to English** if neither available
- Implementation: `server/services/email-parser.ts`, `server/services/cancellation-handler.ts`

**Data Tracked:**
- Guest Info: name, firstName, email, gender, country, language
- Booking Dates: check-in, check-out
- References: groupRef, bookingRefs[] (for modification matching)
- Status: booking status, email tracking flags (postBookingEmailSent, preArrivalEmailSent, etc.)

**Data NOT Tracked (Intentionally Removed):**
- ❌ Pricing: totalPrice, currency (guests already know what they paid)
- ❌ Room Details: roomType, adults, children, people counts
- ❌ Last night date

**Email Types Scheduled:**
1. Post-booking confirmation (sent immediately)
2. Pre-arrival reminder (5 days before check-in)
3. Arrival day welcome (day of check-in)
4. Post-departure thank you (1 day after check-out)

**Files:**
- `server/services/email-parser.ts` - Extracts guest data from Beds24 emails
- `server/services/email-scheduler.ts` - Schedules automated emails
- `server/services/email-templates.ts` - Multi-language email templates
- `server/services/modification-handler.ts` - Processes booking modifications
- `server/services/cancellation-handler.ts` - Handles cancellation emails
- `shared/schema.ts` - Database schema (bookings table)

### Frontend
- **Framework & Build:** React 18, TypeScript, Vite, Wouter for routing.
- **UI & Styling:** shadcn/ui, Tailwind CSS (New York variant), Radix UI primitives, custom color palette, responsive mobile-first design, Inter font.
- **Mobile-First Optimization:** Touch-friendly targets, responsive typography with `clamp()`, simplified animations, responsive spacing, `prefers-reduced-motion` support.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Internationalization:** React-based i18n with lazy-loaded translations for 15 languages, comprehensive country-derived locale mapping.
- **Booking Pages (Nov 2025):** Static language-specific pages in `/public/book/` directory (AF.html, DE.html, EN.html, ES.html, FR.html, IT.html, JA.html, NL.html, PL.html, PT.html, RU.html, SV.html, SW.html, ZH.html, ZU.html) replace deprecated `booking.html`. Features include:
  - **Clickable Benefit Badges:** All 4 benefit cards ("Best Rate Guaranteed", "Secure Payment", "Instant Confirmation", "Direct Support") scroll users to Beds24 iframe when clicked, addressing UX issue where visitors didn't realize they needed to scroll down to book (identified via Microsoft Clarity analytics).
  - **Accessibility:** Full keyboard support (Enter/Space), ARIA roles (`role="button"`), focusable elements (`tabindex="0"`), test IDs (`benefit-card-1` through `benefit-card-4`).
  - **Language Detection:** URL parameter `?lang=XX` → localStorage (user-selected, persisted) → browser language (navigator.language).
  - **Currency Detection:** URL parameter `?cur=XXX` → Cloudflare IP geolocation (`window.__CF_COUNTRY__`) → default USD. Currency is never cached, always fresh per page load.
- **Performance:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver for image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load, CookieYes deferral, Static Hero HTML pattern, INP optimization.
- **SPA Routing:** Cloudflare Pages middleware handles 404s and serves `index.html` for HTML navigation.
- **Storage Safety Layer:** `localStorage`/`sessionStorage` calls are wrapped with try-catch guards.
- **Booking Page UX:** Click-to-reveal design with interactive sections using colorful gradient badges, WCAG AA compliant contrast ratios, and mobile-first optimizations.
- **Booking Translation Architecture:** Fully translated across 15 languages using modular, dynamically loaded ES6 imports to reduce initial page load.

### Backend
- **Server:** Express.js automailer server (port 3003, internal).
- **Database:** PostgreSQL with Drizzle ORM for booking state tracking (guest info, dates, references, email flags).
- **Email Automation:** Node.js (TypeScript) service processes IMAP notifications and sends SMTP emails via nodemailer.
- **Contact Forms:** Cloudflare Workers with Resend API, reCAPTCHA v3, HTML escaping, and 15-language autoreply emails.

### Project Structure
- **Monorepo:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template).

### Deployment
- **Platform:** Cloudflare Pages with Functions (Workers).
- **Build/Deploy:** `npm run build` and `npx wrangler pages deploy`.
- **Middleware:** `functions/_middleware.js` handles domain redirection, SPA routing, and injects Cloudflare IP geolocation.
- **Static Files:** `_redirects`, `_headers`, `404.html`.
- **DNS:** `devoceanlodge.com` managed on Cloudflare.

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager, CookieYes, Microsoft Clarity.
- **Trust:** Trustindex Floating Certificate widget.
- **Booking:** Beds24 booking engine (propid=297012). Images must be uploaded directly to Beds24.
- **Maps:** Google Maps.
- **Security:** Google reCAPTCHA v3.
- **Email:** Resend API (Cloudflare Workers), SMTP via nodemailer (automailer), IMAP (booking notifications).
- **SEO:** IndexNow protocol.
- **Currency Conversion:** fx-rate.net.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.