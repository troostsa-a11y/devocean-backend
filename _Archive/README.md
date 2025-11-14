# Archive Directory

This directory contains files and code that are not actively used by the DEVOCEAN Lodge website application.

## Archive Date
November 14, 2025

## Archived Contents

### Template App Files (`template-app/`)
Files from the original full-stack application template that are not used by the DEVOCEAN Lodge static website:
- `shared/` - Database schema (schema.ts) for template app
- `drizzle/` - Database migrations (0000_initial_schema.sql)
- `server/routes/` - API routes (contact.ts) - website uses Cloudflare Workers instead
- `translation_templates/` - Legacy translation template files (now embedded in code)

### Utility Scripts (`utility-scripts/`)
One-time use scripts for image optimization and data export:
- `optimize-beds24-hero-images.js` - Image optimization script
- `optimize-beds24-images.js` - Image optimization script
- `optimize-logo.js` - Logo optimization script
- `optimize-logo-v2.js` - Logo optimization script (v2)
- `export-secrets.js` - Secrets export utility

### Test Files (`test-files/`)
Development test files not needed in production:
- `test-automailer-email.ts` - Automailer testing script
- `test-email.js` - Email testing script
- `booking-units-navigation.html` - Test HTML file

### Screenshots (`screenshots/`)
Documentation and reference screenshots:
- `banner.png` - Banner screenshot
- `booking-header.png` - Booking header screenshot
- `bottom-right.png` - Bottom right section screenshot
- `fullpage.png` - Full page screenshot

### Beds24 Assets (`beds24/`)
Optimized images for Beds24 booking platform (uploaded to Beds24 image manager):
- Hero images (hero01.jpg/webp, hero02.jpg/webp)
- Accommodation images (chalet-1-4, comfort-1-4, cottage-1-4)

### Documentation (`documentation/`)
Setup guides and configuration documentation:
- CLOUDFLARE_DEPLOYMENT_GUIDE.md
- EMAIL_AUTOMATION_SETUP.md
- GTM_OPTIMIZATION_GUIDE.md
- LANGUAGE_SUPPORT.md
- And other setup/configuration guides

### Backup (`devocean-backup-complete-20251113-053411.tar.gz`)
Complete project backup from November 13, 2025

## Active Files (NOT Archived)

The following remain in the root directory as they are actively used:

### DEVOCEAN Website
- `/WebsiteProject/` - Main React/Vite website application

### Automailer System
- `/server/services/` - Email services (email-parser, email-sender, email-template-renderer)
- `/server/utils/` - Server utility functions
- `/email_templates/` - Email templates used by automailer
- `server.ts` - Automailer entry point

### Configuration & Dependencies
- `package.json`, `package-lock.json` - Project dependencies
- `production.js` - Production server script
- `start.js` - Development startup script
- `replit.md` - Project documentation
- `.env.example` - Environment variables template

### User Assets
- `/attached_assets/` - User-uploaded assets

## Restoration

To restore any archived files, simply move them back to their original location in the root directory.
