================================================================================
DEVOCEAN LODGE - TRANSLATION BATCH FILES
================================================================================

This folder contains comprehensive translation templates for adding a new language
to the DEVOCEAN Lodge website.

================================================================================
FILE STRUCTURE
================================================================================

1. 1_MAIN_UI_TRANSLATIONS.txt
   - Main website UI translations
   - Navigation, hero, stay, experiences, location, contact sections
   - Contact form labels and messages
   - Footer and legal menu

2. 2_CRITICAL_NAV_TRANSLATIONS.txt
   - Critical navigation strings (loads synchronously for instant mobile menu)
   - 8 navigation items + Book Now button
   - Keep translations SHORT for optimal performance

3. 3_LEGAL_UI_LABELS.txt
   - Top bar labels for legal pages (Back button, Home link, Last updated)

4. 4A_LEGAL_PRIVACY_POLICY.txt
   - Complete Privacy Policy translations
   - Data collection, usage, sharing, security, retention, rights

5. 4B_LEGAL_COOKIE_POLICY.txt
   - Cookie Policy translations
   - Cookie categories, table headers, browser settings
   - NOTE: Technical cookie details generally don't need translation

6. 4C_LEGAL_TERMS_CONDITIONS.txt
   - Terms & Conditions translations
   - Booking policies, payment, cancellations, conduct, force majeure

7. 4D_LEGAL_GDPR_NOTICE.txt
   - GDPR compliance notice translations
   - Data controller, legal bases, rights, retention, transfers

8. 4E_LEGAL_CRIC_COMPANY_CONTACT.txt
   - Company registration and contact information
   - Business hours, emergency contact details

================================================================================
HOW TO ADD A NEW LANGUAGE
================================================================================

STEP 1: Translate all batch files
   - Replace all text in quotes while keeping structure markers unchanged
   - Set LANGUAGE CODE at the top of each file (e.g., en, pt, de, fr, ja)

STEP 2: Update code files
   a) WebsiteProject/src/i18n/translations.js
      - Add your language object to the UI export
      - Use batch file 1 (MAIN UI) as reference

   b) WebsiteProject/src/i18n/critical.js
      - Add your language to CRITICAL_NAV
      - Use batch file 2 (CRITICAL NAV) as reference

   c) WebsiteProject/public/legal/i18n/strings.js
      - Add LEGAL_UI entry (batch file 3)
      - Add LEGAL_DICT entry (batch files 4A-4E)

STEP 3: Update supported languages list
   - WebsiteProject/src/i18n/useLocale.js
   - Add your language code to SUPPORTED_LANGS array

STEP 4: Test
   - Build the project: cd WebsiteProject && npm run build
   - Check all pages render correctly in the new language
   - Verify mobile menu loads instantly with critical translations

================================================================================
TRANSLATION NOTES
================================================================================

1. HTML Tags: Keep HTML tags unchanged (<br>, <strong>, <a href=...>)
2. Placeholders: Don't translate technical values (email addresses, phone numbers)
3. Cultural adaptation: Adjust idioms and cultural references where appropriate
4. Character length: Try to keep similar length to English to avoid layout issues
5. Legal accuracy: For legal pages, ensure translations are legally accurate

================================================================================
SUPPORTED LANGUAGES (Current)
================================================================================

en    - English
pt    - Portuguese (Portugal/Brazil)
ptmz  - Portuguese (Mozambique variant)
nl    - Dutch
fr    - French
it    - Italian
de    - German
es    - Spanish
sv    - Swedish
pl    - Polish

================================================================================
QUESTIONS?
================================================================================

Contact the development team for assistance with translations or technical setup.

================================================================================
