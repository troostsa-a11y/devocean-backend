# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele while ensuring legal compliance and a seamless user experience across various devices and languages. The project supports internationalization for 16 languages and includes robust legal/compliance pages for GDPR, cookies, and privacy policies.

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
- **IMPORTANT:** Build script automatically copies `functions/` to `dist/` for Cloudflare Pages Functions (middleware)
- This workaround is documented and reliable for production deployments

## System Architecture

### Frontend Architecture
- **Framework & Build System:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI & Styling:** shadcn/ui components, Tailwind CSS (New York variant), Radix UI primitives, custom color palette (Ocean Blue, Warm Sand, Deep Teal, Sunset Orange), responsive mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Navigation:** Mobile and desktop menus include "Our Story" link to `/story.html` page (added to both desktop and mobile menus).
- **Internationalization:**
    - React-based i18n with lazy-loaded translations for 16 languages using unified Hotelrunner locale codes: en-GB (UK English), en-US (US English), pt-PT (Portugal Portuguese), pt-BR (Brazilian Portuguese, also used for Mozambique/Angola), nl-NL, fr-FR, it-IT, de-DE, es-ES, sv, pl, af-ZA, zu, sw, ja-JP, zh-CN, ru.
    - **Unified Language Codes (Oct 19, 2025 - FULLY UNIFIED):** ALL systems use identical Hotelrunner locale codes throughout with NO mapping layers: `en-GB`, `en-US`, `pt-PT`, `pt-BR`, `nl-NL`, `fr-FR`, `it-IT`, `de-DE`, `es-ES`, `ja-JP`, `zh-CN`, `af-ZA`, `sv`, `pl`, `ru`, `zu`, `sw`. Single unified system across: React app (useLocale.js), vanilla JS i18n (story-i18n.js, accommodation-detail-i18n.js), ALL translation JSON files (translations.js, critical.js, story-translations-template.json, accommodation-translations-template.json), Header.jsx, booking URLs, localStorage, and server-side email. JSON files use exact same codes as system - direct 1:1 mapping with zero conversion.
    - **Portuguese Variants:** Distinct language codes for Portuguese: `pt-PT` for Portugal (EUR currency), `pt-BR` for Brazil/Mozambique/Angola (Hotelrunner only supports pt-PT and pt-BR, not pt-MZ).
    - Vanilla JavaScript i18n for static pages (story.html uses `story-i18n.js`, legal pages use `legal-i18n.js`, accommodation detail pages use `accommodation-detail-i18n.js`).
    - **Accommodation Detail Pages:** All 4 static accommodation pages (safari.html, comfort.html, cottage.html, chalet.html) feature WebP-optimized photo galleries (4 photos each, 46.2% size reduction vs JPEG), full content translation across all 16 languages (hero title, descriptions, and all feature bullet points), and dynamic content loading from accommodation-translations-template.json using unified Hotelrunner locale codes.
    - **Language Preservation:** All navigation links to static pages (story.html, accommodation detail pages) preserve the current language via URL parameter (e.g., `?lang=af-ZA`, `?lang=nl-NL`).
    - **Dynamic Booking URLs:** All static pages (story.html, safari.html, chalet.html, cottage.html, comfort.html) dynamically generate booking URLs based on localStorage preferences (language + currency) using exact Hotelrunner locale codes.
    - **Language Detection:** Multi-tier system prioritizing localStorage → browser language → IP-based country mapping (`CC_TO_LANGUAGE`) → region-aware English fallback (Americas→en-US, others→en-GB). Ensures Japanese visitors see Japanese content even with English-configured browsers. All detection functions normalize to full Hotelrunner locale codes.
    - **Currency System (Oct 19, 2025 - Simplified):** Currency is STRICTLY based on visitor's IP-detected country and ALWAYS shows legal tender for that country (via `CC_TO_CURRENCY` mapping, e.g., MZ→MZN, BR→BRL, ZA→ZAR). Currency automatically updates when user travels to different country. Manual language or region changes do NOT affect currency. URL parameters are ignored to ensure compliance. System auto-corrects wrong cached currencies to match current IP location.
    - Full translation coverage for all legal pages and content across all 16 languages.
    - Cloudflare IP Geolocation for accurate region and country detection (`window.__CF_COUNTRY__`), with a fallback to Europe. Comprehensive country mapping for 80+ countries.
    - US English support (`en-US`) with USD currency, distinct from UK English (`en-GB`).
    - CCPA compliance with "Do Not Sell My Info" footer link and CookieYes integration for US visitors.
- **Performance Optimizations:** Critical Translations Pattern for instant mobile menu rendering, dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting, Framer Motion using LazyMotion, GTM with delayed load.

### Backend Architecture
- **Server Framework:** Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation).
- **Storage Layer:** In-memory storage (`MemStorage`) designed for future database integration.
- **Database Schema:** Drizzle ORM configured for PostgreSQL with Zod schemas for input validation.

### Project Structure
- **Dual Project Setup:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template placeholder).
- **Design System:** Inter font family, card-based layouts, image-first design, expandable detail sections, hover states, focus-visible outlines, smooth scroll, sticky header.

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager (GTM-532W3HH2) with Consent Mode v2, CookieYes (ID: f0a2da84090ecaa3b37f74af) via GTM Template for GDPR/CCPA-compliant cookie consent, Microsoft Clarity for session recording with consent management.
- **Booking Integration (Oct 22, 2025 - MIGRATED TO BEDS24):** 
  - **Current:** Beds24 booking engine (propid=297012) embedded in `/booking.html` with custom header/footer, UTM parameter forwarding, and dynamic height adjustment.
  - **Previous:** Hotelrunner at `book.devoceanlodge.com` - DEPRECATED due to application bug in Hotelrunner's system that redirected visitors to API endpoint (`/api/v1/bv3/orders/pixel/search`) instead of booking page (`/bv3`), causing white pages and visitor frustration. Migration to Beds24 completed October 22, 2025.
  - **Post-booking:** Custom thank you page at `/thankyou.html` for post-reservation redirects.
- **Maps & Location:** Google Maps embed for property location (lazy-loaded interactive map with static preview).
- **Security:** Google reCAPTCHA v3 for invisible verification on contact forms with server-side validation.
- **Email Service:** Secure email integration with auto-reply for contact form submissions.
- **SEO & Search Indexing:** IndexNow protocol for instant search engine indexing via Cloudflare Pages Functions, comprehensive SEO meta tags, titles, Open Graph tags. Cloudflare's built-in `robots.txt` management.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `@replit/vite-plugin-*`, `typescript`, `wrangler`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.

### Asset Management
- **Static Assets:** Stock images, photo gallery, logo, branding assets.
- **Accommodation Photos:** 16 unit photos optimized to WebP format (safari-1 through chalet-4 in `/public/photos/units/`), achieving 46.2% file size reduction. Optimization script uses `fs.stat()` for accurate file size reporting.
- **Legal Documents:** Static HTML pages for compliance (privacy, cookies, terms, GDPR, CRIC).