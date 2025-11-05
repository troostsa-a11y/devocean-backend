# Email Template Language Support

## Architecture

The email system uses a **template + translation file architecture** similar to your legal pages:

```
email_templates/
├── base/                         # Base HTML templates (layout/structure)
│   ├── post_booking.html
│   ├── pre_arrival.html
│   ├── arrival.html
│   ├── post_departure.html
│   ├── cancellation.html
│   └── transfer_notification.html
└── translations/
    └── email-translations.json   # All languages in one file
```

### How It Works

1. **Base Templates** contain HTML structure with placeholders:
   - `{{t.greeting}}` - Translation placeholders
   - `{{guestName}}` - Dynamic data placeholders

2. **Translation File** contains all text in all languages:
   ```json
   {
     "en-GB": {
       "post_booking": {
         "greeting": "Dear {{guestName}},",
         "intro": "Thank you for choosing..."
       }
     },
     "pt-PT": {
       "post_booking": {
         "greeting": "Caro(a) {{guestName}},",
         "intro": "Obrigado por escolher..."
       }
     }
   }
   ```

3. **Email Renderer** loads template + translations and generates final HTML

### Benefits

✅ **6 templates** instead of 80+ individual HTML files  
✅ **One file to update** designs across all languages  
✅ **Easy to add languages** - just add to JSON  
✅ **Same pattern** as legal pages  
✅ **Professional translators** can work with JSON directly

## Currently Supported Languages

The email automation system currently has **full translation support for 4 language variants**:

### ✅ English (UK) - en-GB
### ✅ English (US) - en-US
### ✅ Portuguese (Portugal) - pt-PT
### ✅ Portuguese (Brazil) - pt-BR

All other website languages fall back to `en-GB` until translations are added.

## Website Languages (16 Total)

Your DEVOCEAN Lodge website supports 16 languages. Here's the mapping:

| Language | Code | Status | Notes |
|----------|------|--------|-------|
| UK English | en-GB | ✅ Ready | Uses EN templates |
| US English | en-US | ✅ Ready | Uses EN templates |
| Portugal Portuguese | pt-PT | ✅ Ready | Uses PT templates |
| Brazilian Portuguese | pt-BR | ✅ Ready | Uses PT templates |
| Dutch | nl-NL | 🔄 Template Ready* | Just needs translation |
| French | fr-FR | 🔄 Template Ready* | Just needs translation |
| Italian | it-IT | 🔄 Template Ready* | Just needs translation |
| German | de-DE | 🔄 Template Ready* | Just needs translation |
| Spanish | es-ES | 🔄 Template Ready* | Just needs translation |
| Swedish | sv | 🔄 Template Ready* | Just needs translation |
| Polish | pl | 🔄 Template Ready* | Just needs translation |
| Afrikaans | af-ZA | 🔄 Template Ready* | Just needs translation |
| Zulu | zu | 🔄 Template Ready* | Just needs translation |
| Swahili | sw | 🔄 Template Ready* | Just needs translation |
| Japanese | ja-JP | 🔄 Template Ready* | Just needs translation |
| Chinese | zh-CN | 🔄 Template Ready* | Just needs translation |
| Russian | ru | 🔄 Template Ready* | Just needs translation |

**Template Ready*** = HTML structure exists, just copy EN templates and translate text content

## Language Detection System

The email system automatically selects the correct language template based on:

1. **Guest's Language Preference** (from booking data)
2. **Fallback to English** if guest's language doesn't have templates yet

### Language Mapping in Code

```typescript
// server/services/email-templates.ts
const LANGUAGE_FALLBACKS = {
  'en-GB': 'en',
  'en-US': 'en',
  'pt-PT': 'pt',
  'pt-BR': 'pt',
  'nl-NL': 'en',  // Fallback until Dutch template created
  'fr-FR': 'en',  // Fallback until French template created
  // ... etc
};
```

## How to Add a New Language

With the template + translation architecture, adding a new language is **much simpler**!

### Step 1: Add Translations to JSON

Edit `email_templates/translations/email-translations.json` and add your language:

```json
{
  "en-GB": { ... },
  "pt-PT": { ... },
  "fr-FR": {
    "post_booking": {
      "subject": "Réservation Confirmée - DEVOCEAN Lodge",
      "headerSubtitle": "Votre Refuge Écologique sur la Plage à Ponta do Ouro",
      "greeting": "Cher(e) {{guestName}},",
      "intro": "Merci d'avoir choisi DEVOCEAN Lodge! Nous sommes ravis de confirmer votre réservation.",
      "bookingDetailsTitle": "Détails de la Réservation",
      "bookingRef": "Référence de Réservation",
      "checkIn": "Arrivée",
      "checkOut": "Départ",
      "totalPrice": "Prix Total",
      "nextStepsTitle": "Prochaines Étapes",
      "nextStep1": "Vous recevrez un email 7 jours avant l'arrivée avec des informations importantes",
      "nextStep2": "Notre équipe est disponible pour répondre à vos questions",
      "nextStep3": "Commencez à planifier vos aventures à la plage!",
      "visitWebsite": "Visitez Notre Site",
      "closing": "Nous avons hâte de vous accueillir au paradis!",
      "regards": "Cordialement",
      "teamName": "L'Équipe DEVOCEAN Lodge",
      "location": "Ponta do Ouro, Mozambique"
    },
    "cancellation": {
      "subject": "Annulation Confirmée - DEVOCEAN Lodge",
      "heading": "Annulation Confirmée",
      "greeting": "Cher(e) {{guestName}},",
      ...
    }
  }
}
```

### Step 2: Update Language Fallback (if needed)

Edit `server/services/email-template-renderer.ts` to map your language code:

```typescript
const mapping: { [key: string]: string } = {
  ...
  'fr-FR': 'fr-FR',  // ✅ Add this line
  ...
};
```

### Step 3: That's It!

The system automatically:
- ✅ Loads your translations
- ✅ Uses the same HTML template
- ✅ Sends emails in the correct language

### Example: Adding All 5 Email Types for French

You only need to add ONE entry to the JSON file:

```json
"fr-FR": {
  "post_booking": { ... all translations ... },
  "pre_arrival": { ... all translations ... },
  "arrival": { ... all translations ... },
  "post_departure": { ... all translations ... },
  "cancellation": { ... all translations ... }
}
```

**No HTML duplication!** Just pure text translations.

## Template Placeholders

All templates support these dynamic placeholders:

### Guest Information
- `{{guestName}}` - Guest's full name
- `{{guestEmail}}` - Guest's email address
- `{{guestPhone}}` - Guest's phone number
- `{{guestLanguage}}` - Guest's preferred language

### Booking Details
- `{{groupRef}}` - Booking reference number
- `{{checkInDate}}` - Check-in date (formatted)
- `{{checkOutDate}}` - Check-out date (formatted)
- `{{totalPrice}}` - Total booking price
- `{{currency}}` - Currency code (MZN, USD, EUR, etc.)

### Dates (Formatted)
- `{{cancellationDate}}` - When booking was cancelled

### Transfer Information (if applicable)
- `{{arrivalTransfer.pickupLocation}}` - Airport/location name
- `{{arrivalTransfer.pickupTime}}` - Pick-up time
- `{{arrivalTransfer.flightNumber}}` - Flight number
- `{{arrivalTransfer.passengers}}` - Number of passengers
- `{{departureTransfer.*}}` - Same fields for departure

## Priority Languages to Add Next

Based on your visitor demographics, consider adding these next:

1. **Dutch (nl-NL)** - Many South African/Netherlands visitors
2. **Afrikaans (af-ZA)** - South African visitors
3. **French (fr-FR)** - French tourists
4. **German (de-DE)** - European tourists
5. **Spanish (es-ES)** - Spanish tourists

## Translation Services

For professional translations, consider:
- **DeepL** - High-quality machine translation
- **Google Translate** - Quick translations
- **Professional translators** - For marketing content
- **Native speakers** - Best for cultural nuances

## Translation File Structure

The `email-translations.json` file follows this structure:

```json
{
  "language-code": {
    "email-type": {
      "translationKey": "Translated text with {{placeholders}}"
    }
  }
}
```

### Available Translation Keys

Each email type has specific translation keys. Here's the complete list:

#### post_booking
- `subject`, `headerSubtitle`, `greeting`, `intro`
- `bookingDetailsTitle`, `bookingRef`, `checkIn`, `checkOut`, `totalPrice`
- `nextStepsTitle`, `nextStep1`, `nextStep2`, `nextStep3`
- `visitWebsite`, `closing`, `regards`, `teamName`, `location`

#### cancellation
- `subject`, `heading`, `greeting`, `intro`
- `detailsTitle`, `bookingRef`, `originalCheckIn`, `originalCheckOut`, `cancellationDate`
- `nextStepsTitle`, `nextStep1`, `nextStep2`, `nextStep3`, `nextStep4`
- `sorry`, `visitWebsite`, `questions`, `regards`, `teamName`, `location`

Copy the English version and translate each value.

## Testing Checklist

When adding a new language template:

- [ ] All text is translated (no English remnants)
- [ ] Subject line is translated
- [ ] Button text is translated
- [ ] Placeholders `{{...}}` are unchanged
- [ ] HTML structure is intact
- [ ] Email renders correctly in Gmail/Outlook
- [ ] Language code is added to `LANGUAGE_FALLBACKS`
- [ ] Test email sends successfully
- [ ] Guest receives email in correct language

## Future Enhancements

1. **Database-driven templates** - Store translations in database
2. **Template versioning** - Track template changes over time
3. **A/B testing** - Test different subject lines
4. **RTL support** - For Arabic (if needed in future)
5. **Emoji localization** - Different emojis for different cultures

## Support Contact

For help with translations or templates:
- **Email:** dev@devoceanlodge.com
- **Documentation:** EMAIL_AUTOMATION_SETUP.md
