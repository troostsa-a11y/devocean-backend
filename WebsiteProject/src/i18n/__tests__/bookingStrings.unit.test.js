/**
 * bookingStrings.unit.test.js
 *
 * Completeness guard for all five string tables in bookingStrings.js:
 *   STRINGS          – core booking UI copy
 *   CONFIRM_STRINGS  – post-payment confirmation page copy
 *   RATE_TIER_STRINGS – date-picker rate-legend labels
 *   TERMS_STRINGS    – terms & conditions consent notice
 *   MARIN_STRINGS     – inline Marin help-button labels
 *
 * For each table the test derives the canonical key set from the `en` object
 * and asserts that every other language object contains every one of those keys
 * (including nested sub-object keys such as `rate.*` and `rateTiers.*`).
 *
 * A new key added to `en` only will produce a clear failure message naming
 * both the missing key path and the language codes that are missing it — so
 * the problem is visible before any guest ever sees a blank label.
 */

import { describe, it, expect } from 'vitest';
import {
  STRINGS,
  CONFIRM_STRINGS,
  RATE_TIER_STRINGS,
  TERMS_STRINGS,
  MARIN_STRINGS,
} from '../bookingStrings.js';

/** The 20 base language codes that must be fully translated. */
const SUPPORTED_LANGS = [
  'en', 'pt', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'pl', 'ro',
  'sr', 'hr', 'cs', 'tr', 'ja', 'zh', 'ru', 'af', 'zu', 'sw',
];

/**
 * Recursively collect all leaf key paths from an object.
 * E.g. { rate: { standard: '…', nonRef: '…' }, back: '…' }
 *   → ['rate.standard', 'rate.nonRef', 'back']
 */
function collectKeyPaths(obj, prefix = '') {
  const paths = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...collectKeyPaths(value, path));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

/**
 * Retrieve a nested value from an object by dot-separated path.
 * Returns undefined if any segment is missing.
 */
function getByPath(obj, path) {
  return path.split('.').reduce((cur, seg) => (cur != null ? cur[seg] : undefined), obj);
}

/**
 * Assert that every language in `table` (keyed by base lang code) contains
 * every key path found in the `en` entry.
 *
 * @param {string} tableName  Human-readable name used in failure messages.
 * @param {object} table      The raw string-table object (e.g. STRINGS).
 */
function assertAllLangsComplete(tableName, table) {
  const enKeys = collectKeyPaths(table.en);

  // Map each missing key path → array of lang codes that are missing it
  const missingByKey = new Map();

  for (const lang of SUPPORTED_LANGS) {
    if (lang === 'en') continue;

    if (!table[lang]) {
      // Entire language object is absent — report every key as missing
      for (const keyPath of enKeys) {
        if (!missingByKey.has(keyPath)) missingByKey.set(keyPath, []);
        missingByKey.get(keyPath).push(lang);
      }
      continue;
    }

    for (const keyPath of enKeys) {
      const value = getByPath(table[lang], keyPath);
      if (value === undefined || value === null) {
        if (!missingByKey.has(keyPath)) missingByKey.set(keyPath, []);
        missingByKey.get(keyPath).push(lang);
      }
    }
  }

  if (missingByKey.size > 0) {
    const lines = [];
    for (const [keyPath, langs] of missingByKey) {
      lines.push(`  • "${keyPath}" missing in: ${langs.join(', ')}`);
    }
    throw new Error(
      `[${tableName}] Some translations are incomplete.\n` +
      `Every key must be present in all ${SUPPORTED_LANGS.length} supported languages.\n\n` +
      `Missing keys:\n${lines.join('\n')}\n\n` +
      `Fix: add the missing keys (with translated values) to each language object listed above.`
    );
  }

  expect(missingByKey.size).toBe(0);
}

// ─── ensure all 20 lang entries exist in every table ────────────────────────

function assertAllLangsPresent(tableName, table) {
  const absent = SUPPORTED_LANGS.filter(lang => !table[lang]);
  if (absent.length > 0) {
    throw new Error(
      `[${tableName}] The following language objects are entirely absent: ${absent.join(', ')}.\n` +
      `Each of the 20 supported languages must have an entry.`
    );
  }
  expect(absent).toHaveLength(0);
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('bookingStrings — translation completeness', () => {
  describe('STRINGS (core booking copy)', () => {
    it('has an entry for every supported language', () => {
      assertAllLangsPresent('STRINGS', STRINGS);
    });

    it('every language has every key that English has', () => {
      assertAllLangsComplete('STRINGS', STRINGS);
    });
  });

  describe('CONFIRM_STRINGS (confirmation page copy)', () => {
    it('has an entry for every supported language', () => {
      assertAllLangsPresent('CONFIRM_STRINGS', CONFIRM_STRINGS);
    });

    it('every language has every key that English has', () => {
      assertAllLangsComplete('CONFIRM_STRINGS', CONFIRM_STRINGS);
    });
  });

  describe('RATE_TIER_STRINGS (date-picker rate-legend labels)', () => {
    it('has an entry for every supported language', () => {
      assertAllLangsPresent('RATE_TIER_STRINGS', RATE_TIER_STRINGS);
    });

    it('every language has every key that English has', () => {
      assertAllLangsComplete('RATE_TIER_STRINGS', RATE_TIER_STRINGS);
    });
  });

  describe('TERMS_STRINGS (terms & conditions consent)', () => {
    it('has an entry for every supported language', () => {
      assertAllLangsPresent('TERMS_STRINGS', TERMS_STRINGS);
    });

    it('every language has every key that English has', () => {
      assertAllLangsComplete('TERMS_STRINGS', TERMS_STRINGS);
    });
  });

  describe('MARIN_STRINGS (Marin help-button labels)', () => {
    it('has an entry for every supported language', () => {
      const absent = SUPPORTED_LANGS.filter(lang => !MARIN_STRINGS[lang]);
      expect(absent).toHaveLength(0);
    });

    it('every language has a non-empty translated label', () => {
      expect(Object.values(MARIN_STRINGS).every(label => typeof label === 'string' && label.trim())).toBe(true);
    });
  });
});
