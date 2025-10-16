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
- **Internationalization:**
    - React-based i18n with lazy-loaded translations for 16 languages (English, Portuguese variants, Dutch, French, Italian, German, Spanish, Swedish, Polish, Afrikaans, Zulu, Swahili, Japanese, Mandarin Chinese, Russian).
    - Vanilla JavaScript i18n for static legal pages.
    - **Language Detection:** Multi-tier system prioritizing localStorage → browser language → IP-based country mapping (`CC_TO_LANGUAGE`) → English fallback. Ensures Japanese visitors see Japanese content even with English-configured browsers.
    - **Currency Detection:** Auto-assignment based on visitor's country legal tender via `CC_TO_CURRENCY` mapping (e.g., JP→JPY, CN→CNY, RU→RUB).
    - Full translation coverage for all legal pages and content across all 16 languages.
    - Intelligent currency pairing with language selection with manual override capability.
    - Cloudflare IP Geolocation for accurate region and country detection (`window.__CF_COUNTRY__`), with a fallback to Europe. Comprehensive country mapping for 80+ countries.
    - US English support (`en-US`) with USD currency, distinct from UK English.
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
- **Booking Integration:** External booking engine at `book.devoceanlodge.com` with parameterized URLs for locale and currency, region-aware Portuguese URLs, and smart back navigation from Hotelrunner.
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
- **Legal Documents:** Static HTML pages for compliance (privacy, cookies, terms, GDPR, CRIC).