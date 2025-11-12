# Story Page Translation System

## Overview
The story.html page now has a complete dynamic translation system that automatically detects the visitor's language and displays content in their preferred language.

## How It Works

### Language Detection Priority
The system uses the same multi-tier approach as booking.html:

1. **URL Parameter** - `?lang=XX` overrides all other settings
2. **localStorage** - User-selected language persisted with protection flags (`site.lang_source="user"` and `site.lang.version="2"`)
3. **Browser Language** - Detects browser language preferences (navigator.language)
4. **Fallback** - Defaults to English if no match found

User can override auto-detection by selecting a language, which is then saved to localStorage and protected from automatic changes.

### Special Cases
- **US English**: Visitors with `en-US` browser settings get US English (not UK English)
- **Portuguese Variants**: System supports pt-BR (Brazil), pt-PT (Portugal), and pt-MZ (Mozambique)

## Files

### Translation Data
- **`story-translations-template.json`** - Contains all translations for 16 languages
  - Structure: Organized by sections (nav, hero, cards, cta)
  - Languages: en, en-us, pt, nl, fr, it, de, es, sv, pl, af, zu, sw, ja, zh, ru

### Translation Engine
- **`story-i18n.js`** - Standalone vanilla JavaScript translation system
  - Language detection logic
  - Translation loading
  - DOM replacement
  - Country-to-language mapping

### HTML Integration
- **`story.html`** - Updated with `data-i18n` attributes
  - Every translatable element has a `data-i18n="key.path"` attribute
  - Elements with HTML content (like `<strong>` tags) have `data-i18n-html` attribute

## How to Add Translations

### Step 1: Edit the JSON file
Open `story-translations-template.json` and replace `[TRANSLATE: ...]` placeholders with actual translations.

Example for Portuguese (Brazil):
```json
"pt-BR": {
  "hero": {
    "title": "Aventura encontra sustentabilidade",
    "titleSpan": "Sua estadia faz a diferença."
  }
}
```

### Step 2: Test
1. Open story.html in browser
2. Open browser console
3. Look for: `Story page detected language: [lang]`
4. Verify translations appear correctly

### Step 3: Override Language for Testing
In browser console:
```javascript
localStorage.setItem('site.lang', 'pt');
location.reload();
```

## HTML Data Attributes Reference

### Standard Text (textContent)
```html
<h2 data-i18n="cards.today.title">Today at DEVOCEAN Lodge</h2>
```

### HTML Content (innerHTML)
For content with formatting tags like `<strong>`:
```html
<p data-i18n="cards.today.content" data-i18n-html>
  We offer <strong>10 unique accommodation options</strong>...
</p>
```

## Translation Keys Structure

```
nav
├── logo
└── backToAccommodations

hero
├── eyebrow
├── title
├── titleSpan
├── subtitle
└── proofPoints
    ├── support
    ├── booking
    └── restaurant

cards
├── today
│   ├── title
│   └── content
├── sotiba
│   ├── title
│   ├── content
│   └── linkText
├── farm
│   ├── title
│   └── content
└── impact
    ├── title
    └── content

cta
├── title
├── subtitle
├── bookButton
└── viewButton
```

## Supported Languages

| Code | Language | Target Market |
|------|----------|---------------|
| en | English (UK) | International |
| en-us | English (US) | United States |
| pt | Portuguese | Brazil, Portugal, Mozambique |
| nl | Dutch | Netherlands, Belgium |
| fr | French | France, Belgium, African countries |
| it | Italian | Italy |
| de | German | Germany, Austria, Switzerland |
| es | Spanish | Spain, Latin America |
| sv | Swedish | Sweden, Finland |
| pl | Polish | Poland |
| af | Afrikaans | South Africa |
| zu | Zulu | South Africa |
| sw | Swahili | Kenya, Tanzania, Uganda |
| ja | Japanese | Japan |
| zh | Chinese | China, Hong Kong, Taiwan, Singapore |
| ru | Russian | Russia, Eastern Europe |

## Cloudflare Integration

The system integrates with Cloudflare Pages Functions middleware (`functions/_middleware.js`) for consistent language handling across the site.

## Maintenance

### Adding a New Translation Key
1. Add to English section in JSON file
2. Add `[TRANSLATE: ...]` placeholder to all other languages
3. Add `data-i18n="key.path"` to HTML element
4. Get translations from native speakers
5. Test in browser

### Syncing with Main Site Language
The story page automatically syncs with the main site because both use:
- Same `localStorage.getItem("site.lang")` key
- Same country-to-language mapping
- Same Cloudflare middleware

When users select a language on the main site, it persists to story.html and vice versa.
