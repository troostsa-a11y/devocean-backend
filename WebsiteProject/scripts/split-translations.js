import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const translationsPath = path.join(__dirname, '../src/i18n/translations.js');
const outputDir = path.join(__dirname, '../src/i18n/langs');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the translations file
const content = fs.readFileSync(translationsPath, 'utf8');

// Extract the UI object content
const uiMatch = content.match(/export const UI = \{([\s\S]*?)\n\};/);
if (!uiMatch) {
  console.error('❌ Could not find UI object in translations.js');
  process.exit(1);
}

const uiContent = uiMatch[1];

// Extract the L10N object content
const l10nMatch = content.match(/export const L10N = \{([\s\S]*?)\n\};/);
if (!l10nMatch) {
  console.warn('⚠️  Could not find L10N object in translations.js');
}

const l10nContent = l10nMatch ? l10nMatch[1] : null;

// Split into individual language blocks
// We need to carefully parse nested braces
function extractLanguages(content) {
  const languages = {};
  const lines = content.split('\n');
  
  let currentLang = null;
  let braceCount = 0;
  let langContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match language key like: "en-GB": {
    const langMatch = line.match(/^\s+"([^"]+)":\s*\{/);
    
    if (langMatch && braceCount === 0) {
      // Save previous language if exists
      if (currentLang) {
        if (!languages[currentLang]) {
          languages[currentLang] = langContent.join('\n');
        } else {
          console.warn(`⚠️  Duplicate language key: ${currentLang} - keeping first occurrence`);
        }
      }
      
      currentLang = langMatch[1];
      langContent = [];
      braceCount = 1;
      continue;
    }
    
    if (currentLang) {
      // Count opening and closing braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // Add line to current language content
      if (braceCount > 0) {
        langContent.push(line);
      } else {
        // Language block complete
        if (!languages[currentLang]) {
          languages[currentLang] = langContent.join('\n');
        }
        currentLang = null;
        langContent = [];
      }
    }
  }
  
  // Save last language if exists
  if (currentLang && !languages[currentLang]) {
    languages[currentLang] = langContent.join('\n');
  }
  
  return languages;
}

console.log('📦 Extracting UI language blocks...');
const uiLanguages = extractLanguages(uiContent);

let l10nLanguages = {};
if (l10nContent) {
  console.log('📦 Extracting L10N language blocks...');
  l10nLanguages = extractLanguages(l10nContent);
}

// Merge UI and L10N for each language
const languages = {};
for (const lang of Object.keys(uiLanguages)) {
  languages[lang] = {
    ui: uiLanguages[lang],
    l10n: l10nLanguages[lang] || null
  };
}

const langKeys = Object.keys(languages);
console.log(`✅ Found ${langKeys.length} unique languages:`, langKeys);

// Write individual language files
let totalSaved = 0;
for (const [lang, data] of Object.entries(languages)) {
  const fileName = `${lang}.js`;
  const filePath = path.join(outputDir, fileName);
  
  // Create exportable module with both UI and L10N
  let moduleContent;
  if (data.l10n) {
    moduleContent = `// Translations for ${lang}
export const UI = {
${data.ui.trim()}
};

export const L10N = {
${data.l10n.trim()}
};

export default UI;
`;
  } else {
    moduleContent = `// Translations for ${lang}
export const UI = {
${data.ui.trim()}
};

export default UI;
`;
  }
  
  fs.writeFileSync(filePath, moduleContent, 'utf8');
  const size = Math.round(fs.statSync(filePath).size / 1024);
  console.log(`  ✓ ${fileName} (${size}KB)`);
  totalSaved++;
}

console.log(`\n🎉 Successfully split ${totalSaved} language files into ${outputDir}`);
console.log(`💾 Original: 152KB → Individual files: ~7-8KB each`);
