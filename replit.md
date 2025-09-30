# DEVOCEAN Lodge Website

## Overview

DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. The application is a full-stack web platform featuring a marketing website with accommodation listings, experience showcases, contact forms, and a multi-language interface. The project supports internationalization (i18n) with 7 languages and includes legal/compliance pages for GDPR, cookies, and privacy policies.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (September 30, 2025)

**Major Code Optimization Completed:**
- Refactored monolithic 2,458-line App.jsx into 9 modular components:
  - Header.jsx - Navigation and language/currency selection
  - HeroSection.jsx - Hero slider with brand images
  - AccommodationsSection.jsx - Accommodation unit cards
  - ExperiencesSection.jsx - Activity and experience cards
  - TodoSection.jsx - Things to do section
  - GallerySection.jsx - Photo gallery grid
  - LocationSection.jsx - Google Maps integration
  - ContactSection.jsx - Contact form
  - Footer.jsx - Footer with navigation links
- Implemented dynamic i18n loading - translations now load on-demand per language instead of bundling all 7 languages upfront
- Created LazyImage component with IntersectionObserver for performance-optimized image loading across all sections
- Optimized Vite configuration with manual code splitting (react-vendor, i18n-vendor, motion, icons, translations chunks)
- Extracted content data into separate content.js module for better maintainability
- Reduced App.jsx from 2,458 lines to ~70 lines while preserving all functionality including multi-language support and booking integration

**Secure Email Integration:**
- Replaced insecure .secrets folder with Replit environment secrets (9 MAIL_* variables)
- Created Express backend with /api/contact endpoint in WebsiteProject/server.js
- Implemented security measures: CRLF injection prevention, email validation, input sanitization
- Updated ContactSection.jsx with proper fetch API integration and loading/success/error states
- Created start.js wrapper for cross-directory npm compatibility

**Fixed Header Navigation (RESOLVED):**
- Converted sticky positioned headers to fixed positioning for better reliability
- Topbar (brown bar) and main header now use position: fixed with proper z-index layering
- Implemented differential scroll-margin-top: #home scrolls to top (0), other sections offset by header stack height
- Hero section changed to min-h-screen with dynamic padding to accommodate fixed headers
- Navigation now works perfectly: Accueil scrolls to top with hero visible, all other sections align below headers without gaps
- Solution: CSS changes to index.css (fixed positioning, scroll margins) and HeroSection.jsx (full screen height)

**Performance Improvements:**
- Images load only when entering viewport (IntersectionObserver)
- Translation files load dynamically based on language selection
- Optimized bundle splitting for better caching
- Reduced initial bundle size through lazy loading

## Running the Application

**Local Development (Recommended):**
```bash
cd WebsiteProject
npm run dev
```
Server will start on http://localhost:5000

**Replit Environment:**
The Replit workflow is configured to run `npm run dev` from the root directory. Due to path resolution limitations, if the workflow fails, run manually from WebsiteProject/:
```bash
cd WebsiteProject && npm run dev
```

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for component-based UI development
- Vite as the build tool and development server with HMR support
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component Library:**
- shadcn/ui components with Tailwind CSS styling (New York variant)
- Radix UI primitives for accessible, unstyled component foundations
- Class Variance Authority (CVA) for component variant management
- Lucide React for icon components

**Styling Approach:**
- Tailwind CSS utility-first framework with custom design tokens
- CSS variables for theme customization (light/dark mode support)
- Custom color palette: Ocean Blue (primary), Warm Sand, Deep Teal, Sunset Orange
- Responsive design with mobile-first breakpoints
- Custom elevation utilities (hover-elevate, active-elevate) for interactive elements

**State Management & Data Fetching:**
- TanStack Query (React Query) for server state management
- Local component state with React hooks
- Custom hooks for mobile detection and toast notifications

**Internationalization:**
- Two separate i18n implementations:
  1. Main app: React-based i18n with lazy-loaded translations (WebsiteProject/src/i18n/)
  2. Legacy/static pages: Vanilla JavaScript i18n system (legal pages)
- Supported languages: English, Portuguese (including Mozambique variant), Dutch, French, Italian, German, Spanish
- Currency support: USD, MZN, ZAR, EUR, GBP with browser-based inference
- Date localization with dd/mm/yyyy format preference

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Custom middleware for request logging and error handling
- Session management using connect-pg-simple (PostgreSQL session store)

**Development Environment:**
- Vite middleware integration for HMR in development
- Separate development and production build processes
- Runtime error overlay for development debugging

**Storage Layer:**
- In-memory storage implementation (MemStorage class) as the default
- Interface-based design (IStorage) allowing easy swap to database persistence
- Currently implements basic user CRUD operations

**Database Schema (Prepared but not actively used):**
- Drizzle ORM configured for PostgreSQL
- Schema defines users table with UUID primary keys
- Zod schemas for input validation
- Migration system ready (drizzle-kit configured)

### Project Structure

**Dual Project Setup:**
- `/WebsiteProject/`: Optimized React/Vite marketing website (main site)
- `/client/` and `/server/`: Full-stack application template (not actively used)
- Asset management via Vite aliases (@, @shared, @assets)

**WebsiteProject Component Organization:**
- Main App: `/WebsiteProject/src/App.jsx` (orchestrates all sections)
- Components: `/WebsiteProject/src/components/` (9 modular components)
  - Header.jsx, HeroSection.jsx, AccommodationsSection.jsx, ExperiencesSection.jsx
  - TodoSection.jsx, GallerySection.jsx, LocationSection.jsx, ContactSection.jsx, Footer.jsx
  - LazyImage.jsx (IntersectionObserver-based image loading)
- i18n System: `/WebsiteProject/src/i18n/`
  - translations.js (7 language dictionaries)
  - useLocale.js (dynamic translation loading hook)
  - localize.js (localization helper functions)
- Data: `/WebsiteProject/src/data/content.js` (images, contact info, operators)
- Utils: `/WebsiteProject/src/utils/localize.js` (booking URL generation)

### Design System

**Typography:**
- Inter font family from Google Fonts
- Weight range: 300-900 with italic variants
- Hierarchical sizing for headings, body text, and accent text

**Component Patterns:**
- Card-based layouts for accommodation and activity listings
- Image-first design with aspect ratios (4/3 for cards)
- Expandable detail sections with smooth transitions
- Overlay gradients on hero images for text readability

**Interaction Design:**
- Hover states with subtle zoom effects on images (scale-105)
- Focus-visible outlines using brand color
- Smooth scroll behavior for anchor navigation
- Sticky header with scroll offset compensation (scroll-margin-top)

## External Dependencies

### Third-Party Services

**Analytics & Consent Management:**
- Google Tag Manager with Consent Mode v2 implementation
- CookieYes for GDPR-compliant cookie consent management
- Region-specific consent defaults (EEA + EFTA + GB vs. rest of world)

**Booking Integration:**
- External booking engine at book.devoceanlodge.com
- Parameterized URLs with locale and currency support
- Deep linking from accommodation cards and CTAs

**Maps & Location:**
- Google Maps embed for property location
- Google Maps Directions API integration
- Coordinates: -26.841994852732736, 32.88504331196165

### NPM Packages

**Core Framework:**
- react, react-dom: UI rendering
- express: Server framework
- drizzle-orm, drizzle-zod: Database ORM and validation
- pg: PostgreSQL client (for session store)

**UI & Styling:**
- tailwindcss, autoprefixer, postcss: Styling infrastructure
- @radix-ui/*: Accessible component primitives
- framer-motion: Animation library
- lucide-react: Icon library

**Developer Tools:**
- vite, @vitejs/plugin-react: Build tooling
- @replit/vite-plugin-*: Replit-specific development plugins
- typescript: Type checking

**Data Management:**
- @tanstack/react-query: Server state management
- zod: Runtime type validation
- nanoid: Unique ID generation

**Routing & Forms:**
- wouter: Client-side routing
- react-hook-form: Form state management

### Asset Management

**Static Assets:**
- Stock images stored in `/attached_assets/stock_images/`
- Photo gallery in `/WebsiteProject/public/photos/`
- Logo and branding assets
- Vite alias configuration for clean imports (@assets)

**Legal Documents:**
- Static HTML pages for legal compliance (privacy, cookies, terms, GDPR, CRIC)
- Standalone i18n system for legal pages with inline styles
- Robots.txt and sitemap.xml for SEO

### Performance Optimizations

**Build Configuration:**
- Manual chunk splitting for optimal caching:
  - react-vendor: React core libraries
  - motion: Framer Motion animations
  - icons: Lucide React icons
  - i18n-vendor: i18n dependencies
  - translations: Dynamically loaded per language
- Asset organization by file type (images, fonts, media)
- Esbuild minification for production builds
- Source maps disabled in production
- Compression and build size optimization

**Loading Strategies:**
- Dynamic translation loading: Only the selected language loads, not all 7 languages
- IntersectionObserver-based image lazy loading: Images load when entering viewport
- Preconnect hints for external resources (Google Fonts, Maps, booking engine)
- Font optimization with Google Fonts preconnect
- Hero first image eager loading, subsequent images lazy loaded
- Logo images eager loading for immediate brand display

**Code Organization for Performance:**
- Modular component structure enables better tree shaking
- Separated data and logic for improved maintainability
- Reduced main bundle size from monolithic 2,458-line file to modular ~70-line orchestration