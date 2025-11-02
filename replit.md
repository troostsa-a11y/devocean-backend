# DEVOCEAN Lodge Website

## Overview
DEVOCEAN Lodge is an eco-friendly beach accommodation website for a property in Ponta do Ouro, Mozambique. This full-stack web platform provides accommodation listings, experience showcases, contact forms, and a multi-language interface. Its purpose is to serve as a comprehensive marketing tool, attracting a global clientele while ensuring legal compliance and a seamless user experience across various devices and languages. The project supports internationalization for 16 languages and includes robust legal/compliance pages for GDPR, cookies, and privacy policies.

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

## System Architecture

### Frontend Architecture
- **Framework & Build System:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI & Styling:** shadcn/ui components, Tailwind CSS (New York variant), Radix UI primitives, custom color palette, responsive mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for local state.
- **Internationalization:** React-based i18n with lazy-loaded translations for 16 languages using unified Hotelrunner locale codes. Vanilla JavaScript i18n for static pages. Language persistence via localStorage (`"site.lang"`, `"site.currency"`). Multi-tier language detection prioritizing localStorage → browser language → IP-based country mapping. Currency is strictly based on visitor's IP-detected country. Full translation coverage for legal pages.
- **Performance Optimizations:** Critical Translations Pattern, dynamic translation loading, IntersectionObserver-based image lazy loading, optimized bundle splitting, Framer Motion using LazyMotion, GTM with delayed load.

### Backend Architecture
- **Server Framework:** Express.js for HTTP server and API routing (Contact form, reCAPTCHA validation).
- **Storage Layer:** In-memory storage (`MemStorage`) for future database integration.
- **Database Schema:** Drizzle ORM configured for PostgreSQL with Zod schemas.
- **Email Automation System:** Production-ready Node.js (TypeScript) service processing Beds24 booking notifications via IMAP and sending multi-language automated emails using Resend API.
    - Architecture: IMAP Parser → Supabase PostgreSQL → Email Scheduler → Resend Transactional Emails.
    - **Timezone:** All scheduling operates in Central African Time (CAT/UTC+2).
    - **Email Schedule Times (CAT):** Post-booking (1-2h after booking), Pre-arrival (09:00 CAT, 7 days before), Arrival (09:00 CAT, 2 days before), Post-departure (10:00 CAT, day after checkout).
    - Database tables: `bookings`, `scheduled_emails`, `email_logs`, `email_check_logs`, `pending_cancellations`.
    - Features: Template-based multi-language system (3 base HTML templates + per-template translations), supports 17 languages, cancellation handling, extras management, booking status tracking, automatic language detection with fallback to en-GB.
    - Runs on port 3003.

### Project Structure
- **Dual Project Setup:** `/WebsiteProject/` (React/Vite marketing website) and `/client/` & `/server/` (full-stack application template placeholder).
- **Design System:** Inter font family, card-based layouts, image-first design, expandable detail sections, hover states, focus-visible outlines, smooth scroll, sticky header.

## External Dependencies

### Third-Party Services
- **Analytics & Consent:** Google Tag Manager (GTM-532W3HH2) with Consent Mode v2, CookieYes (ID: f0a2da84090ecaa3b37f74af) for GDPR/CCPA, Microsoft Clarity for session recording.
- **Trust & Verification:** Trustindex Floating Certificate widget (ID: a73b26308ab90c8e6ce30cb) integrated on legal pages.
- **Booking Integration:** Beds24 booking engine (propid=297012) embedded in `/booking.html`, with custom header/footer, UTM forwarding, and dynamic height adjustment.
- **Maps & Location:** Google Maps embed for property location.
- **Security:** Google reCAPTCHA v3 for invisible verification on contact forms with server-side validation.
- **Email Service:** Resend API for transactional emails, IMAP for parsing incoming booking notifications.
- **SEO & Search Indexing:** IndexNow protocol via Cloudflare Pages Functions.

### NPM Packages
- **Core:** `react`, `react-dom`, `express`, `drizzle-orm`, `drizzle-zod`, `pg`.
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `framer-motion`, `lucide-react`.
- **Developer Tools:** `vite`, `@vitejs/plugin-react`, `typescript`, `wrangler`, `tsx`.
- **Data Management:** `@tanstack/react-query`, `zod`, `nanoid`.
- **Routing & Forms:** `wouter`, `react-hook-form`.

### Asset Management
- **Static Assets:** Stock images, photo gallery, logo, branding assets.
- **Accommodation Photos:** 16 unit photos optimized to WebP format in `/public/photos/units/`.
- **Legal Documents:** Static HTML pages for compliance (privacy, cookies, terms, GDPR, CRIC) with cache-busting.
---

## Recent Bug Fixes & Improvements (cont'd)

### November 2, 2025 - Contact Form System Restoration

#### 🐛 Bug Fix #4: Contact Form Not Sending Emails
**Issue:** Contact form submissions were failing silently. Form pointed to dead external API endpoint (`https://devocean-api.onrender.com/api/contact`) which returned 404.

**Root Cause:** External Render.com API service was decommissioned/offline, but frontend was still configured to use it. No local fallback existed.

**Fix Applied:**
- **Created dual-environment contact form system:**
  - Development: Express.js endpoint in `server.js` at `/api/contact`
  - Production: Cloudflare Pages Function at `functions/api/contact.js`
  
- **Updated frontend:** `ContactSection.jsx` now uses relative path `/api/contact` (works in both environments)

- **Migrated from nodemailer to Resend API:** Unified email delivery using same Resend service as booking automation

- **Implemented comprehensive security measures:**
  1. Input sanitization (CR/LF stripping, length limits)
  2. HTML escaping for all user content
  3. reCAPTCHA v3 verification with action matching
  4. Score-based bot detection (<0.3 rejected, <0.5 logged)
  5. Email format validation

- **Added localized auto-reply system:** Customers receive confirmation email in their language (EN, PT, NL, FR, IT, DE, ES)

**Files Modified:**
- `WebsiteProject/functions/api/contact.js` (new - production handler)
- `WebsiteProject/server.js` (converted from nodemailer to Resend)
- `WebsiteProject/src/components/ContactSection.jsx` (endpoint updated)

**Impact:**
- Contact form now works in both development and production
- Enhanced security with multiple layers of validation
- Better user experience with instant auto-reply confirmations
- Consistent email delivery infrastructure (all via Resend)

**Technical Details:**
```javascript
// Both environments share identical logic:
// 1. Sanitize inputs (remove CR/LF, trim, limit length)
// 2. Validate reCAPTCHA (action + score thresholds)
// 3. Escape HTML for safe email rendering
// 4. Send main notification to info@devoceanlodge.com
// 5. Send localized auto-reply to customer
```

**Required Environment Variables:**
- `RESEND_API_KEY` - Resend API key for email delivery
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA v3 server key

---

## Contact Form System Architecture

### Dual-Environment Setup

#### Development (server.js - Port 5000)
- Express.js endpoint: `POST /api/contact`
- Runs alongside Vite dev server
- Hot-reload enabled for rapid testing

#### Production (Cloudflare Pages Function)
- Serverless function: `functions/api/contact.js`
- Edge deployment (auto-scaled, globally distributed)
- Environment variables managed in Cloudflare dashboard

### Security Implementation
Both environments enforce identical security measures:

1. **Input Sanitization:**
   - Header injection prevention (CR/LF stripping)
   - Length limits: name (100 chars), email (100 chars), message (2000 chars)
   - Email format validation with regex

2. **reCAPTCHA v3 Protection:**
   - Server-side token verification with Google API
   - Action verification (must match 'contact_form')
   - Score-based filtering:
     - < 0.3: Rejected as bot
     - 0.3-0.5: Logged as suspicious
     - \> 0.5: Accepted

3. **Output Sanitization:**
   - HTML escaping for all user content in emails
   - Prevents XSS and email template injection

### Email Flow

1. **Main Notification** (to staff)
   - Recipient: info@devoceanlodge.com
   - Contains: Customer details, message, dates, unit preference
   - Reply-to: Customer's email (for easy response)
   - Format: Professional HTML + plain text fallback

2. **Auto-Reply** (to customer)
   - Localized in customer's selected language
   - Includes: Thank you message, booking CTA, signature
   - Professional email template (Outlook/Gmail compatible)
   - Languages supported: EN, PT, NL, FR, IT, DE, ES

### Monitoring & Debugging
- All submissions logged to console with reCAPTCHA scores
- Failed reCAPTCHA attempts logged with details
- Resend API errors captured and logged
- Auto-reply failures non-blocking (main email still succeeds)
