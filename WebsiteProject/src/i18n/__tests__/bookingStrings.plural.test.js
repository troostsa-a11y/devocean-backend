import { describe, it, expect } from 'vitest';
import { getBookingStrings, perNightFromTemplate, fmt } from '../bookingStrings';

// Renders the final user-visible label for a lang + night count.
const label = (lang, n) => fmt(perNightFromTemplate(getBookingStrings(lang), n), { nights: n });

describe('perNightFromTemplate — natural pluralisation', () => {
  it('English: 1 night / n nights', () => {
    expect(label('en', 1)).toBe('for 1 night');
    expect(label('en', 2)).toBe('for 2 nights');
    expect(label('en', 21)).toBe('for 21 nights');
  });

  it('German: Nacht / Nächte', () => {
    expect(label('de', 1)).toBe('für 1 Nacht');
    expect(label('de', 5)).toBe('für 5 Nächte');
  });

  it('Polish: noc / noce (few) / nocy (many), 12-14 → many, 22-24 → few', () => {
    expect(label('pl', 1)).toBe('za 1 noc');
    expect(label('pl', 2)).toBe('za 2 noce');
    expect(label('pl', 5)).toBe('za 5 nocy');
    expect(label('pl', 12)).toBe('za 12 nocy');
    expect(label('pl', 22)).toBe('za 22 noce');
  });

  it('Czech: noc / noci (only 2-4) / nocí (incl. 22+)', () => {
    expect(label('cs', 1)).toBe('na 1 noc');
    expect(label('cs', 2)).toBe('na 2 noci');
    expect(label('cs', 5)).toBe('na 5 nocí');
    expect(label('cs', 22)).toBe('na 22 nocí');
  });

  it('Russian: ночь (1, 21) / ночи (2-4, 22-24) / ночей (5+, 11-14)', () => {
    expect(label('ru', 1)).toBe('за 1 ночь');
    expect(label('ru', 2)).toBe('за 2 ночи');
    expect(label('ru', 5)).toBe('за 5 ночей');
    expect(label('ru', 11)).toBe('за 11 ночей');
    expect(label('ru', 21)).toBe('за 21 ночь');
    expect(label('ru', 22)).toBe('за 22 ночи');
    expect(label('ru', 25)).toBe('за 25 ночей');
  });

  it('Serbian/Croatian: noć (1, 21) / noći (everything else)', () => {
    expect(label('sr', 1)).toBe('za 1 noć');
    expect(label('sr', 3)).toBe('za 3 noći');
    expect(label('sr', 21)).toBe('za 21 noć');
    expect(label('hr', 5)).toBe('za 5 noći');
  });

  it('Japanese/Chinese: single invariant form', () => {
    expect(label('ja', 1)).toBe('1泊分');
    expect(label('ja', 3)).toBe('3泊分');
    expect(label('zh', 1)).toBe('共 1 晚');
  });

  it('falls back to plural template when forms are missing (partial fixtures)', () => {
    const t = { perNightFrom: 'for {nights} night(s)' };
    expect(fmt(perNightFromTemplate(t, 1), { nights: 1 })).toBe('for 1 night(s)');
  });

  it('full locale codes reduce to base language', () => {
    expect(label('pt-PT', 1)).toBe('para 1 noite');
    expect(label('pt-BR', 4)).toBe('para 4 noites');
  });
});
