/**
 * DateRangePicker.sixthtier.test.jsx
 *
 * Forward-compat guard: proves that adding a new tier to RATE_TIER_STRINGS.en
 * is sufficient to make it appear (with a non-blank label AND a visible colour)
 * in both the calendar legend and the day-cell backgrounds.
 *
 * We mock bookingStrings.js to inject a sixth "ultra" tier before the component
 * module is imported. Because vi.mock() is hoisted, DateRangePicker.jsx sees the
 * 6-tier RATE_TIER_STRINGS when it derives TIER_KEYS and FALLBACK_TIER_LABELS at
 * module initialisation time — exactly the scenario we want to prove.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

// ── Module mocks (hoisted) ────────────────────────────────────────────────────

vi.mock('../../i18n/bookingStrings.js', () => ({
  RATE_TIER_STRINGS: {
    en: {
      rateLegendTitle: 'Nightly rate',
      rateTiers: {
        lowest:   'Lowest',
        low:      'Low',
        shoulder: 'Shoulder',
        high:     'High',
        peak:     'Peak',
        ultra:    'Ultra',   // ← hypothetical 6th tier
      },
    },
  },
}));

vi.mock('lucide-react', () => ({
  Calendar:     () => null,
  ChevronLeft:  () => null,
  ChevronRight: () => null,
  ArrowRight:   () => null,
}));

// Import AFTER mocks so the component sees the 6-tier RATE_TIER_STRINGS.
import DateRangePicker from '../DateRangePicker';

afterEach(() => { cleanup(); });

// ── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Six strictly distinct prices — one per tier bucket.
 * With 6 unique values the component takes the "≤ tierCount" path and maps
 * each value onto one of the 6 tiers (0..5), so every legend entry and every
 * corresponding calendar cell is active.
 */
const PRICE_BY_DATE = {
  '2026-09-01': 100,
  '2026-09-02': 200,
  '2026-09-03': 300,
  '2026-09-04': 400,
  '2026-09-05': 500,
  '2026-09-06': 600, // mapped to tier 5 ("ultra") by computeTierByDate
};

const T_SIX_TIERS = {
  rateLegendTitle: 'Nightly rate',
  rateTiers: {
    lowest:   'Lowest',
    low:      'Low',
    shoulder: 'Shoulder',
    high:     'High',
    peak:     'Peak',
    ultra:    'Ultra',
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DateRangePicker legend — sixth-tier forward-compat', () => {
  it('renders all six tier labels (including the new "ultra" tier) with non-blank text', () => {
    const { getByTestId } = render(
      <DateRangePicker
        lang="en"
        t={T_SIX_TIERS}
        priceByDate={PRICE_BY_DATE}
        checkIn="2026-09-01"
      />,
    );

    const legend = getByTestId('legend-rate-tiers');
    expect(legend, 'Legend element must be present when hasTiers=true').toBeTruthy();

    // All six labels — including the newly added "ultra" — must appear in the legend.
    for (const [key, label] of Object.entries(T_SIX_TIERS.rateTiers)) {
      expect(
        legend.textContent,
        `Label for tier "${key}" ("${label}") is missing from the rendered legend — ` +
        'the component did not pick up the new tier from RATE_TIER_STRINGS.en.',
      ).toContain(label);
    }
  });

  it('renders exactly as many legend swatches as there are tier keys', () => {
    const { getByTestId } = render(
      <DateRangePicker
        lang="en"
        t={T_SIX_TIERS}
        priceByDate={PRICE_BY_DATE}
        checkIn="2026-09-01"
      />,
    );

    const legend = getByTestId('legend-rate-tiers');
    const swatches = legend.querySelectorAll('span.rounded-sm');
    expect(swatches).toHaveLength(Object.keys(T_SIX_TIERS.rateTiers).length);
  });

  it('gives the sixth-tier calendar day a non-empty background colour that matches its legend swatch', () => {
    const { getByTestId } = render(
      <DateRangePicker
        lang="en"
        t={T_SIX_TIERS}
        priceByDate={PRICE_BY_DATE}
        checkIn="2026-09-01"  // initialises the calendar view to September 2026
      />,
    );

    // The day button for the sixth-tier date must have an inline backgroundColor.
    const dayBtn = getByTestId('day-2026-09-06');
    expect(dayBtn, 'Day button for 2026-09-06 (tier-5 date) must be in the DOM').toBeTruthy();

    const dayCellBg = dayBtn.style.backgroundColor;
    expect(
      dayCellBg,
      'Day-cell backgroundColor must not be empty for the sixth tier — ' +
      'TIER_TINTS fallback not applied correctly.',
    ).toBeTruthy();

    // The sixth legend swatch must carry the same background colour so
    // legend and calendar are visually consistent.
    const legend = getByTestId('legend-rate-tiers');
    const swatches = Array.from(legend.querySelectorAll('span.rounded-sm'));
    const sixthSwatch = swatches[5]; // 0-based index 5 = "ultra"
    expect(sixthSwatch, 'Sixth legend swatch must exist').toBeTruthy();

    expect(
      sixthSwatch.style.backgroundColor,
      'Sixth swatch backgroundColor must not be empty.',
    ).toBeTruthy();

    expect(
      dayCellBg,
      'Day-cell and legend-swatch backgrounds must match so the calendar and legend agree.',
    ).toBe(sixthSwatch.style.backgroundColor);
  });
});
