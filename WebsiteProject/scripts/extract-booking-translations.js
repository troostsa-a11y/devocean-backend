#!/usr/bin/env node
/**
 * Extract booking.html translations into separate ES module files
 * Usage: node scripts/extract-booking-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKING_HTML = path.join(__dirname, '../booking.html');
const OUTPUT_DIR = path.join(__dirname, '../booking/langs');

// Supported languages
const LANGUAGES = ['en', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'ru', 'zh', 'sv', 'ja', 'pl', 'af', 'zu', 'sw'];

function extractTranslations() {
  console.log('📖 Reading booking.html...');
  const html = fs.readFileSync(BOOKING_HTML, 'utf-8');
  
  // Extract TR object
  const trMatch = html.match(/const TR = \{([\s\S]+?)\n    \};/);
  if (!trMatch) {
    throw new Error('Could not find TR object in booking.html');
  }
  
  // Extract UNIT_TRANSLATIONS object
  const unitMatch = html.match(/const UNIT_TRANSLATIONS = \{([\s\S]+?)\n    \};/);
  if (!unitMatch) {
    throw new Error('Could not find UNIT_TRANSLATIONS object in booking.html');
  }
  
  console.log('✅ Found TR and UNIT_TRANSLATIONS objects');
  
  // Parse into JavaScript objects using Function constructor (safe for controlled input)
  const TR = new Function(`return {${trMatch[1]}}`)();
  const UNIT_TRANSLATIONS = new Function(`return {${unitMatch[1]}}`)();
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Generate a file for each language
  LANGUAGES.forEach(lang => {
    if (!TR[lang]) {
      console.warn(`⚠️  Warning: No TR translation for ${lang}`);
      return;
    }
    if (!UNIT_TRANSLATIONS[lang]) {
      console.warn(`⚠️  Warning: No UNIT_TRANSLATIONS for ${lang}`);
      return;
    }
    
    // Merge TR and UNIT_TRANSLATIONS
    const translations = {
      ...TR[lang],
      units: UNIT_TRANSLATIONS[lang]
    };
    
    // Generate ES module content
    const content = `export default ${JSON.stringify(translations, null, 2)};\n`;
    
    // Write file
    const filePath = path.join(OUTPUT_DIR, `${lang}.js`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Generated ${lang}.js`);
  });
  
  console.log(`\n🎉 Successfully extracted ${LANGUAGES.length} translation files to booking/langs/`);
}

try {
  extractTranslations();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
