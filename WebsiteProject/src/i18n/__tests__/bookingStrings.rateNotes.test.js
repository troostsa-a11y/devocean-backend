import { describe, it, expect } from 'vitest';
import { STRINGS, getBookingStrings, fmt } from '../bookingStrings';

const LANGS = ['en','pt','de','fr','es','it','nl','sv','pl','ro','sr','hr','cs','tr','ja','zh','ru','af','zu','sw'];

describe('rate-plan microcopy strings', () => {
  it('every language defines rateNoteSemiFlex with exactly {days} and {within}', () => {
    for (const lang of LANGS) {
      const s = STRINGS[lang].rateNoteSemiFlex;
      expect(s, lang).toBeTruthy();
      const placeholders = [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(placeholders, lang).toEqual(['days', 'within']);
    }
  });

  it('every language defines rateNoteNonRef with no placeholders', () => {
    for (const lang of LANGS) {
      const s = STRINGS[lang].rateNoteNonRef;
      expect(s, lang).toBeTruthy();
      expect(s, lang).not.toMatch(/\{\w+\}/);
    }
  });

  it('adjacent boundary renders correctly (30+ refund / within 29 fee)', () => {
    const t = getBookingStrings('en');
    const out = fmt(t.rateNoteSemiFlex, { days: 30, within: 29 });
    expect(out).toBe('50% deposit to confirm · full refund 30+ days before arrival · 50% cancellation fee within 29 days');
  });
});
