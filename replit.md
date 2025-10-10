# DEVOCEAN Lodge Website

## Overview

DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. The application is a full-stack web platform featuring a marketing website with accommodation listings, experience showcases, contact forms, and a multi-language interface. The project supports internationalization (i18n) with 9 languages (including Swedish and Portuguese variants) and includes legal/compliance pages for GDPR, cookies, and privacy policies.

## User Preferences

Preferred communication style: Simple, everyday language.

**Build and Deployment:**
- **IMPORTANT:** Only build (`npm run build`) and deploy to Cloudflare when explicitly instructed by the user
- Do NOT automatically build/deploy after making changes
- Wait for explicit user confirmation before deploying

**Testing:**
- **IMPORTANT:** Only run browser tests (run_test tool) when explicitly instructed by the user
- Do NOT automatically run tests after making changes
- Wait for explicit user confirmation before testing

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript
- Vite as the build tool
- Wouter for client-side routing

**UI Component Library & Styling:**
- shadcn/ui components with Tailwind CSS (New York variant)
- Radix UI primitives for accessibility
- Class Variance Authority (CVA) for component variants
- Lucide React for icons
- Custom color palette: Ocean Blue, Warm Sand, Deep Teal, Sunset Orange
- Responsive design with mobile-first breakpoints
- Custom elevation utilities for interactive elements

**State Management & Data Fetching:**
- TanStack Query (React Query) for server state management
- Local component state with React hooks
- Custom hooks for mobile detection and toast notifications

**Internationalization:**
- React-based i18n with lazy-loaded translations (10 languages including Swedish and Polish)
- Vanilla JavaScript i18n for legacy/static legal pages with dynamic data-section/data-part attribute system
- Supported languages: English, Portuguese (pt-mz/pt-br/pt-pt all map to standard Portuguese), Dutch, French, Italian, German, Spanish, Swedish, Polish
- Currency support: USD, MZN, ZAR, EUR, GBP, SEK, PLN with browser-based inference
- Date localization with dd/mm/yyyy format preference
- **Region-based language selector** with 5 continents (Europe, Asia, Americas, Africa, Oceania)
  - Dynamic language filtering: Europe (all 9 languages including Polish), Asia (English), Americas (English/Spanish/French), Africa (English/French/Portuguese), Oceania (English)
  - Currency filtering: Meticais (MZN) restricted to Africa region only
  - Auto-switch to English when current language unavailable in selected region
- **Header dropdown styling**: Fixed-width selectors with consistent design (optimized for mobile)
  - Region: 45px button showing globe icon + 2-letter abbreviation (EU, AS, AM, AF, OC), 90px dropdown with full region names (Americas is widest)
  - Language: 75px
  - Currency: 60px
- Badge translations: All legal pages properly localized with "About cookies" badge in all languages (v=30)
  - Mobile badge styling: 14px font (matches section headers), compact 6px vertical padding
  - Badge text only shown on mobile (body hidden, button removed)
- Terms page translations: Complete translations for Force Majeure (including insurance exclusion clause), Intellectual Property, and Dispute Resolution sections (Polish translations pending)

**Performance Optimizations:**
- Dynamic translation loading
- IntersectionObserver-based image lazy loading
- Optimized bundle splitting (react-vendor, i18n-vendor, motion, icons, translations chunks)
- Preconnect hints for external resources
- Hero first image eager loading, subsequent images lazy loaded
- **Framer Motion**: Using LazyMotion with domAnimation features for ~20-25 KiB bundle savings
- **GTM Optimization**: 4-second delayed load + user engagement detection for deferred marketing tag firing

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation)
- Custom middleware for request logging and error handling

**Storage Layer:**
- In-memory storage implementation (MemStorage class) as default, designed for easy swap to database persistence.

**Database Schema (Prepared):**
- Drizzle ORM configured for PostgreSQL with Zod schemas for input validation.

### Project Structure

**Dual Project Setup:**
- `/WebsiteProject/`: Optimized React/Vite marketing website (main site)
- `/client/` and `/server/`: Full-stack application template (not actively used)

**WebsiteProject Component Organization:**
- Modular components for Header, HeroSection, AccommodationsSection, ExperiencesSection, TodoSection, GallerySection, LocationSection, ContactSection, Footer, and LazyImage.
- i18n System: translations.js, useLocale.js, localize.js
- Data: `/WebsiteProject/src/data/content.js`

### Design System

**Typography:**
- Inter font family from Google Fonts.

**Component Patterns:**
- Card-based layouts, image-first design, expandable detail sections, overlay gradients.

**Interaction Design:**
- Hover states with subtle zoom effects, focus-visible outlines, smooth scroll behavior, sticky header.

## External Dependencies

### Third-Party Services

**Analytics & Consent Management:**
- Google Tag Manager (GTM-532W3HH2) with Consent Mode v2
  - GTM loads with 4-second delay for initial page load optimization
  - Consent defaults set in HTML before GTM loads (best practice for 2024)
  - User engagement detection fires 'marketing_allowed' event after scroll/click/20s + ad consent granted
  - **Additional 3-second delay for Google Ads conversion tracking** (total ~7s delay) to reduce main-thread blocking
- CookieYes for GDPR-compliant cookie consent management
  - **Fully managed via GTM** - no direct CookieYes code in any HTML files
  - CookieYes CMP (loader) tag with priority 100 (loaded through GTM)
  - CookieYes Consent Mode Bridge updates consent when users interact (loaded through GTM)
  - All consent management logic handled by GTM tags, not page-level scripts
- **Legal Pages Optimization (Oct 2025):**
  - Consolidated head section across all 5 legal pages (cookies, privacy, terms, GDPR, CRIC)
  - Removed 4+ duplicate GTM scripts, now single canonical GTM snippet per page
  - Consent Mode v2 defaults set BEFORE GTM loads (GDPR compliance best practice)
  - Performance hints: preconnect/dns-prefetch for GTM, Cloudflare Insights, Google Analytics
  - Deferred i18n scripts (non-blocking page load)
  - Deduplicated CSS (removed 3x duplicate :root, .quick-nav definitions)
  - Accessible focus styles using `var(--focus)` blue outline visible on all backgrounds

**Booking Integration:**
- External booking engine at book.devoceanlodge.com with parameterized URLs.

**Maps & Location:**
- Google Maps embed for property location and Directions API integration
- **Lazy-loaded implementation** (~120 KiB JavaScript savings):
  - Static preview image loaded first
  - Interactive map loads only when user clicks "View Interactive Map" button
  - Server-side proxy endpoint `/api/static-map` for static preview (API key secured on server)
  - Requires `GOOGLE_MAPS_API_KEY` environment variable for static map preview

**Security:**
- Google reCAPTCHA v3 (invisible verification on contact form with server-side validation)
  - Site key: 6LdENtwrAAAAAPy6JsCXFJLR16ST1BnX-NyPDC7L (configured for devoceanlodge.com and localhost)
  - Action validation prevents token reuse across forms (action='contact_form')
  - Score-based bot detection: Rejects < 0.3, logs 0.3-0.5 for monitoring
  - RECAPTCHA_SECRET_KEY stored securely in environment secrets
  - **Domain restriction**: To enable reCAPTCHA on staging/test environments, add the domain to the allowed list in Google reCAPTCHA admin console

**Email Service:**
- Secure email integration with auto-reply functionality for contact form submissions.

**SEO & Search Indexing:**
- IndexNow protocol implementation for instant search engine indexing
  - API Key: 4339cd9fe9f2766ae7f04b21f3848dec
  - Submission script: `WebsiteProject/indexnow-submit.js`
  - Cloudflare Pages Functions used to serve `.txt` files (bypasses SPA routing)
    - `functions/[key].txt.js` - Serves IndexNow key file as plain text
    - `functions/robots.txt.js` - Serves robots.txt with Bing AI content signals
  - Robots.txt includes Content-signal directives (search=yes, ai-train=no) and AI bot restrictions
  - 202 response = Success (URLs accepted and queued for indexing)
- SEO optimizations: 54-char title, 149-char meta description, static H1 tag for crawlers
- Sitemap.xml for comprehensive site structure crawling

### NPM Packages

**Core Framework:**
- react, react-dom
- express
- drizzle-orm, drizzle-zod (for potential future database integration)
- pg (for session store)

**UI & Styling:**
- tailwindcss, autoprefixer, postcss
- @radix-ui/*
- framer-motion
- lucide-react

**Developer Tools:**
- vite, @vitejs/plugin-react
- @replit/vite-plugin-*
- typescript
- wrangler (Cloudflare Pages deployment)

**Data Management:**
- @tanstack/react-query
- zod
- nanoid

**Routing & Forms:**
- wouter
- react-hook-form

### Asset Management

**Static Assets:**
- Stock images, photo gallery, logo, and branding assets.
- Vite alias configuration for asset imports.

**Legal Documents:**
- Static HTML pages for legal compliance (privacy, cookies, terms, GDPR, CRIC).
- Robots.txt and sitemap.xml.

## Deployment Workflow

**Direct Deployment from Replit to Cloudflare Pages:**
- Wrangler CLI configured for direct deployment
- Project name: `devocean-lodge` (Cloudflare Pages)
- Configuration file: `WebsiteProject/wrangler.toml`
- Authentication: `CLOUDFLARE_API_TOKEN` environment variable (requires User→Memberships→Read, User→User Details→Read, Account→Cloudflare Pages→Edit permissions)

**Deployment Commands:**
```bash
cd WebsiteProject
npm run build    # Build optimized production files
npm run deploy   # Deploy to Cloudflare Pages (devoceanlodge.com)
```

**No longer required:**
- GitHub commits for deployment
- Render backend deployment (backend now at https://devocean-api.onrender.com for API endpoints only)