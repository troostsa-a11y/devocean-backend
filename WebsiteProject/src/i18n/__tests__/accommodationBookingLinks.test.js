// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const origin = 'https://lodge.example';
const units = ['safari', 'comfort', 'cottage', 'chalet'];

function bookingLink(unit, pathname, search = '', stored = {}) {
  const html = readFileSync(new URL(`../../../${unit}.html`, import.meta.url), 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1]).find(source => source.includes("fwd.set('unit'"));
  expect(script).toBeTruthy();
  let href = '/book-direct';
  const anchor = {
    getAttribute: () => href,
    setAttribute: (_name, value) => { href = value; },
  };
  runInNewContext(script, {
    URL, URLSearchParams,
    window: { location: new URL(origin + pathname + search) },
    document: { querySelectorAll: () => [anchor] },
    localStorage: { getItem: key => stored[key] || null },
  });
  return new URL(href, origin);
}

describe.each(units)('%s booking links use the current locale URL', unit => {
  it.each(['', '/de', '/pt-pt', '/zh-hans'])('preserves locale %s and every booking field without lang=', prefix => {
    const target = bookingLink(unit, `${prefix}/${unit}`,
      '?lang=ja&checkIn=2027-01-05&checkOut=2027-01-08&adults=2&children=1&infants=1&discount=RETURN&currency=MZN',
      { 'site.lang': 'fr-FR', 'site.currency': 'EUR' });
    expect(target.origin).toBe(origin);
    expect(target.pathname).toBe(`${prefix}/book-direct`);
    expect(Object.fromEntries(target.searchParams)).toEqual({
      checkIn: '2027-01-05', checkOut: '2027-01-08', adults: '2',
      children: '1', infants: '1', discount: 'RETURN', currency: 'MZN', unit,
    });
  });

  it('retains the saved display currency on a direct HTML-page landing', () => {
    const target = bookingLink(unit, `/${unit}.html`, '', { 'site.currency': 'EUR', 'site.lang': 'ja-JP' });
    expect(target.pathname).toBe('/book-direct');
    expect(target.searchParams.get('currency')).toBe('EUR');
    expect(target.searchParams.get('lang')).toBeNull();
    expect(target.searchParams.get('unit')).toBe(unit);
  });

  it('cannot turn a double-slash document path into an external booking link', () => {
    const target = bookingLink(unit, `//${unit}`);
    expect(target.origin).toBe(origin);
    expect(target.pathname).toBe('/book-direct');
  });
});
