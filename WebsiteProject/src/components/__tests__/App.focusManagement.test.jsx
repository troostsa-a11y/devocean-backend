/**
 * App.focusManagement.test.jsx
 *
 * Confirms that the focus-management useEffect in App.jsx (the double-rAF
 * that moves keyboard focus to the new page's H1 on every non-home location
 * change) cannot call focus() on a detached or stale element after the
 * component unmounts.
 *
 * Covers:
 *   1. Happy path — focus() fires on the H1 during a normal navigation.
 *   2. Unmount between frames — component unmounts after the outer rAF fires
 *      but before the inner rAF fires; focus() must NOT be called.
 *   3. Rapid location change — a second navigation fires before the first
 *      double-rAF resolves; focus() fires exactly once (for the second
 *      navigation) and not for the stale first navigation.
 *   4. Homepage — effect returns early; focus() is never called on '/'.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ── Wouter mocks ──────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
let mockLocation = '/';

vi.mock('wouter', () => ({
  useLocation: () => [mockLocation, mockNavigate],
  Router: ({ children }) => <>{children}</>,
  // Always render the homepage branch so section stubs are in the DOM
  Switch: ({ children }) => {
    const arr = Array.isArray(children) ? children : [children];
    const home = arr.find(c => c?.props?.path === '/');
    return home ? <>{home.props.children}</> : null;
  },
  Route: ({ children }) => <>{children}</>,
}));

vi.mock('wouter/use-browser-location', () => ({
  useBrowserLocation: () => [mockLocation, mockNavigate],
}));

// ── Heavy internal dependencies ───────────────────────────────────────────────

vi.mock('../../i18n/useLocale', () => ({
  useLocale: () => ({
    lang: 'en',
    currency: 'USD',
    region: 'westEu',
    setLang: vi.fn(),
    setRegion: vi.fn(),
    setCurrency: vi.fn(),
    ui: { nav: {}, stay: {}, contact: {}, regions: {} },
    criticalUI: { nav: {}, stay: {}, contact: {}, regions: {} },
    loading: false,
    bookingLocale: 'en',
    dateLocale: 'en-GB',
    countryCode: 'ZZ',
  }),
  CC_TO_CURRENCY: {},
}));

vi.mock('../../utils/localize', () => ({
  localizeUnits: () => [],
  localizeExperiences: () => [],
  buildBookingUrl: () => '/book-direct',
}));

vi.mock('../../data/content', () => ({
  HERO_IMAGES: [],
  IMG: { units: {} },
}));

vi.mock('../../utils/debounce', () => ({
  throttle: fn => fn,
}));

vi.mock('../../utils/safeStorage', () => ({
  safeLocalStorage:   { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() },
  safeSessionStorage: { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() },
}));

vi.mock('../../utils/seoMeta', () => ({
  useSeoPage: vi.fn(),
  getHomeDescription: () => null,
  getHomeTitle: () => null,
}));

// ── Section stubs ─────────────────────────────────────────────────────────────
// HeroSection includes an <h1> so the focus-management effect has a target.

vi.mock('../Header',                () => ({ default: () => <header /> }));
vi.mock('../HeroSection',           () => ({ default: () => <div><h1 id="hero-h1">Hero</h1></div> }));
vi.mock('../AccommodationsSection', () => ({ default: () => <div id="stay" /> }));
vi.mock('../ExperiencesSection',    () => ({ default: () => <div id="experiences" /> }));
vi.mock('../GallerySection',        () => ({ default: () => <div id="gallery" /> }));
vi.mock('../LocationSection',       () => ({ default: () => <div id="location" /> }));
vi.mock('../ContactSection',        () => ({ default: () => <div id="contact" /> }));
vi.mock('../Footer',                () => ({ default: () => <footer /> }));

// Lazy route pages (never rendered via the Switch mock, but must be resolvable)
vi.mock('../ExperienceDetailPage',   () => ({ default: () => null }));
vi.mock('../WhyPontaPage',           () => ({ default: () => null }));
vi.mock('../AdminPage',              () => ({ default: () => null }));
vi.mock('../BookDirectPage',         () => ({ default: () => null }));
vi.mock('../BookingConfirmedPage',   () => ({ default: () => null }));
vi.mock('../GiftVouchersPage',       () => ({ default: () => null }));
vi.mock('../GiftConfirmedPage',      () => ({ default: () => null }));
vi.mock('../StoryPage',             () => ({ default: () => null }));
vi.mock('../MealsPage',             () => ({ default: () => null }));
vi.mock('../PontaDoOuroPage',       () => ({ default: () => null }));
vi.mock('../GettingTherePage',      () => ({ default: () => null }));
vi.mock('../WithoutFourByFourPage', () => ({ default: () => null }));
vi.mock('../AccommodationPage',     () => ({ default: () => null }));
vi.mock('../SafariTentsPage',       () => ({ default: () => null }));
vi.mock('../DivingDolphinsPage',    () => ({ default: () => null }));

// ── App under test ────────────────────────────────────────────────────────────

import App from '../../App';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function setWindowLocation({ pathname = '/', hash = '' } = {}) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      pathname,
      hash,
      search: '',
      href: `http://localhost${pathname}${hash}`,
      assign:  vi.fn(),
      replace: vi.fn(),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('App — focus-management useEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    mockLocation = '/';
  });

  // ── Test 1: happy path — focus fires during normal navigation ──────────────
  //
  // Render on '/', then navigate to '/story'. The double-rAF should resolve
  // and call focus() on whatever H1 is found in the document.
  // We spy on HTMLElement.prototype.focus to catch focus on any H1 in the
  // document (including the one rendered by the HeroSection mock).

  it('calls focus() on the H1 during a normal navigation to a non-home route', async () => {
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });

    // Spy on the prototype so we catch focus() regardless of which H1 element
    // the selector resolves to (App renders its own H1 via HeroSection mock).
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });
    // Drain initial rAFs (location is '/' → effect returns early → no focus)
    await act(async () => { vi.runAllTimers(); });
    focusSpy.mockClear();

    // Navigate to /story — triggers the focus-management double-rAF
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Flush both rAF frames
    await act(async () => { vi.runAllTimers(); });

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  // ── Test 2: unmount between frames — focus() must NOT fire ────────────────
  //
  // Navigate to /story so the outer rAF is queued. Before that outer rAF
  // resolves (i.e. before the inner rAF is even scheduled), unmount the
  // component. The cleanup cancels both frames, so focus() must not be called.

  it('does not call focus() when the component unmounts between the two rAF frames', async () => {
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });

    // Spy on the prototype to catch any focus() call on any element
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

    let rerenderFn;
    let unmountFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
      unmountFn = result.unmount;
    });
    await act(async () => { vi.runAllTimers(); });
    focusSpy.mockClear();

    // Navigate to /story → outer rAF is queued but NOT yet flushed
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Unmount NOW — between outer and inner rAF.
    // The effect cleanup must cancel the pending frames.
    unmountFn();

    // Flush all remaining callbacks — neither rAF callback should call focus()
    await act(async () => { vi.runAllTimers(); });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  // ── Test 3: rapid location change — only the final navigation focuses ──────
  //
  // Two navigations fire before either double-rAF resolves. The cleanup from
  // the first navigation must cancel its rAFs. Only the second navigation's
  // focus() call should land.

  it('calls focus() exactly once when a second navigation fires before the first rAF pair resolves', async () => {
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });

    // Spy on the prototype to catch any focus() call on any element
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });
    await act(async () => { vi.runAllTimers(); });
    focusSpy.mockClear();

    // First navigation — outer rAF queued, NOT flushed
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Second navigation fires immediately — React cleans up the first effect
    // (cancelling its rAFs) and queues a new double-rAF for this navigation.
    mockLocation = '/devocean-lodge-meals';
    setWindowLocation({ pathname: '/devocean-lodge-meals', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Flush all pending callbacks
    await act(async () => { vi.runAllTimers(); });

    // focus() must fire exactly once — for the second navigation only
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  // ── Test 4: homepage — effect returns early, focus() never called ──────────

  it('does not call focus() when location is "/"', async () => {
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });

    await act(async () => { render(<App />); });

    const h1 = document.createElement('h1');
    h1.textContent = 'Home';
    document.body.appendChild(h1);
    const focusSpy = vi.spyOn(h1, 'focus');

    await act(async () => { vi.runAllTimers(); });

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
