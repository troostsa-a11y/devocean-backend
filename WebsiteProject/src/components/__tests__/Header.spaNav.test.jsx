/**
 * Header.spaNav.test.jsx
 *
 * Confirms that clicking Stay / Gallery / Location / Contact / Explore Ponta
 * from a guide page (/story, /devocean-lodge-meals) uses SPA navigation
 * — navigate('/#section') — instead of a full page reload.
 *
 * Specifically:
 *   - navigate() is called with the correct hash-bearing path
 *   - window.location.assign / replace are NOT called (no hard reload)
 *   - Both desktop and mobile nav links are covered
 *   - Behaviour applies when on /story and /devocean-lodge-meals
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Header from '../Header';

// ── Wouter mock ───────────────────────────────────────────────────────────────
// navigate is a spy so we can assert what URL it was called with.
const mockNavigate = vi.fn();

vi.mock('wouter', () => ({
  useLocation: () => ['/story', mockNavigate],
}));

// ── Lucide icons ──────────────────────────────────────────────────────────────
vi.mock('lucide-react', () => ({
  Menu:  () => <span data-testid="icon-menu" />,
  Globe2: () => null,
}));

// ── LazyImage stub ────────────────────────────────────────────────────────────
vi.mock('../LazyImage', () => ({
  default: ({ alt, ...props }) => <img alt={alt} {...props} />,
}));

// ── Content data ──────────────────────────────────────────────────────────────
vi.mock('../../data/content', () => ({ IMG: { units: {} } }));

// ── Analytics ─────────────────────────────────────────────────────────────────
vi.mock('../../utils/analytics', () => ({ trackBookingSession: vi.fn() }));

// ─────────────────────────────────────────────────────────────────────────────
// Minimal ui prop (covers all keys referenced in Header)
const ui = {
  nav: {
    home:        'Home',
    stay:        'Stay',
    experiences: 'Explore Ponta',
    gallery:     'Gallery',
    location:    'Location',
    contact:     'Contact',
    food:        'Food',
  },
  stay:    { ourStory: 'Our Story' },
  contact: { bookNow:  'Book Now'  },
  regions: {
    westEu:   'Western Europe',
    eastEu:   'Eastern Europe',
    asia:     'Asia',
    americas: 'Americas',
    africa:   'Africa',
    oceania:  'Oceania',
  },
  menu: 'Menu',
};

const defaultProps = {
  ui,
  lang:           'en-GB',
  currency:       'USD',
  region:         'westEu',
  onLangChange:   vi.fn(),
  onRegionChange: vi.fn(),
  bookUrl:        '/book-direct',
};

// Helper: spy on reload-style navigation so we can assert it was NOT used.
let assignSpy;
let replaceSpy;

function setPathname(pathname) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      pathname,
      hash:    '',
      search:  '',
      href:    `http://localhost${pathname}`,
      assign:  (assignSpy  = vi.fn()),
      replace: (replaceSpy = vi.fn()),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Header — SPA section navigation from /story', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    setPathname('/story');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Desktop nav ─────────────────────────────────────────────────────────────

  it('desktop Stay link → navigate("/#stay"), no hard reload', () => {
    const { getAllByText } = render(<Header {...defaultProps} />);
    // Desktop and mobile both render "Stay"; click the first (desktop) occurrence.
    fireEvent.click(getAllByText('Stay')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/#stay');
    expect(assignSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('desktop Gallery link → navigate("/#gallery")', () => {
    const { getAllByText } = render(<Header {...defaultProps} />);
    fireEvent.click(getAllByText('Gallery')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/#gallery');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('desktop Location link → navigate("/#location")', () => {
    const { getAllByText } = render(<Header {...defaultProps} />);
    fireEvent.click(getAllByText('Location')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/#location');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('desktop Contact link → navigate("/#contact")', () => {
    const { getAllByText } = render(<Header {...defaultProps} />);
    fireEvent.click(getAllByText('Contact')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/#contact');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('desktop Explore Ponta link → navigate("/#experiences")', () => {
    const { getAllByText } = render(<Header {...defaultProps} />);
    fireEvent.click(getAllByText('Explore Ponta')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/#experiences');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  // ── Mobile nav (always in DOM; click without opening the menu) ──────────────

  it('mobile Stay link → navigate("/#stay"), no hard reload', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    fireEvent.click(getByTestId('link-mobile-stay'));
    expect(mockNavigate).toHaveBeenCalledWith('/#stay');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('mobile Gallery link → navigate("/#gallery")', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    fireEvent.click(getByTestId('link-mobile-gallery'));
    expect(mockNavigate).toHaveBeenCalledWith('/#gallery');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('mobile Location link → navigate("/#location")', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    fireEvent.click(getByTestId('link-mobile-location'));
    expect(mockNavigate).toHaveBeenCalledWith('/#location');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('mobile Contact link → navigate("/#contact")', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    fireEvent.click(getByTestId('link-mobile-contact'));
    expect(mockNavigate).toHaveBeenCalledWith('/#contact');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('mobile Explore Ponta link → navigate("/#experiences")', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    fireEvent.click(getByTestId('link-mobile-experiences'));
    expect(mockNavigate).toHaveBeenCalledWith('/#experiences');
    expect(assignSpy).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Header — SPA section navigation from /devocean-lodge-meals', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    setPathname('/devocean-lodge-meals');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('desktop Stay link → navigate("/#stay"), no hard reload', () => {
    const { getAllByText } = render(<Header {...defaultProps} />);
    fireEvent.click(getAllByText('Stay')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/#stay');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('mobile Contact link → navigate("/#contact"), no hard reload', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    fireEvent.click(getByTestId('link-mobile-contact'));
    expect(mockNavigate).toHaveBeenCalledWith('/#contact');
    expect(assignSpy).not.toHaveBeenCalled();
  });
});
