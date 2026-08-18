/**
 * criticalUI.belowfold.test.js
 *
 * Guards against the English-placeholder flash for non-English visitors.
 *
 * Verifies:
 * 1. CRITICAL_NAV carries all required below-fold keys for every supported language.
 * 2. Non-English locales use genuinely translated strings (not English copies).
 * 3. getCriticalUI() correctly maps CRITICAL_NAV values into the stay/experiences
 *    shape consumed by AccommodationsSection and ExperiencesSection, exercising
 *    the actual exported mapper function.
 *
 * "Done" for Task #162: non-English visitors see the correct translated
 * headline from the very first synchronous render — no network round-trip
 * required, no English flicker.
 */

import { describe, it, expect } from 'vitest';
import { CRITICAL_NAV } from '../critical.js';
import { getCriticalUI } from '../useLocale.js';

// ── canonical language list (must stay in sync with SUPPORTED_LANGS in useLocale.js) ──
const ALL_LANGS = [
  'en-GB', 'en-US',
  'pt-PT', 'pt-BR',
  'nl-NL', 'fr-FR', 'it-IT', 'de-DE', 'es-ES', 'sv', 'pl',
  'ro', 'sr', 'hr', 'cs', 'tr',
  'ja-JP', 'zh-CN', 'ru',
  'af-ZA', 'zu', 'sw',
];

// Keys that every CRITICAL_NAV entry must carry for below-fold rendering.
// experiencesFeatured is used by ExperiencesSection as a visible badge label.
const REQUIRED_BELOW_FOLD_KEYS = [
  'stayHeadline',
  'stayBlurb',
  'stayMoreDetails',
  'experiencesHeadline',
  'experiencesBlurb',
  'experiencesFeatured',
  'experiencesLearnMore',
];

// ─── CRITICAL_NAV completeness ────────────────────────────────────────────────

describe('CRITICAL_NAV — below-fold keys present for every language', () => {
  it('has an entry for every supported language', () => {
    const missing = ALL_LANGS.filter(lang => !CRITICAL_NAV[lang]);
    expect(missing, `Missing CRITICAL_NAV entries: ${missing.join(', ')}`).toHaveLength(0);
  });

  for (const key of REQUIRED_BELOW_FOLD_KEYS) {
    it(`"${key}" is a non-empty string in every language`, () => {
      const failures = [];
      for (const lang of ALL_LANGS) {
        const nav = CRITICAL_NAV[lang];
        if (!nav) { failures.push(`${lang}: entry missing`); continue; }
        const val = nav[key];
        if (typeof val !== 'string' || val.trim() === '') {
          failures.push(`${lang}: "${key}" is ${JSON.stringify(val)}`);
        }
      }
      expect(
        failures,
        `Missing/empty "${key}" in:\n${failures.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

// ─── Translated values are actually translated (not English copies) ───────────

describe('CRITICAL_NAV — non-English stayHeadline differs from English', () => {
  const enHeadline = CRITICAL_NAV['en-GB'].stayHeadline;

  // All non-English locales must produce a genuinely different headline.
  const nonEnglishLangs = ALL_LANGS.filter(l => l !== 'en-GB' && l !== 'en-US');

  for (const lang of nonEnglishLangs) {
    it(`${lang}: stayHeadline is not the English fallback "${enHeadline}"`, () => {
      const headline = CRITICAL_NAV[lang]?.stayHeadline;
      expect(headline).toBeTruthy();
      expect(headline).not.toBe(enHeadline);
    });
  }
});

describe('CRITICAL_NAV — non-English experiencesHeadline is not bare English "Explore Ponta"', () => {
  // Languages that are expected to have a non-English headline.
  // (ja-JP previously had "Explore Ponta" — now fixed to "ポンタを探索")
  const expectNonEnglish = ['pt-PT', 'pt-BR', 'de-DE', 'fr-FR', 'it-IT', 'es-ES',
    'nl-NL', 'pl', 'sv', 'ru', 'zh-CN', 'af-ZA', 'ro', 'sr', 'hr', 'cs', 'tr',
    'ja-JP', 'zu', 'sw'];

  const englishPhrases = ['Explore Ponta', 'Experiences'];

  for (const lang of expectNonEnglish) {
    it(`${lang}: experiencesHeadline is not an English placeholder`, () => {
      const headline = CRITICAL_NAV[lang]?.experiencesHeadline;
      expect(headline).toBeTruthy();
      expect(englishPhrases).not.toContain(headline);
    });
  }
});

// ─── getCriticalUI() mapper — exercises the actual exported function ───────────

describe('getCriticalUI() — stay object maps CRITICAL_NAV keys correctly', () => {
  it('pt-PT: stay.headline is "Fique connosco", not English', () => {
    const ui = getCriticalUI('pt-PT');
    expect(ui.stay.headline).toBe('Fique connosco');
    expect(ui.stay.headline).not.toBe('Stay with us');
  });

  it('pt-PT: stay.moreDetails is "Mais detalhes"', () => {
    const ui = getCriticalUI('pt-PT');
    expect(ui.stay.moreDetails).toBe('Mais detalhes');
  });

  it('de-DE: stay.headline is "Bei uns übernachten"', () => {
    const ui = getCriticalUI('de-DE');
    expect(ui.stay.headline).toBe('Bei uns übernachten');
  });

  it('ja-JP: stay.headline is "私たちと一緒に" (Japanese)', () => {
    const ui = getCriticalUI('ja-JP');
    expect(ui.stay.headline).toBe('私たちと一緒に');
  });
});

describe('getCriticalUI() — experiences object maps CRITICAL_NAV keys correctly', () => {
  it('pt-PT: experiences.headline is "Explorar Ponta", not English', () => {
    const ui = getCriticalUI('pt-PT');
    expect(ui.experiences.headline).toBe('Explorar Ponta');
    expect(ui.experiences.headline).not.toBe('Explore Ponta');
  });

  it('pt-PT: experiences.featured is "Destaque", not English "Featured"', () => {
    const ui = getCriticalUI('pt-PT');
    expect(ui.experiences.featured).toBe('Destaque');
    expect(ui.experiences.featured).not.toBe('Featured');
  });

  it('de-DE: experiences.headline is "Erkunde Ponta"', () => {
    const ui = getCriticalUI('de-DE');
    expect(ui.experiences.headline).toBe('Erkunde Ponta');
  });

  it('de-DE: experiences.featured is "Empfohlen", not English "Featured"', () => {
    const ui = getCriticalUI('de-DE');
    expect(ui.experiences.featured).toBe('Empfohlen');
  });

  it('ja-JP: experiences.headline is "ポンタを探索" (Japanese, not English)', () => {
    const ui = getCriticalUI('ja-JP');
    expect(ui.experiences.headline).toBe('ポンタを探索');
    expect(ui.experiences.headline).not.toBe('Explore Ponta');
  });

  it('ja-JP: experiences.featured is "おすすめ" (Japanese)', () => {
    const ui = getCriticalUI('ja-JP');
    expect(ui.experiences.featured).toBe('おすすめ');
  });

  it('en-GB: experiences.headline is "Explore Ponta" (English control)', () => {
    const ui = getCriticalUI('en-GB');
    expect(ui.experiences.headline).toBe('Explore Ponta');
  });

  it('en-GB: experiences.featured is "Featured" (English control)', () => {
    const ui = getCriticalUI('en-GB');
    expect(ui.experiences.featured).toBe('Featured');
  });

  it('unknown lang: falls back to English defaults gracefully', () => {
    const ui = getCriticalUI('xx-UNKNOWN');
    expect(ui.stay.headline).toBe('Stay with us');
    expect(ui.experiences.featured).toBe('Featured');
  });
});

// ─── All locales: getCriticalUI() produces non-null stay/experiences ──────────

describe('getCriticalUI() — every locale returns a complete stay + experiences shape', () => {
  for (const lang of ALL_LANGS) {
    it(`${lang}: stay and experiences objects are fully populated`, () => {
      const ui = getCriticalUI(lang);

      expect(typeof ui.stay.headline).toBe('string');
      expect(ui.stay.headline.trim()).not.toBe('');

      expect(typeof ui.stay.blurb).toBe('string');
      expect(ui.stay.blurb.trim()).not.toBe('');

      expect(typeof ui.stay.moreDetails).toBe('string');
      expect(ui.stay.moreDetails.trim()).not.toBe('');

      expect(typeof ui.experiences.headline).toBe('string');
      expect(ui.experiences.headline.trim()).not.toBe('');

      expect(typeof ui.experiences.blurb).toBe('string');
      expect(ui.experiences.blurb.trim()).not.toBe('');

      expect(typeof ui.experiences.featured).toBe('string');
      expect(ui.experiences.featured.trim()).not.toBe('');

      expect(typeof ui.experiences.learnMore).toBe('string');
      expect(ui.experiences.learnMore.trim()).not.toBe('');
    });
  }
});
