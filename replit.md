# DEVOCEAN Lodge Website

## Overview

DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. The application is a full-stack web platform featuring a marketing website with accommodation listings, experience showcases, contact forms, and a multi-language interface. The project supports internationalization (i18n) with 7 languages and includes legal/compliance pages for GDPR, cookies, and privacy policies.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- React-based i18n with lazy-loaded translations (7 languages)
- Vanilla JavaScript i18n for legacy/static legal pages
- Supported languages: English, Portuguese (including Mozambique variant), Dutch, French, Italian, German, Spanish
- Currency support: USD, MZN, ZAR, EUR, GBP with browser-based inference
- Date localization with dd/mm/yyyy format preference

**Performance Optimizations:**
- Dynamic translation loading
- IntersectionObserver-based image lazy loading
- Optimized bundle splitting (react-vendor, i18n-vendor, motion, icons, translations chunks)
- Preconnect hints for external resources
- Hero first image eager loading, subsequent images lazy loaded

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
- Google Tag Manager with Consent Mode v2.
- CookieYes for GDPR-compliant cookie consent management (integrated via GTM).

**Booking Integration:**
- External booking engine at book.devoceanlodge.com with parameterized URLs.

**Maps & Location:**
- Google Maps embed for property location and Directions API integration.

**Security:**
- Google reCAPTCHA v3 (invisible verification on contact form with server-side validation)
  - Site key: 6LdENtwrAAAAAPy6JsCXFJLR16ST1BnX-NyPDC7L (configured for devoceanlodge.com and localhost)
  - Action validation prevents token reuse across forms (action='contact_form')
  - Score-based bot detection: Rejects < 0.3, logs 0.3-0.5 for monitoring
  - RECAPTCHA_SECRET_KEY stored securely in environment secrets
  - **Domain restriction**: To enable reCAPTCHA on staging/test environments, add the domain to the allowed list in Google reCAPTCHA admin console

**Email Service:**
- Secure email integration with auto-reply functionality for contact form submissions.

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