/**
 * WhyPontaExperience.nullui.test.jsx
 *
 * Verifies that WhyPontaPage and ExperienceDetailPage render without crashing
 * when `ui` is null (translations still loading). Confirms:
 *   - Page content (hero, sections) renders immediately from static content
 *   - Footer is NOT rendered while ui is null (prevents ui.footer.* crash)
 *   - Footer IS rendered once ui (with footer key) is provided
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ── Wouter mock ───────────────────────────────────────────────────────────────
vi.mock('wouter', () => ({
  Link: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
  useRoute: () => [true, { key: 'dolphins' }],
  useLocation: () => ['/experiences/dolphins'],
}));

// ── Lucide icons ──────────────────────────────────────────────────────────────
vi.mock('lucide-react', () => {
  const Stub = () => null;
  return {
    Waves: Stub, Fish: Stub, TreePine: Stub, Globe: Stub, Heart: Stub,
    ArrowRight: Stub, MapPin: Stub,
  };
});

// ── SEO hook (no-op) ──────────────────────────────────────────────────────────
vi.mock('../../utils/seoMeta', () => ({
  useSeoPage: () => {},
  getExperienceDescription: () => 'Mock description',
}));

// ── Footer stub — records whether it was rendered ─────────────────────────────
vi.mock('../Footer', () => ({
  default: ({ ui }) => <div data-testid="footer">footer:{ui?.footer?.desc ?? 'null'}</div>,
}));

// ── ExperienceInquiryForm stub ────────────────────────────────────────────────
vi.mock('../ExperienceInquiryForm', () => ({
  default: () => <div data-testid="inquiry-form" />,
}));

// ── MarinPanel stub ───────────────────────────────────────────────────────────
vi.mock('../MarinPanel', () => ({
  default: () => null,
}));

// ── Dynamic content loaders (dolphins) ───────────────────────────────────────
vi.mock('../../i18n/content/dolphinsContent.js', () => ({
  getDolphinsContent: () => ({
    pricingRange: '$50–$80 per person',
    pricingDetails: ['Includes boat & guide'],
    durationTypical: '2–3 hours',
    durationDetails: ['Morning departures'],
    requirementsLevel: 'All levels',
    requirementsDetails: ['Non-swimmers welcome'],
    bestTimePeak: 'Year-round',
    bestTimeDetails: ['Best Jun–Nov'],
  }),
}));

// ── Actual component imports ──────────────────────────────────────────────────
import WhyPontaPage from '../WhyPontaPage';
import ExperienceDetailPage from '../ExperienceDetailPage';

// ── Shared props ──────────────────────────────────────────────────────────────
const baseProps = {
  units: [{ key: 'safari', title: 'Safari Tent' }],
  experiences: [{ key: 'dolphins', title: 'Dolphin Swim' }],
  lang: 'en',
  currency: 'USD',
  bookUrl: 'https://example.com/book',
};

const fullUi = {
  nav: { stay: 'Stay', experiences: 'Experiences', contact: 'Contact' },
  footer: { desc: 'Eco-friendly lodge', rights: 'All rights reserved.' },
};

// ─────────────────────────────────────────────────────────────────────────────
describe('WhyPontaPage — null ui', () => {
  it('renders without crashing when ui is null', () => {
    expect(() =>
      render(<WhyPontaPage {...baseProps} ui={null} />)
    ).not.toThrow();
  });

  it('shows hero content immediately (static content, no ui needed)', () => {
    render(<WhyPontaPage {...baseProps} ui={null} />);
    // WHY_PONTA_CONTENT.en.heroTitle
    expect(screen.getByText('Why Ponta do Ouro?')).toBeTruthy();
  });

  it('does NOT render Footer while ui is null', () => {
    render(<WhyPontaPage {...baseProps} ui={null} />);
    expect(screen.queryByTestId('footer')).toBeNull();
  });

  it('renders Footer once ui with footer key is provided', () => {
    render(<WhyPontaPage {...baseProps} ui={fullUi} />);
    expect(screen.getByTestId('footer')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ExperienceDetailPage — null ui', () => {
  it('renders without crashing when ui is null', async () => {
    expect(() =>
      render(<ExperienceDetailPage {...baseProps} ui={null} />)
    ).not.toThrow();
  });

  it('shows the experience hero title immediately (static content)', () => {
    render(<ExperienceDetailPage {...baseProps} ui={null} />);
    // EXPERIENCE_DETAILS.dolphins.title = "Dolphin Encounters"
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBeTruthy();
  });

  it('does NOT render Footer while ui is null', () => {
    render(<ExperienceDetailPage {...baseProps} ui={null} />);
    expect(screen.queryByTestId('footer')).toBeNull();
  });

  it('renders Footer once ui with footer key is provided', () => {
    render(<ExperienceDetailPage {...baseProps} ui={fullUi} />);
    expect(screen.getByTestId('footer')).toBeTruthy();
  });
});
