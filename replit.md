# DEVOCEAN Lodge Website

## Overview

DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele while ensuring legal compliance and a seamless user experience across various devices and languages. The project supports internationalization for 15 languages and includes robust legal/compliance pages for GDPR, cookies, and privacy policies.

## User Preferences

**Build and Deployment:**
- **⚠️ CRITICAL:** NEVER build (`npm run build`) or deploy to Cloudflare without explicit user confirmation
- **⚠️ CRITICAL:** After making ANY changes, STOP and wait for user to explicitly say "build and deploy" or similar confirmation
- Do NOT assume deployment is wanted just because changes are complete
- The user will explicitly instruct when to build and deploy

**Testing:**
- **IMPORTANT:** Only run browser tests (run_test tool) when explicitly instructed by the user
- Do NOT automatically run tests after making changes
- Wait for explicit user confirmation before testing

**Deployment Workaround (Git Lock Issue):**
- Replit has a git lock that prevents wrangler from deploying directly from the workspace
- **Solution:** Deploy from /tmp directory to bypass git lock
- **Commands:**
  ```bash
  cd WebsiteProject && npm run build
  rm -rf /tmp/deploy_temp && cp -r WebsiteProject/dist /tmp/deploy_temp
  cd /tmp/deploy_temp && npx wrangler pages deploy . --project-name=devocean-lodge
  ```
- **Project name:** `devocean-lodge` (defined in WebsiteProject/wrangler.toml)
- This workaround is documented and reliable for production deployments

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript
- Vite as the build tool
- Wouter for client-side routing

**UI Component Library & Styling:**
- shadcn/ui components with Tailwind CSS (New York variant)
- Radix UI primitives for accessibility
- Custom color palette: Ocean Blue, Warm Sand, Deep Teal, Sunset Orange
- Responsive design with mobile-first breakpoints

**State Management & Data Fetching:**
- TanStack Query (React Query) for server state management
- Local component state with React hooks

**Internationalization:**
- React-based i18n with lazy-loaded translations across 15 languages (English, Portuguese variants, Dutch, French, Italian, German, Spanish, Swedish, Polish, Afrikaans, Zulu, Japanese, Mandarin Chinese, Russian).
- Vanilla JavaScript i18n for static legal pages.
- Currency support: USD, MZN, ZAR, EUR, GBP, SEK, PLN, JPY, CNY, RUB with browser-based inference.
- Region-based language and currency selector with dynamic filtering based on continents.
- **Russian Language Support (Oct 15):** Complete Russian (ru) translations added including main UI, critical nav, and all 5 legal pages. Hotelrunner booking integration configured with `locale=ru&currency=RUB` parameters. Auto-switches to RUB when Russian language selected in Asia region (manual override available). Russia (RU) mapped to Asia region.
- **Mandarin Chinese Language Support (Oct 15):** Complete Mandarin Chinese (zh) translations added including main UI, critical nav, and all 5 legal pages. Hotelrunner booking integration configured with zh-CN locale and CNY currency. Auto-switches to CNY when Chinese language selected in Asia region (manual override available).
- **Japanese Language Support (Oct 15):** Complete Japanese (ja) translations added including main UI, critical nav, and all 5 legal pages. Hotelrunner booking integration configured with ja-JP locale and JPY currency. Auto-switches to JPY when Japanese language selected in Asia region (manual override available).
- **Afrikaans Language Support (Oct 15):** Complete Afrikaans (af) translations added for Africa region including main UI, critical nav, experiences, and units. Hotelrunner booking integration configured with af-ZA locale. Auto-switches to ZAR when Afrikaans language selected in Africa region (manual override available).
- **Zulu Language Support (Oct 15):** Complete Zulu (zu) translations added including main UI, critical nav, legal UI labels, Privacy Policy, and Cookie Policy. Since Hotelrunner doesn't support Zulu, forwards to en-GB locale with ZAR currency. Auto-switches to ZAR when Zulu language selected in Africa region (manual override available). L10N (units/experiences) using English placeholders. Remaining legal pages (Terms, GDPR, CRIC) ready for future translation.
- **Southern African Country-Specific Currencies (Oct 15):** Intelligent Hotelrunner booking integration now uses country-specific currency codes for Southern African countries based on IP geolocation. Lesotho→LSL, Botswana→BWP, Namibia→NAD, eSwatini→SZL, Zambia→ZMW, Malawi→MWK, Zimbabwe→USD (special case), Tanzania→TZS, Kenya→KES. All countries default to English with menu override option. Users can still manually select different currencies.
- **Currency Auto-Switching (Oct 15):** Intelligent currency pairing with language selection - Japanese→JPY, Chinese→CNY, Russian→RUB, Afrikaans→ZAR automatically when in respective regions. Users retain full manual override capability.
- **IP-Based Geolocation (Oct 14):** Cloudflare automatically injects visitor country code via middleware for accurate region detection. Browser language detection serves as fallback for local development. Eliminates French-in-Asia and eSwatini mapping issues.
- **Currency Detection Fix (Oct 12):** Fixed useState initialization bug where `lang` variable was undefined during currency/region detection. Now properly calls `pickInitialLang()` to ensure correct language context during initialization.
- **Continent Mapping Fixes (Oct 14):** 
  - Added Bosnia-Herzegovina (BA) → Europe and Japan (JP) → Asia
  - Added missing African countries: eSwatini (SZ), Reunion (RE), Mauritius (MU), Seychelles (SC), Lesotho (LS)
  - Fixed timezone overlap causing grey screens: Africa (UTC+0 to +4), Europe (UTC-1 to +2), Asia (UTC+3 to +12) now have distinct non-overlapping ranges
  - Resolves Mozambique and Vietnam grey screen issues in Microsoft Clarity
- **Cloudflare IP Geolocation (Oct 14):**
  - Middleware injects country code from request.cf.country into HTML as window.__CF_COUNTRY__
  - Frontend prioritizes IP-based country detection over browser language hints
  - Browser detection kept as fallback for local development
  - Comprehensive country mapping: 80+ countries across all continents
  - Cache versioning (v2) invalidates old browser-based cached regions
  - Fixes French-in-Asia, eSwatini, UAE, Bosnia Herzegovina, and other mapping issues
  - Production benefits: Free, instant, accurate, no external API needed
- Comprehensive translation of legal pages (Privacy Policy, Cookies Policy, Terms, GDPR, CRIC) including cultural enhancements for Mozambican Portuguese.

**Performance Optimizations:**
- **Critical Translations Pattern (Oct 14):** Mobile menu renders instantly with synchronous 2KB navigation translations inlined in main bundle. Full 17.6KB translation bundle loads progressively in background. Eliminates "nothing happens" delays on slow 2G/3G connections (common in Africa/Mozambique).
  - Header uses critical nav immediately on load
  - UI clears during language switch to force instant critical nav update
  - Page content waits for full translations to prevent placeholder text/undefined errors
  - Adds +1.8KB to main bundle but provides instant interactivity
- Dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting.
- Framer Motion using LazyMotion for bundle size reduction.
- GTM with a 4-second delayed load and user engagement detection.

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation).

**Storage Layer:**
- In-memory storage implementation (MemStorage class) for flexibility, designed for future database integration.

**Database Schema:**
- Drizzle ORM configured for PostgreSQL with Zod schemas for input validation.

### Project Structure

**Dual Project Setup:**
- `/WebsiteProject/`: Optimized React/Vite marketing website.
- `/client/` and `/server/`: Placeholder for a full-stack application template.

**Design System:**
- **Typography:** Inter font family.
- **Component Patterns:** Card-based layouts, image-first design, expandable detail sections.
- **Interaction Design:** Hover states, focus-visible outlines, smooth scroll, sticky header.

## External Dependencies

### Third-Party Services

**Analytics & Consent Management:**
- Google Tag Manager (GTM-532W3HH2) with Consent Mode v2 for analytics and cookie consent.
- CookieYes for GDPR-compliant cookie consent, managed via GTM.
- **Microsoft Clarity Integration (Oct 13):** Custom "User Engaged" trigger (4s delay, fires once) with `analytics_storage` consent requirement. Official "All Pages" tag paused to prevent conflicts and blank recordings for EU users who haven't consented.

**Booking Integration:**
- External booking engine at book.devoceanlodge.com with parameterized URLs for locale and currency.
- Region-aware Portuguese booking URLs for tailored user experience.
- Legal pages support smart back navigation from Hotelrunner via query parameters (e.g., `?return=https://book.devoceanlodge.com/bv3/payment`).
  - Cache-busting versioning for JavaScript (currently v=50) and CSS (currently v=43) to ensure fresh updates.
  - sessionStorage-based referrer tracking for reliable cross-site navigation.

**Maps & Location:**
- Google Maps embed for property location, utilizing a lazy-loaded interactive map with a static preview.

**Security:**
- Google reCAPTCHA v3 for invisible verification on contact forms with server-side validation.

**Email Service:**
- Secure email integration with auto-reply for contact form submissions.

**SEO & Search Indexing:**
- IndexNow protocol implementation for instant search engine indexing.
- Cloudflare Pages Functions for serving IndexNow key file.
- SEO optimizations including meta descriptions, titles, and comprehensive Open Graph tags.
- **Legal Pages SEO (Oct 12):** Enhanced all legal page meta tags with unique 200+ character descriptions, keyword-rich titles, and location-specific content (Ponta do Ouro, Mozambique) to resolve Microsoft Clarity/Bing Webmaster SEO warnings about short/duplicate meta descriptions.
- **Robots.txt (Oct 14):** Fully managed by Cloudflare's built-in robots.txt feature. Custom Pages Function removed to avoid duplication. Cloudflare handles AI bot blocking and content signal directives.

### NPM Packages

**Core Framework:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
**UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
**Developer Tools:** `vite`, `@vitejs/plugin-react`, `@replit/vite-plugin-*`, `typescript`, `wrangler`.
**Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
**Routing & Forms:** `wouter`, `react-hook-form`.

### Asset Management

- **Static Assets:** Stock images, photo gallery, logo, and branding assets.
- **Legal Documents:** Static HTML pages for compliance (privacy, cookies, terms, GDPR, CRIC).