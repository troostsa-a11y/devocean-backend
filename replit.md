# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a lodge in Ponta do Ouro, Mozambique. Its purpose is to serve as the primary marketing tool, showcasing accommodation, experiences, and offering contact forms. The project supports a multi-language interface (17 languages) to attract a global audience, ensures legal compliance (GDPR, cookies), and delivers a responsive user experience. The business vision is to increase bookings and brand visibility for the lodge.

## Recent Changes (December 2025)
- **INP Optimization - Consolidated Script Loader (Jan 3):** Merged 4 separate deferred script loaders (GTM, CookieYes, Engagement Tracker, Rage Detector) into a single unified system. Reduces 12 event listeners to 3, eliminates duplicate `firstInteractionComplete` flags, uses shared `scheduleWithIdle` helper. Same staggered delays (500ms, 700ms, 900ms, 1100ms) but with cleaner code and reduced main thread callback overhead.
- **Multiple H1 SEO Fix (Dec 22):** Resolved Bing Webmaster "more than one h1 tag" warning. The homepage had two h1 tags: (1) static placeholder in index.html for instant display before React loads, and (2) React HeroSection's dynamic h1. Fix: Changed static placeholder from `<h1>` to `<p>` with `role="heading" aria-level="1"` for accessibility. Now only React's h1 exists for SEO while placeholder maintains screen reader support during load.
- **Iframe Error Handling (Dec 22):** Improved error handling on all 15 booking pages to reduce "Script error." events in Clarity. Added `crossorigin="anonymous"` to iframe-resizer script, wrapped initialization in try-catch, added function existence check, and `warningTimeout: 0` to suppress warnings. Errors now caught gracefully; booking still works if iframe-resizer has issues.
- **Preview Badges (Dec 22):** Added preview badges to accommodation cards (Fan, A/C, En-suite, Terrace, etc.) and experience cards (Courses Available, Early Morning, Boat Trip, Game Drive, etc.) to reduce quick back-clicks per Clarity feedback.
- **Beds24 Iframe Auto-Resize (Dec 4):** Eliminated "scroll within scroll" UX issue on all 15 booking pages. Implemented iframe-resizer library (v4.2.10) that dynamically adjusts iframe height to match Beds24 content. Parent pages load `iframeResizer.min.js` from CDN; Beds24 admin has `iframeResizer.contentWindow.min.js` in HTML head. Booking section now flows naturally within page - no internal scrollbar.
- **Accommodation Gallery Lightbox (Dec 4):** Added accessible image lightbox to all 4 accommodation detail pages (safari.html, comfort.html, cottage.html, chalet.html). Features: click-to-zoom, keyboard navigation (arrows, ESC), touch swipe support, image counter, ARIA labels. Reduces rage-clicks on gallery images.

## Recent Changes (November 2025)
- **Automailer Crash Recovery (Nov 28):** Fixed critical bug in `start.js` where email automation server crashes caused complete service failure without auto-restart. Now includes: (1) Automatic restart with exponential backoff (5s to 60s delays), (2) Max 10 restart attempts before giving up, (3) Graceful shutdown on SIGINT/SIGTERM, (4) Separate restart logic for email and website servers. Previously, any crash would just log and exit - now the service self-heals.
- **Gender Detection Multi-Language (Nov 28):** Updated email parser to support gender field in 12 languages (EN, DE, ES, FR, IT, JA, PL, NL, PT, RU, SV, ZH). Recognizes M/F/Other in all language variants including W (German female), K (Polish female), V (Dutch female), Ж (Russian female), and Asian characters. 'Other' gender uses neutral greeting.
- **Booking Page Badges (Nov 28):** Reduced benefit badge height by 50% on all 15 booking pages. Removed description text, keeping only icons and headlines for cleaner look.
- **Rage-Click Detection:** Fully functional spam-click prevention system across all 17 languages to keep Microsoft Clarity data clean. Detects 3+ rapid clicks on non-interactive elements (within 1 second), shows brand-colored toast notification (orange-to-brown gradient matching site colors) via overlay system, applies 2-second cooldown, and tags sessions in Clarity for filtering. Loads asynchronously after first interaction (1100ms delay) with zero impact on page performance. Language detection prioritizes localStorage (React's source of truth) for instant multi-language support. Limit: 10 toasts per session to balance user feedback with non-intrusive behavior.
- **CLS Optimization:** Changed Raleway font loading from `display=swap` to `display=optional` on all 15 booking pages (`/public/book/*.html`). This prevents text reflow when fonts load, improving Cumulative Layout Shift scores for Microsoft Clarity and Core Web Vitals. Fast connections load the font instantly (within 100ms), while slow connections use system fonts without layout shifts.
- **Beds24 Layout Fix:** Updated `beds24-translations.js` custom script to enforce `layout=2` on all unit selection buttons (Safari Tent, Comfort Tent, Garden Cottage, Thatched Chalet). Previously, buttons defaulted to `layout=1`. Script now replaces `layout=1` with `layout=2` or appends `&layout=2` if missing.
- **SEO Compliance:** All 15 booking pages now have unique, language-specific meta descriptions (150-165 characters each), resolving Bing Webmaster Tools duplicate/short description warnings.

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

### UI/UX Decisions
- **Design System:** shadcn/ui, Tailwind CSS (New York variant), Radix UI primitives.
- **Styling:** Custom color palette, Inter font, WCAG AA compliant contrast ratios.
- **Responsiveness:** Mobile-first design, touch-friendly targets, responsive typography with `clamp()`, simplified animations, responsive spacing, `prefers-reduced-motion` support.
- **Booking Page UX:** Click-to-reveal design with interactive sections using colorful gradient badges. Clickable benefit badges scroll users to Beds24 iframe.
- **Accessibility:** Full keyboard support, ARIA roles, focusable elements, test IDs.

### Technical Implementations
- **Frontend Framework:** React 18, TypeScript, Vite, Wouter for routing.
- **Internationalization:** Hybrid language codes (full locale for frontend, 2-letter ISO for backend), React-based i18n with lazy-loaded translations for 15 languages, country-derived locale mapping.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Performance:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver for image lazy loading, optimized bundle splitting, Framer Motion (LazyMotion), GTM with delayed load, CookieYes deferral, Static Hero HTML pattern, INP optimization, CLS optimization via `font-display: optional` on booking pages, rage-click detection to discourage spam clicking and keep Clarity data clean.
- **Storage Safety:** `localStorage`/`sessionStorage` calls wrapped with try-catch.
- **Email Architecture:** Hybrid system where Cloudflare Workers handle contact forms (reCAPTCHA v3, Resend API, localized auto-replies) and an Express.js server (Automailer) in Replit processes Beds24 booking notifications via IMAP to send multi-language automated emails via SMTP.
- **Beds24 Customization:** Custom JavaScript (`beds24-translations.js`) loaded into Beds24 iframe to: (1) translate unit names to 15 languages, (2) highlight active unit selection, (3) enforce `layout=2` parameter on all unit buttons to ensure consistent booking interface across all entry points.

### Feature Specifications
- **Automailer:** Tracks guest info, booking dates, and email flags. Processes new bookings, modifications, and cancellations. Supports 15 languages with 3-tier language determination (Beds24 preference, country code mapping, default English). Schedules post-booking, pre-arrival, arrival day, and post-departure emails.
- **Experience Inquiry Forms:** Reusable form component with multi-language support (17 languages). Uses reCAPTCHA v3 (development vs. production handling). Form validation includes required fields, email format, minimum message length, and future dates. Operator data synchronization is critical, with backend `experienceDetails.js` being the authoritative source for operator emails.

### System Design Choices
- **Monorepo Structure:** `/WebsiteProject/` (React/Vite) and `/client/` & `/server/` (full-stack template).
- **Deployment:** Cloudflare Pages with Functions (Workers) for hosting and backend logic.
- **Backend:** Express.js server (port 3003) for automailer.
- **Database:** PostgreSQL with Drizzle ORM for booking state tracking.
- **Deployment Middleware:** Cloudflare Pages `_middleware.js` for domain redirection, SPA routing, and IP geolocation injection.
- **Static Content:** Static language-specific booking pages (`/public/book/`).

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager, CookieYes, Microsoft Clarity.
- **Trust:** Trustindex Floating Certificate widget.
- **Booking Engine:** Beds24 (propid=297012, layout=2 enforced via custom script).
- **Maps:** Google Maps.
- **Security:** Google reCAPTCHA v3.
- **Email Services:** Resend API (for Cloudflare Workers), SMTP (via nodemailer for automailer), IMAP (for booking notifications).
- **SEO:** IndexNow protocol, Bing Webmaster Tools compliance.
- **Currency Conversion:** fx-rate.net.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.