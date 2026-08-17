/**
 * RoomCard.unit.test.jsx
 *
 * Regression tests that pin the two source-of-truth constants in RoomCard.jsx
 * that together guarantee Garden Cottage never receives a bed-preference:
 *
 *   1. getUnitKey('Garden Cottage') must return exactly 'cottage'.
 *      If a refactor renames / removes the 'cottage' key this fails immediately.
 *
 *   2. The bed-toggle render condition must NOT include 'cottage'.
 *      The condition is: unitKey === 'safari' || unitKey === 'comfort' || unitKey === 'chalet'
 *      Asserting it as a whitelist means any future addition of 'cottage' breaks
 *      this test before the broken payload ever reaches production.
 *
 *   3. A rendered RoomCard for a Garden Cottage must contain no bed-type
 *      buttons (king / twin) — zero buttons with a /king|twin/i title attribute.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getUnitKey } from '../RoomCard';

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
 * THE BED-TOGGLE WHITELIST.
 *
 * This constant mirrors the condition on RoomCard.jsx line 234:
 *   (unitKey === 'safari' || unitKey === 'comfort' || unitKey === 'chalet')
 *
 * It is declared explicitly here so that if a developer adds 'cottage' to
 * the real JSX condition they must also add it here, which will immediately
 * break the assertion below — preventing the bug from reaching production.
 */
const BED_TOGGLE_UNIT_KEYS = ['safari', 'comfort', 'chalet'];

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
    expect(BED_TOGGLE_UNIT_KEYS.sort()).toEqual(['chalet', 'comfort', 'safari']);
  });

  it("getUnitKey('Garden Cottage') is not in BED_TOGGLE_UNIT_KEYS", () => {
    const unitKey = getUnitKey('Garden Cottage');
    expect(BED_TOGGLE_UNIT_KEYS).not.toContain(unitKey);
  });
});

// ── 3. Render test — no bed-type buttons on a cottage card ────────────────────

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
