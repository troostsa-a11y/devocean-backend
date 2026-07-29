/**
 * DEVOCEAN Lodge — Single Source of Truth
 *
 * All factual claims about the lodge (inventory, distances, meals, road
 * access, check-in rules, contact) MUST be derived from this file.
 *
 * How to use:
 *   • React pages — import and reference directly.
 *   • Static HTML pages — copy the canonical phrases (marked ✓) verbatim.
 *   • Marin page context — import MARIN_CONTEXT or build from this data.
 *
 * When a fact changes, update here first, then propagate to static pages.
 */

// ---------------------------------------------------------------------------
// INVENTORY
// ---------------------------------------------------------------------------
export const INVENTORY = {
  // Four publicly marketed accommodation types.
  // TODO: confirm exact Beds24 unit count with operations (story.html says 9;
  // Beds24 may split one type into multiple bookable units).
  types: 4,
  // Canonical public-facing description (use this phrase everywhere).
  typesLabel: 'four accommodation types',
  units: [
    {
      id:       'safari',
      name:     'Safari Tent',
      bedType:  'king-or-twin',        // user-selectable at booking
      ensuite:  false,
      ac:       false,
      maxAdults: 2,
      maxChildren: 1,
      notes:    'Shared ablutions block.',
    },
    {
      id:       'comfort',
      name:     'Comfort Safari Tent',
      bedType:  'king-or-twin',        // user-selectable at booking
      ensuite:  true,
      ac:       false,
      maxAdults: 2,
      maxChildren: 1,
      notes:    'En-suite bathroom under thatched roof.',
    },
    {
      id:       'cottage',
      name:     'Garden Cottage',
      bedType:  'queen',               // FIXED — NOT king/twin
      ensuite:  true,
      ac:       true,                  // inverter AC (heat + cool)
      maxAdults: 2,
      maxChildren: 1,
      notes:    'Solid construction, desk/workspace, dining table, thatched roundavel.',
    },
    {
      id:       'chalet',
      name:     'Thatched Chalet',
      bedType:  'king-or-twin',        // user-selectable at booking
      ensuite:  true,
      ac:       true,                  // inverter AC (heat + cool)
      maxAdults: 2,
      maxChildren: 1,
      notes:    'Flagship unit, traditional thatched roof.',
    },
  ],
};

// ---------------------------------------------------------------------------
// LOCATION & BEACH ACCESS
// Avoid: "beachfront", "oceanfront", "direct beach access".
// Use:   the canonical phrase below.
// ---------------------------------------------------------------------------
export const LOCATION = {
  address:       'Rua C, Parcela 12, Ponta do Ouro, Mozambique',
  coords:        { lat: -26.8420, lng: 32.8850 },
  what3words:    '///slick.jars.rates',

  // Canonical beach-distance phrase — use EXACTLY this wording on all pages.
  beachDistance: 'approximately 300 metres from the beach — a few minutes\u2019 walk through the village',
  // Short form for fact badges / summaries.
  beachShort:    'approx. 300 m to beach',

  transportTerminal: '150 m from the public transport terminal',
};

// ---------------------------------------------------------------------------
// MEALS
// Canonical statement: breakfast included; dinner for resident guests by
// advance order; no regular lunch service.
// ---------------------------------------------------------------------------
export const MEALS = {
  breakfast: {
    included:    true,
    description: 'Included in the accommodation rate. Served 08:30–11:00 in the tropical garden. Earlier/later times by arrangement.',
  },
  dinner: {
    available:   true,
    forGuestsOnly: true,
    description: 'Resident guests may pre-order dinner from the in-house kitchen. Place your order during the day; latest order time 20:00. Kitchen closes 21:00.',
  },
  lunch: {
    available:   false,
    description: 'No regular lunch service. Over 16 restaurants and cafés within 500 m of the lodge.',
  },
  braai: {
    available:   true,
    description: 'Outdoor braai / BBQ facilities available for guests.',
  },
  // Canonical FAQ answer — use verbatim or paraphrase consistently.
  faqAnswer: 'Breakfast is included in the accommodation rate. Resident guests can also pre-order dinner from our in-house kitchen (advance notice required; latest order 20:00). We do not serve lunch — there are over 16 restaurants and cafés within a short walk. Outdoor braai facilities are available for self-catering.',
};

// ---------------------------------------------------------------------------
// ROAD ACCESS
// The approach to the lodge does NOT require a 4×4.
// Reserve the 4×4 warning for Malongane and deep-sand routes only.
// ---------------------------------------------------------------------------
export const ROAD = {
  // Kosi Bay border → village
  borderToVillage: {
    distance:    '13 km',
    surface:     'largely tarred with short sandy sections near seasonal streams',
    requires4x4: false,
    notes:       'Conditions can soften after heavy rain (December–March).',
  },
  // Within the village
  villageCentre: {
    surface:     'paved / compacted',
    requires4x4: false,
  },
  // Lodge approach (Rua C)
  lodgeApproach: {
    surface:     'paved',
    requires4x4: false,
  },
  // Routes that DO require 4×4 — mention only when relevant
  requires4x4Routes: [
    'Malongane (north of village)',
    'Deep-sand beach access tracks',
  ],
  // Canonical public-facing description
  canonicalDescription: 'The approach to DEVOCEAN Lodge is paved. The main road from the Kosi Bay border to the village is largely tarred with short sandy sections. No 4×4 is required to reach the lodge or the main beach. A 4×4 is needed only for Malongane and deep-sand tracks beyond the village.',
};

// ---------------------------------------------------------------------------
// CHECK-IN / CHECK-OUT
// ---------------------------------------------------------------------------
export const CHECKIN = {
  checkIn:  '14:00',
  checkOut: '10:00',
};

// ---------------------------------------------------------------------------
// CONTACT
// ---------------------------------------------------------------------------
export const CONTACT = {
  email:   'info@devoceanlodge.com',
  website: 'https://devoceanlodge.com',
  booking: 'https://devoceanlodge.com/book-direct',
};

// ---------------------------------------------------------------------------
// MARIN CONTEXT BLOCK
// Injected into every Marin conversation as structured page context.
// ---------------------------------------------------------------------------
export const MARIN_CONTEXT = `
DEVOCEAN Lodge — verified facts (use these, not anything else):
- Four accommodation types: Safari Tent (king/twin, shared ablutions), Comfort Tent (king/twin, en-suite), Garden Cottage (QUEEN bed, AC, desk), Thatched Chalet (king/twin, AC, en-suite).
- Beach: ${LOCATION.beachDistance}.
- Meals: breakfast included daily; dinner by advance pre-order (resident guests only); no lunch; braai available.
- Road: paved approach; no 4×4 required for lodge or main beach; 4×4 needed only for Malongane / deep-sand tracks.
- Check-in: ${CHECKIN.checkIn}. Check-out: ${CHECKIN.checkOut}.
- Address: ${LOCATION.address}. What3words: ${LOCATION.what3words}.
`.trim();
