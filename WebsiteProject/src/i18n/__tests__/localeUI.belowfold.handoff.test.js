/**
 * localeUI.belowfold.handoff.test.js
 *
 * Regression guard for the critical → full-UI handoff.
 *
 * After criticalUI renders synchronously, useLocale replaces it with the
 * dynamically-loaded language module's UI object. This test verifies that
 * every lang/*.js module's UI export contains populated, non-English
 * experiences.featured (and the other six below-fold fields) so ExperiencesSection
 * never reverts to English "Featured" after the async translation lands.
 *
 * Importing the modules directly here mirrors what loadTranslation() does
 * (it resolves `module.UI`) without needing async dynamic-import glue.
 */

import { describe, it, expect } from 'vitest';

// ── static imports of every supported locale's UI export ────────────────────
import { UI as UI_en_GB }  from '../langs/en-GB.js';
import { UI as UI_en_US }  from '../langs/en-US.js';
import { UI as UI_pt_PT }  from '../langs/pt-PT.js';
import { UI as UI_pt_BR }  from '../langs/pt-BR.js';
import { UI as UI_nl_NL }  from '../langs/nl-NL.js';
import { UI as UI_fr_FR }  from '../langs/fr-FR.js';
import { UI as UI_it_IT }  from '../langs/it-IT.js';
import { UI as UI_de_DE }  from '../langs/de-DE.js';
import { UI as UI_es_ES }  from '../langs/es-ES.js';
import { UI as UI_sv }     from '../langs/sv.js';
import { UI as UI_pl }     from '../langs/pl.js';
import { UI as UI_ro }     from '../langs/ro.js';
import { UI as UI_sr }     from '../langs/sr.js';
import { UI as UI_hr }     from '../langs/hr.js';
import { UI as UI_cs }     from '../langs/cs.js';
import { UI as UI_tr }     from '../langs/tr.js';
import { UI as UI_ja_JP }  from '../langs/ja-JP.js';
import { UI as UI_zh_CN }  from '../langs/zh-CN.js';
import { UI as UI_ru }     from '../langs/ru.js';
import { UI as UI_af_ZA }  from '../langs/af-ZA.js';
import { UI as UI_zu }     from '../langs/zu.js';
import { UI as UI_sw }     from '../langs/sw.js';

const LOCALES = [
  { lang: 'en-GB',  ui: UI_en_GB,  featuredExpected: 'Featured' },
  { lang: 'en-US',  ui: UI_en_US,  featuredExpected: 'Featured' },
  { lang: 'pt-PT',  ui: UI_pt_PT,  featuredExpected: 'Destaque' },
  { lang: 'pt-BR',  ui: UI_pt_BR,  featuredExpected: 'Destaque' },
  { lang: 'nl-NL',  ui: UI_nl_NL,  featuredExpected: 'Uitgelicht' },
  { lang: 'fr-FR',  ui: UI_fr_FR,  featuredExpected: 'À la une' },
  { lang: 'it-IT',  ui: UI_it_IT,  featuredExpected: 'In evidenza' },
  { lang: 'de-DE',  ui: UI_de_DE,  featuredExpected: 'Empfohlen' },
  { lang: 'es-ES',  ui: UI_es_ES,  featuredExpected: 'Destacado' },
  { lang: 'sv',     ui: UI_sv,     featuredExpected: 'Utvalda' },
  { lang: 'pl',     ui: UI_pl,     featuredExpected: 'Polecane' },
  { lang: 'ro',     ui: UI_ro,     featuredExpected: 'Recomandat' },
  { lang: 'sr',     ui: UI_sr,     featuredExpected: 'Izdvojeno' },
  { lang: 'hr',     ui: UI_hr,     featuredExpected: 'Izdvojeno' },
  { lang: 'cs',     ui: UI_cs,     featuredExpected: 'Vybrané' },
  { lang: 'tr',     ui: UI_tr,     featuredExpected: 'Öne Çıkanlar' },
  { lang: 'ja-JP',  ui: UI_ja_JP,  featuredExpected: 'おすすめ' },
  { lang: 'zh-CN',  ui: UI_zh_CN,  featuredExpected: '精选' },
  { lang: 'ru',     ui: UI_ru,     featuredExpected: 'Рекомендуем' },
  { lang: 'af-ZA',  ui: UI_af_ZA,  featuredExpected: 'Gewild' },
  { lang: 'zu',     ui: UI_zu,     featuredExpected: 'Okugqamile' },
  { lang: 'sw',     ui: UI_sw,     featuredExpected: 'Maarufu' },
];

// Below-fold paths that must be non-empty strings in the loaded UI object.
const REQUIRED_PATHS = [
  ['stay', 'headline'],
  ['stay', 'blurb'],
  ['stay', 'moreDetails'],
  ['experiences', 'headline'],
  ['experiences', 'blurb'],
  ['experiences', 'featured'],
  ['experiences', 'learnMore'],
];

// ─── completeness: all 7 below-fold paths present in every module ────────────

describe('lang/*/UI — below-fold paths populated after async locale load', () => {
  for (const { lang, ui } of LOCALES) {
    describe(lang, () => {
      for (const path of REQUIRED_PATHS) {
        it(`${path.join('.')} is a non-empty string`, () => {
          const val = path.reduce((obj, key) => obj?.[key], ui);
          expect(
            typeof val,
            `${lang}: ${path.join('.')} expected string, got ${JSON.stringify(val)}`
          ).toBe('string');
          expect(val.trim()).not.toBe('');
        });
      }
    });
  }
});

// ─── non-English locales: experiences.featured is not English ────────────────

describe('lang/*/UI — experiences.featured is translated, not English "Featured"', () => {
  const nonEnglish = LOCALES.filter(l => l.lang !== 'en-GB' && l.lang !== 'en-US');

  for (const { lang, ui } of nonEnglish) {
    it(`${lang}: experiences.featured is not "Featured"`, () => {
      const featured = ui?.experiences?.featured;
      expect(featured).toBeTruthy();
      expect(featured).not.toBe('Featured');
    });
  }

  it('en-GB control: experiences.featured is "Featured"', () => {
    expect(UI_en_GB.experiences.featured).toBe('Featured');
  });
});

// ─── exact value assertions for high-traffic locales ────────────────────────

describe('lang/*/UI — experiences.featured exact values (spot check)', () => {
  it('pt-PT: "Destaque"', () => expect(UI_pt_PT.experiences.featured).toBe('Destaque'));
  it('pt-BR: "Destaque"', () => expect(UI_pt_BR.experiences.featured).toBe('Destaque'));
  it('de-DE: "Empfohlen"', () => expect(UI_de_DE.experiences.featured).toBe('Empfohlen'));
  it('fr-FR: "À la une"', () => expect(UI_fr_FR.experiences.featured).toBe('À la une'));
  it('es-ES: "Destacado"', () => expect(UI_es_ES.experiences.featured).toBe('Destacado'));
  it('nl-NL: "Uitgelicht"', () => expect(UI_nl_NL.experiences.featured).toBe('Uitgelicht'));
  it('ja-JP: "おすすめ"', () => expect(UI_ja_JP.experiences.featured).toBe('おすすめ'));
  it('zh-CN: "精选"',     () => expect(UI_zh_CN.experiences.featured).toBe('精选'));
  it('ru:   "Рекомендуем"', () => expect(UI_ru.experiences.featured).toBe('Рекомендуем'));
});

// ─── ja-JP: experiences.headline is Japanese, not English ────────────────────

describe('lang/ja-JP/UI — experiences.headline is Japanese (regression: was "Explore Ponta")', () => {
  it('headline is "ポンタを探索"', () => {
    expect(UI_ja_JP.experiences.headline).toBe('ポンタを探索');
  });

  it('headline is not the old English placeholder "Explore Ponta"', () => {
    expect(UI_ja_JP.experiences.headline).not.toBe('Explore Ponta');
  });
});
