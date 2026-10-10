import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Footer from '../Footer.jsx';
import { getCriticalUI } from '../../i18n/useLocale.js';
import { getGuideLabels, GUIDE_LABELS } from '../../i18n/guideLabels.js';
import { LOCALES } from '../../i18n/localeCatalog.js';

const FULL_UI_MODULES = import.meta.glob('../../i18n/langs/*.js', { eager: true, import: 'UI' });
const links = [
  ['gettingHere', '/getting-to-ponta-do-ouro'],
  ['without4x4', '/ponta-do-ouro-without-4x4'],
  ['accommodation', '/ponta-do-ouro-accommodation'],
  ['meals', '/devocean-lodge-meals'],
];

afterEach(cleanup);

describe('footer guide navigation is translated before and after language loading', () => {
  it.each(LOCALES.map(({ code }) => code))('%s: all guide labels render with unchanged destinations', lang => {
    const labels = getGuideLabels(lang);
    const { rerender } = render(
      <Footer ui={getCriticalUI(lang)} lang={lang} units={[]} experiences={[]} />,
    );

    const assertLabels = () => {
      expect(screen.getByText(labels.heading, { exact: true })).toBeTruthy();
      for (const [key, href] of links) {
        expect(screen.getByRole('link', { name: labels[key], exact: true }).getAttribute('href')).toBe(href);
      }
      expect(screen.getByRole('link', { name: 'Ponta do Ouro', exact: true }).getAttribute('href')).toBe('/ponta-do-ouro');
    };

    assertLabels();
    rerender(
      <Footer ui={FULL_UI_MODULES[`../../i18n/langs/${lang}.js`]} lang={lang} units={[]} experiences={[]} />,
    );
    assertLabels();
  });

  it('has a complete label set for every supported language without English copies', () => {
    expect(Object.keys(GUIDE_LABELS).sort()).toEqual(LOCALES.map(({ code }) => code).sort());
    const english = getGuideLabels('en-GB');
    for (const { code } of LOCALES) {
      for (const key of ['heading', ...links.map(([key]) => key)]) {
        const label = getGuideLabels(code)[key];
        expect(typeof label).toBe('string');
        expect(label.trim()).not.toBe('');
        if (!code.startsWith('en-')) expect(label, `${code}: ${key}`).not.toBe(english[key]);
      }
    }
  });

  it('updates visible guide labels when the selected language changes', () => {
    const { rerender } = render(
      <Footer ui={getCriticalUI('de-DE')} lang="de-DE" units={[]} experiences={[]} />,
    );
    expect(screen.getByRole('link', { name: 'Anreise', exact: true })).toBeTruthy();
    rerender(<Footer ui={getCriticalUI('pt-PT')} lang="pt-PT" units={[]} experiences={[]} />);
    expect(screen.getByRole('link', { name: 'Como chegar', exact: true })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Anreise', exact: true })).toBeNull();
  });

  it('falls back to the English guide labels only for unsupported languages', () => {
    expect(getGuideLabels('xx-UNKNOWN')).toBe(getGuideLabels('en-GB'));
  });
});
