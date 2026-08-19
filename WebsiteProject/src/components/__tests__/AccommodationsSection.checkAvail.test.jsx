import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccommodationsSection from '../AccommodationsSection';

const ui = {
  stay: { headline: 'Stay', blurb: 'blurb', moreDetails: 'Details' },
  experiences: { headline: 'Experiences', blurb: '', cta: 'See experiences' },
  nav: { experiences: 'Experiences' },
};

const units = [
  { key: 'safari', title: 'Safari Tent', img: '/photos/safari.jpg', desc: 'desc', price: 30 },
  { key: 'comfort', title: 'Comfort Room', img: '/photos/comfort.jpg', desc: 'desc', price: 40 },
];

function setup() {
  return render(
    <AccommodationsSection units={units} ui={ui} bookUrl="/book-direct" lang="en" currency="USD" />
  );
}

describe('AccommodationsSection Check Availability feedback', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('shows "Checking availability…" and disables the button on plain click', () => {
    setup();
    const btn = screen.getByTestId('button-book-safari');
    expect(btn.textContent).toContain('Check Availability');
    fireEvent.click(btn, { button: 0 });
    expect(btn.textContent).toContain('Checking availability…');
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    // analytics still fired
    expect(window.dataLayer.some((e) => e.event === 'reservation_complete' && e.unit_key === 'safari')).toBe(true);
  });

  it('prevents further booking clicks while navigating', () => {
    setup();
    fireEvent.click(screen.getByTestId('button-book-safari'), { button: 0 });
    const other = screen.getByTestId('button-book-comfort');
    fireEvent.click(other, { button: 0 });
    expect(other.textContent).toContain('Check Availability'); // unchanged
  });

  it('does not lock the page on Ctrl/Cmd-click (new tab)', () => {
    setup();
    const btn = screen.getByTestId('button-book-safari');
    fireEvent.click(btn, { button: 0, ctrlKey: true });
    expect(btn.textContent).toContain('Check Availability');
    expect(btn.hasAttribute("aria-disabled")).toBe(false);
  });

  it('resets after pageshow (back/forward cache restore)', () => {
    setup();
    const btn = screen.getByTestId('button-book-safari');
    fireEvent.click(btn, { button: 0 });
    expect(btn.textContent).toContain('Checking availability…');
    fireEvent(window, new Event('pageshow'));
    expect(btn.textContent).toContain('Check Availability');
  });
});
