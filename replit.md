# DEVOCEAN Lodge - Email Automation & Website Platform

## Overview

This is a dual-purpose project for DEVOCEAN Lodge, a hospitality property in Ponta do Ouro, Mozambique. The system combines:

1. **Email Automation Service** - Processes Beds24 booking notifications via IMAP, stores booking data in PostgreSQL, and sends scheduled transactional emails (post-booking confirmations, pre-arrival info, arrival welcome, post-departure thank you, and cancellation notifications)

2. **Marketing Website** - A React-based frontend for the lodge using modern UI components and Tailwind CSS with a coastal/hospitality design theme

The architecture follows a monorepo structure with shared schema definitions, a Node.js/Express backend, and a Vite-powered React frontend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Email Processing**: IMAP (imap-simple) for reading Beds24 booking emails, Nodemailer for sending transactional emails
- **Scheduling**: node-cron for periodic email checks and scheduled sending
- **Timezone Handling**: Luxon library, all scheduling in Central African Time (CAT = UTC+2)

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library (New York style)
- **Styling**: Tailwind CSS with CSS variables for theming

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - contains bookings, scheduledEmails, emailLogs, emailCheckLogs, pendingCancellations tables
- **Storage Abstraction**: In-memory storage interface in `server/storage.ts` (can be replaced with database implementation)

### Email Template System
- **Base Templates**: HTML templates in `email_templates/base/` for each email type
- **Translations**: JSON files in `email_templates/translations/` supporting multiple languages (EN-GB, EN-US, PT-PT, DE, FR, ES, IT, NL, AF)
- **Rendering**: Template renderer service applies translations and data substitution

### Design System
- **Color Palette**: Ocean Blue, Warm Sand, Deep Teal as primary colors (defined in design_guidelines.md)
- **Typography**: Inter/DM Sans font families via Google Fonts
- **Component Library**: Full shadcn/ui installation with Radix primitives

## External Dependencies

### Database
- **PostgreSQL** via Supabase (set up via Replit agent)
- **Connection**: Requires `DATABASE_URL` environment variable set in Render dashboard
- **Driver**: `drizzle-orm/postgres-js` with standard `postgres` client

### Email Services
- **IMAP Server**: For reading Beds24 booking notifications
  - Requires: `MAIL_HOST`, `MAIL_PORT`, `IMAP_USER`, `IMAP_PASSWORD`
- **SMTP Server**: For sending transactional emails
  - Uses same host configuration for outbound mail
- **Optional**: Taxi company notification (`TAXI_EMAIL`, `TAXI_WHATSAPP`, `TAXI_NAME`)

### Third-Party Integrations
- **Beds24**: Property management system - booking notifications parsed from email
- **Cloudflare**: CORS enabled for Cloudflare Functions integration
- **Booking Platforms**: Template includes QR codes for Booking.com, Google Reviews, TripAdvisor

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, cartographer, dev-banner (development only)
- **Type Checking**: TypeScript with strict mode
- **Database Migrations**: drizzle-kit for schema management