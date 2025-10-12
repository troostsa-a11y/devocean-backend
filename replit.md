# DEVOCEAN Lodge Website

## Overview

DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele while ensuring legal compliance and a seamless user experience across various devices and languages. The project supports internationalization for 9 languages and includes robust legal/compliance pages for GDPR, cookies, and privacy policies.

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
- React-based i18n with lazy-loaded translations across 10 languages (English, Portuguese variants, Dutch, French, Italian, German, Spanish, Swedish, Polish).
- Vanilla JavaScript i18n for static legal pages.
- Currency support: USD, MZN, ZAR, EUR, GBP, SEK, PLN with browser-based inference.
- Region-based language and currency selector with dynamic filtering based on continents.
- **Smart Geolocation:** Automatic continent detection with African market prioritization - scans ALL browser languages to find African country codes (ZA, MZ, etc.) even when en-US appears first. Falls back to timezone meridian detection, then Europe default.
- Comprehensive translation of legal pages (Privacy Policy, Cookies Policy, Terms, GDPR, CRIC) including cultural enhancements for Mozambican Portuguese.

**Performance Optimizations:**
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

**Booking Integration:**
- External booking engine at book.devoceanlodge.com with parameterized URLs for locale and currency.
- Region-aware Portuguese booking URLs for tailored user experience.
- Legal pages support smart back navigation from Hotelrunner via query parameters (e.g., `?return=https://book.devoceanlodge.com/bv3/payment`).
  - Cache-busting versioning for JavaScript (currently v=46) and CSS (currently v=43) to ensure fresh updates.
  - sessionStorage-based referrer tracking for reliable cross-site navigation.

**Maps & Location:**
- Google Maps embed for property location, utilizing a lazy-loaded interactive map with a static preview.

**Security:**
- Google reCAPTCHA v3 for invisible verification on contact forms with server-side validation.

**Email Service:**
- Secure email integration with auto-reply for contact form submissions.

**SEO & Search Indexing:**
- IndexNow protocol implementation for instant search engine indexing.
- Cloudflare Pages Functions for serving IndexNow key file and robots.txt.
- SEO optimizations including meta descriptions, titles, and AI bot directives in robots.txt.

### NPM Packages

**Core Framework:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
**UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
**Developer Tools:** `vite`, `@vitejs/plugin-react`, `@replit/vite-plugin-*`, `typescript`, `wrangler`.
**Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
**Routing & Forms:** `wouter`, `react-hook-form`.

### Asset Management

- **Static Assets:** Stock images, photo gallery, logo, and branding assets.
- **Legal Documents:** Static HTML pages for compliance (privacy, cookies, terms, GDPR, CRIC).