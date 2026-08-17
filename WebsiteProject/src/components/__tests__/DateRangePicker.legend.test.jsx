/**
 * DateRangePicker.legend.test.jsx
 *
 * Component-level guard: for every supported language, confirm that the
 * date-picker calendar legend renders the correct translated tier label
 * from RATE_TIER_STRINGS — not a blank string or a silent English fallback.
 *
 * Why this exists in addition to bookingStrings.unit.test.js
 * ──────────────────────────────────────────────────────────
 * The unit test checks that every key *exists* in every language object.
 * This test verifies that the component actually *renders* the translated
 * label from `t.rateTiers[key]` in the live DOM. If the component's tier-
 * lookup path ever silently falls back to FALLBACK_TIER_LABELS (e.g. because
 * the `t` prop is wired incorrectly), a guest will see English labels
 * regardless of their language — and the unit test would not catch it.
 *
 * How the legend is triggered
 * ───────────────────────────
 * DateRangePicker renders `data-testid="legend-rate-tiers"` only when
 * `priceByDate` contains ≥ 2 distinct prices (hasTiers=true). We supply
 * exactly 5 distinct prices so every tier bucket is active and all five
 * legend entries must appear.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { RATE_TIER_STRINGS } from '../../i18n/bookingStrings.js';

// Stub lucide icons used inside DateRangePicker so SVG elements don't
// pollute the DOM or cause missing-module errors in the test environment.
vi.mock('lucide-react', () => ({
  Calendar:     () => null,
  ChevronLeft:  () => null,
  ChevronRight: () => null,
  ArrowRight:   () => null,
}));

import DateRangePicker from '../DateRangePicker';

afterEach(() => {
  cleanup();
});

// ── Constants ──────────────────────────────────────────────────────────────────

/** All 20 base language codes that must be fully translated. */
const SUPPORTED_LANGS = [
  'en', 'pt', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'pl', 'ro',
  'sr', 'hr', 'cs', 'tr', 'ja', 'zh', 'ru', 'af', 'zu', 'sw',
];

/**
 * Derived from RATE_TIER_STRINGS.en — stays in sync automatically when a new
 * tier is added to the canonical source of truth.
 */
const TIER_KEYS = Object.keys(RATE_TIER_STRINGS.en.rateTiers);

/**
 * Five strictly distinct prices — one per tier bucket.
 * computeTierByDate() requires ≥ 2 distinct values to assign any tiers;
 * with exactly 5 distinct values it maps each onto its own tier (0..4),
 * so every tier colour and label appears in the rendered legend.
 */
const PRICE_BY_DATE = {
  '2026-09-01': 100,
  '2026-09-02': 200,
  '2026-09-03': 300,
  '2026-09-04': 400,
  '2026-09-05': 500,
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('DateRangePicker calendar legend — translated tier labels', () => {
  for (const lang of SUPPORTED_LANGS) {
    it(`renders all five tier labels correctly for lang="${lang}"`, () => {
      const t = RATE_TIER_STRINGS[lang];

      // Guard: the language object itself must exist (mirrors the unit-test
      // "has an entry for every supported language" assertion at render time).
      expect(
        t,
        `RATE_TIER_STRINGS["${lang}"] is undefined — add this language object.`,
      ).toBeTruthy();

      expect(
        t.rateTiers,
        `RATE_TIER_STRINGS["${lang}"].rateTiers is undefined — add the rateTiers sub-object.`,
      ).toBeTruthy();

      expect(
        t.rateLegendTitle,
        `RATE_TIER_STRINGS["${lang}"].rateLegendTitle is blank or missing.`,
      ).toBeTruthy();

      const { getByTestId } = render(
        <DateRangePicker
          lang={lang}
          t={t}
          priceByDate={PRICE_BY_DATE}
        />,
      );

      // The legend element must be present in the DOM when hasTiers is true.
      const legend = getByTestId('legend-rate-tiers');
      expect(legend, `Legend element missing for lang="${lang}"`).toBeTruthy();

      // The legend title must appear.
      expect(legend.textContent).toContain(t.rateLegendTitle);

      // Every tier key must yield a non-blank label that appears in the legend.
      for (const key of TIER_KEYS) {
        const label = t.rateTiers[key];

        expect(
          label,
          `RATE_TIER_STRINGS["${lang}"].rateTiers["${key}"] is blank or missing — ` +
          `guests will see a blank calendar legend entry.`,
        ).toBeTruthy();

        // The translated string must actually appear in the rendered legend text.
        // If the component's tier-lookup falls back to FALLBACK_TIER_LABELS this
        // assertion will fail for any language whose label differs from English.
        expect(legend.textContent).toContain(label);
      }
    });
  }
});
