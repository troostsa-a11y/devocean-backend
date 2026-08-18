/**
 * App.resizeObserver.test.jsx
 *
 * Confirms that the ResizeObserver useEffect in App.jsx cannot update CSS
 * variables via setProperty after the component unmounts.
 *
 * Covers:
 *   1. Normal path — setProperty IS called when a resize fires (with measurable
 *      dimensions) and the component stays mounted through the rAF.
 *   2. Unmount before rAF — component unmounts after the ResizeObserver callback
 *      fires and queues a rAF, but before that rAF executes; setProperty must
 *      NOT be called.
 *   3. Route change (effect re-run) — a location change triggers effect cleanup;
 *      the stale rAF from the previous run must not call setProperty.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ── Wouter mocks ──────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
let mockLocation = '/';

vi.mock('wouter', () => ({
  useLocation: () => [mockLocation, mockNavigate],
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

// ── Section stubs ─────────────────────────────────────────────────────────────
// Header stub renders both a <header> and a .topbar child so the effect finds
// both selectors.

vi.mock('../Header',                () => ({ default: () => <header><div className="topbar" /></header> }));
vi.mock('../HeroSection',           () => ({ default: () => <div><h1>Hero</h1></div> }));
vi.mock('../AccommodationsSection', () => ({ default: () => <div id="stay" /> }));
vi.mock('../ExperiencesSection',    () => ({ default: () => <div id="experiences" /> }));
vi.mock('../GallerySection',        () => ({ default: () => <div id="gallery" /> }));
vi.mock('../LocationSection',       () => ({ default: () => <div id="location" /> }));
vi.mock('../ContactSection',        () => ({ default: () => <div id="contact" /> }));
vi.mock('../Footer',                () => ({ default: () => <footer /> }));

vi.mock('../ExperienceDetailPage',   () => ({ default: () => null }));
vi.mock('../WhyPontaPage',           () => ({ default: () => null }));
vi.mock('../AdminPage',              () => ({ default: () => null }));
vi.mock('../BookDirectPage',         () => ({ default: () => null }));
vi.mock('../BookingConfirmedPage',   () => ({ default: () => null }));
vi.mock('../GiftVouchersPage',       () => ({ default: () => null }));
vi.mock('../GiftConfirmedPage',      () => ({ default: () => null }));
vi.mock('../StoryPage',              () => ({ default: () => null }));
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

/** Registered ResizeObserver callbacks for the current test. */
let capturedObserverCallbacks = [];

/**
 * Replace global ResizeObserver with a spy that captures the callback so tests
 * can trigger synthetic resize events by calling `triggerResize()`.
 */
function installResizeObserverMock() {
  capturedObserverCallbacks = [];
  global.ResizeObserver = class {
    constructor(cb) {
      this._cb = cb;
      capturedObserverCallbacks.push(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/** Fire all currently-registered ResizeObserver callbacks (simulates a resize). */
function triggerResize() {
  capturedObserverCallbacks.forEach(cb => cb([]));
}

/**
 * Mock `offsetHeight` on HTMLElement.prototype to return `value`.
 * Returns a restore function that puts the original descriptor back.
 */
function mockOffsetHeight(value) {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => value,
  });
  return () => {
    if (original) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original);
    } else {
      delete HTMLElement.prototype.offsetHeight;
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('App — ResizeObserver rAF unmount guard', () => {
  let originalResizeObserver;
  let restoreOffsetHeight;

  beforeEach(() => {
    originalResizeObserver = global.ResizeObserver;
    installResizeObserverMock();
    vi.useFakeTimers();
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });
    // Default: elements report 0 height so the initial idle callback
    // short-circuits and does not call setProperty on its own.
    restoreOffsetHeight = mockOffsetHeight(0);
  });

  afterEach(() => {
    restoreOffsetHeight?.();
    global.ResizeObserver = originalResizeObserver;
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    mockLocation = '/';
  });

  // ── Test 1: normal path — setProperty fires when component stays mounted ───
  //
  // After mount (with offsetHeight=0, so initial idle callback short-circuits),
  // change offsetHeight to 50 and fire a synthetic resize. updateStackHeight
  // now sees 50 ≠ 0 (cached), passes the short-circuit, and queues a rAF.
  // Flush the rAF → setProperty must be called.

  it('calls setProperty when a resize fires and the component remains mounted', async () => {
    await act(async () => { render(<App />); });
    // Flush the initial idle callback (offsetHeight=0 → short-circuits, no rAF)
    await act(async () => { vi.runAllTimers(); });

    const setPropSpy = vi.spyOn(document.documentElement.style, 'setProperty');

    // Give elements a non-zero size so the next updateStackHeight call passes
    // the short-circuit check and queues a rAF.
    restoreOffsetHeight();
    restoreOffsetHeight = mockOffsetHeight(50);

    // Simulate a resize — ResizeObserver callback → idle callback → updateStackHeight
    await act(async () => { triggerResize(); });

    // Flush the idle callback + the rAF it queued
    await act(async () => { vi.runAllTimers(); });

    const varCalls = setPropSpy.mock.calls.map(([k]) => k);
    expect(varCalls).toContain('--stack-h');
    expect(varCalls).toContain('--topbar-h');
    expect(varCalls).toContain('--header-h');
  });

  // ── Test 2: unmount before rAF — setProperty must NOT fire ────────────────
  //
  // After mount, give elements a non-zero size and fire a synthetic resize so
  // updateStackHeight queues a rAF. Unmount BEFORE that rAF executes.
  // The effect cleanup sets cancelled=true and calls cancelAnimationFrame, so
  // the rAF callback must be a no-op — setProperty must not be called.

  it('does not call setProperty after the component unmounts between resize and rAF', async () => {
    let unmountFn;
    await act(async () => {
      const result = render(<App />);
      unmountFn = result.unmount;
    });
    // Settle initial effects (offsetHeight=0 → short-circuit, no rAF)
    await act(async () => { vi.runAllTimers(); });

    // Give elements measurable dimensions for the upcoming resize
    restoreOffsetHeight();
    restoreOffsetHeight = mockOffsetHeight(50);

    const setPropSpy = vi.spyOn(document.documentElement.style, 'setProperty');

    // Fire the resize — ResizeObserver callback runs synchronously here,
    // schedules an idle callback (our mock uses setTimeout(cb,0)).
    // Do NOT flush timers yet; the rAF is not yet queued.
    triggerResize();

    // Unmount NOW — cleanup sets cancelled=true + cancelAnimationFrame(rafId).
    // The idle callback hasn't even run yet, so the rAF will be queued
    // after unmount... but when the idle callback calls updateStackHeight,
    // the rAF it queues will check `cancelled` and return early.
    unmountFn();

    // Flush all remaining idle callbacks and rAFs
    await act(async () => { vi.runAllTimers(); });

    const varCalls = setPropSpy.mock.calls.filter(([k]) =>
      k === '--stack-h' || k === '--topbar-h' || k === '--header-h'
    );
    expect(varCalls).toHaveLength(0);
  });

  // ── Test 3: route change — stale rAF from old effect must not fire ─────────
  //
  // Fire a resize (with non-zero dimensions) so a rAF is queued. Before that
  // rAF executes, trigger a route change that causes React to clean up the old
  // effect (cancelled=true, cancelAnimationFrame). Verify setProperty is not
  // called from the stale rAF.

  it('does not call setProperty from a stale rAF when a route change re-runs the effect', async () => {
    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });
    await act(async () => { vi.runAllTimers(); });

    // Give elements measurable dimensions
    restoreOffsetHeight();
    restoreOffsetHeight = mockOffsetHeight(50);

    const setPropSpy = vi.spyOn(document.documentElement.style, 'setProperty');

    // Fire a resize — queues an idle callback (setTimeout 0) but NOT yet a rAF
    triggerResize();

    // Change location before flushing — React cleans up the old effect
    // (cancelled=true, cancelAnimationFrame) and initializes a new one.
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Flush everything.  The stale rAF's cancelled guard must prevent it from
    // calling setProperty.  The new effect's initial idle measurement will also
    // run here; because the new cache starts at 0 and offsetHeight is now 50,
    // it may queue its own rAF — but that is one legitimate batch of 3 calls.
    await act(async () => { vi.runAllTimers(); });

    // The stale rAF would have added an extra batch, making it 6 calls.
    // With the guard in place there must be at most 3 (one batch from new effect).
    const varCalls = setPropSpy.mock.calls.filter(([k]) =>
      k === '--stack-h' || k === '--topbar-h' || k === '--header-h'
    );
    expect(varCalls.length).toBeLessThanOrEqual(3);
  });
});
