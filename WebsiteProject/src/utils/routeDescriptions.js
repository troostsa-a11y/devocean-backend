/**
 * ROUTE_DESCRIPTIONS — single source of truth for every page's English
 * meta description string.
 *
 * This file is imported by BOTH:
 *   - WebsiteProject/functions/_middleware.js  (edge pre-render, static crawl)
 *   - Each React page component               (client-side hydration)
 *
 * Rules:
 *  1. Descriptions must be ≤ 160 characters.
 *  2. Edit HERE only. The middleware and components read from this object —
 *     never maintain a separate copy.
 *  3. When adding a new route, add its entry here first, then wire up the
 *     middleware ROUTE_META block and the component import.
 */

export const ROUTE_DESCRIPTIONS = {
  '/ponta-do-ouro':
    'Complete travel guide to Ponta do Ouro, Mozambique — pristine beaches, 1,200+ marine species, ethical dolphin swims, and whale watching June–November.',

  '/getting-to-ponta-do-ouro':
    'Getting to Ponta do Ouro: via Kosi Bay border (13 km) or Maputo (120 km), by transfer or public transport. Border hours, road conditions and rental car rules.',

  '/ponta-do-ouro-without-4x4':
    'Yes, you can visit Ponta do Ouro without a 4×4. DEVOCEAN Lodge sits on a tarred village road. What is sandy, what is tarred, and how to get here.',

  '/ponta-do-ouro-accommodation':
    'DEVOCEAN Lodge sits in a tropical garden 300 metres from the beach in Ponta do Ouro. Safari tents, comfort tents, garden cottage and thatched chalet.',

  '/safari-tents-ponta-do-ouro':
    'DEVOCEAN Lodge offers two safari tents in Ponta do Ouro — a classic canvas tent on a raised platform and a Comfort Tent with en-suite bathroom. Book direct.',

  '/diving-dolphin-accommodation':
    "DEVOCEAN Lodge is a few minutes from Ponta do Ouro's dive operators and dolphin swim centre. Dive sites 10 m–47 m, resident dolphin pods year-round, whale watching June–November.",

  '/book-direct':
    'Book direct at DEVOCEAN Lodge for the best rate. No booking fees, no OTA markup. Instant confirmation. Safari tents, cottage and chalet, Ponta do Ouro.',

  '/why-ponta':
    'Why visit Ponta do Ouro? Marine reserve, wild dolphins, humpback whales, world-class diving, big-game fishing and uncrowded beaches in Southern Africa.',

  '/story':
    "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro with plans for sustainable growth and local impact.",

  '/gift-vouchers':
    'Give the gift of a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Gift vouchers available for any accommodation type, valid for 12 months from purchase.',

  '/devocean-lodge-meals':
    'Breakfast is included at DEVOCEAN Lodge in Ponta do Ouro. Resident guests can also pre-order freshly prepared dinners from our in-house restaurant.',

  '/booking-confirmed':
    'Your booking at DEVOCEAN Lodge, Ponta do Ouro is confirmed.',

  '/gift-confirmed':
    'Your DEVOCEAN Lodge gift voucher purchase is confirmed.',

  '/admin':
    'DEVOCEAN Lodge admin area.',
};
