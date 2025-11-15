# Booking System Migration - November 15, 2025

## Overview
Migrated from single `booking.html` file to 15 language-specific pages in `/public/book/` directory.

## Archived Files
- `booking.html.deprecated` - Original single-page booking system
- `booking.html.dist.deprecated` - Built version from dist/

## Legacy Scripts (No Longer Used)
- `scripts/booking-new-script.js` - Used to extract translations from booking.html
- `scripts/extract-booking-translations.js` - Used to generate translation modules

These scripts are NOT deleted but are no longer part of the active codebase.

## Updated Files

### Static Pages (4 files)
- `chalet.html` - Updated booking link from `/booking.html?lang=en&cur=USD` to `/book/EN.html?currency=USD`
- `cottage.html` - Updated booking link
- `safari.html` - Updated booking link  
- `comfort.html` - Updated booking link

### JavaScript/Utilities (2 files)
- `src/utils/localize.js` - Updated fallback from `/booking.html` to `/book/EN.html`
- `src/components/ExperienceDetailPage.jsx` - Updated comment reference

### Backend (1 file)
- `server.js` - Updated contact form auto-reply booking URL to `/book/EN.html`

### Build/Deploy (2 files)
- `package.json` - Removed `booking.html` and `booking/langs/*.js` from build script
- `functions/_middleware.js` - Updated subdomain redirect from `booking.html` to `/book/EN.html`

### Documentation (2 files)
- `translations/README.md` - Updated reference to use `/book/` pages instead of booking.html
- `replit.md` - Updated to document new booking page structure

## New Booking Pages
All 15 language-specific pages in `/public/book/`:
- AF.html (Afrikaans)
- DE.html (German)
- EN.html (English)
- ES.html (Spanish)
- FR.html (French)
- IT.html (Italian)
- JA.html (Japanese)
- NL.html (Dutch)
- PL.html (Polish)
- PT.html (Portuguese)
- RU.html (Russian)
- SV.html (Swedish)
- SW.html (Swahili)
- ZH.html (Chinese)
- ZU.html (Zulu)

## Verification Commands
```bash
# Verify no active references to booking.html (except in _Archive and legacy scripts)
grep -r "booking\.html" WebsiteProject --exclude-dir=_Archive --exclude-dir=scripts

# Verify all accommodation pages link to /book/
grep -r "/book/EN.html" WebsiteProject/*.html
```

## Migration Date
November 15, 2025
