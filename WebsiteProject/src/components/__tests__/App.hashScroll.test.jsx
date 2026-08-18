/**
 * App.hashScroll.test.jsx
 *
 * Confirms that the hash-scroll useEffect in App.jsx correctly scrolls to
 * a target section after SPA navigation lands on the homepage ('/').
 *
 * Covers:
 *   1. SPA transition — render on /story, navigate to /#stay → scrollIntoView fires.
 *   2. Retry path — element absent when location arrives at '/', retry loop finds it.
 *   3. No scroll on non-home routes — effect bails when location !== '/'.
 *   4. No scroll when hash is empty — effect does nothing when there is no hash.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ── Wouter mocks ─────────────────────────────────────────────────────────────
// mockLocation is a mutable module-level variable. Tests update it and call
// rerender(<App />) so React re-renders App, useLocation() returns the new
// value, and location-dependent useEffects fire exactly as they do during
// real SPA navigation.

const mockNavigate = vi.fn();
let mockLocation = '/';

vi.mock('wouter', () => ({
  useLocation: () => [mockLocation, mockNavigate],
  // Router / Switch / Route: always render the homepage branch so the section
  // stubs (id="stay", id="gallery", …) are always in the DOM.
  Router: ({ children }) => <>{children}</>,
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

// ── Section stubs — lightweight divs with the real IDs ───────────────────────

vi.mock('../Header',                () => ({ default: () => <header /> }));
vi.mock('../HeroSection',           () => ({ default: () => <div id="hero" /> }));
vi.mock('../AccommodationsSection', () => ({ default: () => <div id="stay" /> }));
vi.mock('../ExperiencesSection',    () => ({ default: () => <div id="experiences" /> }));
vi.mock('../GallerySection',        () => ({ default: () => <div id="gallery" /> }));
vi.mock('../LocationSection',       () => ({ default: () => <div id="location" /> }));
vi.mock('../ContactSection',        () => ({ default: () => <div id="contact" /> }));
vi.mock('../Footer',                () => ({ default: () => <footer /> }));

// Lazy route pages (never rendered in these tests)
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

/** Override window.location to match the scenario under test. */
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

describe('App — hash-scroll useEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    mockLocation = '/';
  });

  // ── Test 1: SPA navigation transition — the core scenario ──────────────────
  //
  // Renders on /story (guide page), then "navigates" to /#stay by updating
  // mockLocation and calling rerender(<App />). React re-runs useLocation(),
  // gets '/', location deps change, and the hash-scroll effect fires.

  it('scrolls to #stay after SPA navigation from /story to /#stay', async () => {
    // ── Phase 1: render on guide page ───────────────────────────────────────
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });

    // Flush any timers from the initial render — location is '/story' so the
    // hash-scroll effect returns early; no scroll should happen.
    await act(async () => { vi.runAllTimers(); });

    // ── Phase 2: SPA navigate to /#stay ─────────────────────────────────────
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '#stay' });

    // App.jsx uses <div key={location}> which unmounts/remounts the route
    // subtree on every location change.  Rerender with new mockLocation so:
    //   • React calls useLocation() → '/', sees the dep changed
    //   • The keyed div remounts, producing a fresh #stay DOM element
    //   • The hash-scroll useEffect fires and schedules the first rAF
    await act(async () => { rerenderFn(<App />); });

    // Spy must be attached AFTER the rerender because the keyed remount
    // created a new DOM node; the old reference (from phase 1) is detached.
    // The rAF callback runs AFTER this spy is in place.
    const stayEl = document.getElementById('stay');
    expect(stayEl).toBeTruthy();
    const scrollSpy = vi.spyOn(stayEl, 'scrollIntoView');

    // Flush rAF callbacks so tryScroll can reach the element.
    await act(async () => { vi.runAllTimers(); });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  // ── Test 2: retry path after SPA navigation ────────────────────────────────
  //
  // Element is absent when /#lazy-target arrives; retry loop finds it once
  // it is added to the DOM, simulating a lazy-mounted section.

  it('retries until the element appears after SPA navigation, then scrolls', async () => {
    // ── Phase 1: start on guide page ────────────────────────────────────────
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });

    // ── Phase 2: SPA navigate to /#lazy-target (not in any stub) ────────────
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '#lazy-target' });

    await act(async () => { rerenderFn(<App />); });

    // Confirm target is absent right after the location change commits.
    expect(document.getElementById('lazy-target')).toBeNull();

    // Advance one rAF tick — tryScroll fires and finds nothing.
    await act(async () => { vi.advanceTimersByTime(16); });

    // Inject the element now, simulating a lazy section finishing its mount.
    const lazyEl = document.createElement('div');
    lazyEl.id = 'lazy-target';
    document.body.appendChild(lazyEl);
    const scrollSpy = vi.spyOn(lazyEl, 'scrollIntoView');

    // Advance enough time for the retry loop to find the element.
    await act(async () => { vi.advanceTimersByTime(500); });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollSpy).toHaveBeenCalledTimes(1); // scrolled exactly once
  });

  // ── Test 3: non-home route — effect bails without scrolling ────────────────

  it('does not scroll when the current location is not "/"', async () => {
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '#stay' });

    await act(async () => { render(<App />); });

    const stayEl = document.getElementById('stay');
    const scrollSpy = stayEl ? vi.spyOn(stayEl, 'scrollIntoView') : null;

    await act(async () => { vi.runAllTimers(); });

    if (scrollSpy) {
      expect(scrollSpy).not.toHaveBeenCalled();
    }
  });

  // ── Test 4: no hash — effect returns early, no scroll ──────────────────────

  it('does nothing when there is no hash on the homepage', async () => {
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });

    await act(async () => { render(<App />); });

    const stayEl = document.getElementById('stay');
    const scrollSpy = stayEl ? vi.spyOn(stayEl, 'scrollIntoView') : null;

    await act(async () => { vi.runAllTimers(); });

    if (scrollSpy) {
      expect(scrollSpy).not.toHaveBeenCalled();
    }
  });

  // ── Test 5: hash cleared before the retry rAF fires ──────────────────────
  //
  // Regression guard for a specific race:
  //   1. SPA navigates /story → /#stay: effect fires, captures hash='stay',
  //      schedules a rAF — but the rAF has NOT fired yet.
  //   2. Before the rAF fires, the user navigates to '/' (no hash), clearing
  //      window.location.hash. Because the Wouter pathname stays '/', the
  //      hash-scroll useEffect dep (location) does NOT change and the effect
  //      does NOT re-run. The pending rAF callback still holds hash='stay'.
  //   3. The rAF fires. Without a live hash re-check, tryScroll finds #stay
  //      in the DOM and scrolls — incorrectly, because the hash was cleared.
  //
  // The fix: tryScroll re-reads window.location.hash on every attempt and
  // cancels if it no longer matches the originally captured value.

  it('does NOT scroll to #stay when the hash is cleared before the rAF fires', async () => {
    // ── Phase 1: render on /story ────────────────────────────────────────────
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });

    // ── Phase 2: navigate to /#stay — effect fires, rAF queued, NOT flushed ──
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '#stay' });

    // Rerender so the location dep changes (→ '/') and the effect runs.
    // Do NOT flush timers yet: tryScroll is queued in a rAF but hasn't fired.
    await act(async () => { rerenderFn(<App />); });

    // ── Phase 3: user navigates to '/' (no hash) BEFORE the rAF fires ────────
    // Pathname stays '/' — Wouter's location dep doesn't change, so the effect
    // does NOT re-run. The pending rAF still holds hash='stay' in its closure.
    setWindowLocation({ pathname: '/', hash: '' });

    // Spy on #stay — it is already in the DOM; the pending rAF will find it.
    const stayEl = document.getElementById('stay');
    expect(stayEl).toBeTruthy();
    const scrollSpy = vi.spyOn(stayEl, 'scrollIntoView');

    // ── Phase 4: flush — tryScroll fires but must bail because hash is gone ──
    await act(async () => { vi.runAllTimers(); });

    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
