# Accommodation Translation Guide

## Unified Hotelrunner Language Codes

Use these exact codes (case-sensitive):
- `en-GB` (UK English)
- `en-US` (US English)  
- `pt-PT` (Portugal Portuguese)
- `pt-BR` (Brazilian Portuguese - also for Mozambique/Angola)
- `nl-NL` (Dutch)
- `fr-FR` (French)
- `it-IT` (Italian)
- `de-DE` (German)
- `es-ES` (Spanish)
- `ja-JP` (Japanese)
- `zh-CN` (Chinese)
- `ru` (Russian)
- `sv` (Swedish)
- `pl` (Polish)
- `af-ZA` (Afrikaans)
- `zu` (Zulu)
- `sw` (Swahili)

## File Structure

Edit: `WebsiteProject/translations/accommodation-translation-template.json`

```json
{
  "nl-NL": {
    "safari": {
      "eyebrow": "LUXE TENT",
      "heroTitle": "Safari Tent",
      "heroDescription": "Ervaar de perfecte mix van luxe en natuur...",
      "sections": [
        {
          "heading": "Ruimte & Indeling",
          "description": "De tent heeft een goed doordacht...",
          "features": [
            "Platform: 3×6 m • Tent: 12 m²",
            "Twee eenpersoonsbedden..."
          ]
        }
      ],
      "trustItems": [
        "Rustige locatie tussen de bomen",
        "Op loopafstand van het strand",
        "Volledig uitgerust"
      ],
      "cta": {
        "heading": "Klaar om te boeken?",
        "description": "Reserveer uw Safari Tent vandaag..."
      }
    },
    "comfort": { ... },
    "cottage": { ... },
    "chalet": { ... }
  }
}
```

## What to Translate (per unit)

1. **eyebrow** - Category badge (e.g., "LUXURY TENT")
2. **heroTitle** - Main unit name
3. **heroDescription** - Opening paragraph
4. **sections[].heading** - Section titles (Space & Layout, Sleep & Comfort, etc.)
5. **sections[].description** - Paragraph describing each section
6. **sections[].features[]** - All bullet points
7. **sections[].closingNote** - Final note (only in "Good to Know" section)
8. **trustItems[]** - 3 trust badges
9. **cta.heading** - Call-to-action title
10. **cta.description** - CTA paragraph

## Workflow

1. Copy English structure from `en-GB`
2. Replace language code (e.g., `nl-NL`)
3. Translate all fields above
4. Save file
5. Copy to `WebsiteProject/public/translations/`
6. Build & deploy

## Units to Translate

- **safari** (Safari Tent) - 5 sections
- **comfort** (Comfort Tent) - 5 sections  
- **cottage** (Garden Cottage) - 5 sections
- **chalet** (Thatched Chalet) - 5 sections
