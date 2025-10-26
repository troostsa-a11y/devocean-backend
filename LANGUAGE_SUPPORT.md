# Email Template Language Support

## Currently Supported Languages

The email automation system currently has **full template support for 2 languages**:

### ✅ English (EN)
- `post_booking_en.html`
- `pre_arrival_en.html`
- `arrival_en.html`
- `post_departure_en.html`
- `cancellation_en.html`
- `transfer_notification_en.html` (for taxi company)

### ✅ Portuguese (PT)
- `post_booking_pt.html`
- `pre_arrival_pt.html`
- `arrival_pt.html`
- `post_departure_pt.html`
- `cancellation_pt.html`

**Transfer notification is English-only** as it's sent to the taxi company (business communication).

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

### Step 1: Copy English Templates

```bash
# Example: Adding French templates
cp email_templates/post_booking_en.html email_templates/post_booking_fr.html
cp email_templates/pre_arrival_en.html email_templates/pre_arrival_fr.html
cp email_templates/arrival_en.html email_templates/arrival_fr.html
cp email_templates/post_departure_en.html email_templates/post_departure_fr.html
cp email_templates/cancellation_en.html email_templates/cancellation_fr.html
```

### Step 2: Translate Content

Open each file and translate:
- All visible text content
- Email subject lines (in template metadata)
- Button text
- Headers, paragraphs, list items

**Keep these unchanged:**
- HTML structure
- CSS styles
- `{{placeholders}}` (e.g., `{{guestName}}`, `{{checkInDate}}`)
- Email footer contact information

### Step 3: Update Language Mapping

Edit `server/services/email-templates.ts`:

```typescript
const LANGUAGE_FALLBACKS = {
  'en-GB': 'en',
  'en-US': 'en',
  'pt-PT': 'pt',
  'pt-BR': 'pt',
  'fr-FR': 'fr',  // ✅ Add this line
  // ... rest
};
```

### Step 4: Test

```bash
# Test with sample French booking
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "language": "fr-FR",
    "emailType": "post_booking",
    "recipientEmail": "test@example.com"
  }'
```

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

## File Naming Convention

Always follow this pattern:
```
{email_type}_{language_code}.html
```

Examples:
- `post_booking_en.html`
- `post_booking_fr.html`
- `pre_arrival_de.html`
- `cancellation_nl.html`

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
