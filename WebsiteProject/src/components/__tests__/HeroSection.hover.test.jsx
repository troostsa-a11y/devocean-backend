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

describe('hero secondary-button hover colour', () => {
  it('shares the Explore the Lodge hover colour with both bottom buttons', () => {
    const container = renderHero();
    for (const id of ['button-explore-lodge', 'link-why-ponta', 'link-go-diving']) {
      const link = container.querySelector(`[data-testid="${id}"]`);
      expect(link.tagName).toBe('A');
      expect(link.classList.contains('btn-secondary'), id).toBe(true);
    }
  });

  it('preserves the destinations and the separate booking button styling', () => {
    const container = renderHero();
    expect(container.querySelector('[data-testid="button-explore-lodge"]').getAttribute('href')).toBe('#stay');
    expect(container.querySelector('[data-testid="link-why-ponta"]').getAttribute('href')).toBe('/why-ponta');
    expect(container.querySelector('[data-testid="link-go-diving"]').getAttribute('href')).toBe('/experiences/diving');
    const booking = container.querySelector('a.btn-cta');
    expect(booking.getAttribute('href')).toBe('/book-direct');
    expect(booking.classList.contains('btn-secondary')).toBe(false);
  });
});
