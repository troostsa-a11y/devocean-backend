import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HeroSection from '../HeroSection.jsx';
import { getCriticalUI } from '../../i18n/useLocale.js';

function renderHero() {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(
    <HeroSection ui={getCriticalUI('en-GB')} images={[]} bookUrl="/book-direct" lang="en-GB" currency="USD" />,
  );
  return container;
}

describe('hero KAYAK Travel Award', () => {
  it('uses the official badge and opens the supplied property listing safely', () => {
    const link = renderHero().querySelector('[data-testid="link-kayak-travel-awards"]');
    expect(link.getAttribute('href')).toBe('https://www.kayak.com/Ponta-d-Ouro-Hotels-Devocean-Resorts.2320616.ksp');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.relList.contains('noopener')).toBe(true);
    expect(link.relList.contains('noreferrer')).toBe(true);

    const image = link.querySelector('img');
    expect(image.getAttribute('src')).toBe('https://content.r9cdn.net/seo-res/badges/v5/LIGHT_MEDIUM_TRAVEL_AWARDS.png');
    expect(image.getAttribute('alt')).toBe('KAYAK Travel Awards');
    expect(image.getAttribute('width')).toBe('90');
    expect(image.getAttribute('height')).toBe('90');
    expect(image.getAttribute('loading')).toBe('lazy');
  });

  it('keeps the award next to reserved review space and allows wrapping', () => {
    const link = renderHero().querySelector('[data-testid="link-kayak-travel-awards"]');
    const row = link.parentElement;
    expect(row.classList.contains('flex')).toBe(true);
    expect(row.classList.contains('flex-wrap')).toBe(true);
    expect(row.classList.contains('items-center')).toBe(true);
    expect(link.previousElementSibling.classList.contains('w-[250px]')).toBe(true);
    expect(link.previousElementSibling.classList.contains('min-h-[90px]')).toBe(true);
  });
});
