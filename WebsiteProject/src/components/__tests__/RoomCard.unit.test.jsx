/**
 * RoomCard.unit.test.jsx
 *
 * Regression tests that pin the two source-of-truth constants in RoomCard.jsx
 * that together guarantee the bed-preference toggle is shown only for the
 * correct room types:
 *
 *   1. getUnitKey('Garden Cottage') must return exactly 'cottage'.
 *      If a refactor renames / removes the 'cottage' key this fails immediately.
 *
 *   2. UNIT_KEYS and BED_TOGGLE_UNIT_KEYS are imported directly from RoomCard
 *      source (not hardcoded here), so the tests track the real constants.
 *      Every key in UNIT_KEYS must appear in either BED_TOGGLE_UNIT_KEYS or
 *      BED_TOGGLE_NON_KEYS — adding a new unit type without updating either
 *      list will fail this test with a clear diagnostic message.
 *
 *   3. A rendered RoomCard for a Garden Cottage must contain no bed-type
 *      buttons (king / twin) — zero buttons with a /king|twin/i title attribute.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getUnitKey, UNIT_KEYS, BED_TOGGLE_UNIT_KEYS, UNIT_FEATURES, FEATURE_LABELS } from '../RoomCard';

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('../../data/content', () => ({
  IMG: {
    units: {
      safari:  '/mock/safari.webp',
      comfort: '/mock/comfort.webp',
      cottage: '/mock/cottage.webp',
      chalet:  '/mock/chalet.webp',
    },
  },
}));

vi.mock('lucide-react', () => {
  const Stub = () => null;
  return {
    Users:       Stub,
    Plus:        Stub,
    Minus:       Stub,
    ExternalLink: Stub,
    ChevronDown: Stub,
    BedDouble:   Stub,
    BedSingle:   Stub,
  };
});

vi.mock('../../i18n/bookingStrings', () => ({
  fmt: (template, vars) =>
    String(template).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''),
}));

// ── 1 & 2. Pure-function tests — no rendering needed ──────────────────────────

/**
 * Units that are intentionally excluded from the bed-preference toggle.
 * Every key in UNIT_KEYS must appear in either BED_TOGGLE_UNIT_KEYS or here.
 * If a developer adds a new unit type to UNIT_KEYS without updating either
 * list, the cross-check test below will fail with a descriptive message.
 */
const BED_TOGGLE_NON_KEYS = ['cottage'];

describe('getUnitKey — Garden Cottage slug', () => {
  it("returns 'cottage' for 'Garden Cottage'", () => {
    expect(getUnitKey('Garden Cottage')).toBe('cottage');
  });

  it("returns 'cottage' for lowercase 'garden cottage'", () => {
    expect(getUnitKey('garden cottage')).toBe('cottage');
  });

  it("returns 'cottage' for names that contain the word 'cottage'", () => {
    expect(getUnitKey('The Garden Cottage Unit 2')).toBe('cottage');
  });

  // Belt-and-suspenders: other units still resolve correctly.
  it("returns 'safari' for 'Safari Tent'", () => {
    expect(getUnitKey('Safari Tent')).toBe('safari');
  });
  it("returns 'comfort' for 'Comfort Tent'", () => {
    expect(getUnitKey('Comfort Tent')).toBe('comfort');
  });
  it("returns 'chalet' for 'Thatched Chalet'", () => {
    expect(getUnitKey('Thatched Chalet')).toBe('chalet');
  });
});

describe('bed-toggle whitelist — cottage must be absent', () => {
  it("BED_TOGGLE_UNIT_KEYS does NOT include 'cottage'", () => {
    expect(BED_TOGGLE_UNIT_KEYS).not.toContain('cottage');
  });

  it("BED_TOGGLE_UNIT_KEYS includes exactly safari, comfort, chalet", () => {
    expect([...BED_TOGGLE_UNIT_KEYS].sort()).toEqual(['chalet', 'comfort', 'safari']);
  });

  it("getUnitKey('Garden Cottage') is not in BED_TOGGLE_UNIT_KEYS", () => {
    const unitKey = getUnitKey('Garden Cottage');
    expect(BED_TOGGLE_UNIT_KEYS).not.toContain(unitKey);
  });

  /**
   * CROSS-CHECK: every key in UNIT_KEYS must be explicitly accounted for.
   *
   * This test reads UNIT_KEYS and BED_TOGGLE_UNIT_KEYS directly from the
   * RoomCard source. If a developer adds a new entry to UNIT_KEYS they MUST
   * also add it to either BED_TOGGLE_UNIT_KEYS (toggle shown) or to
   * BED_TOGGLE_NON_KEYS in this test file (toggle deliberately absent).
   * Forgetting to do either will fail this test with a clear message naming
   * the unaccounted key — before the omission reaches production.
   */
  it('every UNIT_KEY is accounted for in BED_TOGGLE_UNIT_KEYS or BED_TOGGLE_NON_KEYS', () => {
    const accounted = new Set([...BED_TOGGLE_UNIT_KEYS, ...BED_TOGGLE_NON_KEYS]);
    const unaccounted = UNIT_KEYS.filter((k) => !accounted.has(k));
    expect(unaccounted, [
      'New unit key(s) found in UNIT_KEYS that are not listed in',
      'BED_TOGGLE_UNIT_KEYS (toggle shown) or BED_TOGGLE_NON_KEYS (toggle absent):',
      unaccounted.join(', '),
      '',
      'Add the key to BED_TOGGLE_UNIT_KEYS in RoomCard.jsx if the new room type',
      'should offer a king/twin preference, OR add it to BED_TOGGLE_NON_KEYS in',
      'this test file if its bed layout is fixed.',
    ].join('\n')).toHaveLength(0);
  });

  /**
   * REVERSE-CHECK: BED_TOGGLE_UNIT_KEYS must not reference a key absent from UNIT_KEYS.
   *
   * Catches the case where a unit type is removed from UNIT_KEYS but its toggle
   * entry is left behind as a stale reference.
   */
  it('every BED_TOGGLE_UNIT_KEY exists in UNIT_KEYS', () => {
    const unitKeySet = new Set(UNIT_KEYS);
    const stale = BED_TOGGLE_UNIT_KEYS.filter((k) => !unitKeySet.has(k));
    expect(stale, [
      'BED_TOGGLE_UNIT_KEYS references key(s) not present in UNIT_KEYS:',
      stale.join(', '),
      'Remove the stale entry from BED_TOGGLE_UNIT_KEYS in RoomCard.jsx.',
    ].join('\n')).toHaveLength(0);
  });
});

// ── 3. UNIT_FEATURES sync — every UNIT_KEY must have a features entry ─────────

/**
 * CROSS-CHECK: every key in UNIT_KEYS must have a corresponding entry in UNIT_FEATURES.
 *
 * UNIT_FEATURES is a manual map — if a developer adds a new entry to UNIT_KEYS
 * but forgets to add a matching entry to UNIT_FEATURES, the new room type
 * silently shows no feature badges. This test makes that failure loud.
 */
describe('UNIT_FEATURES sync — every UNIT_KEY has a features entry', () => {
  it('every key in UNIT_KEYS has an entry in UNIT_FEATURES', () => {
    const missing = UNIT_KEYS.filter((k) => !(k in UNIT_FEATURES));
    expect(missing, [
      'Key(s) found in UNIT_KEYS that are missing from UNIT_FEATURES:',
      missing.join(', '),
      '',
      'Add a corresponding entry to UNIT_FEATURES in RoomCard.jsx so the new',
      'room type displays the correct feature badges on its booking card.',
    ].join('\n')).toHaveLength(0);
  });

  it('every key in UNIT_FEATURES exists in UNIT_KEYS (no stale entries)', () => {
    const unitKeySet = new Set(UNIT_KEYS);
    const stale = Object.keys(UNIT_FEATURES).filter((k) => !unitKeySet.has(k));
    expect(stale, [
      'UNIT_FEATURES references key(s) not present in UNIT_KEYS:',
      stale.join(', '),
      'Remove the stale entry from UNIT_FEATURES in RoomCard.jsx.',
    ].join('\n')).toHaveLength(0);
  });
});

// ── 4. FEATURE_LABELS coverage — every slug in UNIT_FEATURES has a label ────────

/**
 * CROSS-CHECK: every feature slug listed in any UNIT_FEATURES value must have
 * a corresponding entry in FEATURE_LABELS.
 *
 * If a developer adds a new slug to UNIT_FEATURES (e.g. 'pool') but forgets to
 * add a matching entry to FEATURE_LABELS, the badge silently falls back to
 * displaying the raw slug key. This test names any missing slug before it ships.
 */
describe('FEATURE_LABELS coverage — every UNIT_FEATURES slug has a label', () => {
  it('every slug referenced in UNIT_FEATURES values has an entry in FEATURE_LABELS', () => {
    const allSlugs = [...new Set(Object.values(UNIT_FEATURES).flat())];
    const missing = allSlugs.filter((slug) => !(slug in FEATURE_LABELS));
    expect(missing, [
      'Feature slug(s) found in UNIT_FEATURES that are missing from FEATURE_LABELS:',
      missing.join(', '),
      '',
      'Add a corresponding entry to FEATURE_LABELS in RoomCard.jsx so the badge',
      'displays a translated label instead of the raw slug key.',
    ].join('\n')).toHaveLength(0);
  });

  it('every entry in FEATURE_LABELS is referenced by at least one UNIT_FEATURES value (no orphans)', () => {
    const usedSlugs = new Set(Object.values(UNIT_FEATURES).flat());
    const orphans = Object.keys(FEATURE_LABELS).filter((slug) => !usedSlugs.has(slug));
    expect(orphans, [
      'FEATURE_LABELS contains entry/entries not referenced by any UNIT_FEATURES value:',
      orphans.join(', '),
      'Remove the unused entry from FEATURE_LABELS in RoomCard.jsx, or add the',
      'slug to the appropriate room type in UNIT_FEATURES.',
    ].join('\n')).toHaveLength(0);
  });

  /**
   * LANGUAGE COVERAGE CHECK: every slug in FEATURE_LABELS must have a
   * translation for every supported base-language code.
   *
   * getRoomFeatureLabel falls back: lang → base → en → raw slug, so a missing
   * key for a non-English locale causes the guest to silently see English text
   * (or the raw slug if 'en' is also absent) rather than their own language.
   * This test catches incomplete translation objects before they ship.
   *
   * CANONICAL_LANGS is the authoritative list of 20 base language codes that
   * FEATURE_LABELS must cover. It is intentionally independent of FEATURE_LABELS
   * itself so that removing a code from any slug cannot suppress the failure.
   * Update this list whenever a new base language is added to the site.
   */
  it('every slug in FEATURE_LABELS has translations for all supported base-language codes', () => {
    const CANONICAL_LANGS = [
      'en', 'pt', 'nl', 'fr', 'it', 'de', 'es', 'af',
      'sv', 'pl', 'ro', 'sr', 'hr', 'cs', 'tr',
      'ja', 'zh', 'ru', 'zu', 'sw',
    ];

    const failures = [];
    for (const [slug, translations] of Object.entries(FEATURE_LABELS)) {
      const presentLangs = new Set(Object.keys(translations));
      const missingLangs = CANONICAL_LANGS.filter((lang) => !presentLangs.has(lang));
      if (missingLangs.length > 0) {
        failures.push(`  "${slug}" is missing: ${missingLangs.join(', ')}`);
      }
    }

    expect(failures, [
      'The following FEATURE_LABELS slugs are missing one or more language translations.',
      'Guests in those locales will fall back to English (or the raw slug key).',
      'Add the missing keys to each slug in RoomCard.jsx:',
      ...failures,
    ].join('\n')).toHaveLength(0);
  });
});

// ── 5. Checkout-sync test — the bedPreferences predicate matches the toggle ────

/**
 * The checkout default logic in BookDirectPage.jsx is:
 *   if (BED_TOGGLE_UNIT_KEYS.includes(uk)) prefs[roomId] = 'king';
 *
 * Since both files now import the same exported constant, this test proves
 * that the predicate produces 'king' for every BED_TOGGLE_UNIT_KEY and
 * produces nothing for every BED_TOGGLE_NON_KEY — so a new unit added to
 * UNIT_KEYS automatically drives the correct checkout behaviour once it is
 * placed in the right list.
 */
describe('checkout bedPreferences sync — every toggle key defaults to king', () => {
  for (const key of BED_TOGGLE_UNIT_KEYS) {
    it(`BED_TOGGLE_UNIT_KEYS.includes(getUnitKey('${key} room')) is true → would default to king`, () => {
      // Simulate a Beds24 room name that contains the unit key (e.g. 'safari room').
      const resolved = getUnitKey(`${key} room`);
      expect(BED_TOGGLE_UNIT_KEYS.includes(resolved)).toBe(true);
    });
  }

  for (const key of BED_TOGGLE_NON_KEYS) {
    it(`BED_TOGGLE_UNIT_KEYS.includes(getUnitKey('${key} room')) is false → no default pref`, () => {
      const resolved = getUnitKey(`${key} room`);
      expect(BED_TOGGLE_UNIT_KEYS.includes(resolved)).toBe(false);
    });
  }
});

// ── 4. Render test — no bed-type buttons on a cottage card ────────────────────

/**
 * Minimal props for a Garden Cottage RoomCard.
 * Only the props that matter for the toggle visibility are required;
 * everything else is given a sensible no-op default.
 */
const COTTAGE_ROOM = {
  roomId:      'cottage-room-test',
  name:        'Garden Cottage',
  currency:    'USD',
  nights:      2,
  maxAdults:   2,
  maxPeople:   2,
  maxChildren: 0,
  available:   true,
  offers: [
    {
      offerId:        'offer-cottage-test',
      total:          500,
      type:           'semiFlex',
      unitsAvailable: 3,
      refundable:     true,
    },
  ],
};

const MINIMAL_T = {
  sleeps:               'Sleeps {count}',
  sleepsAdultsChildren: 'Sleeps {adults} + {children}',
  singleUse:            'Single use',
  childOccupant:        '1 child',
  perNightFrom:         'for {nights} night(s)',
  avgPerNight:          'avg/night',
  unitsLeft:            '{count} left',
  rooms:                'Rooms',
  addRoom:              'Add room',
  removeRoom:           'Remove room',
  yourSelection:        'Your selection',
  details:              'Details',
  unit:                 'Unit',
  nonRefundable:        'Non-refundable',
  depositFullNow:       '',
  rateConditions:       'Rate conditions',
  cancellationPolicy:   'Free cancellation {days} days',
  chooseRate:           'Choose rate',
};

describe('RoomCard render — Garden Cottage has no bed-type buttons', () => {
  it('renders no king/twin toggle buttons for a cottage card', async () => {
    // Lazy import so mocks are applied first.
    const { default: RoomCard } = await import('../RoomCard');

    render(
      <RoomCard
        room={COTTAGE_ROOM}
        displayName="Garden Cottage"
        rateChoiceId={undefined}
        qty={0}
        canAddRoom={true}
        bedChoice={undefined}
        occupancy={undefined}
        quotedTotal={null}
        effAdults={2}
        effChildren={0}
        effInfants={0}
        partyAdults={2}
        partyChildren={0}
        partyInfants={0}
        showFx={false}
        fxRate={1}
        currency="USD"
        freeCancellation={true}
        cancelDays={30}
        t={MINIMAL_T}
        lang="en"
        detailQueryString=""
        onQty={vi.fn()}
        onRate={vi.fn()}
        onOcc={vi.fn()}
        onBedType={vi.fn()}
      />,
    );

    // There must be no button whose title matches 'king' or 'twin'.
    const bedButtons = screen
      .queryAllByRole('button')
      .filter((btn) => /king|twin/i.test(btn.getAttribute('title') || ''));

    expect(bedButtons).toHaveLength(0);
  });

  // Confirm the toggle IS rendered for Safari (positive control).
  it('renders king and twin toggle buttons for a safari tent card', async () => {
    const { default: RoomCard } = await import('../RoomCard');

    const safariRoom = {
      ...COTTAGE_ROOM,
      roomId: 'safari-room-test',
      name:   'Safari Tent',
    };

    render(
      <RoomCard
        room={safariRoom}
        displayName="Safari Tent"
        rateChoiceId={undefined}
        qty={0}
        canAddRoom={true}
        bedChoice={undefined}
        occupancy={undefined}
        quotedTotal={null}
        effAdults={2}
        effChildren={0}
        effInfants={0}
        partyAdults={2}
        partyChildren={0}
        partyInfants={0}
        showFx={false}
        fxRate={1}
        currency="USD"
        freeCancellation={true}
        cancelDays={30}
        t={MINIMAL_T}
        lang="en"
        detailQueryString=""
        onQty={vi.fn()}
        onRate={vi.fn()}
        onOcc={vi.fn()}
        onBedType={vi.fn()}
      />,
    );

    // King and twin buttons must both be present for a safari tent.
    const kingBtn = screen.getByTitle(/king/i);
    const twinBtn = screen.getByTitle(/twin/i);
    expect(kingBtn).toBeTruthy();
    expect(twinBtn).toBeTruthy();
  });
});
